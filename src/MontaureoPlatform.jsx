import React, { useState, useId, useRef, useEffect } from "react";
import { ArrowRight, RotateCcw, Sparkles, MapPin, ShieldCheck, Mountain, Users, Mail, Lock, Plane, Compass, Landmark, Building2, Heart, Calendar, CreditCard, User, Send, Crown } from "lucide-react";

/* =====================================================================
   MONTAUREO — единая платформа (мультиязычная)
   Landing → Profile/анкета → Two Futures → soft gate → Concierge
   ---------------------------------------------------------------------
   i18n: язык в state (default "en"), словарь T, переключатель EN·FR·RU.
   Варианты анкеты хранятся как языконезависимые КЛЮЧИ (form/matters),
   подписи берутся из T[lang].v[...]. Язык интерфейса прокидывается в модель,
   поэтому Two Futures и консьерж отвечают на выбранном языке.
   (AR + RTL добавляется расширением T и dir="rtl" — заложено на будущее.)
   ===================================================================== */

/* ===================== BRAND ===================== */
const C = {
  void: "#070708", panel: "#0E0F14", panelHi: "#14151C", card: "#101117",
  line: "rgba(198,163,90,0.16)", gold: "#C6A35A", goldHi: "#F2DCA0", goldDk: "#8A6B2E",
  mist: "#8A8A92", faint: "#5A5A63", snow: "#F1EFE8", green: "#7FB082",
};

/* ===================== i18n DICTIONARY ===================== */
const LANGS = ["en", "fr", "ru"];
const LANGNAME = { en: "English", fr: "French", ru: "Russian" };

