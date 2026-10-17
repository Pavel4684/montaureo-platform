// =====================================================================
// api/concierge.js — Vercel Serverless Function (Montaureo · Velvet Concierge)
// Лимиты на Upstash Redis; язык ответа по умолчанию из фронта (lang),
// но если последнее сообщение клиента на другом языке — отвечаем на нём.
// KV: Vercel → Storage → Marketplace → Upstash → Redis → Connect to Project,
// затем  npm i @upstash/redis  и redeploy.
// Body: { profileText, persona, focus, moveCountry, messages, lang, clientId, model, accessToken, email }.
// ДОСТУП ПРОВЕРЯЕТСЯ ЗДЕСЬ, НА СЕРВЕРЕ: подписанный токен (ACCESS_TOKEN_SECRET) + действующая
// запись access:<email> в Redis, которую пишут Stripe webhook и session-email.
// Поле isPaid от браузера больше не принимается. Без оплаты — 402 payment_required.
// Пока ACCESS_TOKEN_SECRET не задан, оплата проверяется по email (слабее, но уже на сервере).
// persona → model: Kate → claude | Jun → qwen-plus | Emily → mistral-medium-2508
// =====================================================================

import crypto from "crypto";
import { Redis } from "@upstash/redis";

const redis = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
    })
  : null;

// Потолок для платного клиента — защита от злоупотребления, а не тариф.
const PAID_DAILY_LIMIT = Number(process.env.CONCIERGE_PAID_DAILY_LIMIT || 300);
const MAX_MESSAGES = 20;     // в модель уходят только последние 20 реплик
const MAX_MSG_CHARS = 4000;  // и каждая не длиннее 4000 символов

// Fallback: derive model from persona if the frontend didn't send one explicitly.
const PERSONA_MODEL = {
  Kate: "claude",
  Jun: "qwen-plus",
  Emily: "mistral-medium-2508",
};

// ---------- Проверка доступа ----------
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

// Возвращает email платного клиента или null.
async function paidEmail(body) {
  if (!redis) return null;
  let email = verifyAccessToken(body.accessToken);
  // Переходный режим: пока секрет не задан, принимаем email (как check-access сегодня).
  if (!email && !process.env.ACCESS_TOKEN_SECRET && typeof body.email === "string" && body.email.includes("@")) {
    email = body.email.trim().toLowerCase();
  }
  if (!email) return null;
  try {
    const record = await redis.get(`access:${email}`);
    return record && Number(record.expiresAt || 0) > Date.now() ? email : null;
  } catch (e) {
    console.error("access check: Redis недоступен", e);
    return null;
  }
}

async function underPaidLimit(email) {
  try {
    const key = `quota:concierge:paid:${email}:${new Date().toISOString().slice(0, 10)}`;
    const used = await redis.incr(key);
    if (used === 1) await redis.expire(key, 60 * 60 * 26);
    return used <= PAID_DAILY_LIMIT;
  } catch { return true; }
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
- Leaving France can trigger the French exit tax on substantial shareholdings — flag it as a point for the advisor.
- US citizens: the US taxes its citizens on worldwide income wherever they live — a move alone does not remove US tax; say so clearly.
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
NEVER re-ask anything already in the profile (total wealth, liquid assets, family, citizenship, country, goals, interests).
Rely on the profile and get to the point — e.g. "Given your profile…".
When discussing credit, Lombard lending, or banking account thresholds, reference the client's LIQUID assets specifically, not total wealth — total wealth may include illiquid real estate or business equity that cannot be pledged, deposited, or drawn against.

CRITICAL KYC RULE:
For account-opening questions, give a clear list of required documents (passport, proof of address, source of funds, etc.). BUT:
- NEVER ask the client to upload, send or paste documents;
- NEVER offer to check, verify or analyze their documents;
- direct them to submit documents directly to the bank or to their MFI advisor.
You provide ONLY information about requirements; you do not process documents.

FORMAT — return ONLY clean JSON, no markdown, no code fences, no text before or after the JSON object:
{"agent":"Banking|Credit|RealEstate|Lifestyle|Events|KYC|Wealth",
 "text":"1-3 sentence answer",
 "card": null | {"title":"...","rows":[{"primary":"...","secondary":"...","meta":"...","accent":true|false}]}}
Use a card for lists, comparisons and checklists (3-5 rows); otherwise card=null.
Do not add any commentary, offers, or follow-up text outside the JSON object — everything you want to say to the client must be inside the "text" field.`;

function personaTone(persona) {
  if (persona === "Kate") return "warm, attentive";
  if (persona === "Jun") return "fast, direct, to the point";
  if (persona === "Emily") return "sharp, analytical, structured";
  return "direct, to the point";
}

// The model is instructed to return ONLY a JSON object, but in practice it may still:
//   (a) wrap the JSON in a ```json ... ``` fence,
//   (b) add prose before or after the fenced/raw JSON (e.g. a follow-up offer),
//   (c) get cut off mid-object if it hits the token limit.
// We handle (a) and (b) by extracting just the JSON payload before parsing.
// (c) will still fail to parse — that's expected, and we fall back gracefully
// rather than ever showing the client raw or partially-broken JSON.
function extractParsed(raw) {
  try {
    let jsonStr = raw;

    // Case (a)/(b): a fenced code block — take only what's inside the fence,
    // ignoring anything the model added before or after it.
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch) {
      jsonStr = fenceMatch[1];
    } else {
      // No fence: assume the JSON object is somewhere in the text and extract
      // from the first "{" to the last "}", trimming any leading/trailing prose.
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        jsonStr = raw.slice(start, end + 1);
      }
    }

    const parsed = JSON.parse(jsonStr.trim());
    // Basic shape check — if the model returned valid JSON that isn't our
    // expected shape at all, treat it the same as a parse failure.
    if (typeof parsed !== "object" || parsed === null || typeof parsed.text !== "string") {
      throw new Error("unexpected_shape");
    }
    return parsed;
  } catch {
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
      messages,
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
  const body = req.body || {};

  // 1) Консьерж — платная услуга: проверяем оплату сами, а не верим браузеру.
  const email = await paidEmail(body);
  if (!email) return res.status(402).json({ error: "payment_required" });
  if (!(await underPaidLimit(email))) return res.status(429).json({ error: "limit_reached" });
  const isPaid = true;

  // 2) История: только реплики user/assistant, последние 20, каждая ≤ 4000 символов, начиная с клиента.
  const messages = Array.isArray(body.messages)
    ? body.messages.filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .slice(-MAX_MESSAGES).map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MSG_CHARS) }))
    : [];
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length) return res.status(400).json({ error: "bad_request" });

  // 3) Всё, что попадает в промпт, — из белых списков или обрезано.
  const clip = (v, n) => (typeof v === "string" ? v.slice(0, n) : "");
  const persona = PERSONA_MODEL[body.persona] ? body.persona : "Kate";
  const focus = ["Banking", "RealEstate", "Lifestyle", "Events", "Credit", "Legal"].includes(body.focus) ? body.focus : null;
  const lang = ["English", "French", "Russian"].includes(body.lang) ? body.lang : "English";
  const profileText = clip(body.profileText, 1500);
  const moveCountry = clip(body.moveCountry, 60);
  const resolvedModel = Object.values(PERSONA_MODEL).includes(body.model) ? body.model : PERSONA_MODEL[persona];
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
