// api/telegram.js — Telegram Webhook Handler for Montaureo Concierge Bot
// Receives updates from Telegram, calls Anthropic API, replies to user.

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const KB = `
0% income tax: UAE, Qatar, Monaco (NOT for French citizens — 1963 treaty), Bahrain, Bahamas, Cayman.
Territorial (foreign income untaxed): Singapore, Hong Kong, Panama, Georgia, Costa Rica.
Lump-sum: Italy €300,000/yr from 2026 (family +€50K, 15 yrs); Switzerland forfait; Greece €100K/yr.
Low/special: Andorra ~10%, Bulgaria 10%, Cyprus non-dom, Malta non-dom.
Closed/narrowed: UK non-dom abolished (2025); Portugal NHR closed (narrower IFICI successor).
High tax (where people leave from): France, Germany, UK, Canada, Scandinavia.
`;

const JLOGIC = `Jurisdiction coverage is OPEN — consider ANY relevant jurisdiction worldwide.
- French nationals: Monaco does NOT remove French income tax (the 1963 France-Monaco treaty).
- Wants to stay in the EU: consider Italy (lump-sum flat tax), Portugal, Greece, Cyprus, Malta, Bulgaria.
- Open to leaving the EU: consider UAE, Qatar, Singapore, Panama, Georgia, Cayman.
MFI has the deepest expertise and relationships in Monaco, UAE, Qatar, Singapore, Luxembourg.`;

const SYSTEM = `You are Velvet Concierge of the Montaureo platform: a private AI concierge for ultra-high-net-worth individuals seeking tax optimisation, residency planning, and private banking in Monaco and globally.
Jurisdiction coverage is open — you advise on any relevant jurisdiction worldwide.
Tone: discreet, precise, numbers first, never pushy.
Knowledge (current 2026): ${KB}
${JLOGIC}

You are operating via Telegram. Reply in plain text (no markdown formatting, no asterisks, no bullet symbols — use plain sentences and line breaks). Keep replies concise: 3-5 sentences max unless the user asks for detail. Always end with a concrete next step or question to qualify the client.

CRITICAL KYC RULE:
- NEVER ask the client to upload, send or paste documents via Telegram.
- Direct them to submit documents directly to their MFI advisor.`;

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });
}

async function callAnthropic(userMessage, history) {
  const messages = [
    ...history,
    { role: "user", content: userMessage },
  ];

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: SYSTEM,
      messages,
    }),
  });

  const data = await r.json();
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  try {
    const update = req.body;

    // Only handle regular messages
    const message = update?.message;
    if (!message || !message.text) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const firstName = message.from?.first_name || "there";

    // /start command
    if (text === "/start") {
      await sendMessage(
        chatId,
        `Welcome to Montaureo Concierge, ${firstName}.\n\nI assist ultra-high-net-worth individuals with tax optimisation, residency planning, and private banking — with deep expertise in Monaco, UAE, Singapore, and beyond.\n\nTo get started: what is your current country of residence, and what outcome are you looking to achieve?`
      );
      return res.status(200).json({ ok: true });
    }

    // All other messages — call Anthropic
    const reply = await callAnthropic(text, []);

    await sendMessage(chatId, reply);
    return res.status(200).json({ ok: true });

  } catch (e) {
    console.error("telegram handler error:", e);
    return res.status(200).json({ ok: true }); // always 200 to Telegram
  }
}