const T = {
  en: {
    v: { a30: "30–40", a40: "40–50", a50: "50–60", a60: "60+", c1: "€500K–2M", c2: "€2–5M", c3: "€5–15M", c4: "€15–50M", c5: "€50–100M", c6: "€100M+", i1: "< €200K", i2: "€200–500K", i3: "€500K–1M", i4: "€1M+", l1: "< €500K", l2: "€500K–2M", l3: "€2–10M", l4: "€10–50M", l5: "€50M+", fSingle: "Single", fCouple: "Couple", fKids: "Family with children", zEU: "EU", zUK: "UK", zNA: "US/Canada", zOther: "Other", pMC: "Monaco", pCH: "Switzerland", pAE: "UAE", pLU: "Luxembourg", pLI: "Liechtenstein", pAD: "Andorra", pSG: "Singapore", pFR: "France", pUK: "United Kingdom", pDE: "Germany", pOther: "Other", kids: "Children", safety: "Safety", business: "Business", sea: "Sea", taxes: "Taxes", climate: "Climate" },
    f: { age: "Age", capital: "Capital", liquid: "Liquid assets", income: "Income / year", family: "Family", citizen: "Citizenship", from: "Currently living" },
    quote: "The future is not found. It is designed.", h1a: "Design Your", h1b: "Future",
    sub: "Montaureo is an AI platform for life-changing decisions: residency, wealth, legacy.",
    vp: [["Protect Your Wealth", "Optimize your financial future"], ["Elevate Your Life", "Access the world's best opportunities"], ["Secure Your Family", "A safe and prosperous legacy"]],
    beginTitle: "Begin Your Journey", beginSub: "Begin with clarity. Move with confidence.",
    contEmail: "Continue with Email", contGoogle: "Continue with Google", contApple: "Continue with Apple",
    newHere: "New to Montaureo?", createAcc: "Create account",
    sec: [["Bank-Level Security", "256-bit encryption"], ["Your Data is Private", "Never shared with third parties"]],
    whoTitle: "Who are you?", whatTitle: "What matters to you?", step: "Step", of: "of",
    next: "Next", back: "Back", showTwo: "Show me two futures", drawing: "Montaureo is drawing two futures…",
    errBuild: "Couldn't build the scenarios. Please try again.", backToQ: "Back to questionnaire", passAgain: "Start over",
    twoFutures: "Two futures · 2036", stay: "Stay", move: "Move", tax: "Tax", cap2036: "Capital 2036*", school: "School", climate: "Climate",
    diffTitle: "Difference · if you move", showPath: "Show Me My Path — open concierge", showPathSub: "Velvet Concierge already knows your profile — continue without repeating.",
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
    fcTitle: "Future Confidence", fcSub: "How well this future matches your priorities",
    discPrefix: "* Illustrative estimate under the stated assumptions", scenariosBoth: "both futures are scenarios, not a country forecast.", discDefault: "This is not financial, legal or tax advice; confirm with an advisor.",
    pwEyebrow: "Montaureo Concierge", pwReady: "Your future is ready.", pwVip: "Your VIP concierge", pwUnlock: "Unlock your personal AI concierge.",
    pwBodyA: "Kate and Max will help you turn this scenario", pwBodyB: "into a real plan: banking, real estate, credit, relocation.",
    tierFree: "Free", tierFreeNow: "Current plan", tierFreeActive: "Active", freeF: ["Landing and sign-in", "Profile questionnaire", "Two Futures · Stay vs Move"],
    recommended: "Recommended", tierPremium: "Premium", perMonth: "/mo", premiumAlt: "or $299 — one-time relocation plan",
    promoNote: "Use code WELCOME for your first month at $4.99",
    premF: ["Velvet Concierge · Kate & Max", "Banking · Real Estate · Credit", "Lifestyle · Events · KYC checklists", "8 jurisdictions, profile-aware"],
    btnSub: "Request Premium access", btnOnce: "Ask about the one-time plan",
    tierPrivate: "Private", privatePrice: "By request", privateNote: "Inner circle", privF: ["Everything in Premium", "A real MFI advisor", "Deal & relocation support"], requestAccess: "Request access",
    pwReassure: "Two Futures stays free forever. Cancel anytime. Payment is a demo: buttons open the concierge immediately.",
    profile: "Profile", yourProfile: "Your profile", profileSub: "This data powers both Two Futures and Velvet Concierge. Fill it once.",
    priorities: "Priorities", saveProfile: "Save profile", saved: "Saved ✓", savedNote: "Profile updated — the concierge already accounts for the changes.", planLabel: "Plan", resetFree: "Reset to Free (demo)",
    cWelcomeA: "Given your profile", cWelcomeB: "I already know the details — no need to repeat anything. Where shall we begin?", cMoveInterest: "interest in",
    askPlaceholder: "Ask", cFooter: "Information, not advice. For KYC, documents are submitted directly to the bank or your MFI advisor.",
    nav: { future: "Design Your Future", concierge: "Concierge", banking: "Banking", realestate: "Real Estate", lifestyle: "Lifestyle", events: "Events", credit: "Credit", profile: "Profile" },
    pmcFreeTitle: "MONTAUREO PREMIUM", pmcFreeSub: "Unlock Velvet Concierge — Kate and Max turn the scenario into a plan", pmcUnlock: "Unlock",
    pmcPremTitle: "PREMIUM ACTIVE", pmcPremSub: "Want a real MFI advisor?", pmcToPrivate: "Upgrade to Private", pmcPrivTitle: "PRIVATE", pmcPrivSub: "A Monaco Finance International advisor will be in touch.",
    dom: { null: ["Velvet Concierge", "Banking, real estate, lifestyle, events, relocation — ask anything."], Banking: ["Banking", "Where and how to open an account — pros and cons by bank."], RealEstate: ["Real Estate", "Where to buy property, with price guidance."], Lifestyle: ["Lifestyle", "Where to dine, private service, seasonal trends."], Events: ["Events", "International forums, fairs, private events."], Credit: ["Credit", "Credit and Lombard — where and on what terms."] },
    partnerBankingTitle: "Manage everything in one place", partnerBankingDesc: "monaco-finance.com is our free client portal — track all your accounts, Lombard lines and more.", partnerBankingCta: "Explore monaco-finance.com",
    suggest: { null: ["Best jurisdictions for my profile", "Compare Monaco vs UAE on tax", "Where do I start with relocation?"], Banking: ["Which bank should I open an account with?", "Compare private banks in Monaco", "What's needed for KYC?"], RealEstate: ["What can I buy within my budget?", "Rent or buy?", "Best areas by the sea"], Lifestyle: ["Best restaurants of the 2026 season", "Private service and clubs", "What's new on the Riviera"], Events: ["Upcoming private forums", "Calendar of fairs and auctions", "Grand Prix and yacht shows"], Credit: ["Lombard terms against my portfolio", "Where to get an in-fine loan?", "Rates by country"] },
  },
  fr: {
    v: { a30: "30–40", a40: "40–50", a50: "50–60", a60: "60+", c1: "€500K–2M", c2: "€2–5M", c3: "€5–15M", c4: "€15–50M", c5: "€50–100M", c6: "€100M+", i1: "< €200K", i2: "€200–500K", i3: "€500K–1M", i4: "€1M+", l1: "< €500K", l2: "€500K–2M", l3: "€2–10M", l4: "€10–50M", l5: "€50M+", fSingle: "Seul", fCouple: "Couple", fKids: "Famille avec enfants", zEU: "UE", zUK: "R-U", zNA: "USA/Canada", zOther: "Autre", pMC: "Monaco", pCH: "Suisse", pAE: "EAU", pLU: "Luxembourg", pLI: "Liechtenstein", pAD: "Andorre", pSG: "Singapour", pFR: "France", pUK: "Royaume-Uni", pDE: "Allemagne", pOther: "Autre", kids: "Enfants", safety: "Sécurité", business: "Affaires", sea: "Mer", taxes: "Fiscalité", climate: "Climat" },
    f: { age: "Âge", capital: "Capital", liquid: "Actifs liquides", income: "Revenu / an", family: "Famille", citizen: "Nationalité", from: "Réside actuellement" },
    quote: "L'avenir ne se trouve pas. Il se conçoit.", h1a: "Concevez votre", h1b: "avenir",
    sub: "Montaureo est une plateforme d'IA pour les décisions qui changent une vie : résidence, patrimoine, héritage.",
    vp: [["Protéger votre patrimoine", "Optimisez votre avenir financier"], ["Élever votre vie", "Accédez aux meilleures opportunités au monde"], ["Sécuriser votre famille", "Un héritage sûr et prospère"]],
    beginTitle: "Commencez votre parcours", beginSub: "Commencez avec clarté. Avancez avec confiance.",
    contEmail: "Continuer avec Email", contGoogle: "Continuer avec Google", contApple: "Continuer avec Apple",
    newHere: "Nouveau sur Montaureo ?", createAcc: "Créer un compte",
    sec: [["Sécurité bancaire", "Chiffrement 256 bits"], ["Vos données sont privées", "Jamais partagées avec des tiers"]],
    whoTitle: "Qui êtes-vous ?", whatTitle: "Qu'est-ce qui compte pour vous ?", step: "Étape", of: "sur",
    next: "Suivant", back: "Retour", showTwo: "Montrer mes deux avenirs", drawing: "Montaureo dessine deux avenirs…",
    errBuild: "Impossible de construire les scénarios. Réessayez.", backToQ: "Retour au questionnaire", passAgain: "Recommencer",
    twoFutures: "Deux avenirs · 2036", stay: "Rester", move: "Partir", tax: "Fiscalité", cap2036: "Capital 2036*", school: "École", climate: "Climat",
    diffTitle: "Différence · si vous partez", showPath: "Montrez-moi ma voie — ouvrir le concierge", showPathSub: "Velvet Concierge connaît déjà votre profil — continuez sans répéter.",
    bookConsult: "Réserver une consultation privée",
    leadTitle: "Consultation privée", leadSub: "Un conseiller Monaco Finance International vous contactera directement. Pas d'IA à cette étape.",
    leadName: "Nom complet", leadEmail: "Email", leadPhone: "Téléphone / WhatsApp", leadLang: "Langue préférée", leadTime: "Meilleur moment pour vous contacter",
    leadGoal: "De quoi s'agit-il ?", leadGoals: ["Banque", "Relocation", "Immobilier", "Crédit", "Family Office"],
    leadTimeOpts: ["Matin", "Après-midi", "Soir", "N'importe quand"],
    leadNamePh: "Votre nom complet", leadEmailPh: "nom@email.com", leadPhonePh: "+377…",
    leadSubmit: "Envoyer la demande", leadSending: "Envoi…", leadCancel: "Annuler",
    leadRequired: "Veuillez renseigner votre nom et votre email.",
    leadConsentLabel: "J'accepte d'être contacté(e) par Monaco Finance International au sujet de ma demande.",
    leadConsentRequired: "Veuillez confirmer votre accord pour être contacté(e).",
    leadConnError: "Erreur de connexion. Veuillez réessayer ou nous contacter directement.",
    leadConfirmTitle: "Votre demande a été reçue.", leadConfirmBody: "Un conseiller privé vous contactera prochainement.",
    leadContinue: "Continuer vers le Concierge", leadClose: "Fermer",
    fcTitle: "Future Confidence", fcSub: "À quel point cet avenir correspond à vos priorités",
    discPrefix: "* Estimation illustrative selon les hypothèses indiquées", scenariosBoth: "les deux avenirs sont des scénarios, pas une prévision par pays.", discDefault: "Ceci n'est pas un conseil financier, juridique ou fiscal ; confirmez avec un conseiller.",
    pwEyebrow: "Montaureo Concierge", pwReady: "Votre avenir est prêt.", pwVip: "Votre concierge VIP", pwUnlock: "Débloquez votre concierge IA personnel.",
    pwBodyA: "Kate et Max vous aideront à transformer ce scénario", pwBodyB: "en un vrai plan : banque, immobilier, crédit, relocation.",
    tierFree: "Free", tierFreeNow: "Plan actuel", tierFreeActive: "Actif", freeF: ["Accueil et connexion", "Questionnaire de profil", "Two Futures · Rester ou Partir"],
    recommended: "Recommandé", tierPremium: "Premium", perMonth: "/mois", premiumAlt: "ou $299 — plan de relocation unique",
    promoNote: "Utilisez le code WELCOME pour votre premier mois à $4.99",
    premF: ["Velvet Concierge · Kate & Max", "Banque · Immobilier · Crédit", "Art de vivre · Événements · Checklists KYC", "8 juridictions, profil pris en compte"],
    btnSub: "Demander l'accès Premium", btnOnce: "En savoir plus sur le plan unique",
    tierPrivate: "Private", privatePrice: "Sur demande", privateNote: "Cercle privé", privF: ["Tout le Premium", "Un vrai conseiller MFI", "Accompagnement transactions & relocation"], requestAccess: "Demander l'accès",
    pwReassure: "Two Futures reste gratuit pour toujours. Annulable à tout moment. Le paiement est une démo : les boutons ouvrent le concierge immédiatement.",
    profile: "Profil", yourProfile: "Votre profil", profileSub: "Ces données alimentent Two Futures et Velvet Concierge. À remplir une fois.",
    priorities: "Priorités", saveProfile: "Enregistrer le profil", saved: "Enregistré ✓", savedNote: "Profil mis à jour — le concierge en tient déjà compte.", planLabel: "Plan", resetFree: "Réinitialiser sur Free (démo)",
    cWelcomeA: "Au vu de votre profil", cWelcomeB: "je connais déjà les détails — inutile de répéter. Par où commençons-nous ?", cMoveInterest: "intérêt pour",
    askPlaceholder: "Demandez à", cFooter: "Information, pas un conseil. Pour le KYC, les documents se soumettent directement à la banque ou à votre conseiller MFI.",
    nav: { future: "Design Your Future", concierge: "Concierge", banking: "Banque", realestate: "Immobilier", lifestyle: "Art de vivre", events: "Événements", credit: "Crédit", profile: "Profil" },
    pmcFreeTitle: "MONTAUREO PREMIUM", pmcFreeSub: "Débloquez Velvet Concierge — Kate et Max transforment le scénario en plan", pmcUnlock: "Débloquer",
    pmcPremTitle: "PREMIUM ACTIF", pmcPremSub: "Vous voulez un vrai conseiller MFI ?", pmcToPrivate: "Passer à Private", pmcPrivTitle: "PRIVATE", pmcPrivSub: "Un conseiller Monaco Finance International vous contactera.",
    dom: { null: ["Velvet Concierge", "Banque, immobilier, art de vivre, événements, relocation — demandez tout."], Banking: ["Banque", "Où et comment ouvrir un compte — avantages et inconvénients par banque."], RealEstate: ["Immobilier", "Où acheter, avec une estimation de prix."], Lifestyle: ["Art de vivre", "Où dîner, service privé, tendances de saison."], Events: ["Événements", "Forums internationaux, foires, événements privés."], Credit: ["Crédit", "Crédit et Lombard — où et à quelles conditions."] },
    partnerBankingTitle: "Tout centraliser en un lieu", partnerBankingDesc: "monaco-finance.com est notre portail client gratuit — suivez tous vos comptes, lignes Lombard et plus.", partnerBankingCta: "Découvrir monaco-finance.com",
    suggest: { null: ["Meilleures juridictions pour mon profil", "Comparez Monaco et les EAU sur la fiscalité", "Par où commencer la relocation ?"], Banking: ["Dans quelle banque ouvrir un compte ?", "Comparez les banques privées de Monaco", "Que faut-il pour le KYC ?"], RealEstate: ["Que puis-je acheter avec mon budget ?", "Louer ou acheter ?", "Meilleurs quartiers en bord de mer"], Lifestyle: ["Meilleurs restaurants de la saison 2026", "Service privé et clubs", "Quoi de neuf sur la Riviera"], Events: ["Prochains forums privés", "Calendrier des foires et ventes aux enchères", "Grand Prix et salons nautiques"], Credit: ["Conditions Lombard sur mon portefeuille", "Où obtenir un prêt in fine ?", "Taux par pays"] },
  },
  ru: {
    v: { a30: "30–40", a40: "40–50", a50: "50–60", a60: "60+", c1: "€500K–2M", c2: "€2–5M", c3: "€5–15M", c4: "€15–50M", c5: "€50–100M", c6: "€100M+", i1: "< €200K", i2: "€200–500K", i3: "€500K–1M", i4: "€1M+", l1: "< €500K", l2: "€500K–2M", l3: "€2–10M", l4: "€10–50M", l5: "€50M+", fSingle: "Один", fCouple: "Пара", fKids: "Семья с детьми", zEU: "ЕС", zUK: "UK", zNA: "США/Канада", zOther: "Другое", pMC: "Монако", pCH: "Швейцария", pAE: "ОАЭ", pLU: "Люксембург", pLI: "Лихтенштейн", pAD: "Андорра", pSG: "Сингапур", pFR: "Франция", pUK: "Великобритания", pDE: "Германия", pOther: "Другая", kids: "Дети", safety: "Безопасность", business: "Бизнес", sea: "Море", taxes: "Налоги", climate: "Климат" },
    f: { age: "Возраст", capital: "Капитал", liquid: "Ликвидные активы", income: "Доход в год", family: "Семья", citizen: "Гражданство", from: "Сейчас живёте" },
    quote: "Будущее не находят. Его проектируют.", h1a: "Спроектируйте", h1b: "своё будущее",
    sub: "Montaureo — ИИ-платформа для решений, которые меняют жизнь: резидентство, капитал, наследие.",
    vp: [["Защитить капитал", "Оптимизация финансового будущего"], ["Поднять качество жизни", "Доступ к лучшим возможностям мира"], ["Обезопасить семью", "Надёжное и процветающее наследие"]],
    beginTitle: "Начните путь", beginSub: "С ясности. И уверенным шагом.",
    contEmail: "Продолжить с Email", contGoogle: "Продолжить с Google", contApple: "Продолжить с Apple",
    newHere: "Впервые здесь?", createAcc: "Создать аккаунт",
    sec: [["Банковская защита", "256-битное шифрование"], ["Данные приватны", "Не передаём третьим лицам"]],
    whoTitle: "Кто вы?", whatTitle: "Что вам важно?", step: "Шаг", of: "из",
    next: "Далее", back: "Назад", showTwo: "Показать два будущих", drawing: "Montaureo рисует два будущих…",
    errBuild: "Не удалось построить сценарии. Попробуйте ещё раз.", backToQ: "Назад к анкете", passAgain: "Пройти заново",
    twoFutures: "Two futures · 2036", stay: "Stay", move: "Move", tax: "Налог", cap2036: "Капитал 2036*", school: "Школа", climate: "Климат",
    diffTitle: "Difference · если переехать", showPath: "Show Me My Path — перейти к консьержу", showPathSub: "Velvet Concierge уже знает ваш профиль — продолжите без повторов.",
    bookConsult: "Записаться на закрытую консультацию",
    leadTitle: "Закрытая консультация", leadSub: "Советник Monaco Finance International свяжется с вами напрямую. На этом шаге ИИ не участвует.",
    leadName: "Имя и фамилия", leadEmail: "Email", leadPhone: "Телефон / WhatsApp", leadLang: "Предпочитаемый язык", leadTime: "Удобное время для связи",
    leadGoal: "О чём речь?", leadGoals: ["Банк", "Релокация", "Недвижимость", "Кредит", "Family Office"],
    leadTimeOpts: ["Утро", "День", "Вечер", "В любое время"],
    leadNamePh: "Ваше имя и фамилия", leadEmailPh: "name@email.com", leadPhonePh: "+377…",
    leadSubmit: "Отправить запрос", leadSending: "Отправка…", leadCancel: "Отмена",
    leadRequired: "Заполните имя и email.",
    leadConsentLabel: "Я согласен(на) на то, чтобы Monaco Finance International связалась со мной по поводу моего запроса.",
    leadConsentRequired: "Подтвердите согласие на связь с вами.",
    leadConnError: "Ошибка соединения. Попробуйте снова или свяжитесь с нами напрямую.",
    leadConfirmTitle: "Ваш запрос получен.", leadConfirmBody: "Личный советник свяжется с вами в ближайшее время.",
    leadContinue: "Перейти к Concierge", leadClose: "Закрыть",
    fcTitle: "Future Confidence", fcSub: "Насколько это будущее отвечает вашим приоритетам",
    discPrefix: "* Иллюстративная оценка при заданных допущениях", scenariosBoth: "оба будущих — сценарии, не прогноз по стране.", discDefault: "Это не финансовая, юридическая или налоговая консультация; подтвердите у советника.",
    pwEyebrow: "Montaureo Concierge", pwReady: "Ваше будущее готово.", pwVip: "Ваш VIP-консьерж", pwUnlock: "Откройте личного ИИ-консьержа.",
    pwBodyA: "Kate и Max помогут превратить этот сценарий", pwBodyB: "в реальный план: банки, недвижимость, кредит, релокация.",
    tierFree: "Free", tierFreeNow: "Текущий план", tierFreeActive: "Активен", freeF: ["Landing и вход", "Анкета профиля", "Two Futures · Stay vs Move"],
    recommended: "Рекомендуем", tierPremium: "Premium", perMonth: "/мес", premiumAlt: "или $299 — разовый relocation plan",
    promoNote: "Промокод WELCOME — первый месяц за $4.99",
    premF: ["Velvet Concierge · Kate и Max", "Banking · Real Estate · Credit", "Lifestyle · Events · KYC-чеклисты", "8 юрисдикций, профиль учтён"],
    btnSub: "Запросить доступ Premium", btnOnce: "Узнать про разовый план",
    tierPrivate: "Private", privatePrice: "По запросу", privateNote: "Закрытый круг", privF: ["Всё из Premium", "Реальный советник MFI", "Сопровождение сделок и релокации"], requestAccess: "Запросить доступ",
    pwReassure: "Two Futures остаётся бесплатным навсегда. Отмена в любой момент. Оплата — демо: кнопки сразу открывают консьерж.",
    profile: "Profile", yourProfile: "Ваш профиль", profileSub: "Эти данные питают и Two Futures, и Velvet Concierge. Заполняются один раз.",
    priorities: "Приоритеты", saveProfile: "Сохранить профиль", saved: "Сохранено ✓", savedNote: "Профиль обновлён — консьерж уже учитывает изменения.", planLabel: "Тариф", resetFree: "Сбросить на Free (демо)",
    cWelcomeA: "С учётом вашего профиля", cWelcomeB: "я уже в курсе деталей — повторять ничего не нужно. С чего начнём?", cMoveInterest: "интерес к",
    askPlaceholder: "Спросите", cFooter: "Информация, не консультация. По KYC документы подаются напрямую в банк или советнику MFI.",
    nav: { future: "Design Your Future", concierge: "Concierge", banking: "Banking", realestate: "Real Estate", lifestyle: "Lifestyle", events: "Events", credit: "Credit", profile: "Profile" },
    pmcFreeTitle: "MONTAUREO PREMIUM", pmcFreeSub: "Откройте Velvet Concierge — Kate и Max превратят сценарий в план", pmcUnlock: "Разблокировать",
    pmcPremTitle: "PREMIUM АКТИВЕН", pmcPremSub: "Хотите реального советника MFI?", pmcToPrivate: "Перейти на Private", pmcPrivTitle: "PRIVATE", pmcPrivSub: "Советник Monaco Finance International свяжется с вами.",
    dom: { null: ["Velvet Concierge", "Банки, недвижимость, lifestyle, события, релокация — спросите что угодно."], Banking: ["Banking", "Где и как открыть счёт — плюсы и минусы по банкам."], RealEstate: ["Real Estate", "Где покупать недвижимость, с прикидкой по цене."], Lifestyle: ["Lifestyle", "Где поужинать, частный сервис, тренды сезона."], Events: ["Events", "Международные форумы, ярмарки, закрытые мероприятия."], Credit: ["Credit", "Кредит и Lombard — где и под какие условия."] },
    partnerBankingTitle: "Всё в одном месте", partnerBankingDesc: "monaco-finance.com — наш бесплатный клиентский портал: все счета, Lombard-линии и многое другое.", partnerBankingCta: "Перейти на monaco-finance.com",
    suggest: { null: ["Лучшие юрисдикции под мой профиль", "Сравни Монако и ОАЭ по налогам", "С чего начать релокацию?"], Banking: ["В каком банке открыть счёт?", "Сравни приватные банки Монако", "Что нужно для KYC?"], RealEstate: ["Что купить под мой бюджет?", "Аренда или покупка?", "Лучшие районы у моря"], Lifestyle: ["Лучшие рестораны сезона 2026", "Частный сервис и клубы", "Что нового на Лазурном берегу"], Events: ["Ближайшие закрытые форумы", "Календарь ярмарок и аукционов", "Гран-при и яхт-шоу"], Credit: ["Условия Lombard под портфель", "Где взять кредит in fine?", "Ставки по странам"] },
  },
};

