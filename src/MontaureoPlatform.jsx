import React, { useState, useId, useRef, useEffect } from "react";
import { ArrowRight, RotateCcw, Sparkles, MapPin, ShieldCheck, Mountain, Users, Mail, Lock, Plane, Compass, Landmark, Building2, Heart, Calendar, CreditCard, User, Send, Crown, LogOut, X, Scale } from "lucide-react";
import { trackCtaClick, trackFutureRun, trackFutureResult, trackSectionView, trackPersonaSelect, trackFirstMessage, trackMessageSent, trackBeginCheckout, trackPurchase, trackLoginSuccess, trackLeadOpen, trackGenerateLead, trackOutbound } from "./analytics";

/* =====================================================================
   MONTAUREO — единая платформа (мультиязычная)
   Landing → Profile/анкета → Two Futures (FREE, no login) → soft gate →
   → (login/signup required only here) → Stripe checkout → Concierge
   ===================================================================== */

/* ===================== BRAND ===================== */
const C = {
  void: "#070708", panel: "#0E0F14", panelHi: "#14151C", card: "#101117",
  line: "rgba(198,163,90,0.16)", gold: "#C6A35A", goldHi: "#F2DCA0", goldDk: "#8A6B2E",
  mist: "#8A8A92", faint: "#5A5A63", snow: "#F1EFE8", green: "#7FB082",
};

/* ===================== COPY (English only — AI still replies in the client's own language) ===================== */
const T = {
    v: { a30: "30–40", a40: "40–50", a50: "50–60", a60: "60+", c1: "€500K–2M", c2: "€2–5M", c3: "€5–15M", c4: "€15–50M", c5: "€50–100M", c6: "€100M+", i1: "< €200K", i2: "€200–500K", i3: "€500K–1M", i4: "€1M+", s1: "Salary", s2: "Business / company", s3: "Dividends & investments", s4: "Mixed", l1: "< €500K", l2: "€500K–2M", l3: "€2–10M", l4: "€10–50M", l5: "€50M+", fSingle: "Single", fCouple: "Couple", fKids: "Family with children", zFR: "France", zEU: "Other EU", zUK: "UK", zUS: "United States", zCA: "Canada", zNA: "US/Canada (legacy)", zOther: "Other", pMC: "Monaco", pCH: "Switzerland", pAE: "UAE", pLU: "Luxembourg", pLI: "Liechtenstein", pAD: "Andorra", pSG: "Singapore", pFR: "France", pUK: "United Kingdom", pDE: "Germany", pOther: "Other", kids: "Children", safety: "Safety", business: "Business", sea: "Sea", taxes: "Taxes", climate: "Climate" },
    f: { age: "Age", capital: "Capital", liquid: "Liquid assets", income: "Income / year", src: "Main source of income", family: "Family", citizen: "Citizenship", from: "Currently living" },
    quote: "The future is not found. It is designed.", h1a: "Where will your capital", h1b: "be worth more?",
    sub: "Here — or somewhere else? Answer 7 questions and AI builds two versions of your 2036: Stay vs Move, with tax, capital and lifestyle. Free · 60 seconds · no signup.",
    vp: [["Protect Your Wealth", "Optimize your financial future"], ["Elevate Your Life", "Access the world's best opportunities"], ["Secure Your Family", "A safe and prosperous legacy"]],
    beginTitle: "Two Futures. One Choice.", beginSub: "See yours in 60 seconds.",
    startFree: "Show me my two futures",
    heroTitle: "Design your future.",
    heroSub: "Compare how staying or moving could shape your wealth, lifestyle and family's future — tax, banking and real estate in one view.",
    heroTrust: "By Monaco Finance International LP",
    heroHow: "See an example result",
    heroWorld: "Explore the Montaureo World",
    sec: [["Bank-Level Security", "256-bit encryption"], ["Your Data is Private", "Never shared with third parties"]],
    whoTitle: "Who are you?", whatTitle: "What matters to you?", step: "Step", of: "of",
    next: "Next", back: "Back", showTwo: "Show me two futures", drawing: "Montaureo is drawing two futures…",
    errBuild: "Couldn't build the scenarios. Please try again.", backToQ: "Back to questionnaire", passAgain: "Start over",
    twoFutures: "Two futures · 2036", stay: "Stay", move: "Move", tax: "Tax", cap2036: "Liquid portfolio 2036*", school: "School", climate: "Climate",
    diffTitle: "Difference · if you move", showPath: "Show Me My Path — open concierge", showPathSub: "With your permission, Montaureo Concierge reuses your questionnaire answers.",
    bookConsult: "Book Private Consultation",
    leadTitle: "Private Consultation", leadSub: "A Monaco Finance International advisor will reach out directly. No AI in this step.",
    leadName: "Full name", leadEmail: "Email", leadPhone: "Phone / WhatsApp", leadLang: "Preferred language", leadTime: "Best time to contact",
    leadGoal: "What is this about?", leadGoals: ["Banking", "Relocation", "Real Estate", "Credit", "Family Office"],
    leadTimeOpts: ["Morning", "Afternoon", "Evening", "Anytime"],
    leadNamePh: "Your full name", leadEmailPh: "name@email.com", leadPhonePh: "+377…",
    leadSubmit: "Send request", leadSending: "Sending…", leadCancel: "Cancel",
    leadRequired: "Please fill in your name and email.",
    leadConsentLabel: "I agree to be contacted by Monaco Finance International regarding my request.",
    leadConsentRequired: "Please confirm you agree to be contacted.",
    leadConnError: "Connection error. Please try again or contact us directly.",
    leadConfirmTitle: "Your request has been received.", leadConfirmBody: "A private advisor will contact you shortly.",
    leadContinue: "Continue to Concierge", leadClose: "Close",
    fcTitle: "Fit with your priorities", fcSub: "How well this destination matches what you selected.", fcJudgement: "A judgement, not a probability.",
    whyTitle: "Why", compareTitle: "Compare with another destination", compareNote: "Same family, same assumptions — only the destination changes. You'll see both destinations side by side. Uses one of today's free runs.",
    h2hTitle: "Side by side · same assumptions",
    calcTitle: "How these numbers are calculated", calcStart: "Starting liquid portfolio", calcIncome: "income", calcSpend: "spending", calcReturn: "portfolio return 6%/yr (2.5% income + 3.5% growth), reinvested.",
    calcFormula: "Each year: capital + growth + portfolio income + your income − spending − tax. The same formula and the same inputs for every country — only the tax rules change.",
    calcTax1: "Tax in year 1", calcTaxAll: "Tax over 10 years", calcEnd: "Capital in 2036",
    calcWhyGap: "The gap in 2036 is the tax saved each year plus the growth that money earns once it stays invested.",
    loadSub: "Usually 20–40 seconds — both futures are built for your exact profile.",
    loadSteps: ["Reading your profile", "Matching countries to your citizenship", "Modelling your capital to 2036 — stay vs move", "Writing your 2036"],
    sampleEyebrow: "Example of what you get", sampleNote: "Illustrative example. Your answers use your own profile.",
    discPrefix: "* Illustrative estimate under the stated assumptions", scenariosBoth: "both futures are scenarios, not a country forecast.", discDefault: "This is not financial, legal or tax advice; confirm with an advisor.",
    pwEyebrow: "Montaureo Concierge", pwReady: "Your future is ready.", pwVip: "Your VIP concierge", pwUnlock: "Unlock your personal AI concierge.",
    pwBodyA: "Kate, Jun and Emily will help you turn this scenario", pwBodyB: "into a real plan: banking, real estate, credit, relocation.",
    tierFree: "Free", tierFreeNow: "Current plan", tierFreeActive: "Active", freeF: ["Landing and sign-in", "Profile questionnaire", "Two Futures · Stay vs Move"],
    recommended: "Recommended", tierPremium: "Premium", perMonth: "/mo", premiumAlt: "or $299 — one-time relocation plan",
    promoNote: "USD $4.99 for the first month with code WELCOME, then USD $49/month. Cancel anytime. Confirm eligibility and the final amount in Stripe Checkout.",
    premF: ["Montaureo Concierge · Kate, Jun & Emily", "Banking · Real Estate · Legal · Credit", "Lifestyle · Events · KYC checklists", "8 jurisdictions, profile-aware"],
    btnSub: "Subscribe", btnOnce: "$299 — one-time plan",
    tierPrivate: "Private", privatePrice: "By request", privateNote: "Inner circle", privF: ["Everything in Premium", "A real MFI advisor", "Deal & relocation support"], requestAccess: "Request access",
    pwReassure: "Two Futures stays free forever. Cancel anytime.",
    profile: "Profile", yourProfile: "Your profile", profileSub: "This data powers both Two Futures and Montaureo Concierge. Fill it once.",
    priorities: "Priorities", saveProfile: "Save profile", saved: "Saved ✓", savedNote: "Profile updated — the concierge already accounts for the changes.", planLabel: "Plan",
    cWelcomeA: "Given your profile", cWelcomeB: "I already know the details — no need to repeat anything. Where shall we begin?", cMoveInterest: "interest in",
    askPlaceholder: "Ask", cFooter: "Information, not advice. For KYC, documents are submitted directly to the bank or your MFI advisor.",
    nav: { future: "Design your future", concierge: "Concierge", banking: "Banking", realestate: "Real Estate", legal: "Legal", lifestyle: "Lifestyle", events: "Events", credit: "Credit", profile: "Profile" },
    pmcFreeTitle: "MONTAUREO PREMIUM", pmcFreeSub: "Unlock Montaureo Concierge — Kate, Jun and Emily turn the scenario into a plan", pmcUnlock: "Unlock",
    pmcPremTitle: "PREMIUM ACTIVE", pmcPremSub: "Want a real MFI advisor?", pmcToPrivate: "Upgrade to Private", pmcPrivTitle: "PRIVATE", pmcPrivSub: "A Monaco Finance International advisor will be in touch.",
    dom: { null: ["Montaureo Concierge", "Banking, real estate, legal, lifestyle, events, relocation — ask anything."], Banking: ["Banking", "Where and how to open an account — pros and cons by bank."], RealEstate: ["Real Estate", "Where to buy property, with price guidance."], Legal: ["Legal", "Structuring, residency and cross-border questions, explained plainly."], Lifestyle: ["Lifestyle", "Where to dine, private service, seasonal trends."], Events: ["Events", "International forums, fairs, private events."], Credit: ["Credit", "Credit and Lombard — where and on what terms."] },
    partnerBankingTitle: "Manage everything in one place", partnerBankingDesc: "monaco-finance.com is our free client portal — track all your accounts, Lombard lines and more.", partnerBankingCta: "Explore monaco-finance.com",
    suggest: { null: ["Best jurisdictions for my profile", "Compare Monaco vs UAE on tax", "Where do I start with relocation?"], Banking: ["Which bank should I open an account with?", "Compare private banks in Monaco", "What's needed for KYC?"], RealEstate: ["What can I buy within my budget?", "Rent or buy?", "Best areas by the sea"], Legal: ["What residency permit fits my profile?", "How is my structure taxed if I move?", "What documents does relocation require?"], Lifestyle: ["Best restaurants of the 2026 season", "Private service and clubs", "What's new on the Riviera"], Events: ["Upcoming private forums", "Calendar of fairs and auctions", "Grand Prix and yacht shows"], Credit: ["Lombard terms against my portfolio", "Where to get an in-fine loan?", "Rates by country"] },
    // ---- Auth modal (only shown at the paywall) ----
    authModalTitle: "Sign in to continue",
    authModalSub: "Create an account or sign in to unlock Premium and track your subscription.",
    emailPh: "name@email.com", passwordPh: "Password",
    signIn: "Sign in", signUp: "Create account & continue",
    newHere: "New to Montaureo?", createAcc: "Create account", haveAcc: "Already have an account?", toSignIn: "Sign in",
    authErr: "Something went wrong. Check your email and password.",
    authCheckEmail: "Check your email to confirm your account, then sign in.",
    signingIn: "Signing in…", signingUp: "Creating account…",
    signOut: "Sign out",
    newChat: "New chat",
};

/* ===================== KNOWLEDGE + PROMPTS ===================== */
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

