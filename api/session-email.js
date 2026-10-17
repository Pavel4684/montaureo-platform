// =====================================================================
// api/session-email.js — Vercel Serverless Function (Montaureo)
// Called by the site right after Stripe redirects back with ?session_id=...
// Confirms the Checkout Session is paid, grants access immediately (don't
// wait for the webhook, which can lag by a few seconds), and returns the
// client's email so the frontend can auto-unlock without asking again.
// =====================================================================

import crypto from "crypto";
import Stripe from "stripe";
import { Redis } from "@upstash/redis";

// Signed access token (same format as api/check-access.js). The browser keeps it and
// sends it to api/concierge.js, which verifies it — an email alone is not proof of payment.
function signAccessToken(email) {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) return null;
  const payload = Buffer.from(JSON.stringify({ e: email, x: Date.now() + 30 * 864e5 })).toString("base64url");
  return `${payload}.${crypto.createHmac("sha256", secret).update(payload).digest("base64url")}`;
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const redis = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
    })
  : null;

const accessKey = (email) => `access:${email.trim().toLowerCase()}`;

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "method_not_allowed" });
  if (!stripe) return res.status(500).json({ error: "stripe_not_configured" });

  const sessionId = req.query.session_id;
  if (!sessionId) return res.status(400).json({ error: "missing_session_id" });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    const email = (session.customer_details?.email || session.customer_email || "").trim();
    if (!email || session.payment_status !== "paid") {
      return res.status(200).json({ active: false });
    }

    const normalizedEmail = email.toLowerCase();

    let expiresAt;
    if (session.mode === "payment") {
      expiresAt = Date.now() + 10 * 365 * 24 * 60 * 60 * 1000; // one-time plan
    } else if (session.subscription && session.subscription.current_period_end) {
      expiresAt = session.subscription.current_period_end * 1000;
    } else {
      expiresAt = Date.now() + 31 * 24 * 60 * 60 * 1000; // fallback
    }

    if (redis) {
      await redis.set(accessKey(normalizedEmail), { plan: "premium", expiresAt });
    }

    const token = signAccessToken(normalizedEmail);
    return res.status(200).json({ active: true, email: normalizedEmail, plan: "premium", expiresAt, ...(token ? { token } : {}) });
  } catch (err) {
    console.error("session-email error:", err);
    return res.status(500).json({ error: "server_error" });
  }
}
