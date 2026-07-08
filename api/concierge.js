// =====================================================================
// api/concierge.js — Vercel Serverless Function (Montaureo · Velvet Concierge)
// Лимиты на Upstash Redis; язык ответа по умолчанию из фронта (lang),
// но если последнее сообщение клиента на другом языке — отвечаем на нём.
// KV: Vercel → Storage → Marketplace → Upstash → Redis → Connect to Project,
// затем  npm i @upstash/redis  и redeploy.
// Body: { profileText, persona, focus, moveCountry, messages, lang, clientId, isPaid, model }.
// persona → model: Kate → claude | Jun → qwen-plus | Emily → mistral-medium-2508
// =====================================================================

import { Redis } from "@upstash/redis";

const redis = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
    })
  : null;

const FREE_DAILY_LIMIT = Number(process.env.CONCIERGE_FREE_DAILY_LIMIT || 20);

// Fallback: derive model from persona if the frontend didn't send one explicitly.
const PERSONA_MODEL = {
  Kate: "claude",
  Jun: "qwen-plus",
  Emily: "mistral-medium-2508",
};

async function consumeQuota(clientId, limit) {
  if (!clientId) return { ok: true, left: limit };
  if (!redis) { console.warn("Upstash не настроен — лимит не применяется"); return { ok: true, left: limit }; }
  const day = new Date().toISOString().slice(0, 10);
  const key = `quota:concierge:${clientId}:${day}`;
  const used = await redis.incr(key);
  if (used === 1) await redis.expire(key, 60 * 60 * 26);
  if (used > limit) return { ok: false, left: 0 };
  return { ok: true, left: limit - used };
}

const KB = `
0% income tax: UAE, Qatar, Monaco (NOT for French citizens — 1963 treaty), Bahrain, Bahamas, Cayman.
Territorial (foreign income untaxed): Singapore, Hong Kong, Panama, Georgia, Costa Rica, Malaysia, Thailand.
Lump-sum: Italy €300,000/yr from 2026 (family +€50K, 15 yrs); Switzerland forfait; Greece €100,000/yr.
Low/special: Andorra ~10%, Bulgaria 10%, Cyprus non-dom, Malta non-dom.
Closed/narrowed: UK non-dom abolished (2025); Portugal NHR closed (narrower IFICI successor).
High tax (where people leave from): France, Germany, UK, Canada, Scandinavia.
`;

const JLOGIC = `Jurisdiction coverage is OPEN — consider ANY relevant jurisdiction worldwide; the knowledge above is a starting set, not a limit. Match the destination to the client's CITIZENSHIP and constraints, never one-size-fits-all:
- French nationals: Monaco does NOT remove French income tax (the 1963 France–Monaco treaty taxes French citizens resident in Monaco as if French residents) — never propose Monaco to them.
- Wants to stay in the EU: consider Italy (lump-sum flat tax), Portugal, Greece, Cyprus, Malta.
- Open to leaving the EU: consider 0%/territorial or more exotic options (UAE, Costa Rica, Caribbean, Singapore/Hong Kong).
MFI has the deepest expertise and relationships in Monaco, UAE, Qatar, Singapore, Luxembourg, Switzerland, Liechtenstein and Andorra — give these priority when they genuinely fit, but never force them.`;

const SYSTEM = `You are Velvet Concierge of the Montaureo platform: a private AI concierge for VIP clients with significant capital.
Jurisdiction coverage is open — you advise on any relevant jurisdiction worldwide.
Tone: discreet, precise, numbers first, never pushy.
Knowledge (current 2026):${KB}

${JLOGIC}

Agents (pick the right one): Banking, Credit, RealEstate, Lifestyle, Events, KYC, Wealth.

THE CLIENT PROFILE IS ALREADY KNOWN (see the dynamic block).
NEVER re-ask anything already in the profile (total wealth, liquid assets, family, country, goals, interests).
Rely on the profile and get to the point — e.g. "Given your profile…".
When discussing credit, Lombard lending, or banking account thresholds, reference the client's LIQUID assets specifically, not total wealth — total wealth may include illiquid real estate or business equity that cannot be pledged, deposited, or drawn against.

CRITICAL KYC RULE:
For account-opening questions, give a clear list of required documents (passport, proof of address, source of funds, etc.). BUT:
- NEVER ask the client to upload, send or paste documents;
- NEVER offer to check, verify or analyze their documents;
- direct them to submit documents directly to the bank or to their MFI advisor.
You provide ONLY information about requirements; you do not process documents.

FORMAT — return ONLY clean JSON, no markdown:
{"agent":"Banking|Credit|RealEstate|Lifestyle|Events|KYC|Wealth",
 "text":"1-3 sentence answer",
 "card": null | {"title":"...","rows":[{"primary":"...","secondary":"...","meta":"...","accent":true|false}]}}
Use a card for lists, comparisons and checklists (3-5 rows); otherwise card=null.`;