const FUTURE_SYSTEM = `You are Montaureo, a life architect for wealthy international families. You help make a LIFE DECISION, not pick a country.
Knowledge (current 2026):${KB}

The client thinks not "where to move" but "what do I lose if I stay". Build TWO FUTURES to 2036:
- STAY — the client stays in the current country;
- MOVE — the client moves to the ONE best country for their profile. HARD RULE: if the client's citizenship is France, the MOVE country must NOT be Monaco (unless the client explicitly asks to compare with Monaco).
Compare them and show the difference. Warm, personal, honest tone.

${JLOGIC}

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

const CONCIERGE_SYSTEM = `You are Montaureo Concierge of the Montaureo platform: a private AI concierge for VIP clients with significant capital.
Jurisdiction coverage is open — you advise on any relevant jurisdiction worldwide.
Tone: discreet, precise, numbers first, never pushy.
Knowledge (current 2026):${KB}

${JLOGIC}

Agents (pick the right one): Banking, Credit, RealEstate, Legal, Lifestyle, Events, KYC, Wealth.

THE CLIENT PROFILE IS ALREADY KNOWN (see the dynamic block).
NEVER re-ask anything already in the profile (capital, liquid assets, family, country, goals, interests).
Rely on the profile and get to the point — e.g. "Given your profile…".
When discussing credit, Lombard lending, or banking thresholds, reference the client's LIQUID assets specifically, not total wealth — total wealth may include illiquid real estate or business equity that cannot be pledged or drawn against.

CRITICAL KYC RULE:
For account-opening questions, give a clear list of required documents (passport, proof of address, source of funds, etc.). BUT:
- NEVER ask the client to upload, send or paste documents;
- NEVER offer to check, verify or analyze their documents;
- direct them to submit documents directly to the bank or to their MFI advisor.
You provide ONLY information about requirements; you do not process documents.

FORMAT — return ONLY clean JSON, no markdown:
{"agent":"Banking|Credit|RealEstate|Legal|Lifestyle|Events|KYC|Wealth",
 "text":"1-3 sentence answer",
 "card": null | {"title":"...","rows":[{"primary":"...","secondary":"...","meta":"...","accent":true|false}]}}
