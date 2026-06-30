// =====================================================================
// api/sla-check.js — Vercel Cron Function (Montaureo · SLA escalation)
// Scans the tiered lead queues for leads still status:"new" past their
// first-contact SLA, and escalates via Telegram. Two escalation levels:
//   Level 1 — SLA breached            → advisor channel (TELEGRAM_CHAT_ID)
//   Level 2 — 2x SLA breached         → escalation channel
//             (TELEGRAM_ESCALATION_CHAT_ID, e.g. a director / backup advisor)
// Each level fires once per lead (de-duped via a Redis marker), so this
// can run on a frequent schedule (e.g. every 10–15 minutes) without
// spamming the same lead repeatedly.
//
// Deploy: add to vercel.json —
//   {
//     "crons": [
//       { "path": "/api/sla-check", "schedule": "*/15 * * * *" }
//     ]
//   }
// Vercel automatically calls cron paths with
//   Authorization: Bearer ${CRON_SECRET}
// when the CRON_SECRET env var is set — set one and this endpoint will
// reject any request that doesn't carry it, so it can't be triggered by
// an outside party hitting the URL directly.
//
// Env (required):
//   UPSTASH_REDIS_REST_URL / KV_REST_API_URL
//   UPSTASH_REDIS_REST_TOKEN / KV_REST_API_TOKEN
//   TELEGRAM_BOT_TOKEN
//   TELEGRAM_CHAT_ID                — level 1 (advisor) channel
// Env (optional but recommended):
//   CRON_SECRET                     — protects this endpoint from outside calls
//   TELEGRAM_ESCALATION_CHAT_ID     — level 2 (director / backup advisor) channel
// =====================================================================

import { Redis } from "@upstash/redis";

const redis = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
    })
  : null;

// First-contact SLA per tier, in minutes — matches the MFI response-time policy.
const SLA_MINUTES = { RED: 30, GOLD: 120, PRIORITY: 480, STANDARD: 1440 };
const TIER_EMOJI = { RED: "🔴", GOLD: "🟡", PRIORITY: "🔵", STANDARD: "⚪" };

// How long an escalation marker is kept — long enough that a lead won't be
// re-escalated at the same level once flagged, even across many cron runs.
const ESCALATION_MARKER_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Leads older than this are assumed dead/abandoned and are skipped entirely —
// without this, the scan cost grows unbounded as the tier lists accumulate
// months of history, even though only recent leads can still be SLA-relevant.
const MAX_LEAD_AGE_MINUTES = 60 * 24 * 7; // 7 days

async function sendTelegram(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return false;
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    return r.ok;
  } catch (e) {
    console.error("telegram escalation send error", e);
    return false;
  }
}

function minutesSince(iso) {
  if (!iso) return Infinity;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Infinity;
  return (Date.now() - then) / 60000;
}

async function alreadyEscalated(leadId, level) {
  if (!redis) return false;
  try {
    const key = `escalation:level${level}:${leadId}`;
    const existing = await redis.get(key);
    return Boolean(existing);
  } catch (e) {
    console.error("escalation marker read error", e);
    return false; // fail open — better a possible duplicate alert than a silently lost VIP lead
  }
}

async function markEscalated(leadId, level) {
  if (!redis) return;
  try {
    const key = `escalation:level${level}:${leadId}`;
    await redis.set(key, "1", { ex: ESCALATION_MARKER_TTL_SECONDS });
  } catch (e) {
    console.error("escalation marker write error", e);
  }
}

async function isLeadStillNew(leadId) {
  if (!redis) return true; // fail open in dev/demo without storage configured
  try {
    const raw = await redis.get(leadId);
    if (!raw) return false; // lead vanished — nothing to escalate
    const lead = typeof raw === "string" ? JSON.parse(raw) : raw;
    return (lead.status || "new") === "new";
  } catch (e) {
    console.error("re-check lead status error", e);
    return true; // fail open — better a possible duplicate alert than a silently lost VIP lead
  }
}

async function auditLog(event) {
  if (!redis) return;
  try {
    await redis.lpush("leads:audit", JSON.stringify({ ...event, at: new Date().toISOString() }));
  } catch (e) {
    console.error("audit log error", e);
  }
}

