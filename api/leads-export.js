// =====================================================================
// api/leads-export.js — Vercel Serverless Function (Montaureo · CSV export)
// Exports the lead queue as CSV for import into a CRM/Excel.
//
// Usage:
//   GET /api/leads-export?queue=all|RED|GOLD|PRIORITY|STANDARD&limit=1000
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

const COLUMNS = [
  "id", "tier", "score", "status", "advisor", "name", "email", "phone", "goal",
  "createdAt", "firstContactAt", "responseMinutes", "utm_source", "utm_medium", "utm_campaign",
];

function timingSafeTokenMatch(token, adminPassword) {
  if (!token) return false;
  const a = crypto.createHash("sha256").update(token).digest();
  const b = crypto.createHash("sha256").update(adminPassword).digest();
  return crypto.timingSafeEqual(a, b);
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const s = String(value);
  // Quote and escape any field containing a comma, quote, or newline — the
  // three characters that would otherwise break a naive CSV reader.
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function responseMinutesFor(lead) {
  if (!lead.firstContactAt || !lead.createdAt) return "";
  const mins = (new Date(lead.firstContactAt).getTime() - new Date(lead.createdAt).getTime()) / 60000;
  if (Number.isNaN(mins) || mins < 0) return "";
  return Math.round(mins);
}

function leadToRow(lead) {
  return [
    lead.id || "",
    lead.priority || "",
    lead.score != null ? lead.score : "",
    lead.status || "new",
    lead.advisor || "",
    lead.name || "",
    lead.email || "",
    lead.phone || "",
    lead.goal || "",
    lead.createdAt || lead.receivedAt || "",
    lead.firstContactAt || "",
    responseMinutesFor(lead),
    lead.utm_source || "",
    lead.utm_medium || "",
    lead.utm_campaign || "",
  ];
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "method_not_allowed" });

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(503).json({ error: "not_configured", message: "ADMIN_PASSWORD is not set" });
  }

  const authHeader = req.headers["authorization"] || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const token = authHeader.slice("Bearer ".length).trim();
  if (!timingSafeTokenMatch(token, adminPassword)) {
    return res.status(401).json({ error: "unauthorized" });
  }

  if (!redis) {
    return res.status(503).json({ error: "storage_not_configured", message: "Upstash Redis is not configured" });
  }

  const { queue = "all", limit = "1000" } = req.query || {};
  const tierParam = String(queue).toUpperCase();
  const listKey = VALID_TIERS.includes(tierParam) ? `leads:tier:${tierParam}` : "leads:private_consultation";
  const n = Math.max(1, Math.min(5000, parseInt(limit, 10) || 1000));

  try {
    const ids = await redis.lrange(listKey, 0, n - 1);
    const rawLeads = ids.length ? await Promise.all(ids.map((id) => redis.get(id))) : [];

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
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    const lines = [COLUMNS.map(csvEscape).join(",")];
    for (const lead of leads) {
      lines.push(leadToRow(lead).map(csvEscape).join(","));
    }
    const csv = lines.join("\r\n") + "\r\n";

    const filename = `montaureo-leads-${VALID_TIERS.includes(tierParam) ? tierParam.toLowerCase() : "all"}-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (e) {
    console.error("leads-export error", e);
    return res.status(500).json({ error: "server_error" });
  }
}
