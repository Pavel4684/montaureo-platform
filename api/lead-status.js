// =====================================================================
// api/lead-status.js — Vercel Serverless Function (Montaureo · Lead status)
// Lets an advisor mark a lead's progress, which:
//   - stops the SLA clock used by api/sla-check.js (only status:"new" leads
//     are ever escalated);
//   - auto-stamps firstContactAt the first time a lead moves out of "new";
//   - gives the admin dashboard a real response-time metric to show.
//
// Usage:
//   PATCH /api/lead-status
//   Header: Authorization: Bearer YOUR_ADMIN_PASSWORD
//   Body: { "id": "lead:...", "status": "contacted", "notes": "optional" }
//
// Allowed statuses: new, contacted, qualified, closed
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

const ALLOWED_STATUSES = ["new", "contacted", "qualified", "closed"];

function timingSafeTokenMatch(token, adminPassword) {
  if (!token) return false;
  const a = crypto.createHash("sha256").update(token).digest();
  const b = crypto.createHash("sha256").update(adminPassword).digest();
  return crypto.timingSafeEqual(a, b);
}

async function auditLog(event) {
  if (!redis) return;
  try {
    await redis.lpush("leads:audit", JSON.stringify({ ...event, at: new Date().toISOString() }));
  } catch (e) {
    console.error("audit log error", e);
  }
}

export default async function handler(req, res) {
  if (req.method !== "PATCH") return res.status(405).json({ error: "method_not_allowed" });

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

  const { id, status, notes } = req.body || {};

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "bad_request", message: "id is required" });
  }
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: "bad_request", message: `status must be one of: ${ALLOWED_STATUSES.join(", ")}` });
  }

  let raw;
  try {
    raw = await redis.get(id);
  } catch (e) {
    console.error("lead-status: read error", e);
    return res.status(500).json({ error: "server_error" });
  }
  if (!raw) {
    return res.status(404).json({ error: "not_found", message: "No lead with this id" });
  }

  let lead;
  try {
    lead = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return res.status(500).json({ error: "server_error", message: "Stored lead is corrupted" });
  }

  const previousStatus = lead.status || "new";
  const now = new Date().toISOString();

  lead.status = status;

  // Stamp the moment a lead first leaves "new" — this is what stops the SLA
  // clock in api/sla-check.js and gives the dashboard a real response time.
  // Only set once: a later status change (e.g. contacted -> qualified) must
  // not overwrite the original first-contact timestamp.
  if (previousStatus === "new" && status !== "new" && !lead.firstContactAt) {
    lead.firstContactAt = now;
  }

  if (typeof notes === "string" && notes.trim()) {
    lead.notes = notes.trim();
  }

  lead.statusUpdatedAt = now;

  try {
    await redis.set(id, JSON.stringify(lead));
  } catch (e) {
    console.error("lead-status: write error", e);
    return res.status(500).json({ error: "server_error" });
  }

  await auditLog({
    event: "lead_status_changed",
    leadId: id,
    from: previousStatus,
    to: status,
    firstContactAt: lead.firstContactAt || null,
  });

  return res.status(200).json({ ok: true, lead });
}
