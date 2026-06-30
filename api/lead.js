// =====================================================================
// api/lead.js — Vercel Serverless Function (Montaureo · Private Consultation)
// Captures, scores, rate-limits, de-dupes, tiers, routes and alerts on a
// hot lead from "Book Private Consultation". No AI call here — pure lead
// pipeline.
//
// Body: {
//   name, email, phone, lang, time, goal, profile, moveCountry, source,
//   consent, utm_source, utm_medium, utm_campaign, referrer
// }
//
// Env (optional but recommended for production):
//   UPSTASH_REDIS_REST_URL / KV_REST_API_URL
//   UPSTASH_REDIS_REST_TOKEN / KV_REST_API_TOKEN
//   TELEGRAM_BOT_TOKEN
//   TELEGRAM_CHAT_ID
//   LEAD_NOTIFY_WEBHOOK_URL   — optional Slack/CRM webhook, kept as a second channel
// =====================================================================

import { Redis } from "@upstash/redis";

const redis = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
    })
  : null;

const DUPLICATE_WINDOW_SECONDS = 60 * 60 * 24; // 24h

/* ---------- Rate limiting (IP + email) ---------- */
const RATE_LIMIT_IP = { max: 10, windowSeconds: 60 * 60 };          // 10 requests / hour / IP
const RATE_LIMIT_EMAIL = { max: 3, windowSeconds: 60 * 60 * 24 };    // 3 requests / 24h / email

async function checkRateLimit(key, { max, windowSeconds }) {
  if (!redis) return { ok: true }; // fail open if storage isn't configured (dev/demo)
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds);
    if (count > max) return { ok: false, count };
    return { ok: true, count };
  } catch (e) {
    console.error("rate limit check error", e);
    return { ok: true }; // fail open — never lose a real lead because Redis hiccuped
  }
}

function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return String(fwd).split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function isValidEmail(s) {
  return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

/* ---------- Lead scoring ---------- */
function scoreLead({ profile = "", goal = "", moveCountry = null }) {
  let score = 0;
  const p = profile || "";

  // Capital bands (matches the EN labels produced by buildProfileText on the frontend)
  if (p.includes("€15–50M")) score += 20;
  if (p.includes("€50–100M")) score += 40;
  if (p.includes("€100M+")) score += 60;

  // Liquidity bands — a liquid UHNW client is worth more than a paper-rich one
  if (p.includes("€10–50M")) score += 15;
  if (p.includes("€50M+")) score += 25;

  // Goal weighting
  if (goal === "Family Office") score += 25;
  if (goal === "Banking") score += 15;
  if (goal === "Credit") score += 12;
  if (goal === "Real Estate") score += 10;
  if (goal === "Relocation") score += 8;

  // Already engaged with Two Futures and has a concrete destination in mind
  if (moveCountry) score += 10;

  return score;
}

/* ---------- Priority tiers ---------- */
// RED   ≥ 90  — first contact target: 30 minutes
// GOLD  ≥ 75  — first contact target: 2 hours
// PRIORITY ≥ 60 — first contact target: 8 hours
// STANDARD — first contact target: 24 hours
function tierFor(score) {
  if (score >= 90) return "RED";
  if (score >= 75) return "GOLD";
  if (score >= 60) return "PRIORITY";
  return "STANDARD";
}

/* ---------- Advisor assignment ---------- */
function advisorFor(goal, tier) {
  if (tier === "RED" || tier === "GOLD") return "Senior Advisor";
  switch (goal) {
    case "Banking": return "Private Banking Team";
    case "Real Estate": return "Real Estate Team";
    case "Credit": return "Credit & Lombard Team";
    case "Relocation": return "Relocation Team";
    case "Family Office": return "Senior Advisor";
    default: return "General Concierge Desk";
  }
}

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
  } catch (e) {
    console.error("telegram notify error", e);
  }
}