function buildEscalationText({ lead, leadId, level, tier, ageMinutes, slaMinutes }) {
  const emoji = TIER_EMOJI[tier] || "⚪";
  const levelLabel = level === 1 ? "SLA BREACH" : "ESCALATION — STILL UNCONTACTED";
  return (
    `🚨 ${emoji} ${tier} ${levelLabel}\n\n` +
    `Lead has been status:"new" for ${Math.round(ageMinutes)} min (SLA: ${slaMinutes} min).\n\n` +
    `Name: ${lead.name || "—"}\n` +
    `Email: ${lead.email || "—"}\n` +
    `Phone: ${lead.phone || "—"}\n` +
    `Goal: ${lead.goal || "—"}\n` +
    `Score: ${lead.score != null ? lead.score : "—"}\n` +
    `Assigned advisor: ${lead.advisor || "—"}\n` +
    `Created: ${lead.createdAt || lead.receivedAt || "—"}\n` +
    `Lead ID: ${leadId}`
  );
}

async function processTier(tier, results) {
  const listKey = `leads:tier:${tier}`;
  const slaMinutes = SLA_MINUTES[tier];

  let ids = [];
  try {
    ids = await redis.lrange(listKey, 0, 199); // cap a single run's scan — fine for MVP volumes
  } catch (e) {
    console.error(`sla-check: failed to read ${listKey}`, e);
    return;
  }

  for (const leadId of ids) {
    let raw;
    try {
      raw = await redis.get(leadId);
    } catch (e) {
      continue;
    }
    if (!raw) continue;

    let lead;
    try {
      lead = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      continue;
    }

    // Only "new" leads matter for SLA — once an advisor has acted, the clock stops.
    if ((lead.status || "new") !== "new") continue;

    const ageMinutes = minutesSince(lead.createdAt || lead.receivedAt);

    // Skip stale/abandoned leads entirely — keeps the scan bounded as history grows.
    if (ageMinutes > MAX_LEAD_AGE_MINUTES) continue;

    if (ageMinutes <= slaMinutes) continue;

    results.scanned += 1;

    // Level 1 — SLA breached → advisor channel.
    const level1Done = await alreadyEscalated(leadId, 1);
    if (!level1Done) {
      // Re-read the lead immediately before acting: an advisor may have marked
      // it "contacted" in the moments since the check above (read → advisor
      // acts → cron still escalates is the race this closes).
      const stillNew = await isLeadStillNew(leadId);
      if (stillNew) {
        const text = buildEscalationText({ lead, leadId, level: 1, tier, ageMinutes, slaMinutes });
        const sent = await sendTelegram(process.env.TELEGRAM_CHAT_ID, text);
        await markEscalated(leadId, 1);
        await auditLog({ event: "sla_escalation_level1", leadId, tier, ageMinutes: Math.round(ageMinutes), sent });
        results.level1 += 1;
      }
    }

    // Level 2 — double the SLA window and still untouched → director / backup advisor.
    if (ageMinutes > slaMinutes * 2) {
      const level2Done = await alreadyEscalated(leadId, 2);
      if (!level2Done) {
        const stillNew = await isLeadStillNew(leadId);
        if (stillNew) {
          const text = buildEscalationText({ lead, leadId, level: 2, tier, ageMinutes, slaMinutes });
          const chatId = process.env.TELEGRAM_ESCALATION_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
          const sent = await sendTelegram(chatId, text);
          await markEscalated(leadId, 2);
          await auditLog({ event: "sla_escalation_level2", leadId, tier, ageMinutes: Math.round(ageMinutes), sent });
          results.level2 += 1;
        }
      }
    }
  }
}

export default async function handler(req, res) {
  // Vercel Cron sends GET; allow POST too for manual/local triggering during setup.
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  // Guard against this endpoint being hit by anyone who finds the URL.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers["authorization"] || "";
    if (authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: "unauthorized" });
    }
  }

  if (!redis) {
    return res.status(503).json({ error: "storage_not_configured", message: "Upstash Redis is not configured" });
  }
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    return res.status(503).json({ error: "telegram_not_configured", message: "TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID are not set" });
  }

  const results = { scanned: 0, level1: 0, level2: 0 };

  try {
    await Promise.all(Object.keys(SLA_MINUTES).map((tier) => processTier(tier, results)));
    return res.status(200).json({ ok: true, ...results });
  } catch (e) {
    console.error("sla-check error", e);
    return res.status(500).json({ error: "server_error" });
  }
}
