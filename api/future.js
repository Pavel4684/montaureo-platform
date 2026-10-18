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

const JLOGIC = `The MOVE country is chosen ONLY from the candidate list computed by Montaureo's model (below). Match the destination to the client's CITIZENSHIP and constraints, never one-size-fits-all:
- French nationals: Monaco does NOT remove French income tax (the 1963 France–Monaco treaty taxes French citizens resident in Monaco as if French residents) — never propose Monaco to them.
- Leaving France can trigger the French exit tax on substantial shareholdings — flag it as a point for the advisor.
- US citizens: the US taxes its citizens on worldwide income wherever they live — a move alone does not remove US tax; say so clearly.
- Wants to stay in the EU: consider Italy (lump-sum flat tax), Portugal, Greece, Cyprus, Malta.
- Open to leaving the EU: consider 0%/territorial or more exotic options (UAE, Costa Rica, Caribbean, Singapore/Hong Kong).
MFI has the deepest expertise and relationships in Monaco, UAE, Qatar, Singapore, Luxembourg, Switzerland, Liechtenstein and Andorra — give these priority when they genuinely fit, but never force them.
The client profile may already state a current residence in Monaco, Switzerland, UAE, Luxembourg, Liechtenstein, Andorra or Singapore — in that case the STAY scenario should reflect that jurisdiction's actual regime (it is already favorable), and the MOVE scenario should be a genuine upgrade, not a generic "leave France" narrative.`;

// ===================== DETERMINISTIC CALCULATION (all money is computed here, never by the AI) =====================
// One formula for every scenario. Per year:
//   portfolio income P = 2.5% × capital;   growth = 3.5% × capital
//   tax = rateOnIncome × income + ratePortfolio × P + wealthRate × capital + fixed (+ remitRate × spending)
//   capital(next) = capital + growth + P + income − spending − tax
// Income is money earned OUTSIDE the liquid portfolio (salary, business profits or dividends from the client's own company),
// so portfolio returns are never counted twice. Only the tax rules change between STAY and MOVE.

const LIQUID_MID = { l1: 0.3, l2: 1.25, l3: 6, l4: 30, l5: 75 };          // € millions — midpoint of each band
const LIQUID_LABEL = { l1: "< €500K", l2: "€500K–2M", l3: "€2–10M", l4: "€10–50M", l5: "€50M+" };
const INCOME_MID = { i1: 0.15, i2: 0.35, i3: 0.75, i4: 1.2 };              // € millions per year
const SRC = { s1: "salary", s2: "business", s3: "dividends", s4: "mixed" };
const YIELD = 0.025, GROWTH = 0.035, SPEND_SHARE = 0.4, YEARS = 10, START_YEAR = 2026;

