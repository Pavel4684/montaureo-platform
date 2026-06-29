import React, { useState, useId } from "react";
import { ArrowRight, RotateCcw, Sparkles, MapPin, ShieldCheck, Mountain, Users, Mail, Lock, Plane } from "lucide-react";

/* =====================================================================
   MONTAUREO — единое приложение
   Landing (вход) → Анкета «Кто вы / Что важно» → Two Futures (живой ИИ)
   ---------------------------------------------------------------------
   • Единый роутинг через state (screen): landing | profile | loading | result | error
   • Единая дизайн-система (палитра C, SummitMark, Playfair, глобус)
   • Один главный CTA (золотая кнопка Btn)
   • Ответы анкеты живут в state. В превью — in-memory.
     В реальной сборке на Vercel персистентность подключается через localStorage
     (см. пометку PERSIST ниже) — здесь не вызывается, т.к. в превью storage недоступен.
   • Вызов модели: сначала серверная /api/chat (ключ только в env на Vercel),
     при отсутствии бэкенда (превью) — фолбэк на прямой вызов, чтобы видеть живой результат.
   ===================================================================== */

/* ===================== BRAND ===================== */
const C = {
  void: "#070708", panel: "#0E0F14", panelHi: "#14151C", card: "#101117",
  line: "rgba(198,163,90,0.16)", gold: "#C6A35A", goldHi: "#F2DCA0", goldDk: "#8A6B2E",
  mist: "#8A8A92", faint: "#5A5A63", snow: "#F1EFE8",
};

/* ===================== KNOWLEDGE (RAG stand-in) — current 2026 ===================== */
const KB = `
0% подоходного: ОАЭ, Катар, Монако (резиденты кроме граждан Франции), Бахрейн, Багамы, Каймановы.
Территориальный: Сингапур, Гонконг, Панама, Грузия.
Lump-sum: Италия €300,000/год с 2026 (15 лет); Швейцария forfait; Греция €100,000/год.
Низкий %: Андорра ~10%, Болгария 10%, Кипр non-dom.
Закрыто: Великобритания non-dom отменён (2025); Португалия NHR закрыт.
Высокий налог (откуда уезжают): Франция, Германия, UK, Канада, Скандинавия.
`;

const SYSTEM = `Ты — Montaureo, цифровой архитектор жизни для состоятельных международных семей. Ты помогаешь принять ЖИЗНЕННОЕ РЕШЕНИЕ, а не найти страну.
Знания (актуально 2026):${KB}

Клиент думает не «куда переехать», а «что я потеряю, если останусь». Поэтому построй ДВА БУДУЩИХ к 2036 году:
- STAY — клиент остаётся в текущей стране;
- MOVE — клиент переезжает в ОДНУ лучшую под его профиль страну.
Сравни их и покажи разницу. Тон тёплый, личный, но честный.

Сначала — кинематографичная сцена будущего MOVE: НЕ страна первой, а МОМЕНТ ЖИЗНИ (утро, дети, школа, аэропорт, сохранённый капитал против сценария STAY, погода). 4-6 коротких предложений от второго лица. Страна раскрывается в отдельном поле, не в тексте.
Future Confidence — целое число 0-100: насколько сценарий MOVE соответствует ПРИОРИТЕТАМ клиента (а не «оценка страны»).

Все суммы — иллюстративная оценка при допущениях, не приговор стране и не консультация.

Верни ТОЛЬКО чистый JSON, без markdown:
{"scene":{"month":"Апрель 2036","lines":["Вы …","Ваш сын …","До аэропорта …","Ваш капитал сохранил дополнительно … по сравнению с альтернативой.","Сегодня …°C."],"country":"страна MOVE"},
 "confidence":94,
 "stay":{"country":"текущая страна","tax":"кратко","capital2036":"€X.XM","school":"кратко","climate":"кратко"},
 "move":{"country":"страна MOVE","tax":"кратко","capital2036":"€X.XM","school":"кратко","climate":"кратко"},
 "difference":["€X.XM сохранено","часы/год сэкономлено","ниже налоговая экспозиция","безопаснее"],
 "assumptions":"1 строка допущений",
 "disclaimer":"1 строка: иллюстративно, не консультация, подтвердите у советника"}
Язык — русский. Значения короткие.`;

