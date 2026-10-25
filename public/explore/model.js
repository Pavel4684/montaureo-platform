// Shared illustrative model. Money inputs/outputs are in EUR millions. Not a tax return engine.
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
  Other:       { name: "Current country", sal: 0.45, biz: 0.45, div: 0.30, port: 0.30, label: "Unknown country: illustrative 45% income / 30% portfolio benchmark, not a local rate" },
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

const M = (x) => Math.abs(x) < 0.0005 ? "€0" : `€${(Math.round(x * 10) / 10).toFixed(1)}M`;
const K = (x) => Math.abs(x) < 0.0005 ? "€0" : (Math.abs(x) >= 1 ? M(x) : `€${Math.round(x * 1000)}K`);

// inputs: { liquid, income, src, citizen, from }
function computeScenarios(inputs, amounts = {}) {
  const start = amounts.start ?? LIQUID_MID[inputs.liquid] ?? 6;
  const income = amounts.income ?? INCOME_MID[inputs.income] ?? 0.75;
  if (!Number.isFinite(start) || !Number.isFinite(income) || start < 0 || start > 1000 || income < 0 || income > 100) throw new Error("invalid_amounts");
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
  return `Liquid portfolio only; total wealth and illiquid property are excluded. Start ${M(base.start)} liquid (midpoint of ${LIQUID_LABEL[inputs.liquid] || "your band"}) · income ${K(base.income)}/yr from ${src}, earned outside the portfolio · portfolio return 6%/yr (2.5% income + 3.5% growth), reinvested · spending ${K(base.spend)}/yr · ${START_YEAR}–${START_YEAR + YEARS} · portfolio not sold · simplified effective tax rates; exit taxes and wealth/inheritance taxes not included${inputs.citizen === "zNA" ? " · US citizens stay taxed by the US wherever they live" : ""}`;
}



export { LIQUID_MID, INCOME_MID, SRC, FROM_KEY, YEARS, YIELD, GROWTH, destKey, M, K, computeScenarios, assumptionsLine };
