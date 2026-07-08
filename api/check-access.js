// =====================================================================
// api/check-access.js — Vercel Serverless Function (Montaureo · Access Check)
// Replaces Supabase email+password auth. A paying client is identified
// by email alone — no password, no account creation flow.
// The Stripe webhook (api/stripe-webhook.js) writes access records here;
// this endpoint just reads them back.
// KV: same Upstash Redis instance already used for rate limiting.
// Body: { email }.  Response: { active: boolean, plan?: "premium"|"private", expiresAt?: number }
// =====================================================================

import { Redis } from "@upstash/redis";

const redis = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
    })
  : null;

function accessKey(email) {
  return `access:${email.trim().toLowerCase()}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const { email } = req.body || {};
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "bad_request" });
  }
  if (!redis) {
    console.warn("Upstash не настроен — доступ по умолчанию закрыт");
    return res.status(200).json({ active: false });
  }

  try {
    const record = await redis.get(accessKey(email));
    // record shape written by the Stripe webhook: { plan: "premium"|"private", expiresAt: <ms epoch> }
    if (!record) return res.status(200).json({ active: false });

    const expiresAt = Number(record.expiresAt || 0);
    const active = expiresAt > Date.now();
    if (!active) return res.status(200).json({ active: false });

    return res.status(200).json({ active: true, plan: record.plan || "premium", expiresAt });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server_error" });
  }
}