// Simplified effective top rates for a high earner (2026). sal = salary, biz = business profits,
// div = dividends from own company, port = tax on portfolio income (dividends + interest).
// fixed = annual lump sum (€M), wealth = yearly tax as a share of capital, remit = tax on money brought in to live on.
const ORDINARY = {
  UK:          { name: "United Kingdom", sal: 0.44, biz: 0.44, div: 0.3935, port: 0.41, label: "Income tax up to 45% · dividends 39.35%" },
  France:      { name: "France", sal: 0.50, biz: 0.50, div: 0.34, port: 0.34, label: "Income tax up to 45% + social charges" },
  Germany:     { name: "Germany", sal: 0.475, biz: 0.475, div: 0.264, port: 0.264, label: "Income tax up to 45% + solidarity" },
  Switzerland: { name: "Switzerland", sal: 0.40, biz: 0.40, div: 0.30, port: 0.30, label: "Ordinary taxation, canton-dependent" },
  Luxembourg:  { name: "Luxembourg", sal: 0.458, biz: 0.458, div: 0.21, port: 0.21, label: "Income tax up to 45.8%" },
  Liechtenstein: { name: "Liechtenstein", sal: 0.22, biz: 0.22, div: 0, port: 0, wealth: 0.0088, label: "Up to ~22% + tax on deemed wealth yield" },
  Andorra:     { name: "Andorra", sal: 0.10, biz: 0.10, div: 0.10, port: 0.10, label: "10% flat" },
  Singapore:   { name: "Singapore", sal: 0.24, biz: 0.17, div: 0, port: 0, label: "Up to 24% · foreign dividends exempt" },
  Monaco:      { name: "Monaco", sal: 0, biz: 0, div: 0, port: 0, label: "0% personal income tax" },
  UAE:         { name: "UAE", sal: 0, biz: 0.09, div: 0, port: 0, label: "0% personal income tax" },
  Other:       { name: "Current country", sal: 0.45, biz: 0.45, div: 0.30, port: 0.30, label: "Typical high-tax European rates" },
};
// Destinations, with the regime a new resident would normally use. Income is assumed to keep arising abroad.
const DEST = {
  Monaco:      { ...ORDINARY.Monaco },
  UAE:         { name: "UAE", sal: 0, biz: 0, div: 0, port: 0, label: "0% personal income tax" },
  Qatar:       { name: "Qatar", sal: 0, biz: 0, div: 0, port: 0, label: "0% personal income tax" },
  Bahamas:     { name: "Bahamas", sal: 0, biz: 0, div: 0, port: 0, label: "0% personal income tax" },
  Switzerland: { name: "Switzerland", sal: 0, biz: 0, div: 0, port: 0, fixed: 0.2, label: "Lump-sum (forfait) ~€200K/yr" },
  Italy:       { name: "Italy", sal: 0, biz: 0, div: 0, port: 0, fixed: 0.3, label: "€300K/yr flat tax on foreign income" },
  Greece:      { name: "Greece", sal: 0, biz: 0, div: 0, port: 0, fixed: 0.1, label: "€100K/yr flat tax on foreign income" },
  Cyprus:      { name: "Cyprus", sal: 0.35, biz: 0.35, div: 0, port: 0, label: "Non-dom: dividends & interest 0%" },
  Malta:       { name: "Malta", sal: 0, biz: 0, div: 0, port: 0, fixed: 0.005, remit: 0.35, label: "Non-dom: tax only on money brought in" },
  Andorra:     { ...ORDINARY.Andorra },
  Luxembourg:  { ...ORDINARY.Luxembourg },
  Liechtenstein: { ...ORDINARY.Liechtenstein },
  Singapore:   { name: "Singapore", sal: 0, biz: 0, div: 0, port: 0, label: "Foreign income not taxed" },
  "Hong Kong": { name: "Hong Kong", sal: 0, biz: 0, div: 0, port: 0, label: "Territorial: foreign income not taxed" },
  "Costa Rica": { name: "Costa Rica", sal: 0, biz: 0, div: 0, port: 0, label: "Territorial: foreign income not taxed" },
};
const FROM_KEY = { pOther: "Other", pMC: "Monaco", pCH: "Switzerland", pAE: "UAE", pLU: "Luxembourg", pLI: "Liechtenstein", pAD: "Andorra", pSG: "Singapore", pFR: "France", pUK: "UK", pDE: "Germany" };
const ALIAS = { "united arab emirates": "UAE", dubai: "UAE", "abu dhabi": "UAE", uae: "UAE", "united kingdom": "UK", uk: "UK", britain: "UK", "hong kong": "Hong Kong", "costa rica": "Costa Rica" };

function destKey(name) {
  const k = String(name || "").toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
  if (ALIAS[k]) return DEST[ALIAS[k]] ? ALIAS[k] : null;
  return Object.keys(DEST).find((d) => d.toLowerCase() === k) || null;
}

function incomeRate(r, src) {
  if (src === "s1") return r.sal;
  if (src === "s2") return r.biz;
  if (src === "s3") return r.div;
  if (src === "s4") return (r.sal + r.div) / 2;
  return r.sal; // not specified → treated as salary (stated in the assumptions)
}