/* ===================== KNOWLEDGE + PROMPTS (English base; язык ответа прокидывается) ===================== */
const KB = `
0% income tax: UAE, Qatar, Monaco (NOT for French citizens — 1963 treaty), Bahrain, Bahamas, Cayman.
Territorial (foreign income untaxed): Singapore, Hong Kong, Panama, Georgia, Costa Rica, Malaysia, Thailand.
Lump-sum: Italy €300,000/yr from 2026 (family +€50K, 15 yrs); Switzerland forfait; Greece €100,000/yr.
Low/special: Andorra ~10%, Bulgaria 10%, Cyprus non-dom, Malta non-dom.
Closed/narrowed: UK non-dom abolished (2025); Portugal NHR closed (narrower IFICI successor).
High tax (where people leave from): France, Germany, UK, Canada, Scandinavia.
`;

// Логика подбора юрисдикции — открытая, с приоритетом MFI (используется в обоих промптах).
const JLOGIC = `Jurisdiction coverage is OPEN — consider ANY relevant jurisdiction worldwide; the knowledge above is a starting set, not a limit. Match the destination to the client's CITIZENSHIP and constraints, never one-size-fits-all:
- French nationals: Monaco does NOT remove French income tax (the 1963 France–Monaco treaty taxes French citizens resident in Monaco as if French residents) — never propose Monaco to them.
- Wants to stay in the EU: consider Italy (lump-sum flat tax), Portugal, Greece, Cyprus, Malta.
- Open to leaving the EU: consider 0%/territorial or more exotic options (UAE, Costa Rica, Caribbean, Singapore/Hong Kong).
MFI has the deepest expertise and relationships in Monaco, UAE, Qatar, Singapore, Luxembourg, Switzerland, Liechtenstein and Andorra — give these priority when they genuinely fit, but never force them.`;