Use a card for lists, comparisons and checklists (3-5 rows); otherwise card=null.`;

/* ===================== PAYWALL SAMPLES (shown before paying, per section) ===================== */
const SAMPLES = {
  null: { q: "Compare Monaco and the UAE for my family.", a: "Local personal-tax regimes can be favourable, but French nationals in Monaco and US worldwide tax obligations require special review. For a family, schooling, climate and travel also matter.", rows: [["Monaco", "0% income tax (not for French nationals) · residence needs a home in Monaco and proof of means · 30 min from Nice airport"], ["UAE", "0% personal income tax · long-term visa through property or investment · 6–7 h flights to most of Europe"], ["Next step", "A document checklist for the option you choose"]] },
  Banking: { q: "Where should I open a private bank account in Monaco?", a: "With €2–10M of liquid assets you are within the usual entry range of Monaco private banks. Three kinds of bank fit different needs:", rows: [["Swiss-group private bank", "Entry often from €1–3M · strong Lombard lending"], ["French-group bank", "Broad day-to-day services · detailed source-of-funds review"], ["Boutique Monegasque bank", "One personal banker · flexible with holding structures"]] },
  RealEstate: { q: "Should we rent or buy in Monaco for the first two years?", a: "Most relocating families rent first: a lease is the fastest way to meet the residence requirement while you learn the neighbourhoods.", rows: [["Rent", "Fastest route to a residence card"], ["Buy", "Resale prices are among the highest in the world — often above €50,000 per m²"], ["Shortlist", "Districts compared by school run, sea view and parking"]] },
  Legal: { q: "What do I need for a Monaco residence card?", a: "The application rests on three things: where you live, how you support yourself, and a clean record.", rows: [["Accommodation", "A lease or title deed in Monaco"], ["Financial means", "Usually shown with a deposit at a Monaco bank"], ["Record", "Criminal record extract from your current country"]] },
  Credit: { q: "What Lombard loan could I get against my portfolio?", a: "Banks lend against the value of your portfolio. The advance rate depends on what it holds — diversified portfolios get the most.", rows: [["Bonds and funds", "Highest advance rates"], ["Diversified equities", "Moderate advance rates"], ["Single stocks", "Lower, decided case by case"]] },
  Lifestyle: { q: "Where should we spend the summer season on the Riviera?", a: "For a family with children who love the sea, three things to arrange early:", rows: [["Beach clubs", "Family-friendly options from Monaco to Saint-Jean-Cap-Ferrat"], ["Summer camps", "Sailing and tennis programmes fill up by spring"], ["Private staff", "Chef, driver and nanny on seasonal contracts"]] },
  Events: { q: "What should we not miss in Monaco this year?", a: "The calendar fills quickly; hospitality for the big weekends sells out months ahead.", rows: [["Rolex Monte-Carlo Masters", "Tennis · April"], ["Monaco Grand Prix", "Formula 1 · late May or June"], ["Monaco Yacht Show", "September"]] },
};

/* ===================== PERSONA → MODEL MAPPING ===================== */
const PERSONA_MODEL = {
  Kate: "claude",
  Jun: "qwen-plus",
  Emily: "mistral-medium-2508",
};
const PERSONAS = ["Kate", "Jun", "Emily"];

/* ===================== HELPERS ===================== */
const buildProfileText = (form, matters) => {
  const v = (k) => (form[k] ? T.v[form[k]] : "not specified");
  return `age ${v("age")}, total wealth ${v("capital")}, liquid assets ${v("liquid")}, income ${v("income")}/yr, main income source ${v("src")}, ${v("family")}, citizenship ${v("citizen")}, currently lives in ${v("from")}, priorities: ${(matters || []).map((m) => T.v[m]).join(", ") || "family & life"}`;
};

// Stable anonymous id for the server's daily free limits (Upstash).
function getClientId() {
  try {
    let id = window.localStorage.getItem("montaureo_cid");
    if (!id) {
      id = window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem("montaureo_cid", id);
    }
    return id;
  } catch { return `anon-${Math.random().toString(36).slice(2)}`; }
}
const CLIENT_ID = typeof window !== "undefined" ? getClientId() : "ssr";

// The server answered on purpose (limit reached / payment required) — never fall back to direct calls.
function apiError(code) { const e = new Error(code); e.code = code; return e; }

async function designFuture(profile, langName, model = "claude", extra = {}) {
  const r = await fetch("/api/future", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({profile,lang:langName,model,clientId:CLIENT_ID,...extra})});
  if(r.status===429)throw apiError("limit");
  if(!r.ok)throw apiError("scenario_unavailable");
  return r.json();
}
async function askConcierge({profileText,persona,focus,moveCountry,messages,langName,accessToken,email}) {
  const r=await fetch("/api/concierge",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({profileText,persona,focus,moveCountry,messages,lang:langName,model:PERSONA_MODEL[persona]||"claude",clientId:CLIENT_ID,accessToken,email})});
  if(r.status===402)throw apiError("payment_required");
  if(r.status===429)throw apiError("limit");
  if(!r.ok)throw apiError("concierge_unavailable");
  return r.json();
}

/* ===================== BRAND MARKS ===================== */
function SummitMark({ size = 40 }) {
  const u = useId().replace(/[:]/g, ""); const id = (s) => `${s}${u}`;
  return (
    <svg width={size} height={(size * 188) / 200} viewBox="0 0 200 188" fill="none" aria-hidden>
      <defs>
        <linearGradient id={id("gl")} x1="28" y1="54" x2="74" y2="156" gradientUnits="userSpaceOnUse"><stop stopColor="#F6E3AC" /><stop offset="1" stopColor="#C6A35A" /></linearGradient>
        <linearGradient id={id("gh")} x1="100" y1="46" x2="126" y2="156" gradientUnits="userSpaceOnUse"><stop stopColor="#F2DCA0" /><stop offset="1" stopColor="#B08F47" /></linearGradient>
        <linearGradient id={id("cd")} x1="74" y1="54" x2="100" y2="156" gradientUnits="userSpaceOnUse"><stop stopColor="#43454F" /><stop offset="1" stopColor="#191A21" /></linearGradient>
        <linearGradient id={id("cd2")} x1="126" y1="46" x2="172" y2="156" gradientUnits="userSpaceOnUse"><stop stopColor="#4A4C57" /><stop offset="1" stopColor="#16171D" /></linearGradient>
        <linearGradient id={id("ed")} x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#F6E3AC" /><stop offset="1" stopColor="#E7CD8A" /></linearGradient>
      </defs>
      <polygon points="26,156 74,54 74,156" fill={`url(#${id("gl")})`} />
      <polygon points="74,54 100,100 100,156 74,156" fill={`url(#${id("cd")})`} />
      <polygon points="100,100 126,46 126,156 100,156" fill={`url(#${id("gh")})`} />
      <polygon points="126,46 174,156 126,156" fill={`url(#${id("cd2")})`} />
      <path d="M26 156 L74 54 L100 100 L126 46 L174 156" stroke={`url(#${id("ed")})`} strokeWidth="2.4" strokeLinejoin="round" fill="none" />
      <line x1="126" y1="46" x2="126" y2="156" stroke="#F2DCA0" strokeWidth="1" opacity="0.55" />
      <line x1="14" y1="156" x2="186" y2="156" stroke={`url(#${id("ed")})`} strokeWidth="1" opacity="0.5" />
    </svg>
  );
}
const Wordmark = ({ size = 13 }) => (
  <span style={{ fontSize: size, letterSpacing: "0.30em", fontWeight: 500, textShadow: "0 2px 10px #000", paddingLeft: "0.30em" }}>
    <span style={{ color: C.snow }}>MONT</span><span style={{ background: `linear-gradient(180deg, ${C.goldHi}, ${C.gold})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: C.goldHi, WebkitTextFillColor: C.goldHi }}>AUREO</span>
  </span>
);
function SpinningGlobe() {
  const parallels = [-64, -32, 0, 32, 64];
  const meridians = [-72, -48, -24, 0, 24, 48, 72];
  return (
    <div style={{ position: "relative", width: "min(82%, 440px)", aspectRatio: "1" }}>
      <div style={{ position: "absolute", inset: "-7%", borderRadius: "50%", background: "radial-gradient(circle at 60% 42%, rgba(231,184,106,0.24), transparent 60%)", filter: "blur(10px)" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", background: "radial-gradient(circle at 36% 30%, #16202d 0%, #0b1019 48%, #06080d 80%)", boxShadow: "inset -36px -30px 90px rgba(0,0,0,0.9), 0 0 150px rgba(198,163,90,0.14)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 12px 18px, rgba(240,196,116,0.9) 0.6px, transparent 1.6px), radial-gradient(circle at 40px 44px, rgba(240,196,116,0.7) 0.6px, transparent 1.6px), radial-gradient(circle at 64px 12px, rgba(240,196,116,0.55) 0.6px, transparent 1.6px), radial-gradient(circle at 30px 70px, rgba(240,196,116,0.65) 0.6px, transparent 1.6px)", backgroundSize: "80px 80px", animation: "globe-surface 7s linear infinite", opacity: 0.9 }} />
        <div style={{ position: "absolute", inset: "-25%", background: "conic-gradient(from 0deg, transparent 0deg, rgba(255,200,120,0.16) 40deg, rgba(255,200,120,0.04) 90deg, transparent 150deg, transparent 360deg)", animation: "globe-rot 11s linear infinite", transformOrigin: "center" }} />
        <svg viewBox="0 0 200 200" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <g stroke="rgba(231,184,106,0.34)" strokeWidth="0.6" fill="none">
            {parallels.map((y) => <ellipse key={y} cx="100" cy={100 + y} rx={Math.sqrt(Math.max(0, 9700 - y * y))} ry={Math.max(3, 96 - Math.abs(y) * 0.32)} />)}
            {meridians.map((m) => <ellipse key={m} cx="100" cy="100" rx={Math.max(3, 96 * Math.cos(m * Math.PI / 180))} ry="96" />)}
            <circle cx="100" cy="100" r="96" stroke="rgba(231,184,106,0.5)" />
          </g>
        </svg>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 36% 32%, transparent 38%, rgba(6,8,13,0.5) 72%, rgba(6,8,13,0.92) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 82% 40%, rgba(255,196,110,0.20), transparent 40%)" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <div style={{ filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.7))" }}><SummitMark size={70} /></div>
        <div style={{ fontSize: "min(4vw,26px)", letterSpacing: "0.36em", color: C.snow, paddingLeft: "0.36em", marginTop: 8, textShadow: "0 2px 18px rgba(0,0,0,0.8)" }}>MONTAUREO</div>
        <div style={{ fontSize: 11, letterSpacing: "0.34em", color: C.gold, textTransform: "uppercase", paddingLeft: "0.34em" }}>Design your future</div>
      </div>
    </div>
  );
}

/* ===================== SHARED UI ===================== */
const Btn = ({ onClick, children, disabled }) => (
  <button onClick={onClick} disabled={disabled} className="mt-cta" style={{ marginTop: 6, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.7 : 1, border: "none", borderRadius: 14, padding: "15px", fontSize: 15, fontWeight: 600, color: "#1A1408", background: `linear-gradient(140deg, ${C.goldHi}, ${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" }}>{children}</button>
);
function ChatCard({ card }) {
  if (!card || !card.rows) return null;
  return (
    <div style={{ marginTop: 10, border: `1px solid rgba(198,163,90,0.3)`, borderRadius: 14, overflow: "hidden", background: "linear-gradient(180deg, rgba(198,163,90,0.06), rgba(16,17,23,0.5))" }}>
      {card.title && <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.line}`, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: C.gold }}>{card.title}</div>}
      {card.rows.map((r, i) => (
        <div key={i} style={{ padding: "10px 14px", borderBottom: i < card.rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, color: r.accent ? C.goldHi : C.snow, fontWeight: r.accent ? 600 : 500 }}>{r.primary}</div>
            {r.secondary && <div style={{ fontSize: 12, color: C.mist, marginTop: 1 }}>{r.secondary}</div>}
          </div>
          {r.meta && <div style={{ fontSize: 12, color: C.faint, whiteSpace: "nowrap", flexShrink: 0 }}>{r.meta}</div>}
        </div>
      ))}
    </div>
  );
}

/* ===================== CONFIG ===================== */
const SECTIONS = [["future", Compass], ["concierge", Sparkles], ["banking", Landmark], ["realestate", Building2], ["legal", Scale], ["lifestyle", Heart], ["events", Calendar], ["credit", CreditCard], ["profile", User]];
const FOCUS = { banking: "Banking", realestate: "RealEstate", legal: "Legal", lifestyle: "Lifestyle", events: "Events", credit: "Credit" };
const FIELDS = [["age", ["a30", "a40", "a50", "a60"]], ["capital", ["c1", "c2", "c3", "c4", "c5", "c6"]], ["liquid", ["l1", "l2", "l3", "l4", "l5"]], ["income", ["i1", "i2", "i3", "i4"]], ["src", ["s1", "s2", "s3", "s4"]], ["family", ["fSingle", "fCouple", "fKids"]], ["citizen", ["zFR", "zEU", "zUK", "zUS", "zCA", "zOther"]], ["from", ["pOther", "pMC", "pCH", "pAE", "pLU", "pLI", "pAD", "pSG", "pFR", "pUK", "pDE"]]];
const MATTER_KEYS = ["kids", "safety", "business", "sea", "taxes", "climate"];

/* ===================== APP ===================== */
export default function MontaureoPlatform() {
  const [authed, setAuthed] = useState(false); // local "entered the app" flag — no login required for this
  // Landing video: horizontal for wide screens, vertical for phones (chosen once on load).
  const [heroPortrait] = useState(() => { try { return window.matchMedia("(max-aspect-ratio: 4/5)").matches; } catch { return false; } });

  // ---- Access is keyed by email only: no password, no Supabase.
  // A Stripe webhook writes {plan, expiresAt} to Redis for the paying email;
  // /api/check-access reads it back. The browser remembers the email via localStorage
  // so returning clients don't have to retype it (autofill also helps here).
  const [plan, setPlan] = useState("free");
  const [accessEmail, setAccessEmail] = useState("");
  const [accessInput, setAccessInput] = useState("");
  const [accessChecking, setAccessChecking] = useState(false);
  const [accessErr, setAccessErr] = useState("");
  const [accessNote, setAccessNote] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const [section, setSection] = useState("future");
  const [form, setForm] = useState({ age: "a50", capital: "c4", liquid: "l3", income: "i3", src: null, family: "fKids", citizen: null, from: "pOther" });
  const [matters, setMatters] = useState(["kids", "sea"]);
  const [step, setStep] = useState(1);
  const [profileConsent, setProfileConsent] = useState(false);
  const [conciergeConsent, setConciergeConsent] = useState(false);
  const [futureState, setFutureState] = useState("form");
  const [futureResult, setFutureResult] = useState(null);
  const [prevResult, setPrevResult] = useState(null); // the result we compare against (same STAY, same base)
  const [futureErr, setFutureErr] = useState(null); // null | "limit" | "error"
  const [persona, setPersona] = useState("Kate");
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [leadSending, setLeadSending] = useState(false);
  const [leadErr, setLeadErr] = useState("");
  const [lead, setLead] = useState({ name: "", email: "", phone: "", time: "", goal: "", consent: false });
  const [loadSec, setLoadSec] = useState(0);
  const utmRef = useRef(null);
  const endRef = useRef(null);

  const t = T;
  const v = (key) => t.v[key];
  const setF = (k, val) => { setForm((f) => ({ ...f, [k]: val })); setSaved(false); };
  const toggleM = (m) => { setMatters((a) => a.includes(m) ? a.filter((x) => x !== m) : [...a, m]); setSaved(false); };

  const focus = FOCUS[section] || null;
  const isConcierge = section === "concierge" || section in FOCUS;
  const locked = isConcierge && plan === "free";
  const PLAN_LABEL = { free: "Free", premium: "Premium", private: "Private" };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, chatBusy, section]);


  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      utmRef.current = {
        utm_source: params.get("utm_source") || null,
        utm_medium: params.get("utm_medium") || null,
        utm_campaign: params.get("utm_campaign") || null,
        referrer: document.referrer || null,
      };
    } catch {
      utmRef.current = { utm_source: null, utm_medium: null, utm_campaign: null, referrer: null };
    }
  }, []);

  // ---- Remember a verified access (signed token from the server + email) ----
  const rememberAccess = (email, token, planName) => {
    setPlan(planName || "premium");
    if (email) { setAccessEmail(email); setAccessInput(email); }
    if (token) setAccessToken(token);
    try {
      if (email) window.localStorage.setItem("montaureo_email", email);
      if (token) window.localStorage.setItem("montaureo_token", token);
    } catch {}
  };

  // ---- Check access. With a signed token: verified on the server. With an email:
  // either a sign-in link is emailed (secure mode) or, until that is configured, access
  // is checked by email as before. Returns nothing; updates plan/state. ----
  const checkAccess = async (email, { silent, token } = {}) => {
    if (!token && (!email || !email.trim())) return;
    if (!silent) { setAccessChecking(true); setAccessErr(""); setAccessNote(""); }
    const body = token ? { token } : { email: email.trim().toLowerCase(), silent: Boolean(silent) };
    try {
      const r = await fetch("/api/check-access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d && d.active) {
        rememberAccess(d.email || (email || "").trim().toLowerCase(), d.token || token, d.plan);
        if (!silent) trackLoginSuccess();
        return true;
      }
      if (r.ok && d && d.sent) {
        if (!silent) setAccessNote("If this email has an active subscription, a sign-in link is on its way. Check your inbox.");
        return false;
      }
      if (token) { try { window.localStorage.removeItem("montaureo_token"); } catch {} setAccessToken(""); }
      setPlan("free");
      if (!silent) setAccessErr("We couldn't find an active subscription for that email.");
    } catch {
      if (!silent) setAccessErr("Connection error — please try again.");
    } finally {
      if (!silent) setAccessChecking(false);
    }
    return false;
  };

  // ---- On load: a sign-in link (?access=...), else a remembered token, else a remembered email ----
  useEffect(() => {
    let linkToken = "", savedToken = "", savedEmail = "";
    try {
      const url = new URL(window.location.href);
      linkToken = url.searchParams.get("access") || "";
      if (linkToken) { url.searchParams.delete("access"); window.history.replaceState({}, "", url.toString()); }
      savedToken = window.localStorage.getItem("montaureo_token") || "";
      savedEmail = window.localStorage.getItem("montaureo_email") || "";
    } catch {}
    if (savedEmail) setAccessInput(savedEmail);
    if (linkToken) {
      checkAccess("", { token: linkToken, silent: true }).then((ok) => {
        if (ok) { setAuthed(true); setSection("concierge"); trackLoginSuccess(); }
      });
    } else if (savedToken) {
      checkAccess("", { token: savedToken, silent: true });
    } else if (savedEmail) {
      checkAccess(savedEmail, { silent: true });
    }
  }, []);

  // ---- Just returned from Stripe Checkout? Confirm the session and unlock immediately. ----
  useEffect(() => {
    let sessionId = "";
    try {
      const params = new URLSearchParams(window.location.search);
      sessionId = params.get("session_id") || "";
    } catch {}
    if (!sessionId) return;

    (async () => {
      try {
        const r = await fetch(`/api/session-email?session_id=${encodeURIComponent(sessionId)}`);
        const d = await r.json().catch(() => ({}));
        if (r.ok && d && d.active && d.email) {
          rememberAccess(d.email, d.token, d.plan);
          setAuthed(true);
          setSection("concierge");
          trackPurchase(d.plan || "premium");
        }
      } catch {
        // silent — user can still unlock manually via email field
      } finally {
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("session_id");
          window.history.replaceState({}, "", url.toString());
        } catch {}
      }
    })();
  }, []);

  const enter = () => { trackCtaClick("start_free"); setAuthed(true); setSection("future"); setFutureState("form"); setStep(1); };

  // ---- Switching topics (Banking, Legal, etc.) starts a fresh conversation instead of
  // continuing the old one — this also unblocks the input if a previous reply was still pending. ----
  const switchSection = (key) => {
    setChat([]);
    setChatInput("");
    setChatBusy(false);
    setSection(key);
    trackSectionView(key);
  };

  const startNewChat = () => {
    setChat([]);
    setChatInput("");
    setChatBusy(false);
  };

  // Elapsed seconds while the scenario is being built (drives the progress bar).
  useEffect(() => {
    if (futureState !== "loading") return;
    setLoadSec(0);
    const id = setInterval(() => setLoadSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [futureState]);

  const runFuture = async (compareWith) => {
    if (!form.citizen || !form.src || !profileConsent) { setFutureState("form"); setStep(1); return; }
    trackFutureRun();
    setFutureState("loading");
    const cmp = typeof compareWith === "string" ? compareWith.replace(/[^\p{L} .'-]/gu, "").trim().slice(0, 40) : "";
    if (cmp) trackCtaClick("compare_country");
    const base = cmp && futureResult ? futureResult : null;
    const profile = `Profile: ${buildProfileText(form, matters)}.${cmp ? ` The client wants to compare with this MOVE destination: ${cmp}.` : ""} Build Stay vs Move to 2036.`;
    // The server computes every amount from these inputs with one formula; the AI only chooses and explains.
    const inputs = { liquid: form.liquid, income: form.income, src: form.src, citizen: form.citizen, from: form.from };
    try {
      const r = await designFuture(profile, "English", "claude", { inputs, compare: cmp || undefined });
      setPrevResult(base); setFutureResult(r); setFutureState("result"); trackFutureResult(r?.move?.country);
    }
    catch (e) { setFutureErr(e?.code === "limit" ? "limit" : "error"); setFutureState("error"); }
  };

  const sendChat = async (text) => {
    const content = (text ?? chatInput).trim();
    if (!content || chatBusy) return;
    if (!conciergeConsent) { setAccessErr("Please consent to profile reuse before using the concierge."); return; }
    trackFirstMessage(persona);
    trackMessageSent(persona);
    const next = [...chat, { role: "user", content }];
    setChat(next); setChatInput(""); setChatBusy(true);
    try {
      const apiMsgs = next.map((m) => ({ role: m.role, content: m.content }));
      const r = await askConcierge({ profileText: buildProfileText(form, matters), persona, focus, moveCountry: futureResult?.move?.country, messages: apiMsgs, langName: "English", accessToken, email: accessEmail });
      setChat([...next, { role: "assistant", content: r.text || "…", card: r.card || null, agent: r.agent }]);
    } catch (e) {
      if (e?.code === "payment_required") { setPlan("free"); setChat(next.slice(0, -1)); return; } // server says access ended → paywall
      const msg = e?.code === "limit" ? "Today's message limit is reached. Please come back tomorrow." : "…";
      setChat([...next, { role: "assistant", content: msg, card: null }]);
    } finally { setChatBusy(false); }
  };

  const openLead = () => {
    trackLeadOpen();
    setLead((l) => ({ ...l, goal: l.goal || t.leadGoals[0], time: l.time || t.leadTimeOpts[3] }));
    setLeadErr(""); setLeadSent(false); setLeadOpen(true);
  };

  // Links from the "How it's calculated" page: /?start=1 opens the questionnaire, /?consult=1 the consultation form.
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const start = url.searchParams.has("start"), consult = url.searchParams.has("consult"), concierge = url.searchParams.has("concierge");
      if (!start && !consult && !concierge) return;
      url.searchParams.delete("start"); url.searchParams.delete("consult"); url.searchParams.delete("concierge");
      window.history.replaceState({}, "", url.toString());
      if (concierge) { setAuthed(true); setSection("concierge"); }
      else if (start) enter();
      else { setAuthed(true); openLead(); }
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submitLead = async () => {
    if (!lead.name.trim() || !lead.email.trim()) { setLeadErr(t.leadRequired); return; }
    if (!lead.consent) { setLeadErr(t.leadConsentRequired); return; }
    setLeadErr(""); setLeadSending(true);
    const payload = {
      ...lead,
      profile: buildProfileText(form, matters),
      moveCountry: futureResult?.move?.country || null,
      source: "two_futures",
      lang: "English",
      ...(utmRef.current || {}),
    };
    try {
      const r = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        if (d.error === "consent_required") setLeadErr(t.leadConsentRequired);
        else setLeadErr(t.leadRequired);
        setLeadSending(false);
        return;
      }
      setLeadSending(false); setLeadSent(true);
      trackGenerateLead(lead.goal);
    } catch {
      setLeadSending(false);
      setLeadErr(t.leadConnError);
      return;
    }
  };

  const closeLeadAndEnterConcierge = () => { setLeadOpen(false); };

  // ---- Called when the user clicks Subscribe / one-time on the paywall — straight to Stripe. ----
  // Stripe collects the client's email itself; the webhook then activates access for that email,
  // so there is nothing to sign in to beforehand.
  const requestPaidAccess = (stripeUrl) => {
    trackBeginCheckout();
    window.location.href = stripeUrl;
  };

  const handleSignOut = () => {
    setPlan("free");
    setAccessEmail("");
    setAccessInput("");
    setAccessToken("");
    try { window.localStorage.removeItem("montaureo_email"); window.localStorage.removeItem("montaureo_token"); } catch {}
  };

  const Chips = ({ fieldKey, opts }) => (
    <div>
      <div style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: C.gold, marginBottom: 9 }}>{t.f[fieldKey]}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {opts.map((o) => { const on = form[fieldKey] === o; return <button key={o} onClick={() => setF(fieldKey, o)} style={{ cursor: "pointer", border: `1px solid ${on ? C.gold : C.line}`, background: on ? "rgba(198,163,90,0.12)" : "transparent", color: on ? C.snow : C.mist, padding: "9px 14px", borderRadius: 99, fontSize: 13, transition: "all .15s" }}>{v(o)}</button>; })}
      </div>
    </div>
  );
  const STYLE = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap&subset=cyrillic,latin');
      @keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:.5}50%{opacity:.95}}
      @keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
      @keyframes line{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
      @keyframes ring{from{stroke-dashoffset:339}to{stroke-dashoffset:var(--off)}}
      @keyframes globe-surface{from{background-position-x:0}to{background-position-x:-80px}}
      @keyframes globe-rot{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      @keyframes fade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
      @keyframes dot{0%,80%,100%{opacity:.25}40%{opacity:1}}
      .mt-up{animation:up .55s cubic-bezier(.2,.7,.2,1) both}
      .fade{animation:fade .7s cubic-bezier(.2,.7,.2,1) both}
      .mt-cta:hover{filter:brightness(1.1)} @keyframes platinum-shine{0%,68%,100%{background-position:180% 0}82%{background-position:-80% 0}}
      .mt-world-cta{display:flex;align-items:center;justify-content:center;gap:9px;width:min(100%,360px);box-sizing:border-box;border:1px solid rgba(255,255,255,.85);border-radius:99px;padding:13px 24px;color:#17181B;text-decoration:none;font-size:14px;font-weight:600;background:linear-gradient(135deg,#F7F7F5 0%,#C8C9CC 42%,#F1F1EF 68%,#AEB0B5 100%);box-shadow:0 8px 28px rgba(210,214,220,.18),inset 0 1px 0 rgba(255,255,255,.95);transition:filter .15s,transform .15s;animation:platinum-shine 5.5s ease-in-out infinite;background-size:240% 100%}
      .mt-world-cta:hover{filter:brightness(1.05);transform:translateY(-1px)}
      .auth-btn:hover{filter:brightness(1.06);border-color:rgba(198,163,90,0.4)}
      .nav-item:hover{background:rgba(198,163,90,0.06)!important}
      .link:hover{color:${C.goldHi}!important}
      input::placeholder{color:${C.faint}}
      @media (prefers-reduced-motion:reduce){*{animation:none!important}}
      @media (max-width:860px){
        .mt-shell{flex-direction:column!important}
        .mt-side{width:100%!important;flex-direction:row!important;overflow-x:auto;border-right:none!important;border-bottom:1px solid ${C.line};padding:10px 12px!important;gap:6px!important;align-items:center}
        .mt-navrow{flex-direction:row!important;flex-wrap:wrap!important;gap:6px!important;width:100%}
        .mt-side{flex-wrap:wrap!important;overflow-x:visible!important}
        .mt-brand{width:100%}
        .nav-item{white-space:nowrap}
        .mt-premium{display:none!important}
        .mt-landing{grid-template-columns:1fr!important;padding-top:24px!important}
        .mt-globewrap{order:2!important}
      }
      .mt-hero-shade{background:linear-gradient(0deg, rgba(7,7,8,.94) 0%, rgba(7,7,8,.78) 22%, rgba(7,7,8,.25) 40%, transparent 55%)}
      .mt-hero-dock{display:flex;align-items:flex-end;justify-content:space-between;gap:40px;padding:0 6vw 7svh}
      .mt-hero-copy{max-width:640px}
      .mt-hero-title{font-size:clamp(40px,4.4vw,64px)}
      .mt-hero-sub{font-size:17px;max-width:560px}
      .mt-hero-actions{display:flex;flex-direction:column;align-items:center;gap:12px;flex-shrink:0}
      @media (max-aspect-ratio: 4/5), (max-width: 760px){
        .mt-hero-shade{background:linear-gradient(0deg, rgba(7,7,8,.96) 0%, rgba(7,7,8,.85) 26%, rgba(7,7,8,.3) 40%, transparent 52%)}
        .mt-hero-dock{flex-direction:column;align-items:stretch;gap:18px;padding:0 20px 5svh}
        .mt-hero-title{font-size:34px}
        .mt-hero-sub{font-size:14.5px}
        .mt-hero-actions{align-items:stretch}
        .mt-hero-actions>div{text-align:center}
      }
      @media (max-aspect-ratio: 4/5) and (max-height: 720px){
        .mt-hero-sub{display:none}
        .mt-hero-title{font-size:30px}
      }
    `}</style>
  );

  /* ===================== LANDING (no login required) ===================== */
  if (!authed) {
    return (
      <div style={{ background: C.void, minHeight: "100%", width: "100%", color: C.snow, fontFamily: "Inter, sans-serif" }}>
        {STYLE}
        <div className="mt-hero" style={{ position: "relative", height: "100svh", minHeight: 560, overflow: "hidden", background: C.void }}>
          <video
            key={heroPortrait ? "v" : "h"}
            autoPlay muted playsInline preload="auto"
            src={heroPortrait ? "/hero-9x16.mp4" : "/hero-16x9.mp4"}
            poster={heroPortrait ? "/hero-9x16-poster.jpg" : "/hero-16x9-poster.jpg"}
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          {/* readable text over any frame */}
          <div className="mt-hero-shade" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }} />
          <div style={{ position: "absolute", top: 22, left: 0, right: 0, zIndex: 3, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, pointerEvents: "none" }}>
            <SummitMark size={26} /><Wordmark size={12} />
          </div>
          <div className="mt-hero-dock" style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 4 }}>
            <div className="mt-hero-copy">
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600, margin: 0, color: C.snow, lineHeight: 1.05, textShadow: "0 2px 24px rgba(0,0,0,0.6)" }} className="mt-hero-title">{t.heroTitle}</h1>
              <p className="mt-hero-sub" style={{ margin: "12px 0 0", color: "#D9D8D2", lineHeight: 1.5, textShadow: "0 1px 14px rgba(0,0,0,0.8)" }}>{t.heroSub}</p>
            </div>
            <div className="mt-hero-actions">
              <button onClick={enter} className="mt-cta" style={{ cursor: "pointer", border: "none", borderRadius: 99, padding: "16px 30px", fontSize: 15.5, fontWeight: 600, fontFamily: "Inter, sans-serif", color: "#1A1408", background: `linear-gradient(140deg, ${C.goldHi}, ${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, boxShadow: "0 10px 40px rgba(198,163,90,0.35)" }}>
                {t.startFree} <ArrowRight size={18} strokeWidth={2.4} />
              </button>
              <div style={{ fontSize: 11.5, letterSpacing: ".12em", color: "#C9C8C2", textShadow: "0 1px 14px rgba(0,0,0,0.85)" }}>FREE · 60 SECONDS · NO SIGNUP</div>
              <a href="/how-it-is-calculated.html" onClick={() => trackCtaClick("how_calculated")} style={{ fontSize: 15.5, fontWeight: 500, color: C.goldHi, textDecoration: "underline", textUnderlineOffset: 4, textDecorationThickness: 1, textShadow: "0 1px 14px rgba(0,0,0,0.85)", padding: "4px 0", textAlign: "center" }}>{t.heroHow} →</a>
              <a href="/explore" onClick={() => trackOutbound("montaureo_world_game")} className="mt-world-cta">
                {t.heroWorld} <ArrowRight size={17} strokeWidth={2.2} />
              </a>
              <div style={{ fontSize: 11.5, color: C.mist, letterSpacing: ".04em" }}>{t.heroTrust}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ===================== SHELL ===================== */
  const [domTitle, domSub] = t.dom[focus];

  return (
    <div style={{ background: C.void, minHeight: "100%", width: "100%", color: C.snow, fontFamily: "Inter, sans-serif" }}>
      {STYLE}
      <div className="mt-shell" style={{ display: "flex", minHeight: "100vh", maxWidth: 1500, margin: "0 auto" }}>

        {/* ===== SIDEBAR ===== */}
        <aside className="mt-side" style={{ width: 248, flexShrink: 0, borderRight: `1px solid ${C.line}`, padding: "22px 16px", display: "flex", flexDirection: "column", gap: 22 }}>
          <button className="mt-brand" onClick={() => setSection("future")} style={{ display: "flex", alignItems: "center", gap: 9, paddingLeft: 4, background: "transparent", border: "none", cursor: "pointer" }}>
            <SummitMark size={30} /><div style={{ fontSize: 13.5, letterSpacing: "0.30em", color: C.snow }}>MONTAUREO</div>
          </button>
          <nav className="mt-navrow" style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {SECTIONS.map(([key, Icon]) => {
              const on = section === key;
              const gated = (key === "concierge" || key in FOCUS) && plan === "free";
              return (
                <button key={key} className="nav-item" onClick={() => switchSection(key)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 11, padding: "10px 13px", borderRadius: 11, border: on ? `1px solid ${C.line}` : "1px solid transparent", background: on ? "rgba(198,163,90,0.08)" : "transparent", color: on ? C.snow : C.mist, fontSize: 13.5, textAlign: "left", transition: "background .15s" }}>
                  <Icon size={16} color={on ? C.gold : C.mist} /> <span style={{ flex: 1 }}>{t.nav[key]}</span>
                  {gated && <Lock size={12} color={C.faint} />}
                </button>
              );
            })}
          </nav>
          <div className="mt-premium" style={{ marginTop: "auto", border: `1px solid ${C.line}`, borderRadius: 16, padding: "16px 14px", textAlign: "center", background: `linear-gradient(180deg, ${C.panelHi}, ${C.card})` }}>
            <Crown size={20} color={C.gold} style={{ margin: "0 auto 7px" }} />
            {plan === "free" && (<>
              <div style={{ fontSize: 12, letterSpacing: ".12em", color: C.gold, fontWeight: 600 }}>{t.pmcFreeTitle}</div>
              <div style={{ fontSize: 11.5, color: C.mist, margin: "6px 0 12px", lineHeight: 1.45 }}>{t.pmcFreeSub}</div>
              <button onClick={() => { trackCtaClick("unlock_sidebar"); setSection("concierge"); }} className="mt-cta" style={{ width: "100%", cursor: "pointer", border: "none", borderRadius: 11, padding: "10px", fontSize: 13, fontWeight: 600, color: "#1A1408", background: `linear-gradient(140deg, ${C.goldHi}, ${C.gold})` }}>{t.pmcUnlock}</button>
            </>)}
            {plan === "premium" && (<>
              <div style={{ fontSize: 12, letterSpacing: ".12em", color: C.gold, fontWeight: 600 }}>{t.pmcPremTitle}</div>
              <div style={{ fontSize: 11.5, color: C.mist, margin: "6px 0 12px", lineHeight: 1.45 }}>{t.pmcPremSub}</div>
              <button onClick={openLead} style={{ width: "100%", cursor: "pointer", border: `1px solid ${C.gold}`, borderRadius: 11, padding: "10px", fontSize: 13, fontWeight: 600, color: C.goldHi, background: "transparent" }}>{t.pmcToPrivate}</button>
            </>)}
            {plan === "private" && (<>
              <div style={{ fontSize: 12, letterSpacing: ".12em", color: C.gold, fontWeight: 600 }}>{t.pmcPrivTitle}</div>
              <div style={{ fontSize: 11.5, color: C.mist, margin: "6px 0 4px", lineHeight: 1.45 }}>{t.pmcPrivSub}</div>
            </>)}
          </div>
          {plan !== "free" && (
            <button onClick={handleSignOut} style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: `1px solid ${C.line}`, background: "transparent", color: C.mist, borderRadius: 11, padding: "10px", fontSize: 12.5 }}>
              <LogOut size={13} /> {t.signOut}
            </button>
          )}
        </aside>

        {/* ===== MAIN ===== */}
        <main style={{ flex: 1, minWidth: 0, position: "relative", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, padding: "16px 22px 0" }}>
            <button onClick={() => setSection("profile")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 7, border: `1px solid ${C.line}`, background: "rgba(255,255,255,0.02)", color: C.snow, borderRadius: 99, padding: "6px 12px", fontSize: 12.5 }}>
              <User size={13} color={C.gold} /> {v(form.from)} · <span style={{ color: plan === "free" ? C.mist : C.goldHi, fontWeight: plan === "free" ? 400 : 600 }}>{PLAN_LABEL[plan]}</span>
            </button>
          </div>

          {/* ---------- FUTURE ---------- */}
          {section === "future" && (
            <div style={{ flex: 1, position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(58% 38% at 50% 8%, rgba(198,163,90,0.10), transparent 70%)" }} />

              {futureState === "form" && step === 1 && (
                <div className="mt-up" style={{ padding: "8px 22px 40px", position: "relative", maxWidth: 560, margin: "0 auto" }}>
                  <div style={{ textAlign: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 11, letterSpacing: ".34em", textTransform: "uppercase", color: C.gold }}>Design your future</div>
                    <h1 style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontWeight: 500, fontSize: "clamp(25px,5.8vw,32px)", color: C.snow, margin: "10px 0 4px" }}>{t.whoTitle}</h1>
                    <div style={{ fontSize: 12.5, color: C.mist }}>{t.step} 1 {t.of} 2</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 17, marginTop: 20 }}>
                    {FIELDS.map(([k, opts]) => <Chips key={k} fieldKey={k} opts={opts} />)}
                    {!form.citizen && <div style={{ fontSize: 12.5, color: C.mist, textAlign: "center" }}>Choose your citizenship to continue — it decides which countries make sense for you.</div>}
                    {!form.src && <div style={{fontSize:12.5,color:C.goldHi}}>Choose your main source of income. We do not assume salary.</div>}
                    <div style={{fontSize:12,color:C.mist}}>Calculations use liquid assets only, not your total wealth. Other-country figures use an explicit benchmark, not a country-specific tax rate. US citizens require specialist review of continuing US tax; Canadian obligations depend on residence and ties.</div>
                    <label style={{fontSize:12,color:C.mist,lineHeight:1.5}}><input type="checkbox" checked={profileConsent} onChange={e=>setProfileConsent(e.target.checked)} /> I agree to my answers being processed to generate my scenario as explained in the <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" style={{color:C.goldHi}}>Privacy Policy</a>.</label>
                    <Btn disabled={!form.citizen || !form.src || !profileConsent} onClick={() => setStep(2)}>{t.next} <ArrowRight size={18} strokeWidth={2.4} /></Btn>
                  </div>
                </div>
              )}

              {futureState === "form" && step === 2 && (
                <div className="mt-up" style={{ padding: "8px 22px 40px", position: "relative", maxWidth: 460, margin: "0 auto" }}>
                  <div style={{ textAlign: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 11, letterSpacing: ".34em", textTransform: "uppercase", color: C.gold }}>Design your future</div>
                    <h1 style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontWeight: 500, fontSize: "clamp(25px,5.8vw,32px)", color: C.snow, margin: "10px 0 4px" }}>{t.whatTitle}</h1>
                    <div style={{ fontSize: 12.5, color: C.mist }}>{t.step} 2 {t.of} 2</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 }}>
                    {MATTER_KEYS.map((m) => { const on = matters.includes(m); return (
                      <button key={m} onClick={() => toggleM(m)} style={{ cursor: "pointer", border: `1px solid ${on ? C.gold : C.line}`, background: on ? "rgba(198,163,90,0.12)" : `linear-gradient(180deg, ${C.panelHi}, ${C.panel})`, color: on ? C.snow : C.mist, padding: "16px", borderRadius: 14, fontSize: 14.5, fontWeight: 500, transition: "all .15s" }}>{v(m)}</button>
                    ); })}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                    <button onClick={() => setStep(1)} style={{ cursor: "pointer", border: `1px solid ${C.line}`, background: "transparent", color: C.mist, borderRadius: 14, padding: "15px 18px", fontSize: 14 }}>{t.back}</button>
                    <div style={{ flex: 1 }}><Btn onClick={() => { setPrevResult(null); runFuture(); }}>{t.showTwo} <ArrowRight size={18} strokeWidth={2.4} /></Btn></div>
                  </div>
                </div>
              )}

              {futureState === "loading" && (
                <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, position: "relative" }}>
                  <div style={{ position: "relative", width: 140, height: 140, display: "grid", placeItems: "center" }}>
                    <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: "absolute", animation: "spin 2.4s linear infinite" }}><circle cx="70" cy="70" r="60" fill="none" stroke="rgba(198,163,90,.4)" strokeWidth="1" strokeDasharray="2 8" /></svg>
                    <div style={{ animation: "pulse 1.5s ease-in-out infinite" }}><SummitMark size={56} /></div>
                  </div>
                  <div style={{ fontSize: 12.5, letterSpacing: ".2em", textTransform: "uppercase", color: C.gold }}>{t.drawing}</div>
                  <div style={{ width: "min(340px, 86vw)" }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(95 * (1 - Math.exp(-loadSec / 14)))}>
                    <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${95 * (1 - Math.exp(-loadSec / 14))}%`, background: `linear-gradient(90deg, ${C.gold}, ${C.goldHi})`, transition: "width 1s linear" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 16 }}>
                      {t.loadSteps.map((label, i) => { const at = [0, 4, 10, 18][i]; const next = [4, 10, 18, Infinity][i]; const done = loadSec >= next; const active = loadSec >= at && !done; return (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: done ? C.mist : active ? C.snow : C.faint, transition: "color .3s" }}>
                          <span style={{ width: 14, textAlign: "center", color: done ? C.green : C.gold }}>{done ? "✓" : active ? "•" : "·"}</span>{label}
                        </div>
                      ); })}
                    </div>
                    <div style={{ fontSize: 12, color: C.mist, marginTop: 14, lineHeight: 1.5 }}>{t.loadSub}</div>
                  </div>
                </div>
              )}

              {futureState === "error" && (
                <div style={{ minHeight: "50vh", display: "grid", placeItems: "center", padding: 22, position: "relative" }}>
                  <div style={{ textAlign: "center", maxWidth: 320 }}>
                    <div role="alert" style={{ color: C.mist, fontSize: 14, marginBottom: 14, lineHeight: 1.5 }}>{futureErr === "limit" ? "You've reached today's free limit for Two Futures. Come back tomorrow — or speak with an advisor now." : t.errBuild}</div>
                    {futureErr === "limit"
                      ? <Btn onClick={openLead}>{t.requestAccess} <ArrowRight size={18} strokeWidth={2.4} /></Btn>
                      : <Btn onClick={() => setFutureState("form")}>{t.backToQ}</Btn>}
                  </div>
                </div>
              )}

              {futureState === "result" && futureResult && (
                <div style={{ padding: "4px 18px 40px", position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
                    <button onClick={() => { setFutureState("form"); setStep(1); }} style={{ cursor: "pointer", background: "transparent", border: `1px solid ${C.line}`, borderRadius: 99, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, color: C.mist, fontSize: 12 }}><RotateCcw size={12} /> {t.passAgain}</button>
                  </div>
                  {futureResult.scene && (
                    <div className="mt-up" style={{ maxWidth: 600, margin: "0 auto", borderRadius: 20, padding: "28px 24px", background: "linear-gradient(165deg, rgba(198,163,90,0.12), rgba(8,8,11,0.4) 55%)", border: `1px solid rgba(198,163,90,0.3)`, position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 80% 0%, rgba(198,163,90,0.14), transparent 60%)", pointerEvents: "none" }} />
                      <div style={{ position: "relative" }}>
                        <div style={{ fontSize: 10.5, letterSpacing: ".3em", textTransform: "uppercase", color: C.gold, marginBottom: 16 }}>{futureResult.scene.month}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          {(futureResult.scene.lines || []).map((l, i) => (<div key={i} style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, lineHeight: 1.5, color: "#E9E7DF", animation: `line .6s ease ${0.15 + i * 0.2}s both` }}>{l}</div>))}
                        </div>
                        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 7, animation: `line .6s ease ${0.2 + (futureResult.scene.lines?.length || 5) * 0.2}s both` }}>
                          <MapPin size={15} color={C.gold} /><span style={{ fontSize: 15, fontWeight: 600, letterSpacing: ".04em", color: C.snow }}>{futureResult.scene.country}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {typeof futureResult.confidence === "number" && (
                    <div className="mt-up" style={{ maxWidth: 600, margin: "18px auto 0", display: "flex", alignItems: "center", gap: 16, border: `1px solid ${C.line}`, borderRadius: 16, padding: "16px 18px", background: `linear-gradient(180deg, ${C.panelHi}, ${C.panel})` }}>
                      <div style={{ position: "relative", width: 58, height: 58, flexShrink: 0 }}>
                        <svg width="58" height="58" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
                          <circle cx="60" cy="60" r="54" fill="none" stroke="url(#fc)" strokeWidth="9" strokeLinecap="round" strokeDasharray="339" style={{ strokeDashoffset: 339 - 339 * futureResult.confidence / 100, transform: "rotate(-90deg)", transformOrigin: "center", animation: "ring 1s ease both" }} />
                          <defs><linearGradient id="fc" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#F2DCA0" /><stop offset="1" stopColor="#C6A35A" /></linearGradient></defs>
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 16, fontWeight: 700, color: C.snow }}>{futureResult.confidence}<span style={{ fontSize: 9, color: C.mist }}>/100</span></div>
                      </div>
                      <div><div style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: C.gold }}>{t.fcTitle}</div><div style={{ fontSize: 12.5, color: C.mist, marginTop: 3, lineHeight: 1.4 }}>{futureResult.fitNote || t.fcSub} {t.fcJudgement}{matters.length ? <span style={{ display: "block", marginTop: 4, color: C.faint }}>You selected: {matters.map((m) => v(m)).join(", ")}</span> : null}</div></div>
                    </div>
                  )}
                  {Array.isArray(futureResult.why) && futureResult.why.length > 0 && (
                    <div className="mt-up" style={{ maxWidth: 600, margin: "16px auto 0", border: `1px solid ${C.line}`, borderRadius: 16, padding: "16px 18px", background: `linear-gradient(180deg, ${C.panelHi}, ${C.panel})` }}>
                      <div style={{ fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: C.gold, marginBottom: 10 }}>{t.whyTitle} {futureResult.move?.country || futureResult.scene?.country}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {futureResult.why.slice(0, 4).map((w, i) => (<div key={i} style={{ display: "flex", gap: 9, fontSize: 14, color: "#D9D8D2", lineHeight: 1.45 }}><span style={{ color: C.gold, flexShrink: 0 }}>{i + 1}.</span><span>{w}</span></div>))}
                      </div>
                    </div>
                  )}
                  {(() => {
                    const ALIAS = { "united arab emirates": "uae", dubai: "uae", "abu dhabi": "uae", emirates: "uae", uk: "united kingdom", britain: "united kingdom", "great britain": "united kingdom", england: "united kingdom", usa: "united states", us: "united states", swiss: "switzerland" };
                    const norm = (x) => { const k = String(x || "").toLowerCase().replace(/\(.*?\)/g, "").replace(/[^\p{L} ]/gu, " ").replace(/\s+/g, " ").trim(); return ALIAS[k] || k; };
                    const label = (x) => String(x).replace(/\s*\(.*?\)\s*/g, " ").trim();
                    const cur = [futureResult.move?.country, futureResult.stay?.country, futureResult.scene?.country].filter(Boolean).map(norm);
                    const seen = new Set(cur);
                    const opts = [];
                    for (const raw of [...(form.citizen === "zFR" ? [] : ["Monaco"]), "UAE", "Singapore", "Cyprus"]) {
                      const n = norm(raw); const l = label(raw);
                      if (!n || !l || l.length > 30 || seen.has(n) || cur.some((c) => c.includes(n) || n.includes(c)) || (form.citizen === "zFR" && n === "monaco")) continue;
                      seen.add(n); opts.push(l); if (opts.length === 5) break;
                    }
                    return opts.length > 0 && (
                      <div className="mt-up" style={{ maxWidth: 600, margin: "12px auto 0", border: `1px solid ${C.line}`, borderRadius: 16, padding: "14px 18px" }}>
                        <div style={{ fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: C.gold, marginBottom: 10 }}>{t.compareTitle}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {opts.map((c) => (<button key={c} className="cmp-chip" onClick={() => runFuture(c)} style={{ cursor: "pointer", border: `1px solid ${C.gold}`, background: "transparent", color: C.goldHi, padding: "9px 14px", borderRadius: 99, fontSize: 13, fontWeight: 500 }}>{c}</button>))}
                        </div>
                        <div style={{ fontSize: 11.5, color: C.faint, marginTop: 9 }}>{t.compareNote} Saint Barthélemy needs an individual eligibility review: <button onClick={openLead} style={{color:C.goldHi,background:"none",border:0,textDecoration:"underline",cursor:"pointer"}}>Request a review</button>.</div>
                      </div>
                    );
                  })()}
                  {prevResult?.move && futureResult.move && (
                    <div className="mt-up" style={{ maxWidth: 600, margin: "16px auto 0", border: `1px solid rgba(198,163,90,0.4)`, borderRadius: 16, overflow: "hidden" }}>
                      <div style={{ padding: "12px 14px", fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: C.gold, borderBottom: `1px solid ${C.line}` }}>{t.h2hTitle}</div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: 12, color: C.snow, overflowWrap: "break-word", hyphens: "auto" }} lang="en">
                          <colgroup><col style={{ width: "16%" }} /><col style={{ width: "28%" }} /><col style={{ width: "28%" }} /><col style={{ width: "28%" }} /></colgroup>
                          <thead><tr>{["", prevResult.stay?.country ? `${prevResult.stay.country} (stay)` : t.stay, prevResult.move.country, futureResult.move.country].map((h, i) => (<th key={i} style={{ textAlign: "left", padding: "9px 6px", fontSize: 11.5, fontWeight: 600, verticalAlign: "bottom", color: i === 3 ? C.goldHi : i === 0 ? C.faint : "#CFCFC8", borderBottom: `1px solid ${C.line}` }}>{h}</th>))}</tr></thead>
                          <tbody>
                            {[[t.tax, "tax"], [t.cap2036, "capital2036"], [t.school, "school"], [t.climate, "climate"]].map(([lbl, key]) => (
                              <tr key={key}>
                                <td style={{ padding: "9px 6px", fontSize: 9, letterSpacing: ".02em", textTransform: "uppercase", color: C.faint, verticalAlign: "top", borderTop: "1px solid rgba(255,255,255,0.04)" }}>{lbl}</td>
                                <td style={{ padding: "9px 6px", verticalAlign: "top", color: C.mist, borderTop: "1px solid rgba(255,255,255,0.04)" }}>{prevResult.stay?.[key] || "—"}</td>
                                <td style={{ padding: "9px 6px", verticalAlign: "top", fontWeight: key === "capital2036" ? 600 : 400, borderTop: "1px solid rgba(255,255,255,0.04)" }}>{prevResult.move[key] || "—"}</td>
                                <td style={{ padding: "9px 6px", verticalAlign: "top", fontWeight: key === "capital2036" ? 600 : 400, color: key === "capital2036" ? C.goldHi : C.snow, borderTop: "1px solid rgba(255,255,255,0.04)" }}>{futureResult.move[key] || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  <div className="mt-up" style={{ maxWidth: 600, margin: "20px auto 0" }}>
                    <div style={{ textAlign: "center", fontSize: 10.5, letterSpacing: ".26em", textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>{t.twoFutures}</div>
                    <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
                      {[["stay", futureResult.stay, false], ["move", futureResult.move, true]].map(([id, data, isMove]) => data && (
                        <div key={id} style={{ flex: 1, minWidth: 0, border: `1px solid ${isMove ? "rgba(198,163,90,0.4)" : C.line}`, borderRadius: 16, overflow: "hidden", background: isMove ? "linear-gradient(180deg, rgba(198,163,90,0.08), rgba(16,17,23,0.6))" : C.panel }}>
                          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.line}` }}>
                            <div style={{ fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", color: isMove ? C.gold : C.faint }}>{isMove ? t.move : t.stay}</div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: C.snow, marginTop: 2 }}>{data.country}</div>
                          </div>
                          {[[t.tax, data.tax], [t.cap2036, data.capital2036], [t.school, data.school], [t.climate, data.climate]].map(([l, val], i) => (
                            <div key={i} style={{ padding: "9px 14px", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                              <div style={{ fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: C.faint }}>{l}</div>
                              <div style={{ fontSize: 13.5, color: isMove && l === t.cap2036 ? C.goldHi : C.snow, fontWeight: l === t.cap2036 ? 600 : 400, marginTop: 2 }}>{val || "—"}</div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                  {futureResult.taxWarning && <div role="alert" style={{maxWidth:600,margin:"16px auto",padding:16,border:`1px solid ${C.gold}`,borderRadius:12,color:C.goldHi,fontSize:13,lineHeight:1.5}}>{futureResult.taxWarning}</div>}
                  {futureResult.difference && (
                    <div className="mt-up" style={{ maxWidth: 600, margin: "16px auto 0", border: `1px solid rgba(198,163,90,0.35)`, borderRadius: 16, padding: "16px 18px", background: "linear-gradient(180deg, rgba(198,163,90,0.07), rgba(16,17,23,0.5))" }}>
                      <div style={{ fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: C.gold, marginBottom: 10 }}>{t.diffTitle}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {futureResult.difference.map((d, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14, color: i === 0 ? C.goldHi : "#D9D8D2", fontWeight: i === 0 ? 600 : 400 }}><Sparkles size={13} color={C.gold} style={{ flexShrink: 0 }} /> {d}</div>))}
                      </div>
                    </div>
                  )}
                  {futureResult.calc && (() => { const c = futureResult.calc; const m = (x) => Math.abs(x) < 0.0005 ? "€0" : `€${(Math.round(x * 10) / 10).toFixed(1)}M`; const k = (x) => Math.abs(x) < 0.0005 ? "€0" : (Math.abs(x) >= 1 ? m(x) : `€${Math.round(x * 1000)}K`); return (
                    <details className="mt-up" style={{ maxWidth: 600, margin: "12px auto 0", border: `1px solid ${C.line}`, borderRadius: 16, padding: "12px 16px", background: C.panel }}>
                      <summary style={{ cursor: "pointer", fontSize: 13.5, color: C.goldHi, fontWeight: 600 }}>{t.calcTitle}</summary>
                      <div style={{ fontSize: 13, color: "#D9D8D2", lineHeight: 1.6, marginTop: 10 }}>
                        <div>{t.calcStart} <b>{m(c.start)}</b> · {t.calcIncome} <b>{k(c.income)}</b>/yr · {t.calcSpend} <b>{k(c.spending)}</b>/yr · {t.calcReturn}</div>
                        <div style={{ marginTop: 8, color: C.mist }}>{t.calcFormula}</div>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10, fontSize: 12.5, fontVariantNumeric: "tabular-nums" }}>
                          <thead><tr>{["", c.stay.name, c.move.name].map((h, i) => <th key={i} style={{ textAlign: i ? "right" : "left", padding: "6px 4px", color: i === 2 ? C.goldHi : C.mist, fontWeight: 600, borderBottom: `1px solid ${C.line}` }}>{h}</th>)}</tr></thead>
                          <tbody>
                            {[[t.calcTax1, k(c.stay.taxFirstYear), k(c.move.taxFirstYear)], [t.calcTaxAll, m(c.stay.taxTotal), m(c.move.taxTotal)], [t.calcEnd, m(c.stay.end), m(c.move.end)]].map(([l, a, b]) => (
                              <tr key={l}><td style={{ padding: "6px 4px", color: C.mist }}>{l}</td><td style={{ padding: "6px 4px", textAlign: "right" }}>{a}</td><td style={{ padding: "6px 4px", textAlign: "right", color: C.goldHi, fontWeight: 600 }}>{b}</td></tr>
                            ))}
                          </tbody>
                        </table>
                        <div style={{ marginTop: 8, color: C.mist, fontSize: 12 }}>{t.calcWhyGap}</div>
                      </div>
                    </details>
                  ); })()}
                  {/* ---------- INTRO VIDEO — bridge between the free scenario and the paywall ---------- */}
                  <div className="mt-up" style={{ maxWidth: 600, margin: "22px auto 0" }}>
                    <div style={{ fontSize: 10.5, letterSpacing: ".26em", textTransform: "uppercase", color: C.gold, textAlign: "center", marginBottom: 12 }}>
                      Meet your advisors
                    </div>
                    <video
                      src="/montaureo-intro.mp4"
                      poster="/montaureo-poster.jpg"
                      controls
                      playsInline
                      preload="none"
                      style={{ width: "100%", borderRadius: 16, border: `1px solid ${C.line}`, display: "block" }}
                    />
                    <div style={{ fontSize: 12.5, color: C.mist, textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
                      Kate, Jun and Emily work your specific case — banking, legal, real estate.
                    </div>
                  </div>

                  <div className="mt-up" style={{ maxWidth: 600, margin: "20px auto 0" }}>
                    <label style={{display:"block",fontSize:12,color:C.mist,lineHeight:1.5,marginBottom:10}}><input type="checkbox" checked={conciergeConsent} onChange={e=>setConciergeConsent(e.target.checked)} /> I agree to reuse my questionnaire answers in Montaureo Concierge. <a href="/privacy-policy.html" style={{color:C.goldHi}}>Privacy Policy</a></label>
                    <Btn disabled={!conciergeConsent} onClick={() => { trackCtaClick("show_my_path"); setSection("concierge"); }}>{t.showPath} <ArrowRight size={18} strokeWidth={2.4} /></Btn>
                    <div style={{ fontSize: 11.5, color: C.mist, textAlign: "center", marginTop: 10 }}>{t.showPathSub}</div>
                    <button
                      onClick={openLead}
                      style={{ marginTop: 10, width: "100%", cursor: "pointer", border: `1px solid ${C.gold}`, borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 600, color: C.goldHi, background: "rgba(198,163,90,0.08)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    >
                      <Crown size={16} /> {t.bookConsult}
                    </button>
                  </div>
                  <div style={{ maxWidth: 600, margin: "16px auto 0", fontSize: 10.5, color: C.faint, lineHeight: 1.5, textAlign: "center", padding: "0 10px" }}>
                    {t.discPrefix}{futureResult.assumptions ? ` (${futureResult.assumptions})` : ""}; {t.scenariosBoth} {futureResult.disclaimer || t.discDefault}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---------- PROFILE ---------- */}
          {section === "profile" && (
            <div className="mt-up" style={{ padding: "10px 22px 40px", maxWidth: 560, margin: "0 auto", width: "100%" }}>
              <div style={{ fontSize: 11, letterSpacing: ".26em", textTransform: "uppercase", color: C.gold }}>{t.profile}</div>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: C.snow, margin: "6px 0 4px" }}>{t.yourProfile}</h1>
              <div style={{ fontSize: 13, color: C.mist, marginBottom: 22 }}>{t.profileSub}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 17 }}>
                {FIELDS.map(([k, opts]) => <Chips key={k} fieldKey={k} opts={opts} />)}
                <div>
                  <div style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: C.gold, marginBottom: 9 }}>{t.priorities}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {MATTER_KEYS.map((m) => { const on = matters.includes(m); return <button key={m} onClick={() => toggleM(m)} style={{ cursor: "pointer", border: `1px solid ${on ? C.gold : C.line}`, background: on ? "rgba(198,163,90,0.12)" : "transparent", color: on ? C.snow : C.mist, padding: "9px 14px", borderRadius: 99, fontSize: 13 }}>{v(m)}</button>; })}
                  </div>
                </div>
                <Btn onClick={() => setSaved(true)}>{saved ? t.saved : t.saveProfile}</Btn>
                {saved && <div style={{ fontSize: 12, color: C.green, textAlign: "center" }}>{t.savedNote}</div>}
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 14px" }}>
                  <div><div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: C.gold }}>{t.planLabel}</div><div style={{ fontSize: 14, color: C.snow, marginTop: 2 }}>{PLAN_LABEL[plan]}</div></div>
                </div>
              </div>
            </div>
          )}

          {/* ---------- PAYWALL GATE ---------- */}
          {locked && (
            <div className="mt-up" style={{ flex: 1, padding: "10px 22px 48px", maxWidth: 920, margin: "0 auto", width: "100%", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(60% 40% at 50% 6%, rgba(198,163,90,0.12), transparent 70%)" }} />
              <div style={{ textAlign: "center", position: "relative" }}>
                <div style={{ fontSize: 11, letterSpacing: ".3em", textTransform: "uppercase", color: C.gold }}>{t.pwEyebrow}</div>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: "clamp(28px,5vw,44px)", color: C.snow, margin: "12px 0 6px" }}>{futureResult ? t.pwReady : t.pwVip}</h1>
                <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: "clamp(18px,3vw,24px)", color: C.goldHi, marginBottom: 12 }}>{t.pwUnlock}</div>
                <p style={{ fontSize: 15, color: C.mist, maxWidth: 540, margin: "0 auto", lineHeight: 1.55 }}>
                  {t.pwBodyA}{futureResult?.move?.country ? ` (${futureResult.move.country})` : ""} {t.pwBodyB}
                </p>
              </div>
              {(() => { const sm = SAMPLES[focus] || SAMPLES.null; return (
                <div style={{ maxWidth: 620, margin: "26px auto 0", border: `1px solid ${C.line}`, borderRadius: 18, padding: "18px 18px 16px", background: `linear-gradient(180deg, ${C.panelHi}, ${C.panel})`, position: "relative" }}>
                  <div style={{ fontSize: 10.5, letterSpacing: ".24em", textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>{t.sampleEyebrow} · {t.dom[focus]?.[0] || t.dom.null[0]}</div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}><div style={{ maxWidth: "85%", background: "rgba(198,163,90,0.14)", border: `1px solid rgba(198,163,90,0.3)`, color: C.snow, borderRadius: "14px 14px 4px 14px", padding: "10px 13px", fontSize: 13.5, lineHeight: 1.45 }}>{sm.q}</div></div>
                  <div style={{ marginTop: 10, color: "#D9D8D2", fontSize: 13.5, lineHeight: 1.55 }}>{sm.a}</div>
                  <div style={{ marginTop: 10, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
                    {sm.rows.map(([p, s2], i) => (<div key={p} style={{ padding: "9px 12px", borderTop: i ? "1px solid rgba(255,255,255,0.05)" : "none" }}><div style={{ fontSize: 13, fontWeight: 600, color: C.goldHi }}>{p}</div><div style={{ fontSize: 12.5, color: C.mist, marginTop: 2, lineHeight: 1.45 }}>{s2}</div></div>))}
                  </div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 10 }}>{t.sampleNote}</div>
                </div>
              ); })()}
              <div style={{ display: "flex", gap: 14, marginTop: 30, alignItems: "stretch", flexWrap: "wrap", justifyContent: "center", position: "relative" }}>
                <div style={{ flex: "1 1 220px", maxWidth: 300, border: `1px solid ${C.line}`, borderRadius: 18, padding: "22px 20px", background: C.panel, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: C.faint }}>{t.tierFree}</div>
                  <div style={{ fontSize: 30, fontWeight: 700, color: C.snow, margin: "8px 0 2px" }}>$0</div>
                  <div style={{ fontSize: 12.5, color: C.mist, marginBottom: 16 }}>{t.tierFreeNow}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 13, color: "#CFCFC8", flex: 1 }}>
                    {t.freeF.map((x) => <div key={x} style={{ display: "flex", gap: 8, alignItems: "center" }}><ShieldCheck size={14} color={C.faint} /> {x}</div>)}
                  </div>
                  <div style={{ marginTop: 18, textAlign: "center", fontSize: 12.5, color: C.faint, border: `1px solid ${C.line}`, borderRadius: 11, padding: "11px" }}>{t.tierFreeActive}</div>
                </div>
                <div style={{ flex: "1 1 240px", maxWidth: 320, border: `1px solid rgba(198,163,90,0.5)`, borderRadius: 18, padding: "22px 20px", background: "linear-gradient(180deg, rgba(198,163,90,0.12), rgba(16,17,23,0.7))", display: "flex", flexDirection: "column", boxShadow: "0 0 50px rgba(198,163,90,0.12)", position: "relative" }}>
                  <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(140deg, ${C.goldHi}, ${C.gold})`, color: "#1A1408", fontSize: 10.5, fontWeight: 700, letterSpacing: ".08em", padding: "3px 12px", borderRadius: 99, textTransform: "uppercase" }}>{t.recommended}</div>
                  <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: C.gold }}>{t.tierPremium}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "8px 0 2px" }}><span style={{ fontSize: 34, fontWeight: 700, color: C.snow }}>$49</span><span style={{ fontSize: 13, color: C.mist }}>{t.perMonth}</span></div>
                  <div style={{ fontSize: 12.5, color: C.mist, marginBottom: 4 }}>{t.premiumAlt}</div>
                  <div style={{ fontSize: 12.5, color: C.goldHi, fontWeight: 600, marginBottom: 16 }}>{t.promoNote}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 13, color: "#E6E5DE", flex: 1 }}>
                    {t.premF.map((x) => <div key={x} style={{ display: "flex", gap: 8, alignItems: "center" }}><Sparkles size={14} color={C.gold} /> {x}</div>)}
                  </div>
                  <button onClick={() => requestPaidAccess("https://buy.stripe.com/28E7sM6tncD23NIadk6Vq00")} className="mt-cta" style={{ marginTop: 18, cursor: "pointer", border: "none", borderRadius: 12, padding: "13px", fontSize: 14.5, fontWeight: 700, color: "#1A1408", background: `linear-gradient(140deg, ${C.goldHi}, ${C.gold})` }}>{t.btnSub}</button>
                  <button onClick={openLead} style={{ marginTop: 9, cursor: "pointer", border: `1px solid ${C.gold}`, borderRadius: 12, padding: "12px", fontSize: 13.5, fontWeight: 600, color: C.goldHi, background: "transparent" }}>{t.btnOnce}</button>
                </div>
                <div style={{ flex: "1 1 220px", maxWidth: 300, border: `1px solid ${C.line}`, borderRadius: 18, padding: "22px 20px", background: C.panel, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: C.faint }}>{t.tierPrivate}</div>
                  <div style={{ fontSize: 30, fontWeight: 700, color: C.snow, margin: "8px 0 2px" }}>{t.privatePrice}</div>
                  <div style={{ fontSize: 12.5, color: C.mist, marginBottom: 16 }}>{t.privateNote}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 13, color: "#CFCFC8", flex: 1 }}>
                    {t.privF.map((x) => <div key={x} style={{ display: "flex", gap: 8, alignItems: "center" }}><Crown size={14} color={C.gold} /> {x}</div>)}
                  </div>
                  <button onClick={openLead} style={{ marginTop: 18, cursor: "pointer", border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px", fontSize: 13.5, fontWeight: 600, color: C.snow, background: "rgba(255,255,255,0.03)" }}>{t.requestAccess}</button>
                </div>
              </div>
              <div style={{ textAlign: "center", marginTop: 22, fontSize: 12, color: C.faint, lineHeight: 1.6 }}>{t.pwReassure}</div>

              <div style={{ maxWidth: 420, margin: "26px auto 0", textAlign: "center" }}>
                <div style={{ fontSize: 12, color: C.mist, marginBottom: 10 }}>Already subscribed? Enter your email to unlock access.</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="email" name="email" autoComplete="email" value={accessInput}
                    onChange={(e) => setAccessInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") checkAccess(accessInput); }}
                    placeholder="name@email.com"
                    style={{ flex: 1, background: C.card, border: `1px solid ${C.line}`, borderRadius: 11, padding: "12px 14px", fontSize: 13.5, color: C.snow, fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box" }}
                  />
                  <button onClick={() => checkAccess(accessInput)} disabled={accessChecking || !accessInput.trim()} style={{ cursor: accessChecking ? "default" : "pointer", border: `1px solid ${C.gold}`, background: "transparent", color: C.goldHi, borderRadius: 11, padding: "0 18px", fontSize: 13.5, fontWeight: 600, opacity: accessChecking ? 0.6 : 1 }}>
                    {accessChecking ? "Checking…" : "Unlock"}
                  </button>
                </div>
                {accessErr && <div style={{ fontSize: 12, color: "#E08A8A", marginTop: 8 }}>{accessErr}</div>}
                {accessNote && <div role="status" style={{ fontSize: 12, color: C.goldHi, marginTop: 8, lineHeight: 1.5 }}>{accessNote}</div>}
              </div>
            </div>
          )}

          {/* ---------- CONCIERGE ---------- */}
          {isConcierge && !locked && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "8px 0 0", minHeight: 0 }}>
              <div style={{ padding: "0 22px 14px", borderBottom: `1px solid ${C.line}` }}>
                <label style={{display:"block",fontSize:12,color:C.mist,lineHeight:1.5,marginBottom:12}}><input type="checkbox" checked={conciergeConsent} onChange={e=>setConciergeConsent(e.target.checked)} /> I agree to reuse my profile in Montaureo Concierge. <a href="/privacy-policy.html" style={{color:C.goldHi}}>Privacy Policy</a></label>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: C.gold }}>{domTitle}</div>
                    <div style={{ fontSize: 13, color: C.mist, marginTop: 4, maxWidth: 460 }}>{domSub}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", border: `1px solid ${C.line}`, borderRadius: 99, overflow: "hidden" }}>
                      {PERSONAS.map((p) => { const on = persona === p; return (
                        <button key={p} onClick={() => { setPersona(p); trackPersonaSelect(p); }} style={{ cursor: "pointer", border: "none", padding: "7px 16px", fontSize: 13, fontWeight: 600, color: on ? "#1A1408" : C.mist, background: on ? `linear-gradient(140deg, ${C.goldHi}, ${C.gold})` : "transparent" }}>{p}</button>
                      ); })}
                    </div>
                    <button onClick={startNewChat} style={{ cursor: "pointer", border: `1px solid ${C.line}`, background: "transparent", color: C.mist, borderRadius: 99, padding: "7px 14px", fontSize: 12.5, whiteSpace: "nowrap" }}>{t.newChat}</button>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
                  {[["concierge", Sparkles], ["banking", Landmark], ["realestate", Building2], ["legal", Scale], ["lifestyle", Heart], ["events", Calendar], ["credit", CreditCard]].map(([key, Icon]) => {
                    const on = section === key;
                    return (
                      <button key={key} onClick={() => switchSection(key)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6, border: `1px solid ${on ? C.gold : C.line}`, background: on ? "rgba(198,163,90,0.14)" : "transparent", color: on ? C.snow : C.mist, padding: "7px 13px", borderRadius: 99, fontSize: 12.5, fontWeight: on ? 600 : 400 }}>
                        <Icon size={13} color={on ? C.gold : C.mist} /> {t.nav[key]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
                {focus === "Banking" && (
                  <div className="mt-up" style={{ alignSelf: "flex-start", maxWidth: 560, width: "100%", border: `1px solid rgba(198,163,90,0.35)`, borderRadius: 16, padding: "16px 18px", background: "linear-gradient(180deg, rgba(198,163,90,0.08), rgba(16,17,23,0.5))" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: C.goldHi, marginBottom: 4 }}>{t.partnerBankingTitle}</div>
                    <div style={{ fontSize: 12.5, color: C.mist, lineHeight: 1.5, marginBottom: 12 }}>{t.partnerBankingDesc}</div>
                    <a href="https://monaco-finance.com" target="_blank" rel="noopener noreferrer" onClick={() => trackOutbound("monaco-finance.com")} style={{ display: "inline-flex", alignItems: "center", gap: 7, textDecoration: "none", border: `1px solid ${C.gold}`, borderRadius: 99, padding: "9px 16px", fontSize: 12.5, fontWeight: 600, color: C.goldHi }}>
                      {t.partnerBankingCta} <ArrowRight size={13} strokeWidth={2.4} />
                    </a>
                  </div>
                )}
                {chat.length === 0 && (
                  <div className="mt-up" style={{ alignSelf: "flex-start", maxWidth: 560 }}>
                    <div style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.gold, marginBottom: 6 }}>{persona}</div>
                    <div style={{ border: `1px solid ${C.line}`, borderRadius: "4px 16px 16px 16px", padding: "13px 16px", background: `linear-gradient(180deg, ${C.panelHi}, ${C.panel})`, fontSize: 14.5, lineHeight: 1.55, color: "#E6E5DE" }}>
                      {t.cWelcomeA} ({v(form.capital)}, {v(form.from)}{futureResult?.move?.country ? `, ${t.cMoveInterest} ${futureResult.move.country}` : ""}) {t.cWelcomeB}
                    </div>
                  </div>
                )}
                {chat.map((m, i) => (
                  <div key={i} className="mt-up" style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: m.role === "user" ? "78%" : 600 }}>
                    {m.role === "assistant" && <div style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.gold, marginBottom: 6 }}>{persona}{m.agent && m.agent !== "Velvet" ? ` · ${m.agent}` : ""}</div>}
                    <div style={{ border: `1px solid ${m.role === "user" ? "rgba(198,163,90,0.3)" : C.line}`, borderRadius: m.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", padding: "13px 16px", background: m.role === "user" ? "rgba(198,163,90,0.12)" : `linear-gradient(180deg, ${C.panelHi}, ${C.panel})`, fontSize: 14.5, lineHeight: 1.55, color: m.role === "user" ? C.snow : "#E6E5DE", whiteSpace: "pre-wrap" }}>{m.content}</div>
                    {m.card && <ChatCard card={m.card} />}
                  </div>
                ))}
                {chatBusy && (<div style={{ alignSelf: "flex-start", display: "flex", gap: 5, padding: "8px 4px" }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 6, height: 6, borderRadius: 99, background: C.gold, animation: `dot 1.2s ease-in-out ${i * 0.18}s infinite` }} />)}</div>)}
                <div ref={endRef} />
              </div>

              <div style={{ borderTop: `1px solid ${C.line}`, padding: "12px 22px 18px", background: C.void }}>
                {chat.length < 2 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                    {(t.suggest[focus] || t.suggest.null).map((s) => <button key={s} onClick={() => sendChat(s)} style={{ cursor: "pointer", border: `1px solid ${C.line}`, background: "transparent", color: C.mist, padding: "8px 13px", borderRadius: 99, fontSize: 12.5 }}>{s}</button>)}
                  </div>
                )}
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }} placeholder={`${t.askPlaceholder} ${persona}…`} style={{ flex: 1, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 13, padding: "13px 16px", fontSize: 14.5, color: C.snow, fontFamily: "Inter, sans-serif", outline: "none" }} />
                  <button onClick={() => sendChat()} disabled={chatBusy || !chatInput.trim()} style={{ cursor: chatBusy || !chatInput.trim() ? "default" : "pointer", border: "none", borderRadius: 13, width: 48, height: 48, display: "grid", placeItems: "center", flexShrink: 0, color: "#1A1408", background: chatInput.trim() ? `linear-gradient(140deg, ${C.goldHi}, ${C.gold})` : "rgba(198,163,90,0.25)" }}><Send size={18} strokeWidth={2.2} /></button>
                </div>
                <div style={{ fontSize: 10.5, color: C.faint, marginTop: 9, textAlign: "center" }}>{t.cFooter}</div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===== LEAD MODAL — Private Consultation ===== */}
      {leadOpen && (
        <div
          onClick={() => setLeadOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(5,5,7,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18, backdropFilter: "blur(3px)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-up"
            style={{ width: "100%", maxWidth: 440, maxHeight: "88vh", overflowY: "auto", borderRadius: 20, border: `1px solid rgba(198,163,90,0.35)`, background: `linear-gradient(180deg, ${C.panelHi}, ${C.panel})`, padding: "26px 24px", boxShadow: "0 30px 90px rgba(0,0,0,0.6)" }}
          >
            {!leadSent ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                  <Crown size={18} color={C.gold} />
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: C.snow }}>{t.leadTitle}</div>
                </div>
                <div style={{ fontSize: 12.5, color: C.mist, marginBottom: 18, lineHeight: 1.5 }}>{t.leadSub}</div>

                <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                  <div>
                    <div style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.gold, marginBottom: 6 }}>{t.leadName}</div>
                    <input value={lead.name} onChange={(e) => setLead((l) => ({ ...l, name: e.target.value }))} placeholder={t.leadNamePh} style={{ width: "100%", background: C.card, border: `1px solid ${C.line}`, borderRadius: 11, padding: "11px 13px", fontSize: 14, color: C.snow, fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.gold, marginBottom: 6 }}>{t.leadEmail}</div>
                    <input type="email" value={lead.email} onChange={(e) => setLead((l) => ({ ...l, email: e.target.value }))} placeholder={t.leadEmailPh} style={{ width: "100%", background: C.card, border: `1px solid ${C.line}`, borderRadius: 11, padding: "11px 13px", fontSize: 14, color: C.snow, fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.gold, marginBottom: 6 }}>{t.leadPhone}</div>
                    <input value={lead.phone} onChange={(e) => setLead((l) => ({ ...l, phone: e.target.value }))} placeholder={t.leadPhonePh} style={{ width: "100%", background: C.card, border: `1px solid ${C.line}`, borderRadius: 11, padding: "11px 13px", fontSize: 14, color: C.snow, fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box" }} />
                  </div>

                  <div>
                    <div style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.gold, marginBottom: 6 }}>{t.leadGoal}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {t.leadGoals.map((g) => { const on = lead.goal === g; return (
                        <button key={g} onClick={() => setLead((l) => ({ ...l, goal: g }))} style={{ cursor: "pointer", border: `1px solid ${on ? C.gold : C.line}`, background: on ? "rgba(198,163,90,0.14)" : "transparent", color: on ? C.snow : C.mist, padding: "7px 12px", borderRadius: 99, fontSize: 12.5 }}>{g}</button>
                      ); })}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.gold, marginBottom: 6 }}>{t.leadTime}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {t.leadTimeOpts.map((tm) => { const on = lead.time === tm; return (
                        <button key={tm} onClick={() => setLead((l) => ({ ...l, time: tm }))} style={{ cursor: "pointer", border: `1px solid ${on ? C.gold : C.line}`, background: on ? "rgba(198,163,90,0.14)" : "transparent", color: on ? C.snow : C.mist, padding: "7px 12px", borderRadius: 99, fontSize: 12.5 }}>{tm}</button>
                      ); })}
                    </div>
                  </div>

                  <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={lead.consent}
                      onChange={(e) => setLead((l) => ({ ...l, consent: e.target.checked }))}
                      style={{ marginTop: 3, width: 16, height: 16, accentColor: C.gold, flexShrink: 0, cursor: "pointer" }}
                    />
                    <span style={{ fontSize: 12, color: C.mist, lineHeight: 1.45 }}>{t.leadConsentLabel}</span>
                  </label>

                  {leadErr && <div style={{ fontSize: 12, color: "#E08A8A" }}>{leadErr}</div>}

                  <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                    <button onClick={() => setLeadOpen(false)} style={{ cursor: "pointer", border: `1px solid ${C.line}`, background: "transparent", color: C.mist, borderRadius: 12, padding: "13px 16px", fontSize: 13.5 }}>{t.leadCancel}</button>
                    <div style={{ flex: 1 }}>
                      <button onClick={submitLead} disabled={leadSending} className="mt-cta" style={{ width: "100%", cursor: leadSending ? "default" : "pointer", border: "none", borderRadius: 12, padding: "13px", fontSize: 14, fontWeight: 700, color: "#1A1408", background: `linear-gradient(140deg, ${C.goldHi}, ${C.gold})`, opacity: leadSending ? 0.7 : 1 }}>
                        {leadSending ? t.leadSending : t.leadSubmit}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "10px 4px" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(127,176,130,0.14)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
                  <ShieldCheck size={24} color={C.green} />
                </div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, color: C.snow, marginBottom: 6 }}>{t.leadConfirmTitle}</div>
                <div style={{ fontSize: 13.5, color: C.mist, lineHeight: 1.5, marginBottom: 22 }}>{t.leadConfirmBody}</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setLeadOpen(false)} style={{ flex: 1, cursor: "pointer", border: `1px solid ${C.line}`, background: "transparent", color: C.mist, borderRadius: 12, padding: "13px", fontSize: 13.5 }}>{t.leadClose}</button>
                  <button onClick={closeLeadAndEnterConcierge} className="mt-cta" style={{ flex: 1, cursor: "pointer", border: "none", borderRadius: 12, padding: "13px", fontSize: 13.5, fontWeight: 700, color: "#1A1408", background: `linear-gradient(140deg, ${C.goldHi}, ${C.gold})` }}>{t.leadContinue}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