function simulate(regime, src, start, income) {
  const spend = SPEND_SHARE * income;
  const rInc = incomeRate(regime, src);
  let c = start, total = 0, first = 0;
  const path = [];
  for (let y = 1; y <= YEARS; y++) {
    const p = YIELD * c;
    const tax = rInc * income + regime.port * p + (regime.wealth || 0) * c + (regime.fixed || 0) + (regime.remit || 0) * spend;
    c = c + GROWTH * c + p + income - spend - tax;
    total += tax; if (y === 1) first = tax;
    path.push({ year: START_YEAR + y, capital: +c.toFixed(3), tax: +tax.toFixed(3) });
  }
  return { end: c, taxFirstYear: first, taxTotal: total, path };
}

const M = (x) => `€${(Math.round(x * 10) / 10).toFixed(1)}M`;
const K = (x) => (Math.abs(x) >= 1 ? M(x) : `€${Math.round(x * 1000)}K`);

// inputs: { liquid, income, src, citizen, from }
function computeScenarios(inputs) {
  const start = LIQUID_MID[inputs.liquid] ?? 6;
  const income = INCOME_MID[inputs.income] ?? 0.75;
  const french = inputs.citizen === "zFR";
  const stayKey = FROM_KEY[inputs.from] || "Other";
  // French nationals living in Monaco are taxed as French residents (1963 treaty).
  const stayRegime = stayKey === "Monaco" && french ? { ...ORDINARY.France, name: "Monaco", label: "French tax applies (1963 treaty)" } : ORDINARY[stayKey];
  const stay = { key: stayKey, name: stayRegime.name, regime: stayRegime, ...simulate(stayRegime, inputs.src, start, income) };
  const candidates = {};
  for (const [key, reg] of Object.entries(DEST)) {
    if (key === stayKey) continue;
    const regime = key === "Monaco" && french ? { ...ORDINARY.France, name: "Monaco", label: "French tax still applies (1963 treaty)" } : reg;
    const sim = simulate(regime, inputs.src, start, income);
    candidates[key] = { key, name: regime.name, regime, ...sim, gain: sim.end - stay.end };
  }
  return { start, income, spend: SPEND_SHARE * income, stay, candidates, french };
}

function assumptionsLine(base, inputs) {
  const src = SRC[inputs.src] ? `${SRC[inputs.src]}` : "salary (not specified)";
  return `Start ${M(base.start)} liquid (midpoint of ${LIQUID_LABEL[inputs.liquid] || "your band"}) · income ${K(base.income)}/yr from ${src}, earned outside the portfolio · portfolio return 6%/yr (2.5% income + 3.5% growth), reinvested · spending ${K(base.spend)}/yr · ${START_YEAR}–${START_YEAR + YEARS} · portfolio not sold · simplified effective tax rates; exit taxes and wealth/inheritance taxes not included${inputs.citizen === "zNA" ? " · US citizens stay taxed by the US wherever they live" : ""}`;
}


const SYSTEM = `You are Montaureo, a life architect for wealthy international families. You help make a LIFE DECISION, not pick a country.
Knowledge (current 2026):${KB}

${JLOGIC}

ALL MONEY IS ALREADY CALCULATED BY MONTAUREO'S MODEL (given below the client profile). You do NOT calculate anything.
- Never invent, change or re-derive amounts. If you mention money, use ONLY the exact figures given (e.g. the capital gain).
- Your job: choose the MOVE country from the candidate list (unless one is fixed), and explain it.

Choose MOVE by balancing the client's PRIORITIES with the computed gain — the highest gain is not automatically the best life.
Never choose a candidate that is not in the list. If a MOVE country is fixed by the client, use it and be honest if it brings little benefit.

Write:
- scene: a cinematic MOMENT of life in the MOVE future in April 2036 (morning, children, school, airport, weather) — 4-5 short second-person sentences; do not name the country; at most ONE sentence may mention money, and only the exact capital gain given.
- why: 3 reasons this MOVE country fits THIS client (citizenship, priorities, income source) — max 18 words each, no new numbers.
- confidence: integer 0-100, how well MOVE matches the priorities the client selected (a judgement, not a probability); fitNote: max 20 words explaining it.
- alternatives: 2 other candidate KEYS worth comparing.
- school and climate for STAY and MOVE: max 6 words each.
- extra: 1 qualitative difference of moving (lifestyle, safety, travel) — max 10 words, no numbers.

Return ONLY clean JSON, no markdown:
{"move":"<candidate KEY>","scene":{"month":"April 2036","lines":["…","…","…","…"]},"confidence":80,"fitNote":"…","why":["…","…","…"],"alternatives":["<KEY>","<KEY>"],
 "school":{"stay":"…","move":"…"},"climate":{"stay":"…","move":"…"},"extra":"…"}`;

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