const FUTURE_SYSTEM = `You are Montaureo, a life architect for wealthy international families. You help make a LIFE DECISION, not pick a country.
Knowledge (current 2026):${KB}

The client thinks not "where to move" but "what do I lose if I stay". Build TWO FUTURES to 2036:
- STAY — the client stays in the current country;
- MOVE — the client moves to the ONE best country for their profile.
Compare them and show the difference. Warm, personal, honest tone.

${JLOGIC}

First — a cinematic scene of the MOVE future: NOT the country first, but a MOMENT of life (morning, children, school, airport, capital preserved vs the STAY scenario, weather). 4-6 short second-person sentences. The country is revealed in a separate field, not in the text.
Future Confidence — an integer 0-100: how well the MOVE scenario matches the client's PRIORITIES.

All amounts are illustrative estimates under assumptions, not a verdict on a country and not advice.

Return ONLY clean JSON, no markdown:
{"scene":{"month":"<Month 2036>","lines":["…","…","…","…","…"],"country":"<MOVE country>"},
 "confidence":94,
 "stay":{"country":"<current country>","tax":"short","capital2036":"€X.XM","school":"short","climate":"short"},
 "move":{"country":"<MOVE country>","tax":"short","capital2036":"€X.XM","school":"short","climate":"short"},
 "difference":["€X.XM saved","hours/yr saved","lower tax exposure","safer"],
 "assumptions":"1 line of assumptions",
 "disclaimer":"1 line: illustrative, not advice, confirm with an advisor"}
Keep values short.`;

