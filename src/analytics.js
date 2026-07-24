// ============================================================
// Montaureo — GA4 custom events
// File: src/analytics.js
// Safe if gtag is blocked (ad-blockers) — never breaks the UI.
// ============================================================

function track(eventName, params = {}) {
  try {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
    } else {
      window.dataLayer.push({ event: eventName, ...params });
    }
  } catch (e) {
    console.warn("analytics:", e);
  }
}

// ---------- Top of funnel ----------

// Any primary CTA click ("start_free", "show_my_path", ...)
export function trackCtaClick(ctaName) {
  track("cta_click", { cta_name: ctaName });
}

// User launched Two Futures generation
export function trackFutureRun() {
  track("future_run");
}

// Two Futures result rendered (which MOVE country the AI proposed)
export function trackFutureResult(moveCountry) {
  track("future_result", { move_country: moveCountry || "unknown" });
}

// Navigation between domains (banking / legal / realestate / ...)
export function trackSectionView(section) {
  track("section_view", { section });
}

// ---------- Concierge engagement ----------

export function trackPersonaSelect(persona) {
  track("persona_select", { persona });
}

// First message in the whole browser session — strongest engagement signal
let firstMessageSent = false;
export function trackFirstMessage(persona) {
  if (firstMessageSent) return;
  firstMessageSent = true;
  track("first_message", { persona });
}

export function trackMessageSent(persona) {
  track("message_sent", { persona });
}

// ---------- Monetization ----------

// Subscribe click → redirect to Stripe. Mark as Key event in GA4.
export function trackBeginCheckout() {
  track("begin_checkout", {
    currency: "USD",
    value: 49,
    items: [{ item_name: "Montaureo Premium", price: 49 }],
  });
}

// Returned from Stripe with a confirmed session — actual purchase. Key event.
export function trackPurchase(plan) {
  track("purchase", {
    currency: "USD",
    value: 49,
    transaction_id: `mt_${Date.now()}`,
    items: [{ item_name: `Montaureo ${plan || "premium"}`, price: 49 }],
  });
}

// Existing subscriber unlocked access by email
export function trackLoginSuccess() {
  track("login_success");
}

// ---------- Lead funnel (Private Consultation) ----------

export function trackLeadOpen() {
  track("lead_open");
}

// Lead form submitted successfully — GA4 recommended event name. Key event.
export function trackGenerateLead(goal) {
  track("generate_lead", { lead_goal: goal || "unspecified" });
}

// ---------- Outbound ----------

export function trackOutbound(destination) {
  track("outbound_click", { destination });
}