// Reverse maps so an older page that only sends the profile text still gets a correct calculation.
const LABEL_TO_KEY = {
  liquid: { "< €500K": "l1", "€500K–2M": "l2", "€2–10M": "l3", "€10–50M": "l4", "€50M+": "l5" },
  income: { "< €200K": "i1", "€200–500K": "i2", "€500K–1M": "i3", "€1M+": "i4" },
  src: { "Salary": "s1", "Business / company": "s2", "Dividends & investments": "s3", "Mixed": "s4" },
  citizen: { "France": "zFR", "Other EU": "zEU", "UK": "zUK", "US/Canada": "zNA", "Other": "zOther" },
  from: { "Other": "pOther", "Monaco": "pMC", "Switzerland": "pCH", "UAE": "pAE", "Luxembourg": "pLU", "Liechtenstein": "pLI", "Andorra": "pAD", "Singapore": "pSG", "France": "pFR", "United Kingdom": "pUK", "Germany": "pDE" },
};
const ALLOWED = { liquid: Object.keys(LIQUID_MID), income: Object.keys(INCOME_MID), src: Object.keys(SRC), citizen: ["zFR", "zEU", "zUK", "zNA", "zOther"], from: Object.keys(FROM_KEY) };
function readInputs(body, profile) {
  const inp = body.inputs && typeof body.inputs === "object" ? body.inputs : {};
  const grab = (re) => (re.exec(profile) || [])[1]?.trim();
  const fromText = {
    liquid: LABEL_TO_KEY.liquid[grab(/liquid assets ([^,]+),/)],
    income: LABEL_TO_KEY.income[grab(/income ([^,/]+)\/yr/)],
    src: LABEL_TO_KEY.src[grab(/main income source ([^,]+),/)],
    citizen: LABEL_TO_KEY.citizen[grab(/citizenship ([^,]+),/)],
    from: LABEL_TO_KEY.from[grab(/currently lives in ([^,]+),/)],
  };
  const out = {};
  for (const k of Object.keys(ALLOWED)) out[k] = ALLOWED[k].includes(inp[k]) ? inp[k] : fromText[k] || null;
  return out;
}