const CONCIERGE_SYSTEM = `You are Velvet Concierge of the Montaureo platform: a private AI concierge for VIP clients with significant capital.
Jurisdiction coverage is open — you advise on any relevant jurisdiction worldwide.
Tone: discreet, precise, numbers first, never pushy.
Knowledge (current 2026):${KB}

${JLOGIC}

Agents (pick the right one): Banking, Credit, RealEstate, Lifestyle, Events, KYC, Wealth.

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
{"agent":"Banking|Credit|RealEstate|Lifestyle|Events|KYC|Wealth",
 "text":"1-3 sentence answer",
 "card": null | {"title":"...","rows":[{"primary":"...","secondary":"...","meta":"...","accent":true|false}]}}
Use a card for lists, comparisons and checklists (3-5 rows); otherwise card=null.`;

/* ===================== HELPERS ===================== */
// Профиль для модели строим всегда по EN-меткам (стабильно), язык ответа задаём отдельно.
const buildProfileText = (form, matters) => {
  const v = T.en.v;
  return `age ${v[form.age]}, total wealth ${v[form.capital]}, liquid assets ${v[form.liquid]}, income ${v[form.income]}/yr, ${v[form.family]}, citizenship ${v[form.citizen]}, currently lives in ${v[form.from]}, priorities: ${(matters || []).map((m) => v[m]).join(", ") || "family & life"}`;
};

async function designFuture(profile, langName) {
  const langLine = `\n\nRespond entirely in ${langName}. All JSON string values must be written in ${langName}.`;
  try {
    const r = await fetch("/api/future", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile, lang: langName }) });
    if (r.ok) { const d = await r.json(); if (d && (d.move || d.scene)) return d; }
    throw new Error("no-backend");
  } catch {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 2048, system: FUTURE_SYSTEM + langLine, messages: [{ role: "user", content: profile }] }),
    });
    if (!res.ok) throw new Error("api");
    const data = await res.json();
    const raw = data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  }
}

