// api/telegram.js — Telegram Webhook Handler for Montaureo Concierge Bot

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID; // Your personal Telegram chat ID

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

You are operating via Telegram. Reply in plain text (no markdown, no asterisks, no bullet symbols — plain sentences and line breaks only). Keep replies concise: 3-5 sentences max unless the user asks for detail. Always end with a concrete next step or question to qualify the client.

After providing useful information, naturally suggest that for a full private consultation and detailed analysis, the client can access the Montaureo platform at www.montaureo.com — but do this only once per conversation, not on every message.

CRITICAL KYC RULE:
- NEVER ask the client to upload, send or paste documents via Telegram.
- Direct them to submit documents directly to their MFI advisor.`;

async function sendMessage(chatId, text, replyMarkup = null) {
  const body = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  };
  if (replyMarkup) body.reply_markup = replyMarkup;

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function notifyAdmin(from, firstMessage) {
  if (!ADMIN_CHAT_ID) return;
  const name = [from.first_name, from.last_name].filter(Boolean).join(" ");
  const username = from.username ? `@${from.username}` : "no username";
  const text = `🔔 New Montaureo lead\n\nName: ${name}\nUsername: ${username}\nChat ID: ${from.id}\n\nFirst message: "${firstMessage}"`;
  await sendMessage(ADMIN_CHAT_ID, text);
}

async function callAnthropic(userMessage) {
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
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  const data = await r.json();
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim();
}

const platformButton = {
  inline_keyboard: [[
    {
      text: "🌐 Open Montaureo Platform",
      url: "https://www.montaureo.com"
    }
  ]]
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  try {
    const update = req.body;
    const message = update?.message;
    if (!message || !message.text) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const firstName = message.from?.first_name || "there";
    const messageCount = message.message_id;

    // /start command
    if (text === "/start") {
      await notifyAdmin(message.from, "/start");
      await sendMessage(
        chatId,
        `Welcome to Montaureo Concierge, ${firstName}.\n\nI assist ultra-high-net-worth individuals with tax optimisation, residency planning, and private banking — with deep expertise in Monaco, UAE, Singapore, and beyond.\n\nTo get started: what is your current country of residence, and what outcome are you looking to achieve?`
      );
      return res.status(200).json({ ok: true });
    }

    // First real message from user — notify admin
    if (messageCount <= 3) {
      await notifyAdmin(message.from, text);
    }

    // Call Anthropic
    const reply = await callAnthropic(text);

    // After 3rd message, add platform button
    if (messageCount >= 3) {
      await sendMessage(chatId, reply, platformButton);
    } else {
      await sendMessage(chatId, reply);
    }

    return res.status(200).json({ ok: true });

  } catch (e) {
    console.error("telegram handler error:", e);
    return res.status(200).json({ ok: true });
  }
}