/* ===================== AI CALL ===================== */
/* Прод: POST /api/chat → серверная функция, ключ только в env (см. api/chat.js).
   Превью: /api/chat отсутствует → фолбэк на прямой вызов, чтобы видеть живой результат. */
async function designFuture(profile) {
  // 1) серверный путь (прод)
  try {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile }),
    });
    if (r.ok) {
      const data = await r.json();
      if (data && data.move) return data;            // уже распарсенный результат с сервера
      if (data && data.scene) return data;
    }
    throw new Error("no-backend");
  } catch {
    // 2) фолбэк: прямой вызов (работает в превью claude.ai; в проде этот путь не используется)
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system: SYSTEM,
        messages: [{ role: "user", content: profile }],
      }),
    });
    if (!res.ok) throw new Error("api");
    const data = await res.json();
    const raw = data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  }
}

/* ===================== SUMMIT MARK ===================== */
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
  <span style={{ fontSize: size, letterSpacing: "0.30em", fontWeight: 300, paddingLeft: "0.30em" }}>
    <span style={{ color: C.snow }}>MONT</span><span style={{ background: `linear-gradient(180deg, ${C.goldHi}, ${C.gold})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>AUREO</span>
  </span>
);

/* ===================== ROTATING GLOBE (signature) ===================== */
function SpinningGlobe() {
  const parallels = [-64, -32, 0, 32, 64];
  const meridians = [-72, -48, -24, 0, 24, 48, 72];
  return (
    <div style={{ position: "relative", width: "min(82%, 460px)", aspectRatio: "1" }}>
      <div style={{ position: "absolute", inset: "-7%", borderRadius: "50%", background: "radial-gradient(circle at 60% 42%, rgba(231,184,106,0.24), transparent 60%)", filter: "blur(10px)" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", background: "radial-gradient(circle at 36% 30%, #16202d 0%, #0b1019 48%, #06080d 80%)", boxShadow: "inset -36px -30px 90px rgba(0,0,0,0.9), 0 0 150px rgba(198,163,90,0.14)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 12px 18px, rgba(240,196,116,0.9) 0.6px, transparent 1.6px), radial-gradient(circle at 40px 44px, rgba(240,196,116,0.7) 0.6px, transparent 1.6px), radial-gradient(circle at 64px 12px, rgba(240,196,116,0.55) 0.6px, transparent 1.6px), radial-gradient(circle at 30px 70px, rgba(240,196,116,0.65) 0.6px, transparent 1.6px)", backgroundSize: "80px 80px", animation: "globe-surface 7s linear infinite", opacity: 0.9 }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg, rgba(231,184,106,0.10) 0 1px, transparent 1px 80px)", backgroundSize: "80px 100%", animation: "globe-surface 7s linear infinite", opacity: 0.6 }} />
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
      <svg viewBox="0 0 200 200" style={{ position: "absolute", inset: "-4%", width: "108%", height: "108%", pointerEvents: "none" }}>
        <ellipse cx="100" cy="100" rx="118" ry="44" fill="none" stroke="rgba(231,184,106,0.28)" strokeWidth="0.5" transform="rotate(-24 100 100)" />
        <ellipse cx="100" cy="100" rx="122" ry="28" fill="none" stroke="rgba(231,184,106,0.16)" strokeWidth="0.5" transform="rotate(16 100 100)" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <div style={{ filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.7))" }}><SummitMark size={72} /></div>
        <div style={{ fontSize: "min(4vw,26px)", letterSpacing: "0.36em", color: C.snow, paddingLeft: "0.36em", marginTop: 8, textShadow: "0 2px 18px rgba(0,0,0,0.8)" }}>MONTAUREO</div>
        <div style={{ fontSize: 11, letterSpacing: "0.34em", color: C.gold, textTransform: "uppercase", paddingLeft: "0.34em" }}>Design Your Future</div>
      </div>
    </div>
  );
}

function AppleLogo({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" aria-hidden>
      <path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.88 2.65 3.22 2.6 1.29-.05 1.78-.83 3.34-.83 1.56 0 2 .83 3.37.81 1.39-.03 2.27-1.27 3.12-2.53.98-1.45 1.39-2.85 1.41-2.92-.03-.01-2.7-1.04-2.73-4.13M14.54 4.66c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.44" />
    </svg>
  );
}

/* ===================== SHARED UI ===================== */
const Btn = ({ onClick, children, full = true }) => (
  <button onClick={onClick} className="mt-cta" style={{ marginTop: 6, cursor: "pointer", border: "none", borderRadius: 14, padding: "15px", fontSize: 15, fontWeight: 600, color: "#1A1408", background: `linear-gradient(140deg, ${C.goldHi}, ${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: full ? "100%" : "auto" }}>{children}</button>
);

const FutureCol = ({ data, move }) => (
  <div style={{ flex: 1, minWidth: 0, border: `1px solid ${move ? "rgba(198,163,90,0.4)" : C.line}`, borderRadius: 16, overflow: "hidden", background: move ? "linear-gradient(180deg, rgba(198,163,90,0.08), rgba(16,17,23,0.6))" : C.panel }}>
    <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.line}` }}>
      <div style={{ fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", color: move ? C.gold : C.faint }}>{move ? "Move" : "Stay"}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: C.snow, marginTop: 2 }}>{data.country}</div>
    </div>
    {[["Налог", data.tax], ["Капитал 2036*", data.capital2036], ["Школа", data.school], ["Климат", data.climate]].map(([l, v], i) => (
      <div key={i} style={{ padding: "9px 14px", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
        <div style={{ fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: C.faint }}>{l}</div>
        <div style={{ fontSize: 13.5, color: move && l === "Капитал 2036*" ? C.goldHi : C.snow, fontWeight: l === "Капитал 2036*" ? 600 : 400, marginTop: 2 }}>{v || "—"}</div>
      </div>
    ))}
  </div>
);

/* ===================== APP ===================== */
export default function MontaureoApp() {
  const [screen, setScreen] = useState("landing"); // landing | profile | loading | result | error
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ age: "50–60", capital: "€5–15M", income: "€200–500K", family: "Семья с детьми", citizen: "ЕС", from: "Франция" });
  const [matters, setMatters] = useState(["Дети", "Море"]);
  const [result, setResult] = useState(null);

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleM = (m) => setMatters((a) => a.includes(m) ? a.filter((x) => x !== m) : [...a, m]);

  const reset = () => { setScreen("profile"); setStep(1); };

  const run = async () => {
    setScreen("loading");
    /* PERSIST (прод/Vercel): здесь сохраняем ответы анкеты —
       localStorage.setItem("mt_profile", JSON.stringify({ form, matters }));
       В превью storage недоступен, поэтому всё уже держится в React state. */
    const profile = `Профиль: возраст ${form.age}, капитал ${form.capital}, доход ${form.income}/год, ${form.family}, гражданство ${form.citizen}, сейчас живёт в ${form.from}. Важно: ${matters.join(", ") || "жизнь и семья"}. Построй Stay vs Move к 2036.`;
    try { const r = await designFuture(profile); setResult(r); setScreen("result"); }
    catch { setScreen("error"); }
  };

  const Q1 = [
    ["Возраст", "age", ["30–40", "40–50", "50–60", "60+"]],
    ["Капитал", "capital", ["€500K–2M", "€2–5M", "€5–15M", "€15–50M"]],
    ["Доход в год", "income", ["< €200K", "€200–500K", "€500K–1M", "€1M+"]],
    ["Семья", "family", ["Один", "Пара", "Семья с детьми"]],
    ["Гражданство", "citizen", ["ЕС", "UK", "США/Канада", "Другое"]],
    ["Сейчас живёте", "from", ["Франция", "Великобритания", "Германия", "Другая"]],
  ];
  const MATTERS = ["Дети", "Безопасность", "Бизнес", "Море", "Налоги", "Климат"];

  const Chips = ({ label, k, opts }) => (
    <div>
      <div style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: C.gold, marginBottom: 9 }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {opts.map((o) => { const on = form[k] === o; return <button key={o} onClick={() => setF(k, o)} style={{ cursor: "pointer", border: `1px solid ${on ? C.gold : C.line}`, background: on ? "rgba(198,163,90,0.12)" : "transparent", color: on ? C.snow : C.mist, padding: "9px 14px", borderRadius: 99, fontSize: 13, transition: "all .15s" }}>{o}</button>; })}
      </div>
    </div>
  );

  const AuthBtn = ({ icon, children, primary }) => (
    <button onClick={() => setScreen("profile")} className="auth-btn" style={{ cursor: "pointer", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px", borderRadius: 12, fontSize: 14.5, fontWeight: 600, border: primary ? "none" : `1px solid ${C.line}`, color: primary ? "#1A1408" : C.snow, background: primary ? `linear-gradient(140deg, ${C.goldHi}, ${C.gold})` : "rgba(255,255,255,0.03)", position: "relative" }}>
      <span style={{ position: "absolute", left: 16, display: "flex" }}>{icon}</span>{children}
    </button>
  );

  const showReset = screen === "result" || screen === "profile";

  return (
    <div style={{ background: C.void, minHeight: "100%", width: "100%", color: C.snow, fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap&subset=cyrillic,latin');
        @keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:.5}50%{opacity:.95}}
        @keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes line{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes ring{from{stroke-dashoffset:339}to{stroke-dashoffset:var(--off)}}
        @keyframes globe-surface{from{background-position-x:0}to{background-position-x:-80px}}
        @keyframes globe-rot{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .mt-up{animation:up .55s cubic-bezier(.2,.7,.2,1) both}
        .fade{animation:fade .7s cubic-bezier(.2,.7,.2,1) both}
        .mt-cta:hover{filter:brightness(1.1)}
        .auth-btn:hover{filter:brightness(1.06);border-color:rgba(198,163,90,0.4)}
        .link:hover{color:${C.goldHi}!important}
        @media (prefers-reduced-motion:reduce){*{animation:none!important}}
        @media (max-width:860px){ .mt-landing{grid-template-columns:1fr!important; padding-top:80px!important} .mt-globewrap{order:-1!important} }
      `}</style>

      <div style={{ maxWidth: screen === "landing" ? 1180 : 760, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(58% 38% at 50% 12%, rgba(198,163,90,0.10), transparent 70%)" }} />

        {/* HEADER */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", position: "relative", zIndex: 4 }}>
          <button onClick={() => setScreen("landing")} style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: "pointer" }}>
            <SummitMark size={26} /><Wordmark size={13} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12.5, color: C.mist }}>RU ▾</span>
            {showReset && <button onClick={reset} style={{ cursor: "pointer", background: "transparent", border: `1px solid ${C.line}`, borderRadius: 99, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, color: C.mist, fontSize: 12 }}><RotateCcw size={12} /> Заново</button>}
          </div>
        </header>

        {/* ===== LANDING ===== */}
        {screen === "landing" && (
          <main className="mt-landing fade" style={{ flex: 1, display: "grid", gridTemplateColumns: "1.05fr 1fr", alignItems: "center", gap: 30, padding: "10px 30px 40px", position: "relative", zIndex: 1 }}>
            <div className="mt-globewrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <SpinningGlobe />
              <div style={{ alignSelf: "flex-start", marginTop: 26, maxWidth: 420 }}>
                <div style={{ width: 26, height: 1, background: C.gold, marginBottom: 12 }} />
                <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 19, lineHeight: 1.5, color: "#D9D8D2" }}>Будущее не находят. Его проектируют.</div>
                <div style={{ fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: C.gold, marginTop: 12 }}>— Montaureo</div>
              </div>
            </div>

            <div style={{ maxWidth: 440, justifySelf: "center", width: "100%" }}>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: "clamp(36px, 5vw, 58px)", lineHeight: 1.02, margin: 0, color: C.snow }}>
                Спроектируйте<br /><span style={{ background: `linear-gradient(180deg, ${C.goldHi}, ${C.gold})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>своё будущее</span>
              </h1>
              <p style={{ fontSize: 15.5, lineHeight: 1.55, color: C.mist, margin: "18px 0 24px" }}>
                Montaureo — ИИ-платформа для решений, которые меняют жизнь: резидентство, капитал, наследие.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 26 }}>
                {[[ShieldCheck, "Защитить капитал", "Оптимизация вашего финансового будущего"], [Mountain, "Поднять качество жизни", "Доступ к лучшим возможностям мира"], [Users, "Обезопасить семью", "Надёжное и процветающее наследие"]].map(([Icon, h, s]) => (
                  <div key={h} style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                    <Icon size={20} color={C.gold} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div><div style={{ fontSize: 15, fontWeight: 600, color: C.snow }}>{h}</div><div style={{ fontSize: 13, color: C.mist, marginTop: 1 }}>{s}</div></div>
                  </div>
                ))}
              </div>

              <div style={{ border: `1px solid ${C.line}`, borderRadius: 18, padding: 22, background: `linear-gradient(180deg, ${C.panelHi}, ${C.panel})` }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: C.snow, marginBottom: 2 }}>Начните путь</div>
                <div style={{ fontSize: 13, color: C.mist, marginBottom: 18 }}>С ясности. И уверенным шагом.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <AuthBtn primary icon={<Mail size={17} color="#1A1408" />}>Продолжить с Email</AuthBtn>
                  <AuthBtn icon={<span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>G</span>}>Продолжить с Google</AuthBtn>
                  <AuthBtn icon={<AppleLogo />}>Продолжить с Apple</AuthBtn>
                </div>
                <div style={{ textAlign: "center", fontSize: 13, color: C.mist, marginTop: 16 }}>
                  Впервые здесь? <span className="link" onClick={() => setScreen("profile")} style={{ color: C.gold, cursor: "pointer", fontWeight: 500 }}>Создать аккаунт</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 26, marginTop: 18, flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 9, alignItems: "center" }}><Lock size={15} color={C.gold} /><div><div style={{ fontSize: 12.5, color: C.snow }}>Банковская защита</div><div style={{ fontSize: 11, color: C.faint }}>256-битное шифрование</div></div></div>
                <div style={{ display: "flex", gap: 9, alignItems: "center" }}><ShieldCheck size={15} color={C.gold} /><div><div style={{ fontSize: 12.5, color: C.snow }}>Данные приватны</div><div style={{ fontSize: 11, color: C.faint }}>Мы не передаём их третьим лицам</div></div></div>
              </div>
            </div>
          </main>
        )}

        {/* ===== PROFILE · STEP 1 ===== */}
        {screen === "profile" && step === 1 && (
          <main className="mt-up" style={{ flex: 1, padding: "8px 22px 40px", position: "relative", zIndex: 1 }}>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 11, letterSpacing: ".34em", textTransform: "uppercase", color: C.gold }}>Design your future</div>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontWeight: 500, fontSize: "clamp(25px,5.8vw,32px)", color: C.snow, margin: "10px 0 4px" }}>Кто вы?</h1>
              <div style={{ fontSize: 12.5, color: C.mist }}>Шаг 1 из 2</div>
            </div>
            <div style={{ maxWidth: 520, margin: "20px auto 0", display: "flex", flexDirection: "column", gap: 17 }}>
              {Q1.map(([l, k, o]) => <Chips key={k} label={l} k={k} opts={o} />)}
              <Btn onClick={() => setStep(2)}>Далее <ArrowRight size={18} strokeWidth={2.4} /></Btn>
            </div>
          </main>
        )}

        {/* ===== PROFILE · STEP 2 ===== */}
        {screen === "profile" && step === 2 && (
          <main className="mt-up" style={{ flex: 1, padding: "8px 22px 40px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 11, letterSpacing: ".34em", textTransform: "uppercase", color: C.gold }}>Design your future</div>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontWeight: 500, fontSize: "clamp(25px,5.8vw,32px)", color: C.snow, margin: "10px 0 4px" }}>Что вам важно?</h1>
              <div style={{ fontSize: 12.5, color: C.mist }}>Шаг 2 из 2</div>
            </div>
            <div style={{ maxWidth: 460, margin: "22px auto 0", width: "100%" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {MATTERS.map((m) => { const on = matters.includes(m); return (
                  <button key={m} onClick={() => toggleM(m)} style={{ cursor: "pointer", border: `1px solid ${on ? C.gold : C.line}`, background: on ? "rgba(198,163,90,0.12)" : `linear-gradient(180deg, ${C.panelHi}, ${C.panel})`, color: on ? C.snow : C.mist, padding: "16px", borderRadius: 14, fontSize: 14.5, fontWeight: 500, transition: "all .15s" }}>{m}</button>
                ); })}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                <button onClick={() => setStep(1)} style={{ cursor: "pointer", border: `1px solid ${C.line}`, background: "transparent", color: C.mist, borderRadius: 14, padding: "15px 18px", fontSize: 14 }}>Назад</button>
                <div style={{ flex: 1 }}><Btn onClick={run}>Показать два будущих <ArrowRight size={18} strokeWidth={2.4} /></Btn></div>
              </div>
            </div>
          </main>
        )}

        {/* ===== LOADING ===== */}
        {screen === "loading" && (
          <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, position: "relative", zIndex: 1 }}>
            <div style={{ position: "relative", width: 140, height: 140, display: "grid", placeItems: "center" }}>
              <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: "absolute", animation: "spin 2.4s linear infinite" }}><circle cx="70" cy="70" r="60" fill="none" stroke="rgba(198,163,90,.4)" strokeWidth="1" strokeDasharray="2 8" /></svg>
              <div style={{ animation: "pulse 1.5s ease-in-out infinite" }}><SummitMark size={56} /></div>
            </div>
            <div style={{ fontSize: 12.5, letterSpacing: ".2em", textTransform: "uppercase", color: C.gold }}>Montaureo рисует два будущих…</div>
          </main>
        )}

        {/* ===== ERROR ===== */}
        {screen === "error" && (
          <main style={{ flex: 1, display: "grid", placeItems: "center", padding: 22, position: "relative", zIndex: 1 }}>
            <div style={{ textAlign: "center", maxWidth: 320 }}>
              <div style={{ color: C.mist, fontSize: 14, marginBottom: 14 }}>Не удалось построить сценарии. Попробуйте ещё раз.</div>
              <Btn onClick={() => setStep(2) || setScreen("profile")}>Назад к анкете</Btn>
            </div>
          </main>
        )}

        {/* ===== RESULT ===== */}
        {screen === "result" && result && (
          <main style={{ flex: 1, padding: "4px 18px 36px", position: "relative", zIndex: 1 }}>
            {/* THE SCENE FIRST — emotion before geography */}
            {result.scene && (
              <div className="mt-up" style={{ maxWidth: 600, margin: "0 auto", borderRadius: 20, padding: "28px 24px", background: "linear-gradient(165deg, rgba(198,163,90,0.12), rgba(8,8,11,0.4) 55%)", border: `1px solid rgba(198,163,90,0.3)`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 80% 0%, rgba(198,163,90,0.14), transparent 60%)", pointerEvents: "none" }} />
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: 10.5, letterSpacing: ".3em", textTransform: "uppercase", color: C.gold, marginBottom: 16 }}>{result.scene.month}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {(result.scene.lines || []).map((l, i) => (
                      <div key={i} style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, lineHeight: 1.5, color: "#E9E7DF", animation: `line .6s ease ${0.15 + i * 0.2}s both` }}>{l}</div>
                    ))}
                  </div>
                  <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 7, animation: `line .6s ease ${0.2 + (result.scene.lines?.length || 5) * 0.2}s both` }}>
                    <MapPin size={15} color={C.gold} />
                    <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: ".04em", color: C.snow }}>{result.scene.country}</span>
                  </div>
                </div>
              </div>
            )}

            {/* FUTURE CONFIDENCE */}
            {typeof result.confidence === "number" && (
              <div className="mt-up" style={{ maxWidth: 600, margin: "18px auto 0", display: "flex", alignItems: "center", gap: 16, border: `1px solid ${C.line}`, borderRadius: 16, padding: "16px 18px", background: `linear-gradient(180deg, ${C.panelHi}, ${C.panel})` }}>
                <div style={{ position: "relative", width: 58, height: 58, flexShrink: 0 }}>
                  <svg width="58" height="58" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
                    <circle cx="60" cy="60" r="54" fill="none" stroke="url(#fc)" strokeWidth="9" strokeLinecap="round" strokeDasharray="339" style={{ "--off": 339 - 339 * result.confidence / 100, strokeDashoffset: 339 - 339 * result.confidence / 100, transform: "rotate(-90deg)", transformOrigin: "center", animation: "ring 1s ease both" }} />
                    <defs><linearGradient id="fc" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#F2DCA0" /><stop offset="1" stopColor="#C6A35A" /></linearGradient></defs>
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 16, fontWeight: 700, color: C.snow }}>{result.confidence}<span style={{ fontSize: 9, color: C.faint }}>%</span></div>
                </div>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: C.gold }}>Future Confidence</div>
                  <div style={{ fontSize: 12.5, color: C.mist, marginTop: 3, lineHeight: 1.4 }}>Насколько это будущее отвечает вашим приоритетам</div>
                </div>
              </div>
            )}

            {/* TWO FUTURES */}
            <div className="mt-up" style={{ maxWidth: 600, margin: "20px auto 0" }}>
              <div style={{ textAlign: "center", fontSize: 10.5, letterSpacing: ".26em", textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>Two futures · 2036</div>
              <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
                {result.stay && <FutureCol data={result.stay} move={false} />}
                {result.move && <FutureCol data={result.move} move={true} />}
              </div>
            </div>

            {/* DIFFERENCE */}
            {result.difference && (
              <div className="mt-up" style={{ maxWidth: 600, margin: "16px auto 0", border: `1px solid rgba(198,163,90,0.35)`, borderRadius: 16, padding: "16px 18px", background: "linear-gradient(180deg, rgba(198,163,90,0.07), rgba(16,17,23,0.5))" }}>
                <div style={{ fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: C.gold, marginBottom: 10 }}>Difference · если переехать</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.difference.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14, color: i === 0 ? C.goldHi : "#D9D8D2", fontWeight: i === 0 ? 600 : 400 }}>
                      <Sparkles size={13} color={C.gold} style={{ flexShrink: 0 }} /> {d}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* single main CTA */}
            <div style={{ maxWidth: 600, margin: "20px auto 0" }}>
              <Btn onClick={() => alert("MONTAUREO PREMIUM — здесь подключается человек-советник MFI.")}>Показать мой путь <Plane size={17} strokeWidth={2.2} /></Btn>
            </div>

            {/* guardrail */}
            <div style={{ maxWidth: 600, margin: "16px auto 0", fontSize: 10.5, color: C.faint, lineHeight: 1.5, textAlign: "center", padding: "0 10px" }}>
              * Иллюстративная оценка при заданных допущениях{result.assumptions ? ` (${result.assumptions})` : ""}; оба будущих — сценарии, не прогноз по конкретной стране. {result.disclaimer || "Это не финансовая, юридическая или налоговая консультация; подтвердите у советника."}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