async function sendWebhook(text) {
  if (!process.env.LEAD_NOTIFY_WEBHOOK_URL) return;
  try {
    await fetch(process.env.LEAD_NOTIFY_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (e) {
    console.error("lead notify webhook error", e);
  }
}

const TIER_EMOJI = { RED: "🔴", GOLD: "🟡", PRIORITY: "🔵", STANDARD: "⚪" };
const TIER_SLA = { RED: "30 minutes", GOLD: "2 hours", PRIORITY: "8 hours", STANDARD: "24 hours" };

function buildTelegramCard(lead) {
  const emoji = TIER_EMOJI[lead.priority] || "⚪";
  const title = lead.priority === "RED" || lead.priority === "GOLD" ? "NEW VIP LEAD" : "NEW LEAD";
  return (
    `${emoji} ${title} — ${lead.priority}\n\n` +
    `Name: ${lead.name}\n` +
    `Email: ${lead.email}\n` +
    `Phone: ${lead.phone || "—"}\n` +
    `Goal: ${lead.goal || "—"}\n` +
    `Profile: ${lead.profile || "—"}\n` +
    `Move country (Two Futures): ${lead.moveCountry || "—"}\n\n` +
    `Score: ${lead.score}\n` +
    `Advisor: ${lead.advisor}\n` +
    `First contact target: ${TIER_SLA[lead.priority] || "24 hours"}\n\n` +
    `Preferred time: ${lead.time || "—"}\n` +
    `Language: ${lead.lang || "—"}\n` +
    `UTM: ${[lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" / ") || "—"}\n` +
    `Referrer: ${lead.referrer || "—"}`
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const {
    name = "", email = "", phone = "", lang = "", time = "", goal = "",
    profile = "", moveCountry = null, source = "two_futures",
    consent = false,
    utm_source = null, utm_medium = null, utm_campaign = null, referrer = null,
  } = req.body || {};

  if (!name.trim() || !isValidEmail(email)) {
    return res.status(400).json({ error: "bad_request", message: "name and a valid email are required" });
  }

  if (!consent) {
    return res.status(400).json({ error: "consent_required", message: "Consent to be contacted is required" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const ip = getClientIp(req);

  /* ---------- Rate limiting ---------- */
  const ipLimit = await checkRateLimit(`ratelimit:ip:${ip}:lead`, RATE_LIMIT_IP);
  if (!ipLimit.ok) {
    return res.status(429).json({ error: "rate_limited", scope: "ip", message: "Too many requests from this network. Please try again later." });
  }
  const emailLimit = await checkRateLimit(`ratelimit:email:${normalizedEmail}:lead`, RATE_LIMIT_EMAIL);
  if (!emailLimit.ok) {
    return res.status(429).json({ error: "rate_limited", scope: "email", message: "Too many requests for this email. Please try again later." });
  }

  /* ---------- Duplicate protection ---------- */
  if (redis) {
    try {
      const duplicateKey = `lead-email:${normalizedEmail}`;
      const existing = await redis.get(duplicateKey);
      if (existing) {
        return res.status(200).json({ ok: true, duplicate: true, message: "Request already received recently" });
      }
      await redis.set(duplicateKey, "1", { ex: DUPLICATE_WINDOW_SECONDS });
    } catch (e) {
      console.error("dedup check error", e);
      // Fail open — better to accept a possible duplicate than to lose a real lead.
    }
  }

  const score = scoreLead({ profile, goal, moveCountry });
  const priority = tierFor(score);
  const advisor = advisorFor(goal, priority);
  const now = new Date().toISOString();

  const lead = {
    name: name.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    lang,
    time,
    goal,
    profile,
    moveCountry,
    source,
    consent: true,
    utm_source, utm_medium, utm_campaign, referrer,
    score,
    priority,
    advisor,
    status: "new",              // new -> contacted -> qualified -> closed (iteration 2)
    createdAt: now,
    firstContactAt: null,       // set by a future PATCH endpoint when an advisor responds
    receivedAt: now,            // kept for backward compatibility with existing readers
    ip,
  };

  /* ---------- Persist ---------- */
  try {
    if (redis) {
      const id = `lead:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
      await redis.set(id, JSON.stringify(lead));
      await redis.lpush("leads:private_consultation", id);
      await redis.lpush(`leads:tier:${priority}`, id);
      // Audit trail entry — a lightweight running log distinct from the lead record itself.
      await redis.lpush("leads:audit", JSON.stringify({ event: "lead_created", leadId: id, email: normalizedEmail, priority, score, at: now, ip }));
    } else {
      console.warn("Upstash не настроен — лид не сохранён, только лог:", lead);
    }
  } catch (e) {
    console.error("lead storage error", e);
  }

  /* ---------- Telegram + (optional) Slack/CRM webhook ---------- */
  const text = buildTelegramCard(lead);
  await Promise.all([sendTelegram(text), sendWebhook(text)]);

  return res.status(200).json({ ok: true, score, priority, advisor });
}