function personaTone(persona) {
  if (persona === "Kate") return "warm, attentive";
  if (persona === "Jun") return "fast, direct, to the point";
  if (persona === "Emily") return "sharp, analytical, structured";
  return "direct, to the point";
}

// If the model's reply gets cut off mid-JSON (token limit) or is otherwise malformed,
// JSON.parse throws — in that case we never show the raw, half-finished JSON to the
// client. We log it for diagnostics and return a short, friendly retry message instead.
function extractParsed(raw) {
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
  catch {
    console.error("concierge JSON parse failed, raw output:", raw);
    return { agent: "Velvet", text: "Let me pull that together properly — could you ask me again?", card: null };
  }
}

async function callClaude(dynamic, messages, isPaid) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: isPaid ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: [
        { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }, // кешируется
        { type: "text", text: dynamic },                                     // профиль/персона/фокус/язык
      ],
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!r.ok) { console.error("anthropic", r.status, await r.text().catch(() => "")); throw new Error("model_error"); }
  const data = await r.json();
  const raw = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
  return extractParsed(raw);
}

async function callQwen(dynamic, messages) {
  const r = await fetch("https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Authorization": `Bearer ${process.env.DASHSCOPE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "qwen-plus",
      max_tokens: 2048,
      messages: [
        { role: "system", content: SYSTEM + "\n\n" + dynamic },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });
  if (!r.ok) { console.error("qwen", r.status, await r.text().catch(() => "")); throw new Error("model_error"); }
  const data = await r.json();
  const raw = (data.choices?.[0]?.message?.content || "").trim();
  return extractParsed(raw);
}

async function callMistral(dynamic, messages) {
  const r = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: "mistral-medium-2508",
      max_tokens: 2048,
      messages: [
        { role: "system", content: SYSTEM + "\n\n" + dynamic },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });
  if (!r.ok) { console.error("mistral", r.status, await r.text().catch(() => "")); throw new Error("model_error"); }
  const data = await r.json();
  const raw = (data.choices?.[0]?.message?.content || "").trim();
  return extractParsed(raw);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const {
    profileText, persona = "Kate", focus = null, moveCountry = null,
    messages, clientId, isPaid = false, lang = "English", model,
  } = req.body || {};
  if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: "bad_request" });

  if (!isPaid) {
    const quota = await consumeQuota(clientId, FREE_DAILY_LIMIT);
    if (!quota.ok) return res.status(429).json({ error: "limit_reached", requestsLeft: 0 });
  }

  const resolvedModel = model || PERSONA_MODEL[persona] || "claude";
  const dynamic = `Client profile: ${profileText || "not provided"}.${moveCountry ? ` The client is considering moving to ${moveCountry}.` : ""}\nService persona: ${persona} (${personaTone(persona)}).${focus ? `\nCurrent focus: ${focus} — act as this agent.` : ""}\nDefault response language: ${lang}, unless the client's last message is clearly in another language.`;

  try {
    let parsed;
    if (resolvedModel === "qwen-plus") parsed = await callQwen(dynamic, messages);
    else if (resolvedModel === "mistral-medium-2508") parsed = await callMistral(dynamic, messages);
    else parsed = await callClaude(dynamic, messages, isPaid);
    return res.status(200).json(parsed);
  } catch (e) {
    console.error(e);
    if (e.message === "model_error") return res.status(502).json({ error: "model_error" });
    return res.status(500).json({ error: "server_error" });
  }
}
