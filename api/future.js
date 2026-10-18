// =====================================================================
// api/future.js — Vercel Serverless Function (Montaureo · Two Futures)
// Лимиты на Upstash Redis; язык ответа приходит из фронта (lang).
// KV: Vercel → Storage → Marketplace → Upstash → Redis → Connect to Project,
// затем  npm i @upstash/redis  и redeploy. Ключи интеграция кладёт в env сама.
// Body: { profile, lang, clientId, model }. Ключ модели — только в env.
// model: "claude" (Kate) | "qwen-plus" (Jun) | "mistral-medium-2508" (Emily)
// =====================================================================

import crypto from "crypto";
import { Redis } from "@upstash/redis";

const redis = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
    })
  : null;

const FREE_DAILY_LIMIT = Number(process.env.FUTURE_FREE_DAILY_LIMIT || 5);


// Храним не сам IP, а его хэш (GDPR) — страховка к clientId: очистка браузера лимит не сбрасывает.
function ipKey(req) {
  const xf = req.headers["x-forwarded-for"];
  const ip = String(Array.isArray(xf) ? xf[0] : xf || req.socket?.remoteAddress || "").split(",")[0].trim();
  return ip ? crypto.createHash("sha256").update(ip + (process.env.IP_SALT || "montaureo")).digest("hex").slice(0, 32) : null;
}

async function hit(key, limit) {
  const used = await redis.incr(key);
  if (used === 1) await redis.expire(key, 60 * 60 * 26);
  return used <= limit;
}

// Дневной лимит: по clientId и по IP (с запасом ×4 — семья или офис за одним адресом).
// Раньше без clientId лимита не было вовсе, а фронт clientId не отправлял.
async function consumeQuota(req, clientId, limit) {
  if (!redis) { console.warn("Upstash не настроен — лимит не применяется"); return true; }
  const day = new Date().toISOString().slice(0, 10);
  const ip = ipKey(req);
  try {
    const okClient = clientId ? await hit(`quota:future:c:${String(clientId).slice(0, 64)}:${day}`, limit) : true;
    const okIp = ip ? await hit(`quota:future:ip:${ip}:${day}`, limit * 4) : true;
    return okClient && okIp;
  } catch (e) {
    console.error("quota: Redis недоступен — запрос пропущен без лимита", e);
    return true;
  }
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
MFI has the deepest expertise and relationships in Monaco, UAE, Qatar, Singapore, Luxembourg, Switzerland, Liechtenstein and Andorra — give these priority when they genuinely fit, but never force them.
The client profile may already state a current residence in Monaco, Switzerland, UAE, Luxembourg, Liechtenstein, Andorra or Singapore — in that case the STAY scenario should reflect that jurisdiction's actual regime (it is already favorable), and the MOVE scenario should be a genuine upgrade, not a generic "leave France" narrative.`;

const SYSTEM = `You are Montaureo, a life architect for wealthy international families. You help make a LIFE DECISION, not pick a country.
Knowledge (current 2026):${KB}

The client thinks not "where to move" but "what do I lose if I stay". Build TWO FUTURES to 2036:
- STAY — the client stays in the current country;
- MOVE — the client moves to the ONE best country for their profile. HARD RULE: if the client's citizenship is France, the MOVE country must NOT be Monaco (unless the client explicitly asks to compare with Monaco).
Compare them and show the difference. Warm, personal, honest tone.

${JLOGIC}

The client profile includes both total wealth and liquid assets — use liquid assets when discussing what capital is realistically deployable (relocation costs, lump-sum tax regime minimums, real estate purchasing power), and total wealth only for overall positioning.

First — a cinematic scene of the MOVE future: NOT the country first, but a MOMENT of life (morning, children, school, airport, capital preserved vs the STAY scenario, weather). 4-6 short second-person sentences. The country is revealed in a separate field, not in the text.
CALCULATION BASE — always the same, so every run and every comparison is comparable:
- starting portfolio = midpoint of the LIQUID assets band (e.g. €2–10M → €6M); annual income = midpoint of the income band (€1M+ → €1.2M);
- portfolio return 6%/yr (2.5% income + 3.5% growth); family spending €400K/yr; horizon 2026–2036; the portfolio is not sold;
- only the tax rules change between STAY and MOVE. Put these numbers in "assumptions".
- If the profile gives a previous calculation base or a fixed STAY result, reuse them exactly.
INCOME: the profile states the client's MAIN income source (salary, business, dividends/investments or mixed). Tax treatment differs by source — model it accordingly. If it is "not specified", state the assumption you made in "assumptions".
COMPARISON REQUEST: if the profile says the client wants to compare with a specific MOVE destination, use EXACTLY that country as MOVE. If it brings little or no benefit for this citizenship (e.g. Monaco for a French national), say so honestly in "why" and "difference".
WHY: give 3 short reasons why the MOVE country fits THIS client (citizenship, priorities, income source, liquid assets) — concrete, no slogans.
ALTERNATIVES: 2 other countries worth comparing for this profile (never the STAY or MOVE country).
Fit score — an integer 0-100: how well the MOVE scenario matches the priorities the client selected. It is a judgement, not a probability; explain it in one line in "fitNote".

All amounts are illustrative estimates under assumptions, not a verdict on a country and not advice.

Return ONLY clean JSON, no markdown:
{"scene":{"month":"<Month 2036>","lines":["…","…","…","…","…"],"country":"<MOVE country>"},
 "confidence":82,
 "fitNote":"1 line: what drives the fit score up or down",
 "why":["reason 1","reason 2","reason 3"],
 "alternatives":["<country>","<country>"],
 "stay":{"country":"<current country>","tax":"short","capital2036":"€X.XM","school":"short","climate":"short"},
 "move":{"country":"<MOVE country>","tax":"short","capital2036":"€X.XM","school":"short","climate":"short"},
 "difference":["€X.XM saved","hours/yr saved","lower tax exposure","safer"],
 "assumptions":"1 line of assumptions",
 "disclaimer":"1 line: illustrative, not advice, confirm with an advisor"}
STRICT LENGTH (the result is read on a phone):
- tax: max 10 words; school: max 6 words; climate: max 6 words.
- capital2036: ONE figure like "€24.5M" — never a range, never a sentence.
- why: 3 items, max 18 words each. fitNote: max 20 words. difference: 4 items, max 10 words each.
- country names: plain names only ("UAE", "Malta"), no parentheses or city names.
- alternatives: plain country names only, never the STAY or MOVE country.`

function extractJson(raw) {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

async function callClaude(profile, langLine) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      temperature: 0.2,
      system: [
        { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }, // кешируется
        { type: "text", text: langLine },                                    // язык ответа
      ],
      messages: [{ role: "user", content: profile }],
    }),
  });
  if (!r.ok) { console.error("anthropic", r.status, await r.text().catch(() => "")); throw new Error("model_error"); }
  const data = await r.json();
  const raw = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
  return extractJson(raw);
}

