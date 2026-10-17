// =====================================================================
// api/check-access.js — Vercel Serverless Function (Montaureo · Access Check)
// A paying client is identified without a password. Two ways in:
//
//   { token }  — the signed access token the browser got after Stripe checkout
//                (api/session-email.js) or from a sign-in link. Verified here,
//                then the Redis record access:<email> must still be active.
//                Response: { active, plan?, expiresAt?, email? }
//
//   { email }  — "Already subscribed?" on another device.
//     • Sign-in-link mode (RESEND_API_KEY + ACCESS_FROM_EMAIL + ACCESS_TOKEN_SECRET set):
//       if that email has active access, we EMAIL a sign-in link; the response is
//       always { sent: true, mode: "link" }, so nobody can test which emails are
//       Montaureo clients, and nobody can unlock someone else's access by typing
//       their email.
//     • Transitional mode (any of those not set): same behaviour as before —
//       { active, plan, expiresAt, token? }. Set the variables to close this gap.
//     • { email, silent: true } never sends an email (used on page load).
//
// Env:
//   ACCESS_TOKEN_SECRET  any long random string (e.g. 64 characters) — signs access tokens
//   RESEND_API_KEY       Resend API key, for sign-in links
//   ACCESS_FROM_EMAIL    sender on a domain verified in Resend, e.g. access@montaureo.com
//   SITE_URL             optional, default https://montaureo.com
// KV: same Upstash Redis instance used by the Stripe webhook.
// =====================================================================

import crypto from "crypto";
import { Redis } from "@upstash/redis";

const redis = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
    })
  : null;

const TOKEN_DAYS = 30;
const accessKey = (email) => `access:${email.trim().toLowerCase()}`;

function signAccessToken(email) {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) return null;
  const payload = Buffer.from(JSON.stringify({ e: email, x: Date.now() + TOKEN_DAYS * 864e5 })).toString("base64url");
  return `${payload}.${crypto.createHmac("sha256", secret).update(payload).digest("base64url")}`;
}

function verifyAccessToken(token) {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret || typeof token !== "string") return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  if (expected.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.e && data.x > Date.now() ? String(data.e).toLowerCase() : null;
  } catch { return null; }
}

async function activeRecord(email) {
  const record = await redis.get(accessKey(email));
  if (!record) return null;
  const expiresAt = Number(record.expiresAt || 0);
  return expiresAt > Date.now() ? { plan: record.plan || "premium", expiresAt } : null;
}

const linkMode = () => Boolean(process.env.RESEND_API_KEY && process.env.ACCESS_FROM_EMAIL && process.env.ACCESS_TOKEN_SECRET);

function ipKey(req) {
  const xf = req.headers["x-forwarded-for"];
  const ip = String(Array.isArray(xf) ? xf[0] : xf || req.socket?.remoteAddress || "").split(",")[0].trim();
  return ip ? crypto.createHash("sha256").update(ip + (process.env.IP_SALT || "montaureo")).digest("hex").slice(0, 32) : "unknown";
}

// No more than 3 links per email per hour and 10 requests per IP per day.
async function linkAllowed(req, email) {
  try {
    const hourKey = `quota:accesslink:e:${email}:${new Date().toISOString().slice(0, 13)}`;
    const dayKey = `quota:accesslink:ip:${ipKey(req)}:${new Date().toISOString().slice(0, 10)}`;
    const [e, i] = [await redis.incr(hourKey), await redis.incr(dayKey)];
    if (e === 1) await redis.expire(hourKey, 3600);
    if (i === 1) await redis.expire(dayKey, 60 * 60 * 26);
    return e <= 3 && i <= 10;
  } catch { return true; }
}

async function sendSignInLink(email) {
  const token = signAccessToken(email);
  const link = `${(process.env.SITE_URL || "https://montaureo.com").replace(/\/$/, "")}/?access=${encodeURIComponent(token)}`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#222">
    <p>Your Montaureo sign-in link:</p>
    <p><a href="${link}" style="display:inline-block;padding:12px 20px;background:#C6A35A;color:#1A1408;text-decoration:none;border-radius:8px;font-weight:bold">Open Montaureo Concierge</a></p>
    <p style="color:#777;font-size:13px">The link is valid for ${TOKEN_DAYS} days. If you didn't request it, ignore this email.</p></div>`;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.ACCESS_FROM_EMAIL, to: [email], subject: "Your Montaureo sign-in link", html }),
  });
  if (!r.ok) console.error("resend", r.status, await r.text().catch(() => ""));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const { email, token, silent } = req.body || {};

  if (!redis) {
    console.warn("Upstash не настроен — доступ по умолчанию закрыт");
    return res.status(200).json({ active: false });
  }

  try {
    // ---- 1) Signed token (after checkout, from a sign-in link, or remembered by the browser)
    if (token) {
      const tokenEmail = verifyAccessToken(token);
      if (!tokenEmail) return res.status(200).json({ active: false });
      const rec = await activeRecord(tokenEmail);
      return res.status(200).json(rec ? { active: true, ...rec, email: tokenEmail } : { active: false });
    }

    // ---- 2) Email
    if (!email || typeof email !== "string" || !email.includes("@") || email.length > 160) {
      return res.status(400).json({ error: "bad_request" });
    }
    const normalized = email.trim().toLowerCase();

    if (linkMode()) {
      if (silent) return res.status(200).json({ active: false, mode: "link" });
      if (await linkAllowed(req, normalized)) {
        const rec = await activeRecord(normalized);
        if (rec) await sendSignInLink(normalized);
      }
      // Same answer whether or not the email is a client.
      return res.status(200).json({ sent: true, mode: "link" });
    }

    // Transitional mode — previous behaviour.
    const rec = await activeRecord(normalized);
    if (!rec) return res.status(200).json({ active: false });
    const signed = signAccessToken(normalized);
    return res.status(200).json({ active: true, ...rec, ...(signed ? { token: signed } : {}) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server_error" });
  }
}
