// =====================================================================
// api/leads.js — Vercel Serverless Function (Montaureo · Admin lead queue)
// Simple password-protected read endpoint so an MFI advisor can see the
// lead queue in a browser without a full CRM. NOT a replacement for a real
// admin panel/auth system — treat ADMIN_PASSWORD as a shared secret only,
// rotate it periodically, and put this behind HTTPS (Vercel does this by
// default) plus ideally an additional layer (e.g. Vercel Password Protection
// or IP allowlist) before relying on it for sensitive UHNW client data.
//
// Usage:
//   GET /api/leads?queue=all|RED|GOLD|PRIORITY|STANDARD&limit=50
//   Header: Authorization: Bearer YOUR_ADMIN_PASSWORD
//
// Env (required):
//   ADMIN_PASSWORD
//   UPSTASH_REDIS_REST_URL / KV_REST_API_URL
//   UPSTASH_REDIS_REST_TOKEN / KV_REST_API_TOKEN
// =====================================================================

import crypto from "crypto";
import { Redis } from "@upstash/redis";

const redis = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
    })
  : null;

const VALID_TIERS = ["RED", "GOLD", "PRIORITY", "STANDARD"];

// First-contact SLA per tier, in minutes — kept in sync with api/lead.js (tierFor)
// and api/sla-check.js (SLA_MINUTES). Duplicated here deliberately: each Vercel
// function is an independent module, and this constant is small enough that
// keeping a single shared source isn't worth the extra build complexity yet.
const SLA_MINUTES = { RED: 30, GOLD: 120, PRIORITY: 480, STANDARD: 1440 };

// How many recent leads to scan for KPI computation — bounds the cost of the
// extra read regardless of how big the full history grows.
const KPI_SCAN_LIMIT = 500;

function responseMinutesFor(lead) {
  if (!lead.firstContactAt || !lead.createdAt) return null;
  const mins = (new Date(lead.firstContactAt).getTime() - new Date(lead.createdAt).getTime()) / 60000;
  if (Number.isNaN(mins) || mins < 0) return null;
  return mins;
}

function computeKpi(leads) {
  const byTier = {};
  VALID_TIERS.forEach((t) => { byTier[t] = { open: 0, contacted: 0, totalResponseMinutes: 0, withinSla: 0 }; });

  for (const lead of leads) {
    const tier = lead.priority;
    if (!byTier[tier]) continue;
    if ((lead.status || "new") === "new") byTier[tier].open += 1;

    const mins = responseMinutesFor(lead);
    if (mins != null) {
      byTier[tier].contacted += 1;
      byTier[tier].totalResponseMinutes += mins;
      if (mins <= SLA_MINUTES[tier]) byTier[tier].withinSla += 1;
    }
  }

  const result = {};
  VALID_TIERS.forEach((tier) => {
    const b = byTier[tier];
    result[tier] = {
      slaMinutes: SLA_MINUTES[tier],
      openLeads: b.open,
      contactedLeads: b.contacted,
      avgResponseMinutes: b.contacted ? Math.round(b.totalResponseMinutes / b.contacted) : null,
      withinSlaPct: b.contacted ? Math.round((b.withinSla / b.contacted) * 100) : null,
    };
  });
  return result;
}

/* ---------- Timing-safe Bearer auth ---------- */
function timingSafeTokenMatch(token, adminPassword) {
  if (!token) return false;
  // timingSafeEqual requires equal-length buffers — compare against a fixed-length
  // hash of both sides instead of the raw strings, so length differences don't
  // short-circuit the comparison (and don't leak password length via timing either).
  const a = crypto.createHash("sha256").update(token).digest();
  const b = crypto.createHash("sha256").update(adminPassword).digest();
  return crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "method_not_allowed" });

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(503).json({ error: "not_configured", message: "ADMIN_PASSWORD is not set" });
  }

  // Authorization: Bearer <password> — kept out of the URL so it never lands in
  // browser history, server access logs, or the Referer header sent by the browser.
  const authHeader = req.headers["authorization"] || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const token = authHeader.slice("Bearer ".length).trim();
  if (!timingSafeTokenMatch(token, adminPassword)) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const { queue = "all", limit = "50" } = req.query || {};

  if (!redis) {
    return res.status(503).json({ error: "storage_not_configured", message: "Upstash Redis is not configured" });
  }

  const tierParam = String(queue).toUpperCase();
  const listKey = VALID_TIERS.includes(tierParam) ? `leads:tier:${tierParam}` : "leads:private_consultation";
  const n = Math.max(1, Math.min(200, parseInt(limit, 10) || 50));

  try {
    // KPI is always computed from the overall history (capped), independent of
    // whichever tier the table view is currently filtered to — the dashboard
    // numbers shouldn't change just because someone clicked "RED" in the UI.
    const kpiIds = await redis.lrange("leads:private_consultation", 0, KPI_SCAN_LIMIT - 1);
    const kpiRaw = kpiIds.length ? await Promise.all(kpiIds.map((id) => redis.get(id))) : [];
    const kpiLeads = kpiRaw
      .map((raw) => { try { return typeof raw === "string" ? JSON.parse(raw) : raw; } catch { return null; } })
      .filter(Boolean);
    const kpi = computeKpi(kpiLeads);

    const ids = await redis.lrange(listKey, 0, n - 1);
    if (!ids || ids.length === 0) return res.status(200).json({ leads: [], count: 0, kpi });

    const rawLeads = await Promise.all(ids.map((id) => redis.get(id)));
    const leads = rawLeads
      .map((raw, i) => {
        try {
          const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
          return parsed ? { ...parsed, id: ids[i] } : null;
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      // Highest score first — the most valuable lead at the top of the queue.
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    return res.status(200).json({ leads, count: leads.length, kpi });
  } catch (e) {
    console.error("leads admin error", e);
    return res.status(500).json({ error: "server_error" });
  }
}