// Keep only text that does not introduce money we did not compute.
function moneyOk(text, allowed) {
  const found = String(text || "").match(/€\s?\d[\d.,]*\s?[MKk]?/g) || [];
  return found.every((a) => allowed.some((x) => a.replace(/\s/g, "").toLowerCase() === x.toLowerCase()));
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

  // 1) Numbers — computed here, identical for every run with the same inputs.
  const inputs = readInputs(body, profile);
  const base = computeScenarios(inputs);
  const fixedKey = body.compare ? destKey(body.compare) : null;
  let cands = Object.values(base.candidates).filter((c) => !(base.french && c.key === "Monaco" && fixedKey !== "Monaco"));
  if (fixedKey && base.candidates[fixedKey]) cands = [base.candidates[fixedKey]];
  cands.sort((a, b) => b.gain - a.gain);
  const table = cands.map((c) => `${c.key}: regime "${c.regime.label}", capital 2036 ${M(c.end)} (gain vs stay ${c.gain >= 0 ? "+" : ""}${M(c.gain)})`).join("\n");
  const facts = `\n\nMONTAUREO MODEL (fixed figures — do not change):\nSTAY ${base.stay.name}: regime "${base.stay.regime.label}", capital 2036 ${M(base.stay.end)}.\nCANDIDATES:\n${table}\n${fixedKey ? `MOVE IS FIXED BY THE CLIENT: ${fixedKey}.` : "Choose MOVE from the candidate KEYS above."}`;
  const langLine = `\n\nRespond entirely in ${lang}. All JSON string values must be written in ${lang}, except the candidate KEYS which stay exactly as listed.`;

  try {
    const ask = (p) => (model === "qwen-plus" ? callQwen(p, langLine) : model === "mistral-medium-2508" ? callMistral(p, langLine) : callClaude(p, langLine));
    const ai = await ask(profile + facts);

    // 2) Validate the choice; the model can only pick from the list.
    let move = cands.find((c) => c.key === ai.move) || cands.find((c) => c.key === destKey(ai.move)) || cands[0];
    if (fixedKey && base.candidates[fixedKey]) move = base.candidates[fixedKey];
    const stay = base.stay;
    const gain = move.end - stay.end;
    const allowedMoney = [M(gain), M(Math.abs(gain)), M(move.end), M(stay.end), M(base.start)].map((x) => x.toLowerCase()).concat([M(gain).replace(".0M", "M"), M(Math.abs(gain)).replace(".0M", "M")].map((x) => x.toLowerCase()));
    const clean = (arr, n) => (Array.isArray(arr) ? arr : []).map(String).filter((x) => x && moneyOk(x, allowedMoney)).slice(0, n);

    const lines = clean(ai.scene?.lines, 5);
    const why = clean(ai.why, 3);
    const alternatives = (Array.isArray(ai.alternatives) ? ai.alternatives : []).map((x) => destKey(x)).filter((k) => k && k !== move.key && base.candidates[k] && !(base.french && k === "Monaco"))
      .concat(cands.map((c) => c.key)).filter((k, i, a) => k !== move.key && a.indexOf(k) === i).slice(0, 3).map((k) => base.candidates[k].name);
    const out = {
      scene: { month: "April 2036", lines: lines.length >= 3 ? lines : ["You wake up in the life you chose.", "The school run takes ten minutes.", "Your capital kept working for your family."], country: move.name },
      confidence: Number.isFinite(+ai.confidence) ? Math.max(0, Math.min(100, Math.round(+ai.confidence))) : 75,
      fitNote: moneyOk(ai.fitNote, allowedMoney) ? String(ai.fitNote || "").slice(0, 200) : "",
      why,
      alternatives,
      stay: { country: stay.name, tax: stay.regime.label, capital2036: M(stay.end), school: String(ai.school?.stay || "—").slice(0, 60), climate: String(ai.climate?.stay || "—").slice(0, 60) },
      move: { country: move.name, tax: move.regime.label, capital2036: M(move.end), school: String(ai.school?.move || "—").slice(0, 60), climate: String(ai.climate?.move || "—").slice(0, 60) },
      difference: [
        gain > 0.05 ? `+${M(gain)} more capital by 2036` : gain < -0.05 ? `${M(gain)} less capital by 2036` : "About the same capital by 2036",
        `Tax in year 1: ${K(stay.taxFirstYear)} → ${K(move.taxFirstYear)}`,
        `Tax over 10 years: ${M(stay.taxTotal)} → ${M(move.taxTotal)}`,
        ...(ai.extra && moneyOk(ai.extra, allowedMoney) ? [String(ai.extra).slice(0, 80)] : []),
      ],
      assumptions: assumptionsLine(base, inputs),
      disclaimer: "Illustrative model, not tax or investment advice — confirm with an advisor.",
      calc: {
        start: base.start, income: base.income, spending: base.spend, years: YEARS, yield: YIELD, growth: GROWTH,
        stay: { name: stay.name, taxFirstYear: stay.taxFirstYear, taxTotal: stay.taxTotal, end: stay.end, path: stay.path },
        move: { name: move.name, taxFirstYear: move.taxFirstYear, taxTotal: move.taxTotal, end: move.end, path: move.path },
      },
    };
    return res.status(200).json(out);
  } catch (e) {
    console.error(e);
    if (e.message === "model_error") return res.status(502).json({ error: "model_error" });
    return res.status(502).json({ error: "parse_error" });
  }
}
