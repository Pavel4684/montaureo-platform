// =====================================================================
// api/stripe-webhook.js — Vercel Serverless Function (Montaureo · Stripe Webhook)
// Replaces Supabase auth entirely. This is the ONLY place that grants access:
// a paying client's email is written to Redis with an expiry date; the site
// checks that record via api/check-access.js. No password, no account.
//
// Setup checklist (do this in order):
// 1. npm i stripe   (in the project, so this function can import it)
// 2. Vercel → Settings → Environment Variables, add:
//      STRIPE_SECRET_KEY       (from Stripe Dashboard → Developers → API keys)
//      STRIPE_WEBHOOK_SECRET   (created in step 3 below, starts with whsec_...)
// 3. Stripe Dashboard → Developers → Webhooks → Add endpoint
//      URL:    https://montaureo.com/api/stripe-webhook
//      Events: checkout.session.completed
//              customer.subscription.updated
//              customer.subscription.deleted
//    Stripe shows the signing secret once the endpoint is created — that's STRIPE_WEBHOOK_SECRET.
// 4. Redeploy so the new env vars are picked up.
//
// KV: same Upstash Redis instance already used elsewhere in the project.
// =====================================================================

import Stripe from "stripe";
import { Redis } from "@upstash/redis";

export const config = {
  api: { bodyParser: false }, // Stripe requires the raw request body to verify the signature
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const redis = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
    })
  : null;

const accessKey = (email) => `access:${email.trim().toLowerCase()}`;
const customerKey = (customerId) => `cust:${customerId}`;

const ONE_TIME_PLAN_YEARS = 10; // the $299 one-time relocation plan — effectively permanent access
const FALLBACK_SUB_DAYS = 31;   // used only if we can't read the subscription's real period end

async function grantAccess(email, plan, expiresAt) {
  if (!redis || !email) return;
  await redis.set(accessKey(email), { plan, expiresAt });
}

async function revokeAccess(email) {
  if (!redis || !email) return;
  await redis.del(accessKey(email));
}

async function rememberCustomer(customerId, email) {
  if (!redis || !customerId || !email) return;
  await redis.set(customerKey(customerId), email.trim().toLowerCase());
}

async function lookupEmailForCustomer(customerId) {
  if (!redis || !customerId) return null;
  return await redis.get(customerKey(customerId));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  if (!stripe) return res.status(500).json({ error: "stripe_not_configured" });

  let event;
  try {
    const rawBody = await readRawBody(req);
    const signature = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe signature verification failed:", err.message);
    return res.status(400).json({ error: "invalid_signature" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const email = (session.customer_details?.email || session.customer_email || "").trim();
        if (!email) break;

        if (session.customer) await rememberCustomer(session.customer, email);

        if (session.mode === "payment") {
          // The $299 one-time relocation plan — grant long-lived access.
          const expiresAt = Date.now() + ONE_TIME_PLAN_YEARS * 365 * 24 * 60 * 60 * 1000;
          await grantAccess(email, "premium", expiresAt);
        } else if (session.mode === "subscription") {
          // Try to read the real renewal date from the subscription; fall back to +31 days.
          let expiresAt = Date.now() + FALLBACK_SUB_DAYS * 24 * 60 * 60 * 1000;
          try {
            if (session.subscription) {
              const sub = await stripe.subscriptions.retrieve(session.subscription);
              if (sub?.current_period_end) expiresAt = sub.current_period_end * 1000;
            }
          } catch (e) { console.warn("Could not read subscription period end, using fallback", e.message); }
          await grantAccess(email, "premium", expiresAt);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const email = await lookupEmailForCustomer(sub.customer);
        if (!email) break;
        if (sub.status === "active" || sub.status === "trialing") {
          const expiresAt = sub.current_period_end ? sub.current_period_end * 1000 : Date.now() + FALLBACK_SUB_DAYS * 24 * 60 * 60 * 1000;
          await grantAccess(email, "premium", expiresAt);
        } else {
          // past_due, unpaid, incomplete_expired, canceled, etc. — close access.
          await revokeAccess(email);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const email = await lookupEmailForCustomer(sub.customer);
        if (email) await revokeAccess(email);
        break;
      }

      default:
        // Ignore everything else.
        break;
    }
    return res.status(200).json({ received: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server_error" });
  }
}