async function askConcierge({ profileText, persona, focus, moveCountry, messages, langName }) {
  const dynamic = `Client profile: ${profileText}.${moveCountry ? ` The client is considering moving to ${moveCountry}.` : ""}\nService persona: ${persona} (${persona === "Kate" ? "warm, attentive" : "direct, to the point"}).${focus ? `\nCurrent focus: ${focus} — act as this agent.` : ""}\nDefault response language: ${langName}, unless the client's last message is clearly in another language.`;
  try {
    const r = await fetch("/api/concierge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profileText, persona, focus, moveCountry, messages, lang: langName }) });
    if (r.ok) { const d = await r.json(); if (d && d.text) return d; }
    throw new Error("no-backend");
  } catch {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1024, system: CONCIERGE_SYSTEM + "\n\n" + dynamic, messages }),
    });
    if (!res.ok) throw new Error("api");
    const data = await res.json();
    const raw = data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
    catch { return { agent: "Velvet", text: raw, card: null }; }
  }
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
  <span style={{ fontSize: size, letterSpacing: "0.30em", fontWeight: 300, paddingLeft: "0.30em" }}>
    <span style={{ color: C.snow }}>MONT</span><span style={{ background: `linear-gradient(180deg, ${C.goldHi}, ${C.gold})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>AUREO</span>
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
        <div style={{ fontSize: 11, letterSpacing: "0.34em", color: C.gold, textTransform: "uppercase", paddingLeft: "0.34em" }}>Design Your Future</div>
      </div>
    </div>
  );
}
function AppleLogo({ size = 16 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" aria-hidden><path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.88 2.65 3.22 2.6 1.29-.05 1.78-.83 3.34-.83 1.56 0 2 .83 3.37.81 1.39-.03 2.27-1.27 3.12-2.53.98-1.45 1.39-2.85 1.41-2.92-.03-.01-2.7-1.04-2.73-4.13M14.54 4.66c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.44" /></svg>);
}

/* ===================== SHARED UI ===================== */
const Btn = ({ onClick, children }) => (
  <button onClick={onClick} className="mt-cta" style={{ marginTop: 6, cursor: "pointer", border: "none", borderRadius: 14, padding: "15px", fontSize: 15, fontWeight: 600, color: "#1A1408", background: `linear-gradient(140deg, ${C.goldHi}, ${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" }}>{children}</button>
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
const SECTIONS = [["future", Compass], ["concierge", Sparkles], ["banking", Landmark], ["realestate", Building2], ["lifestyle", Heart], ["events", Calendar], ["credit", CreditCard], ["profile", User]];
const FOCUS = { banking: "Banking", realestate: "RealEstate", lifestyle: "Lifestyle", events: "Events", credit: "Credit" };
const FIELDS = [["age", ["a30", "a40", "a50", "a60"]], ["capital", ["c1", "c2", "c3", "c4", "c5", "c6"]], ["liquid", ["l1", "l2", "l3", "l4", "l5"]], ["income", ["i1", "i2", "i3", "i4"]], ["family", ["fSingle", "fCouple", "fKids"]], ["citizen", ["zEU", "zUK", "zNA", "zOther"]], ["from", ["pOther", "pMC", "pCH", "pAE", "pLU", "pLI", "pAD", "pSG", "pFR", "pUK", "pDE"]]];
const MATTER_KEYS = ["kids", "safety", "business", "sea", "taxes", "climate"];

/* ===================== APP ===================== */
export default function MontaureoPlatform() {
  const [lang, setLang] = useState("en");
  const [authed, setAuthed] = useState(false);
  const [section, setSection] = useState("future");
  const [form, setForm] = useState({ age: "a50", capital: "c4", liquid: "l3", income: "i3", family: "fKids", citizen: "zEU", from: "pOther" });
  const [matters, setMatters] = useState(["kids", "sea"]);
  const [step, setStep] = useState(1);
  const [futureState, setFutureState] = useState("form");
  const [futureResult, setFutureResult] = useState(null);
  const [persona, setPersona] = useState("Kate");
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [plan, setPlan] = useState("free");
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [leadSending, setLeadSending] = useState(false);
  const [leadErr, setLeadErr] = useState("");
  const [lead, setLead] = useState({ name: "", email: "", phone: "", lang: LANGNAME[lang], time: "", goal: "", consent: false });
  const utmRef = useRef(null);
  const endRef = useRef(null);

  const t = T[lang];
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

  const enter = () => { setAuthed(true); setSection("future"); setFutureState("form"); setStep(1); };

  const runFuture = async () => {
    setFutureState("loading");
    const profile = `Profile: ${buildProfileText(form, matters)}. Build Stay vs Move to 2036.`;
    try { const r = await designFuture(profile, LANGNAME[lang]); setFutureResult(r); setFutureState("result"); }
    catch { setFutureState("error"); }
  };

  const sendChat = async (text) => {
    const content = (text ?? chatInput).trim();
    if (!content || chatBusy) return;
    const next = [...chat, { role: "user", content }];
    setChat(next); setChatInput(""); setChatBusy(true);
    try {
      const apiMsgs = next.map((m) => ({ role: m.role, content: m.content }));
      const r = await askConcierge({ profileText: buildProfileText(form, matters), persona, focus, moveCountry: futureResult?.move?.country, messages: apiMsgs, langName: LANGNAME[lang] });
      setChat([...next, { role: "assistant", content: r.text || "…", card: r.card || null, agent: r.agent }]);
    } catch {
      setChat([...next, { role: "assistant", content: "…", card: null }]);
    } finally { setChatBusy(false); }
  };

  const openLead = () => {
    setLead((l) => ({ ...l, lang: LANGNAME[lang], goal: l.goal || t.leadGoals[0], time: l.time || t.leadTimeOpts[3] }));
    setLeadErr(""); setLeadSent(false); setLeadOpen(true);
  };

  const submitLead = async () => {
    if (!lead.name.trim() || !lead.email.trim()) { setLeadErr(t.leadRequired); return; }
    if (!lead.consent) { setLeadErr(t.leadConsentRequired); return; }
    setLeadErr(""); setLeadSending(true);
    const payload = {
      ...lead,
      profile: buildProfileText(form, matters),
      moveCountry: futureResult?.move?.country || null,
      source: "two_futures",
      lang: LANGNAME[lang],
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
    } catch {
      setLeadSending(false);
      setLeadErr(t.leadConnError);
      return;
    }
  };

  const closeLeadAndEnterConcierge = () => { setLeadOpen(false); };

  const Chips = ({ fieldKey, opts }) => (
    <div>
      <div style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: C.gold, marginBottom: 9 }}>{t.f[fieldKey]}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {opts.map((o) => { const on = form[fieldKey] === o; return <button key={o} onClick={() => setF(fieldKey, o)} style={{ cursor: "pointer", border: `1px solid ${on ? C.gold : C.line}`, background: on ? "rgba(198,163,90,0.12)" : "transparent", color: on ? C.snow : C.mist, padding: "9px 14px", borderRadius: 99, fontSize: 13, transition: "all .15s" }}>{v(o)}</button>; })}
      </div>
    </div>
  );
  const AuthBtn = ({ icon, children, primary }) => (
    <button onClick={enter} className="auth-btn" style={{ cursor: "pointer", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px", borderRadius: 12, fontSize: 14.5, fontWeight: 600, border: primary ? "none" : `1px solid ${C.line}`, color: primary ? "#1A1408" : C.snow, background: primary ? `linear-gradient(140deg, ${C.goldHi}, ${C.gold})` : "rgba(255,255,255,0.03)", position: "relative" }}>
      <span style={{ position: "absolute", left: 16, display: "flex" }}>{icon}</span>{children}
    </button>
  );
  const langSwitch = (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {LANGS.map((l) => <button key={l} onClick={() => setLang(l)} style={{ cursor: "pointer", background: "transparent", border: "none", padding: "2px 6px", fontSize: 12, letterSpacing: ".1em", color: lang === l ? C.goldHi : C.faint, fontWeight: lang === l ? 700 : 400 }}>{l.toUpperCase()}</button>)}
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
      .mt-cta:hover{filter:brightness(1.1)}
      .auth-btn:hover{filter:brightness(1.06);border-color:rgba(198,163,90,0.4)}
      .nav-item:hover{background:rgba(198,163,90,0.06)!important}
      .link:hover{color:${C.goldHi}!important}
      input::placeholder{color:${C.faint}}
      @media (prefers-reduced-motion:reduce){*{animation:none!important}}
      @media (max-width:860px){
        .mt-shell{flex-direction:column!important}
        .mt-side{width:100%!important;flex-direction:row!important;overflow-x:auto;border-right:none!important;border-bottom:1px solid ${C.line};padding:10px 12px!important;gap:6px!important;align-items:center}
        .mt-navrow{flex-direction:row!important;gap:6px!important}
        .nav-item{white-space:nowrap}
        .mt-premium{display:none!important}
        .mt-landing{grid-template-columns:1fr!important;padding-top:24px!important}
        .mt-globewrap{order:-1!important}
      }
    `}</style>
  );

  /* ===================== LANDING ===================== */
  if (!authed) {
    return (
      <div style={{ background: C.void, minHeight: "100%", width: "100%", color: C.snow, fontFamily: "Inter, sans-serif" }}>
        {STYLE}
        <div style={{ position: "absolute", top: 22, left: 30, display: "flex", alignItems: "center", gap: 11, zIndex: 5 }}><SummitMark size={28} /><Wordmark size={13} /></div>
        <div style={{ position: "absolute", top: 20, right: 30, zIndex: 5 }}>{langSwitch}</div>
        <div className="mt-landing" style={{ minHeight: "100vh", maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1.05fr 1fr", alignItems: "center", gap: 30, padding: "80px 36px 36px", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(50% 36% at 30% 30%, rgba(198,163,90,0.10), transparent 70%)" }} />
          <div className="mt-globewrap fade" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <SpinningGlobe />
            <div style={{ alignSelf: "flex-start", marginTop: 24, maxWidth: 420 }}>
              <div style={{ width: 26, height: 1, background: C.gold, marginBottom: 12 }} />
              <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 19, lineHeight: 1.5, color: "#D9D8D2" }}>{t.quote}</div>
              <div style={{ fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: C.gold, marginTop: 12 }}>— Montaureo</div>
            </div>
          </div>
          <div className="fade" style={{ maxWidth: 440, justifySelf: "center", width: "100%", position: "relative" }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600, fontSize: "clamp(34px, 5vw, 56px)", lineHeight: 1.02, margin: 0, color: C.snow }}>
              {t.h1a}<br /><span style={{ background: `linear-gradient(180deg, ${C.goldHi}, ${C.gold})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{t.h1b}</span>
            </h1>
            <p style={{ fontSize: 15.5, lineHeight: 1.55, color: C.mist, margin: "18px 0 24px" }}>{t.sub}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 26 }}>
              {[ShieldCheck, Mountain, Users].map((Icon, i) => (
                <div key={i} style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                  <Icon size={20} color={C.gold} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div><div style={{ fontSize: 15, fontWeight: 600, color: C.snow }}>{t.vp[i][0]}</div><div style={{ fontSize: 13, color: C.mist, marginTop: 1 }}>{t.vp[i][1]}</div></div>
                </div>
              ))}
            </div>
            <div style={{ border: `1px solid ${C.line}`, borderRadius: 18, padding: 22, background: `linear-gradient(180deg, ${C.panelHi}, ${C.panel})` }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: C.snow, marginBottom: 2 }}>{t.beginTitle}</div>
              <div style={{ fontSize: 13, color: C.mist, marginBottom: 18 }}>{t.beginSub}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <AuthBtn primary icon={<Mail size={17} color="#1A1408" />}>{t.contEmail}</AuthBtn>
                <AuthBtn icon={<span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>G</span>}>{t.contGoogle}</AuthBtn>
                <AuthBtn icon={<AppleLogo />}>{t.contApple}</AuthBtn>
              </div>
              <div style={{ textAlign: "center", fontSize: 13, color: C.mist, marginTop: 16 }}>{t.newHere} <span className="link" onClick={enter} style={{ color: C.gold, cursor: "pointer", fontWeight: 500 }}>{t.createAcc}</span></div>
            </div>
            <div style={{ display: "flex", gap: 26, marginTop: 18, flexWrap: "wrap" }}>
              {[Lock, ShieldCheck].map((Icon, i) => (
                <div key={i} style={{ display: "flex", gap: 9, alignItems: "center" }}><Icon size={15} color={C.gold} /><div><div style={{ fontSize: 12.5, color: C.snow }}>{t.sec[i][0]}</div><div style={{ fontSize: 11, color: C.faint }}>{t.sec[i][1]}</div></div></div>
              ))}
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
                <button key={key} className="nav-item" onClick={() => setSection(key)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 11, padding: "10px 13px", borderRadius: 11, border: on ? `1px solid ${C.line}` : "1px solid transparent", background: on ? "rgba(198,163,90,0.08)" : "transparent", color: on ? C.snow : C.mist, fontSize: 13.5, textAlign: "left", transition: "background .15s" }}>
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
              <button onClick={() => setSection("concierge")} className="mt-cta" style={{ width: "100%", cursor: "pointer", border: "none", borderRadius: 11, padding: "10px", fontSize: 13, fontWeight: 600, color: "#1A1408", background: `linear-gradient(140deg, ${C.goldHi}, ${C.gold})` }}>{t.pmcUnlock}</button>
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
        </aside>

        {/* ===== MAIN ===== */}
        <main style={{ flex: 1, minWidth: 0, position: "relative", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, padding: "16px 22px 0" }}>
            {langSwitch}
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
                    <Btn onClick={() => setStep(2)}>{t.next} <ArrowRight size={18} strokeWidth={2.4} /></Btn>
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
                    <div style={{ flex: 1 }}><Btn onClick={runFuture}>{t.showTwo} <ArrowRight size={18} strokeWidth={2.4} /></Btn></div>
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
                </div>
              )}

              {futureState === "error" && (
                <div style={{ minHeight: "50vh", display: "grid", placeItems: "center", padding: 22, position: "relative" }}>
                  <div style={{ textAlign: "center", maxWidth: 320 }}>
                    <div style={{ color: C.mist, fontSize: 14, marginBottom: 14 }}>{t.errBuild}</div>
                    <Btn onClick={() => setFutureState("form")}>{t.backToQ}</Btn>
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
                        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 16, fontWeight: 700, color: C.snow }}>{futureResult.confidence}<span style={{ fontSize: 9, color: C.faint }}>%</span></div>
                      </div>
                      <div><div style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: C.gold }}>{t.fcTitle}</div><div style={{ fontSize: 12.5, color: C.mist, marginTop: 3, lineHeight: 1.4 }}>{t.fcSub}</div></div>
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
                  {futureResult.difference && (
                    <div className="mt-up" style={{ maxWidth: 600, margin: "16px auto 0", border: `1px solid rgba(198,163,90,0.35)`, borderRadius: 16, padding: "16px 18px", background: "linear-gradient(180deg, rgba(198,163,90,0.07), rgba(16,17,23,0.5))" }}>
                      <div style={{ fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: C.gold, marginBottom: 10 }}>{t.diffTitle}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {futureResult.difference.map((d, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14, color: i === 0 ? C.goldHi : "#D9D8D2", fontWeight: i === 0 ? 600 : 400 }}><Sparkles size={13} color={C.gold} style={{ flexShrink: 0 }} /> {d}</div>))}
                      </div>
                    </div>
                  )}
                  <div className="mt-up" style={{ maxWidth: 600, margin: "20px auto 0" }}>
                    <Btn onClick={() => setSection("concierge")}>{t.showPath} <ArrowRight size={18} strokeWidth={2.4} /></Btn>
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
                  {plan !== "free" && <button onClick={() => setPlan("free")} style={{ cursor: "pointer", border: `1px solid ${C.line}`, background: "transparent", color: C.mist, borderRadius: 99, padding: "7px 13px", fontSize: 12 }}>{t.resetFree}</button>}
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
                  <button onClick={openLead} className="mt-cta" style={{ marginTop: 18, cursor: "pointer", border: "none", borderRadius: 12, padding: "13px", fontSize: 14.5, fontWeight: 700, color: "#1A1408", background: `linear-gradient(140deg, ${C.goldHi}, ${C.gold})` }}>{t.btnSub}</button>
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
            </div>
          )}

          {/* ---------- CONCIERGE ---------- */}
          {isConcierge && !locked && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "8px 0 0", minHeight: 0 }}>
              <div style={{ padding: "0 22px 14px", borderBottom: `1px solid ${C.line}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: C.gold }}>{domTitle}</div>
                    <div style={{ fontSize: 13, color: C.mist, marginTop: 4, maxWidth: 460 }}>{domSub}</div>
                  </div>
                  <div style={{ display: "flex", border: `1px solid ${C.line}`, borderRadius: 99, overflow: "hidden" }}>
                    {["Kate", "Max"].map((p) => { const on = persona === p; return (
                      <button key={p} onClick={() => setPersona(p)} style={{ cursor: "pointer", border: "none", padding: "7px 16px", fontSize: 13, fontWeight: 600, color: on ? "#1A1408" : C.mist, background: on ? `linear-gradient(140deg, ${C.goldHi}, ${C.gold})` : "transparent" }}>{p}</button>
                    ); })}
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
                  {[["concierge", Sparkles], ["banking", Landmark], ["realestate", Building2], ["lifestyle", Heart], ["events", Calendar], ["credit", CreditCard]].map(([key, Icon]) => {
                    const on = section === key;
                    return (
                      <button key={key} onClick={() => setSection(key)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6, border: `1px solid ${on ? C.gold : C.line}`, background: on ? "rgba(198,163,90,0.14)" : "transparent", color: on ? C.snow : C.mist, padding: "7px 13px", borderRadius: 99, fontSize: 12.5, fontWeight: on ? 600 : 400 }}>
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
                    <a href="https://monaco-finance.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, textDecoration: "none", border: `1px solid ${C.gold}`, borderRadius: 99, padding: "9px 16px", fontSize: 12.5, fontWeight: 600, color: C.goldHi }}>
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

                  <div>
                    <div style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.gold, marginBottom: 6 }}>{t.leadLang}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {LANGS.map((l) => { const on = lead.lang === LANGNAME[l]; return (
                        <button key={l} onClick={() => setLead((ld) => ({ ...ld, lang: LANGNAME[l] }))} style={{ cursor: "pointer", border: `1px solid ${on ? C.gold : C.line}`, background: on ? "rgba(198,163,90,0.14)" : "transparent", color: on ? C.snow : C.mist, padding: "7px 12px", borderRadius: 99, fontSize: 12.5 }}>{LANGNAME[l]}</button>
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