async function callQwen(profile, langLine) {
  const r = await fetch("https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Authorization": `Bearer ${process.env.DASHSCOPE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "qwen-plus",
      max_tokens: 2048,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM + langLine },
        { role: "user", content: profile },
      ],
    }),
  });
  if (!r.ok) { console.error("qwen", r.status, await r.text().catch(() => "")); throw new Error("model_error"); }
  const data = await r.json();
  const raw = (data.choices?.[0]?.message?.content || "").trim();
  return extractJson(raw);
}

async function callMistral(profile, langLine) {
  const r = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: "mistral-medium-2508",
      max_tokens: 2048,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM + langLine },
        { role: "user", content: profile },
      ],
    }),
  });
  if (!r.ok) { console.error("mistral", r.status, await r.text().catch(() => "")); throw new Error("model_error"); }
  const data = await r.json();
  const raw = (data.choices?.[0]?.message?.content || "").trim();
  return extractJson(raw);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const body = req.body || {};
  const { profile, clientId } = body;
  if (!profile || typeof profile !== "string" || profile.length > 2000) return res.status(400).json({ error: "bad_request" });
  // В промпт попадают только значения из белых списков.
  const lang = ["English", "French", "Russian"].includes(body.lang) ? body.lang : "English";
  const model = ["claude", "qwen-plus", "mistral-medium-2508"].includes(body.model) ? body.model : "claude";

  if (!(await consumeQuota(req, clientId, FREE_DAILY_LIMIT))) return res.status(429).json({ error: "limit_reached", requestsLeft: 0 });

  const langLine = `\n\nRespond entirely in ${lang}. All JSON string values must be written in ${lang}.`;

  try {
    let parsed;
    if (model === "qwen-plus") parsed = await callQwen(profile, langLine);
    else if (model === "mistral-medium-2508") parsed = await callMistral(profile, langLine);
    else parsed = await callClaude(profile, langLine);

    // Guard: French nationals gain nothing tax-wise in Monaco (1963 treaty). If the model still picked it
    // without being asked to compare with Monaco, ask once more with an explicit correction.
    const isFrench = /citizenship France/i.test(profile);
    const askedMonaco = /compare with this MOVE destination:\s*Monaco/i.test(profile);
    const pickedMonaco = (p) => /monaco/i.test(String(p?.move?.country || p?.scene?.country || ""));
    if (isFrench && !askedMonaco && pickedMonaco(parsed)) {
      const fix = profile + " IMPORTANT: the client is a French national — Monaco is NOT allowed as the MOVE country. Choose the best other country.";
      try {
        const again = model === "qwen-plus" ? await callQwen(fix, langLine) : model === "mistral-medium-2508" ? await callMistral(fix, langLine) : await callClaude(fix, langLine);
        if (!pickedMonaco(again)) parsed = again;
      } catch (e) { console.error("monaco guard retry", e); }
    }
    // Tidy fields the UI shows as buttons.
    if (Array.isArray(parsed.alternatives)) parsed.alternatives = parsed.alternatives.map((x) => String(x).replace(/\s*\(.*?\)\s*/g, " ").trim()).filter(Boolean).slice(0, 3);
    return res.status(200).json(parsed);
  } catch (e) {
    console.error(e);
    if (e.message === "model_error") return res.status(502).json({ error: "model_error" });
    return res.status(502).json({ error: "parse_error" });
  }
}
