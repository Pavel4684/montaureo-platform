import React, { useState, useId, useRef, useEffect } from "react";
import { ArrowRight, RotateCcw, Sparkles, MapPin, ShieldCheck, Mountain, Users, Mail, Lock, Plane, Compass, Landmark, Building2, Heart, Calendar, CreditCard, User, Send, Crown, LogOut, X } from "lucide-react";
import { supabase } from "./supabaseClient";

/* =====================================================================
   MONTAUREO â€” ÐµÐ´Ð¸Ð½Ð°Ñ Ð¿Ð»Ð°Ñ‚Ñ„Ð¾Ñ€Ð¼Ð° (Ð¼ÑƒÐ»ÑŒÑ‚Ð¸ÑÐ·Ñ‹Ñ‡Ð½Ð°Ñ)
   Landing â†’ Profile/Ð°Ð½ÐºÐµÑ‚Ð° â†’ Two Futures (FREE, no login) â†’ soft gate â†’
   â†’ (login/signup required only here) â†’ Stripe checkout â†’ Concierge
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
    v: { a30: "30â€“40", a40: "40â€“50", a50: "50â€“60", a60: "60+", c1: "â‚¬500Kâ€“2M", c2: "â‚¬2â€“5M", c3: "â‚¬5â€“15M", c4: "â‚¬15â€“50M", c5: "â‚¬50â€“100M", c6: "â‚¬100M+", i1: "< â‚¬200K", i2: "â‚¬200â€“500K", i3: "â‚¬500Kâ€“1M", i4: "â‚¬1M+", l1: "< â‚¬500K", l2: "â‚¬500Kâ€“2M", l3: "â‚¬2â€“10M", l4: "â‚¬10â€“50M", l5: "â‚¬50M+", fSingle: "Single", fCouple: "Couple", fKids: "Family with children", zEU: "EU", zUK: "UK", zNA: "US/Canada", zOther: "Other", pMC: "Monaco", pCH: "Switzerland", pAE: "UAE", pLU: "Luxembourg", pLI: "Liechtenstein", pAD: "Andorra", pSG: "Singapore", pFR: "France", pUK: "United Kingdom", pDE: "Germany", pOther: "Other", kids: "Children", safety: "Safety", business: "Business", sea: "Sea", taxes: "Taxes", climate: "Climate" },
    f: { age: "Age", capital: "Capital", liquid: "Liquid assets", income: "Income / year", family: "Family", citizen: "Citizenship", from: "Currently living" },
    quote: "The future is not found. It is designed.", h1a: "Design Your", h1b: "Future",
    sub: "Montaureo is an AI platform for life-changing decisions: residency, wealth, legacy.",
    vp: [["Protect Your Wealth", "Optimize your financial future"], ["Elevate Your Life", "Access the world's best opportunities"], ["Secure Your Family", "A safe and prosperous legacy"]],
    beginTitle: "Begin Your Journey", beginSub: "Begin with clarity. Move with confidence.",
    startFree: "Start free â€” no account needed",
    sec: [["Bank-Level Security", "256-bit encryption"], ["Your Data is Private", "Never shared with third parties"]],
    whoTitle: "Who are you?", whatTitle: "What matters to you?", step: "Step", of: "of",
    next: "Next", back: "Back", showTwo: "Show me two futures", drawing: "Montaureo is drawing two futuresâ€¦",
    errBuild: "Couldn't build the scenarios. Please try again.", backToQ: "Back to questionnaire", passAgain: "Start over",
    twoFutures: "Two futures Â· 2036", stay: "Stay", move: "Move", tax: "Tax", cap2036: "Capital 2036*", school: "School", climate: "Climate",
    diffTitle: "Difference Â· if you move", showPath: "Show Me My Path â€” open concierge", showPathSub: "Velvet Concierge already knows your profile â€” continue without repeating.",
    bookConsult: "Book Private Consultation",
    leadTitle: "Private Consultation", leadSub: "A Monaco Finance International advisor will reach out directly. No AI in this step.",
    leadName: "Full name", leadEmail: "Email", leadPhone: "Phone / WhatsApp", leadLang: "Preferred language", leadTime: "Best time to contact",
    leadGoal: "What is this about?", leadGoals: ["Banking", "Relocation", "Real Estate", "Credit", "Family Office"],
    leadTimeOpts: ["Morning", "Afternoon", "Evening", "Anytime"],
    leadNamePh: "Your full name", leadEmailPh: "name@email.com", leadPhonePh: "+377â€¦",
    leadSubmit: "Send request", leadSending: "Sendingâ€¦", leadCancel: "Cancel",
    leadRequired: "Please fill in your name and email.",
    leadConsentLabel: "I agree to be contacted by Monaco Finance International regarding my request.",
    leadConsentRequired: "Please confirm you agree to be contacted.",
    leadConnError: "Connection error. Please try again or contact us directly.",
    leadConfirmTitle: "Your request has been received.", leadConfirmBody: "A private advisor will contact you shortly.",
    leadContinue: "Continue to Concierge", leadClose: "Close",
    fcTitle: "Future Confidence", fcSub: "How well this future matches your priorities",
    discPrefix: "* Illustrative estimate under the stated assumptions", scenariosBoth: "both futures are scenarios, not a country forecast.", discDefault: "This is not financial, legal or tax advice; confirm with an advisor.",
    pwEyebrow: "Montaureo Concierge", pwReady: "Your future is ready.", pwVip: "Your VIP concierge", pwUnlock: "Unlock your personal AI concierge.",
    pwBodyA: "Kate, Jun and Emily will help you turn this scenario", pwBodyB: "into a real plan: banking, real estate, credit, relocation.",
    tierFree: "Free", tierFreeNow: "Current plan", tierFreeActive: "Active", freeF: ["Landing and sign-in", "Profile questionnaire", "Two Futures Â· Stay vs Move"],
    recommended: "Recommended", tierPremium: "Premium", perMonth: "/mo", premiumAlt: "or $299 â€” one-time relocation plan",
    promoNote: "Use code WELCOME for your first month at $4.99",
    premF: ["Velvet Concierge Â· Kate, Jun & Emily", "Banking Â· Real Estate Â· Credit", "Lifestyle Â· Events Â· KYC checklists", "8 jurisdictions, profile-aware"],
    btnSub: "Subscribe", btnOnce: "$299 â€” one-time plan",
    tierPrivate: "Private", privatePrice: "By request", privateNote: "Inner circle", privF: ["Everything in Premium", "A real MFI advisor", "Deal & relocation support"], requestAccess: "Request access",
    pwReassure: "Two Futures stays free forever. Cancel anytime.",
    profile: "Profile", yourProfile: "Your profile", profileSub: "This data powers both Two Futures and Velvet Concierge. Fill it once.",
    priorities: "Priorities", saveProfile: "Save profile", saved: "Saved âœ“", savedNote: "Profile updated â€” the concierge already accounts for the changes.", planLabel: "Plan",
    cWelcomeA: "Given your profile", cWelcomeB: "I already know the details â€” no need to repeat anything. Where shall we begin?", cMoveInterest: "interest in",
    askPlaceholder: "Ask", cFooter: "Information, not advice. For KYC, documents are submitted directly to the bank or your MFI advisor.",
    nav: { future: "Design Your Future", concierge: "Concierge", banking: "Banking", realestate: "Real Estate", lifestyle: "Lifestyle", events: "Events", credit: "Credit", profile: "Profile" },
    pmcFreeTitle: "MONTAUREO PREMIUM", pmcFreeSub: "Unlock Velvet Concierge â€” Kate, Jun and Emily turn the scenario into a plan", pmcUnlock: "Unlock",
    pmcPremTitle: "PREMIUM ACTIVE", pmcPremSub: "Want a real MFI advisor?", pmcToPrivate: "Upgrade to Private", pmcPrivTitle: "PRIVATE", pmcPrivSub: "A Monaco Finance International advisor will be in touch.",
    dom: { null: ["Velvet Concierge", "Banking, real estate, lifestyle, events, relocation â€” ask anything."], Banking: ["Banking", "Where and how to open an account â€” pros and cons by bank."], RealEstate: ["Real Estate", "Where to buy property, with price guidance."], Lifestyle: ["Lifestyle", "Where to dine, private service, seasonal trends."], Events: ["Events", "International forums, fairs, private events."], Credit: ["Credit", "Credit and Lombard â€” where and on what terms."] },
    partnerBankingTitle: "Manage everything in one place", partnerBankingDesc: "monaco-finance.com is our free client portal â€” track all your accounts, Lombard lines and more.", partnerBankingCta: "Explore monaco-finance.com",
    suggest: { null: ["Best jurisdictions for my profile", "Compare Monaco vs UAE on tax", "Where do I start with relocation?"], Banking: ["Which bank should I open an account with?", "Compare private banks in Monaco", "What's needed for KYC?"], RealEstate: ["What can I buy within my budget?", "Rent or buy?", "Best areas by the sea"], Lifestyle: ["Best restaurants of the 2026 season", "Private service and clubs", "What's new on the Riviera"], Events: ["Upcoming private forums", "Calendar of fairs and auctions", "Grand Prix and yacht shows"], Credit: ["Lombard terms against my portfolio", "Where to get an in-fine loan?", "Rates by country"] },
    // ---- Auth modal (only shown at the paywall) ----
    authModalTitle: "Sign in to continue",
    authModalSub: "Create an account or sign in to unlock Premium and track your subscription.",
    emailPh: "name@email.com", passwordPh: "Password",
    signIn: "Sign in", signUp: "Create account & continue",
    newHere: "New to Montaureo?", createAcc: "Create account", haveAcc: "Already have an account?", toSignIn: "Sign in",
    authErr: "Something went wrong. Check your email and password.",
    authCheckEmail: "Check your email to confirm your account, then sign in.",
    signingIn: "Signing inâ€¦", signingUp: "Creating accountâ€¦",
    signOut: "Sign out",
  },
  fr: {
    v: { a30: "30â€“40", a40: "40â€“50", a50: "50â€“60", a60: "60+", c1: "â‚¬500Kâ€“2M", c2: "â‚¬2â€“5M", c3: "â‚¬5â€“15M", c4: "â‚¬15â€“50M", c5: "â‚¬50â€“100M", c6: "â‚¬100M+", i1: "< â‚¬200K", i2: "â‚¬200â€“500K", i3: "â‚¬500Kâ€“1M", i4: "â‚¬1M+", l1: "< â‚¬500K", l2: "â‚¬500Kâ€“2M", l3: "â‚¬2â€“10M", l4: "â‚¬10â€“50M", l5: "â‚¬50M+", fSingle: "Seul", fCouple: "Couple", fKids: "Famille avec enfants", zEU: "UE", zUK: "R-U", zNA: "USA/Canada", zOther: "Autre", pMC: "Monaco", pCH: "Suisse", pAE: "EAU", pLU: "Luxembourg", pLI: "Liechtenstein", pAD: "Andorre", pSG: "Singapour", pFR: "France", pUK: "Royaume-Uni", pDE: "Allemagne", pOther: "Autre", kids: "Enfants", safety: "SÃ©curitÃ©", business: "Affaires", sea: "Mer", taxes: "FiscalitÃ©", climate: "Climat" },
    f: { age: "Ã‚ge", capital: "Capital", liquid: "Actifs liquides", income: "Revenu / an", family: "Famille", citizen: "NationalitÃ©", from: "RÃ©side actuellement" },
    quote: "L'avenir ne se trouve pas. Il se conÃ§oit.", h1a: "Concevez votre", h1b: "avenir",
    sub: "Montaureo est une plateforme d'IA pour les dÃ©cisions qui changent une vie : rÃ©sidence, patrimoine, hÃ©ritage.",
    vp: [["ProtÃ©ger votre patrimoine", "Optimisez votre avenir financier"], ["Ã‰lever votre vie", "AccÃ©dez aux meilleures opportunitÃ©s au monde"], ["SÃ©curiser votre famille", "Un hÃ©ritage sÃ»r et prospÃ¨re"]],
    beginTitle: "Commencez votre parcours", beginSub: "Commencez avec clartÃ©. Avancez avec confiance.",
    startFree: "Commencer gratuitement â€” sans compte",
    sec: [["SÃ©curitÃ© bancaire", "Chiffrement 256 bits"], ["Vos donnÃ©es sont privÃ©es", "Jamais partagÃ©es avec des tiers"]],
    whoTitle: "Qui Ãªtes-vous ?", whatTitle: "Qu'est-ce qui compte pour vous ?", step: "Ã‰tape", of: "sur",
    next: "Suivant", back: "Retour", showTwo: "Montrer mes deux avenirs", drawing: "Montaureo dessine deux avenirsâ€¦",
    errBuild: "Impossible de construire les scÃ©narios. RÃ©essayez.", backToQ: "Retour au questionnaire", passAgain: "Recommencer",
    twoFutures: "Deux avenirs Â· 2036", stay: "Rester", move: "Partir", tax: "FiscalitÃ©", cap2036: "Capital 2036*", school: "Ã‰cole", climate: "Climat",
    diffTitle: "DiffÃ©rence Â· si vous partez", showPath: "Montrez-moi ma voie â€” ouvrir le concierge", showPathSub: "Velvet Concierge connaÃ®t dÃ©jÃ  votre profil â€” continuez sans rÃ©pÃ©ter.",
    bookConsult: "RÃ©server une consultation privÃ©e",
    leadTitle: "Consultation privÃ©e", leadSub: "Un conseiller Monaco Finance International vous contactera directement. Pas d'IA Ã  cette Ã©tape.",
    leadName: "Nom complet", leadEmail: "Email", leadPhone: "TÃ©lÃ©phone / WhatsApp", leadLang: "Langue prÃ©fÃ©rÃ©e", leadTime: "Meilleur moment pour vous contacter",
    leadGoal: "De quoi s'agit-il ?", leadGoals: ["Banque", "Relocation", "Immobilier", "CrÃ©dit", "Family Office"],
    leadTimeOpts: ["Matin", "AprÃ¨s-midi", "Soir", "N'importe quand"],
    leadNamePh: "Votre nom complet", leadEmailPh: "nom@email.com", leadPhonePh: "+377â€¦",
    leadSubmit: "Envoyer la demande", leadSending: "Envoiâ€¦", leadCancel: "Annuler",
    leadRequired: "Veuillez renseigner votre nom et votre email.",
    leadConsentLabel: "J'accepte d'Ãªtre contactÃ©(e) par Monaco Finance International au sujet de ma demande.",
    leadConsentRequired: "Veuillez confirmer votre accord pour Ãªtre contactÃ©(e).",
    leadConnError: "Erreur de connexion. Veuillez rÃ©essayer ou nous contacter directement.",
    leadConfirmTitle: "Votre demande a Ã©tÃ© reÃ§ue.", leadConfirmBody: "Un conseiller privÃ© vous contactera prochainement.",
    leadContinue: "Continuer vers le Concierge", leadClose: "Fermer",
    fcTitle: "Future Confidence", fcSub: "Ã€ quel point cet avenir correspond Ã  vos prioritÃ©s",
    discPrefix: "* Estimation illustrative selon les hypothÃ¨ses indiquÃ©es", scenariosBoth: "les deux avenirs sont des scÃ©narios, pas une prÃ©vision par pays.", discDefault: "Ceci n'est pas un conseil financier, juridique ou fiscal ; confirmez avec un conseiller.",
    pwEyebrow: "Montaureo Concierge", pwReady: "Votre avenir est prÃªt.", pwVip: "Votre concierge VIP", pwUnlock: "DÃ©bloquez votre concierge IA personnel.",
    pwBodyA: "Kate, Jun et Emily vous aideront Ã  transformer ce scÃ©nario", pwBodyB: "en un vrai plan : banque, immobilier, crÃ©dit, relocation.",
    tierFree: "Free", tierFreeNow: "Plan actuel", tierFreeActive: "Actif", freeF: ["Accueil et connexion", "Questionnaire de profil", "Two Futures Â· Rester ou Partir"],
    recommended: "RecommandÃ©", tierPremium: "Premium", perMonth: "/mois", premiumAlt: "ou $299 â€” plan de relocation unique",
    promoNote: "Utilisez le code WELCOME pour votre premier mois Ã  $4.99",
    premF: ["Velvet Concierge Â· Kate, Jun & Emily", "Banque Â· Immobilier Â· CrÃ©dit", "Art de vivre Â· Ã‰vÃ©nements Â· Checklists KYC", "8 juridictions, profil pris en compte"],
    btnSub: "S'abonner", btnOnce: "$299 â€” plan unique",
    tierPrivate: "Private", privatePrice: "Sur demande", privateNote: "Cercle privÃ©", privF: ["Tout le Premium", "Un vrai conseiller MFI", "Accompagnement transactions & relocation"], requestAccess: "Demander l'accÃ¨s",
    pwReassure: "Two Futures reste gratuit pour toujours. Annulable Ã  tout moment.",
    profile: "Profil", yourProfile: "Votre profil", profileSub: "Ces donnÃ©es alimentent Two Futures et Velvet Concierge. Ã€ remplir une fois.",
    priorities: "PrioritÃ©s", saveProfile: "Enregistrer le profil", saved: "EnregistrÃ© âœ“", savedNote: "Profil mis Ã  jour â€” le concierge en tient dÃ©jÃ  compte.", planLabel: "Plan",
    cWelcomeA: "Au vu de votre profil", cWelcomeB: "je connais dÃ©jÃ  les dÃ©tails â€” inutile de rÃ©pÃ©ter. Par oÃ¹ commenÃ§ons-nous ?", cMoveInterest: "intÃ©rÃªt pour",
    askPlaceholder: "Demandez Ã ", cFooter: "Information, pas un conseil. Pour le KYC, les documents se soumettent directement Ã  la banque ou Ã  votre conseiller MFI.",
    nav: { future: "Design Your Future", concierge: "Concierge", banking: "Banque", realestate: "Immobilier", lifestyle: "Art de vivre", events: "Ã‰vÃ©nements", credit: "CrÃ©dit", profile: "Profil" },
    pmcFreeTitle: "MONTAUREO PREMIUM", pmcFreeSub: "DÃ©bloquez Velvet Concierge â€” Kate, Jun et Emily transforment le scÃ©nario en plan", pmcUnlock: "DÃ©bloquer",
    pmcPremTitle: "PREMIUM ACTIF", pmcPremSub: "Vous voulez un vrai conseiller MFI ?", pmcToPrivate: "Passer Ã  Private", pmcPrivTitle: "PRIVATE", pmcPrivSub: "Un conseiller Monaco Finance International vous contactera.",
    dom: { null: ["Velvet Concierge", "Banque, immobilier, art de vivre, Ã©vÃ©nements, relocation â€” demandez tout."], Banking: ["Banque", "OÃ¹ et comment ouvrir un compte â€” avantages et inconvÃ©nients par banque."], RealEstate: ["Immobilier", "OÃ¹ acheter, avec une estimation de prix."], Lifestyle: ["Art de vivre", "OÃ¹ dÃ®ner, service privÃ©, tendances de saison."], Events: ["Ã‰vÃ©nements", "Forums internationaux, foires, Ã©vÃ©nements privÃ©s."], Credit: ["CrÃ©dit", "CrÃ©dit et Lombard â€” oÃ¹ et Ã  quelles conditions."] },
    partnerBankingTitle: "Tout centraliser en un lieu", partnerBankingDesc: "monaco-finance.com est notre portail client gratuit â€” suivez tous vos comptes, lignes Lombard et plus.", partnerBankingCta: "DÃ©couvrir monaco-finance.com",
    suggest: { null: ["Meilleures juridictions pour mon profil", "Comparez Monaco et les EAU sur la fiscalitÃ©", "Par oÃ¹ commencer la relocation ?"], Banking: ["Dans quelle banque ouvrir un compte ?", "Comparez les banques privÃ©es de Monaco", "Que faut-il pour le KYC ?"], RealEstate: ["Que puis-je acheter avec mon budget ?", "Louer ou acheter ?", "Meilleurs quartiers en bord de mer"], Lifestyle: ["Meilleurs restaurants de la saison 2026", "Service privÃ© et clubs", "Quoi de neuf sur la Riviera"], Events: ["Prochains forums privÃ©s", "Calendrier des foires et ventes aux enchÃ¨res", "Grand Prix et salons nautiques"], Credit: ["Conditions Lombard sur mon portefeuille", "OÃ¹ obtenir un prÃªt in fine ?", "Taux par pays"] },
    authModalTitle: "Connectez-vous pour continuer",
    authModalSub: "CrÃ©ez un compte ou connectez-vous pour dÃ©bloquer Premium et suivre votre abonnement.",
    emailPh: "nom@email.com", passwordPh: "Mot de passe",
    signIn: "Se connecter", signUp: "CrÃ©er un compte et continuer",
    newHere: "Nouveau sur Montaureo ?", createAcc: "CrÃ©er un compte", haveAcc: "Vous avez dÃ©jÃ  un compte ?", toSignIn: "Se connecter",
    authErr: "Une erreur est survenue. VÃ©rifiez votre email et mot de passe.",
    authCheckEmail: "VÃ©rifiez votre email pour confirmer votre compte, puis connectez-vous.",
    signingIn: "Connexionâ€¦", signingUp: "CrÃ©ation du compteâ€¦",
    signOut: "Se dÃ©connecter",
  },
  ru: {
    v: { a30: "30â€“40", a40: "40â€“50", a50: "50â€“60", a60: "60+", c1: "â‚¬500Kâ€“2M", c2: "â‚¬2â€“5M", c3: "â‚¬5â€“15M", c4: "â‚¬15â€“50M", c5: "â‚¬50â€“100M", c6: "â‚¬100M+", i1: "< â‚¬200K", i2: "â‚¬200â€“500K", i3: "â‚¬500Kâ€“1M", i4: "â‚¬1M+", l1: "< â‚¬500K", l2: "â‚¬500Kâ€“2M", l3: "â‚¬2â€“10M", l4: "â‚¬10â€“50M", l5: "â‚¬50M+", fSingle: "ÐžÐ´Ð¸Ð½", fCouple: "ÐŸÐ°Ñ€Ð°", fKids: "Ð¡ÐµÐ¼ÑŒÑ Ñ Ð´ÐµÑ‚ÑŒÐ¼Ð¸", zEU: "Ð•Ð¡", zUK: "UK", zNA: "Ð¡Ð¨Ð/ÐšÐ°Ð½Ð°Ð´Ð°", zOther: "Ð”Ñ€ÑƒÐ³Ð¾Ðµ", pMC: "ÐœÐ¾Ð½Ð°ÐºÐ¾", pCH: "Ð¨Ð²ÐµÐ¹Ñ†Ð°Ñ€Ð¸Ñ", pAE: "ÐžÐÐ­", pLU: "Ð›ÑŽÐºÑÐµÐ¼Ð±ÑƒÑ€Ð³", pLI: "Ð›Ð¸Ñ…Ñ‚ÐµÐ½ÑˆÑ‚ÐµÐ¹Ð½", pAD: "ÐÐ½Ð´Ð¾Ñ€Ñ€Ð°", pSG: "Ð¡Ð¸Ð½Ð³Ð°Ð¿ÑƒÑ€", pFR: "Ð¤Ñ€Ð°Ð½Ñ†Ð¸Ñ", pUK: "Ð’ÐµÐ»Ð¸ÐºÐ¾Ð±Ñ€Ð¸Ñ‚Ð°Ð½Ð¸Ñ", pDE: "Ð“ÐµÑ€Ð¼Ð°Ð½Ð¸Ñ", pOther: "Ð”Ñ€ÑƒÐ³Ð°Ñ", kids: "Ð”ÐµÑ‚Ð¸", safety: "Ð‘ÐµÐ·Ð¾Ð¿Ð°ÑÐ½Ð¾ÑÑ‚ÑŒ", business: "Ð‘Ð¸Ð·Ð½ÐµÑ", sea: "ÐœÐ¾Ñ€Ðµ", taxes: "ÐÐ°Ð»Ð¾Ð³Ð¸", climate: "ÐšÐ»Ð¸Ð¼Ð°Ñ‚" },
    f: { age: "Ð’Ð¾Ð·Ñ€Ð°ÑÑ‚", capital: "ÐšÐ°Ð¿Ð¸Ñ‚Ð°Ð»", liquid: "Ð›Ð¸ÐºÐ²Ð¸Ð´Ð½Ñ‹Ðµ Ð°ÐºÑ‚Ð¸Ð²Ñ‹", income: "Ð”Ð¾Ñ…Ð¾Ð´ Ð² Ð³Ð¾Ð´", family: "Ð¡ÐµÐ¼ÑŒÑ", citizen: "Ð“Ñ€Ð°Ð¶Ð´Ð°Ð½ÑÑ‚Ð²Ð¾", from: "Ð¡ÐµÐ¹Ñ‡Ð°Ñ Ð¶Ð¸Ð²Ñ‘Ñ‚Ðµ" },
    quote: "Ð‘ÑƒÐ´ÑƒÑ‰ÐµÐµ Ð½Ðµ Ð½Ð°Ñ…Ð¾Ð´ÑÑ‚. Ð•Ð³Ð¾ Ð¿Ñ€Ð¾ÐµÐºÑ‚Ð¸Ñ€ÑƒÑŽÑ‚.", h1a: "Ð¡Ð¿Ñ€Ð¾ÐµÐºÑ‚Ð¸Ñ€ÑƒÐ¹Ñ‚Ðµ", h1b: "ÑÐ²Ð¾Ñ‘ Ð±ÑƒÐ´ÑƒÑ‰ÐµÐµ",
    sub: "Montaureo â€” Ð˜Ð˜-Ð¿Ð»Ð°Ñ‚Ñ„Ð¾Ñ€Ð¼Ð° Ð´Ð»Ñ Ñ€ÐµÑˆÐµÐ½Ð¸Ð¹, ÐºÐ¾Ñ‚Ð¾Ñ€Ñ‹Ðµ Ð¼ÐµÐ½ÑÑŽÑ‚ Ð¶Ð¸Ð·Ð½ÑŒ: Ñ€ÐµÐ·Ð¸Ð´ÐµÐ½Ñ‚ÑÑ‚Ð²Ð¾, ÐºÐ°Ð¿Ð¸Ñ‚Ð°Ð», Ð½Ð°ÑÐ»ÐµÐ´Ð¸Ðµ.",
    vp: [["Ð—Ð°Ñ‰Ð¸Ñ‚Ð¸Ñ‚ÑŒ ÐºÐ°Ð¿Ð¸Ñ‚Ð°Ð»", "ÐžÐ¿Ñ‚Ð¸Ð¼Ð¸Ð·Ð°Ñ†Ð¸Ñ Ñ„Ð¸Ð½Ð°Ð½ÑÐ¾Ð²Ð¾Ð³Ð¾ Ð±ÑƒÐ´ÑƒÑ‰ÐµÐ³Ð¾"], ["ÐŸÐ¾Ð´Ð½ÑÑ‚ÑŒ ÐºÐ°Ñ‡ÐµÑÑ‚Ð²Ð¾ Ð¶Ð¸Ð·Ð½Ð¸", "Ð”Ð¾ÑÑ‚ÑƒÐ¿ Ðº Ð»ÑƒÑ‡ÑˆÐ¸Ð¼ Ð²Ð¾Ð·Ð¼Ð¾Ð¶Ð½Ð¾ÑÑ‚ÑÐ¼ Ð¼Ð¸Ñ€Ð°"], ["ÐžÐ±ÐµÐ·Ð¾Ð¿Ð°ÑÐ¸Ñ‚ÑŒ ÑÐµÐ¼ÑŒÑŽ", "ÐÐ°Ð´Ñ‘Ð¶Ð½Ð¾Ðµ Ð¸ Ð¿Ñ€Ð¾Ñ†Ð²ÐµÑ‚Ð°ÑŽÑ‰ÐµÐµ Ð½Ð°ÑÐ»ÐµÐ´Ð¸Ðµ"]],
    beginTitle: "ÐÐ°Ñ‡Ð½Ð¸Ñ‚Ðµ Ð¿ÑƒÑ‚ÑŒ", beginSub: "Ð¡ ÑÑÐ½Ð¾ÑÑ‚ÑŒÑŽ. Ð˜ ÑƒÐ²ÐµÑ€ÐµÐ½Ð½Ñ‹Ð¼ ÑˆÐ°Ð³Ð¾Ð¼.",
    startFree: "ÐÐ°Ñ‡Ð°Ñ‚ÑŒ Ð±ÐµÑÐ¿Ð»Ð°Ñ‚Ð½Ð¾ â€” Ð±ÐµÐ· Ð°ÐºÐºÐ°ÑƒÐ½Ñ‚Ð°",
    sec: [["Ð‘Ð°Ð½ÐºÐ¾Ð²ÑÐºÐ°Ñ Ð·Ð°Ñ‰Ð¸Ñ‚Ð°", "256-Ð±Ð¸Ñ‚Ð½Ð¾Ðµ ÑˆÐ¸Ñ„Ñ€Ð¾Ð²Ð°Ð½Ð¸Ðµ"], ["Ð”Ð°Ð½Ð½Ñ‹Ðµ Ð¿Ñ€Ð¸Ð²Ð°Ñ‚Ð½Ñ‹", "ÐÐµ Ð¿ÐµÑ€ÐµÐ´Ð°Ñ‘Ð¼ Ñ‚Ñ€ÐµÑ‚ÑŒÐ¸Ð¼ Ð»Ð¸Ñ†Ð°Ð¼"]],
    whoTitle: "ÐšÑ‚Ð¾ Ð²Ñ‹?", whatTitle: "Ð§Ñ‚Ð¾ Ð²Ð°Ð¼ Ð²Ð°Ð¶Ð½Ð¾?", step: "Ð¨Ð°Ð³", of: "Ð¸Ð·",
    next: "Ð”Ð°Ð»ÐµÐµ", back: "ÐÐ°Ð·Ð°Ð´", showTwo: "ÐŸÐ¾ÐºÐ°Ð·Ð°Ñ‚ÑŒ Ð´Ð²Ð° Ð±ÑƒÐ´ÑƒÑ‰Ð¸Ñ…", drawing: "Montaureo Ñ€Ð¸ÑÑƒÐµÑ‚ Ð´Ð²Ð° Ð±ÑƒÐ´ÑƒÑ‰Ð¸Ñ…â€¦",
    errBuild: "ÐÐµ ÑƒÐ´Ð°Ð»Ð¾ÑÑŒ Ð¿Ð¾ÑÑ‚Ñ€Ð¾Ð¸Ñ‚ÑŒ ÑÑ†ÐµÐ½Ð°Ñ€Ð¸Ð¸. ÐŸÐ¾Ð¿Ñ€Ð¾Ð±ÑƒÐ¹Ñ‚Ðµ ÐµÑ‰Ñ‘ Ñ€Ð°Ð·.", backToQ: "ÐÐ°Ð·Ð°Ð´ Ðº Ð°Ð½ÐºÐµÑ‚Ðµ", passAgain: "ÐŸÑ€Ð¾Ð¹Ñ‚Ð¸ Ð·Ð°Ð½Ð¾Ð²Ð¾",
    twoFutures: "Two futures Â· 2036", stay: "Stay", move: "Move", tax: "ÐÐ°Ð»Ð¾Ð³", cap2036: "ÐšÐ°Ð¿Ð¸Ñ‚Ð°Ð» 2036*", school: "Ð¨ÐºÐ¾Ð»Ð°", climate: "ÐšÐ»Ð¸Ð¼Ð°Ñ‚",
    diffTitle: "Difference Â· ÐµÑÐ»Ð¸ Ð¿ÐµÑ€ÐµÐµÑ…Ð°Ñ‚ÑŒ", showPath: "Show Me My Path â€” Ð¿ÐµÑ€ÐµÐ¹Ñ‚Ð¸ Ðº ÐºÐ¾Ð½ÑÑŒÐµÑ€Ð¶Ñƒ", showPathSub: "Velvet Concierge ÑƒÐ¶Ðµ Ð·Ð½Ð°ÐµÑ‚ Ð²Ð°Ñˆ Ð¿Ñ€Ð¾Ñ„Ð¸Ð»ÑŒ â€” Ð¿Ñ€Ð¾Ð´Ð¾Ð»Ð¶Ð¸Ñ‚Ðµ Ð±ÐµÐ· Ð¿Ð¾Ð²Ñ‚Ð¾Ñ€Ð¾Ð².",
    bookConsult: "Ð—Ð°Ð¿Ð¸ÑÐ°Ñ‚ÑŒÑÑ Ð½Ð° Ð·Ð°ÐºÑ€Ñ‹Ñ‚ÑƒÑŽ ÐºÐ¾Ð½ÑÑƒÐ»ÑŒÑ‚Ð°Ñ†Ð¸ÑŽ",
    leadTitle: "Ð—Ð°ÐºÑ€Ñ‹Ñ‚Ð°Ñ ÐºÐ¾Ð½ÑÑƒÐ»ÑŒÑ‚Ð°Ñ†Ð¸Ñ", leadSub: "Ð¡Ð¾Ð²ÐµÑ‚Ð½Ð¸Ðº Monaco Finance International ÑÐ²ÑÐ¶ÐµÑ‚ÑÑ Ñ Ð²Ð°Ð¼Ð¸ Ð½Ð°Ð¿Ñ€ÑÐ¼ÑƒÑŽ. ÐÐ° ÑÑ‚Ð¾Ð¼ ÑˆÐ°Ð³Ðµ Ð˜Ð˜ Ð½Ðµ ÑƒÑ‡Ð°ÑÑ‚Ð²ÑƒÐµÑ‚.",
    leadName: "Ð˜Ð¼Ñ Ð¸ Ñ„Ð°Ð¼Ð¸Ð»Ð¸Ñ", leadEmail: "Email", leadPhone: "Ð¢ÐµÐ»ÐµÑ„Ð¾Ð½ / WhatsApp", leadLang: "ÐŸÑ€ÐµÐ´Ð¿Ð¾Ñ‡Ð¸Ñ‚Ð°ÐµÐ¼Ñ‹Ð¹ ÑÐ·Ñ‹Ðº", leadTime: "Ð£Ð´Ð¾Ð±Ð½Ð¾Ðµ Ð²Ñ€ÐµÐ¼Ñ Ð´Ð»Ñ ÑÐ²ÑÐ·Ð¸",
    leadGoal: "Ðž Ñ‡Ñ‘Ð¼ Ñ€ÐµÑ‡ÑŒ?", leadGoals: ["Ð‘Ð°Ð½Ðº", "Ð ÐµÐ»Ð¾ÐºÐ°Ñ†Ð¸Ñ", "ÐÐµÐ´Ð²Ð¸Ð¶Ð¸Ð¼Ð¾ÑÑ‚ÑŒ", "ÐšÑ€ÐµÐ´Ð¸Ñ‚", "Family Office"],
    leadTimeOpts: ["Ð£Ñ‚Ñ€Ð¾", "Ð”ÐµÐ½ÑŒ", "Ð’ÐµÑ‡ÐµÑ€", "Ð’ Ð»ÑŽÐ±Ð¾Ðµ Ð²Ñ€ÐµÐ¼Ñ"],
    leadNamePh: "Ð’Ð°ÑˆÐµ Ð¸Ð¼Ñ Ð¸ Ñ„Ð°Ð¼Ð¸Ð»Ð¸Ñ", leadEmailPh: "name@email.com", leadPhonePh: "+377â€¦",
    leadSubmit: "ÐžÑ‚Ð¿Ñ€Ð°Ð²Ð¸Ñ‚ÑŒ Ð·Ð°Ð¿Ñ€Ð¾Ñ", leadSending: "ÐžÑ‚Ð¿Ñ€Ð°Ð²ÐºÐ°â€¦", leadCancel: "ÐžÑ‚Ð¼ÐµÐ½Ð°",
    leadRequired: "Ð—Ð°Ð¿Ð¾Ð»Ð½Ð¸Ñ‚Ðµ Ð¸Ð¼Ñ Ð¸ email.",
    leadConsentLabel: "Ð¯ ÑÐ¾Ð³Ð»Ð°ÑÐµÐ½(Ð½Ð°) Ð½Ð° Ñ‚Ð¾, Ñ‡Ñ‚Ð¾Ð±Ñ‹ Monaco Finance International ÑÐ²ÑÐ·Ð°Ð»Ð°ÑÑŒ ÑÐ¾ Ð¼Ð½Ð¾Ð¹ Ð¿Ð¾ Ð¿Ð¾Ð²Ð¾Ð´Ñƒ Ð¼Ð¾ÐµÐ³Ð¾ Ð·Ð°Ð¿Ñ€Ð¾ÑÐ°.",
    leadConsentRequired: "ÐŸÐ¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ñ‚Ðµ ÑÐ¾Ð³Ð»Ð°ÑÐ¸Ðµ Ð½Ð° ÑÐ²ÑÐ·ÑŒ Ñ Ð²Ð°Ð¼Ð¸.",
    leadConnError: "ÐžÑˆÐ¸Ð±ÐºÐ° ÑÐ¾ÐµÐ´Ð¸Ð½ÐµÐ½Ð¸Ñ. ÐŸÐ¾Ð¿Ñ€Ð¾Ð±ÑƒÐ¹Ñ‚Ðµ ÑÐ½Ð¾Ð²Ð° Ð¸Ð»Ð¸ ÑÐ²ÑÐ¶Ð¸Ñ‚ÐµÑÑŒ Ñ Ð½Ð°Ð¼Ð¸ Ð½Ð°Ð¿Ñ€ÑÐ¼ÑƒÑŽ.",
    leadConfirmTitle: "Ð’Ð°Ñˆ Ð·Ð°Ð¿Ñ€Ð¾Ñ Ð¿Ð¾Ð»ÑƒÑ‡ÐµÐ½.", leadConfirmBody: "Ð›Ð¸Ñ‡Ð½Ñ‹Ð¹ ÑÐ¾Ð²ÐµÑ‚Ð½Ð¸Ðº ÑÐ²ÑÐ¶ÐµÑ‚ÑÑ Ñ Ð²Ð°Ð¼Ð¸ Ð² Ð±Ð»Ð¸Ð¶Ð°Ð¹ÑˆÐµÐµ Ð²Ñ€ÐµÐ¼Ñ.",
    leadContinue: "ÐŸÐµÑ€ÐµÐ¹Ñ‚Ð¸ Ðº Concierge", leadClose: "Ð—Ð°ÐºÑ€Ñ‹Ñ‚ÑŒ",
    fcTitle: "Future Confidence", fcSub: "ÐÐ°ÑÐºÐ¾Ð»ÑŒÐºÐ¾ ÑÑ‚Ð¾ Ð±ÑƒÐ´ÑƒÑ‰ÐµÐµ Ð¾Ñ‚Ð²ÐµÑ‡Ð°ÐµÑ‚ Ð²Ð°ÑˆÐ¸Ð¼ Ð¿Ñ€Ð¸Ð¾Ñ€Ð¸Ñ‚ÐµÑ‚Ð°Ð¼",
    discPrefix: "* Ð˜Ð»Ð»ÑŽÑÑ‚Ñ€Ð°Ñ‚Ð¸Ð²Ð½Ð°Ñ Ð¾Ñ†ÐµÐ½ÐºÐ° Ð¿Ñ€Ð¸ Ð·Ð°Ð´Ð°Ð½Ð½Ñ‹Ñ… Ð´Ð¾Ð¿ÑƒÑ‰ÐµÐ½Ð¸ÑÑ…", scenariosBoth: "Ð¾Ð±Ð° Ð±ÑƒÐ´ÑƒÑ‰Ð¸Ñ… â€” ÑÑ†ÐµÐ½Ð°Ñ€Ð¸Ð¸, Ð½Ðµ Ð¿Ñ€Ð¾Ð³Ð½Ð¾Ð· Ð¿Ð¾ ÑÑ‚Ñ€Ð°Ð½Ðµ.", discDefault: "Ð­Ñ‚Ð¾ Ð½Ðµ Ñ„Ð¸Ð½Ð°Ð½ÑÐ¾Ð²Ð°Ñ, ÑŽÑ€Ð¸Ð´Ð¸Ñ‡ÐµÑÐºÐ°Ñ Ð¸Ð»Ð¸ Ð½Ð°Ð»Ð¾Ð³Ð¾Ð²Ð°Ñ ÐºÐ¾Ð½ÑÑƒÐ»ÑŒÑ‚Ð°Ñ†Ð¸Ñ; Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ñ‚Ðµ Ñƒ ÑÐ¾Ð²ÐµÑ‚Ð½Ð¸ÐºÐ°.",
    pwEyebrow: "Montaureo Concierge", pwReady: "Ð’Ð°ÑˆÐµ Ð±ÑƒÐ´ÑƒÑ‰ÐµÐµ Ð³Ð¾Ñ‚Ð¾Ð²Ð¾.", pwVip: "Ð’Ð°Ñˆ VIP-ÐºÐ¾Ð½ÑÑŒÐµÑ€Ð¶", pwUnlock: "ÐžÑ‚ÐºÑ€Ð¾Ð¹Ñ‚Ðµ Ð»Ð¸Ñ‡Ð½Ð¾Ð³Ð¾ Ð˜Ð˜-ÐºÐ¾Ð½ÑÑŒÐµÑ€Ð¶Ð°.",
    pwBodyA: "Kate, Jun Ð¸ Emily Ð¿Ð¾Ð¼Ð¾Ð³ÑƒÑ‚ Ð¿Ñ€ÐµÐ²Ñ€Ð°Ñ‚Ð¸Ñ‚ÑŒ ÑÑ‚Ð¾Ñ‚ ÑÑ†ÐµÐ½Ð°Ñ€Ð¸Ð¹", pwBodyB: "Ð² Ñ€ÐµÐ°Ð»ÑŒÐ½Ñ‹Ð¹ Ð¿Ð»Ð°Ð½: Ð±Ð°Ð½ÐºÐ¸, Ð½ÐµÐ´Ð²Ð¸Ð¶Ð¸Ð¼Ð¾ÑÑ‚ÑŒ, ÐºÑ€ÐµÐ´Ð¸Ñ‚, Ñ€ÐµÐ»Ð¾ÐºÐ°Ñ†Ð¸Ñ.",
    tierFree: "Free", tierFreeNow: "Ð¢ÐµÐºÑƒÑ‰Ð¸Ð¹ Ð¿Ð»Ð°Ð½", tierFreeActive: "ÐÐºÑ‚Ð¸Ð²ÐµÐ½", freeF: ["Landing Ð¸ Ð²Ñ…Ð¾Ð´", "ÐÐ½ÐºÐµÑ‚Ð° Ð¿Ñ€Ð¾Ñ„Ð¸Ð»Ñ", "Two Futures Â· Stay vs Move"],
    recommended: "Ð ÐµÐºÐ¾Ð¼ÐµÐ½Ð´ÑƒÐµÐ¼", tierPremium: "Premium", perMonth: "/Ð¼ÐµÑ", premiumAlt: "Ð¸Ð»Ð¸ $299 â€” Ñ€Ð°Ð·Ð¾Ð²Ñ‹Ð¹ relocation plan",
    promoNote: "ÐŸÑ€Ð¾Ð¼Ð¾ÐºÐ¾Ð´ WELCOME â€” Ð¿ÐµÑ€Ð²Ñ‹Ð¹ Ð¼ÐµÑÑÑ† Ð·Ð° $4.99",
    premF: ["Velvet Concierge Â· Kate, Jun Ð¸ Emily", "Banking Â· Real Estate Â· Credit", "Lifestyle Â· Events Â· KYC-Ñ‡ÐµÐºÐ»Ð¸ÑÑ‚Ñ‹", "8 ÑŽÑ€Ð¸ÑÐ´Ð¸ÐºÑ†Ð¸Ð¹, Ð¿Ñ€Ð¾Ñ„Ð¸Ð»ÑŒ ÑƒÑ‡Ñ‚Ñ‘Ð½"],
    btnSub: "ÐžÑ„Ð¾Ñ€Ð¼Ð¸Ñ‚ÑŒ Ð¿Ð¾Ð´Ð¿Ð¸ÑÐºÑƒ", btnOnce: "$299 â€” Ñ€Ð°Ð·Ð¾Ð²Ñ‹Ð¹ Ð¿Ð»Ð°Ð½",
    tierPrivate: "Private", privatePrice: "ÐŸÐ¾ Ð·Ð°Ð¿Ñ€Ð¾ÑÑƒ", privateNote: "Ð—Ð°ÐºÑ€Ñ‹Ñ‚Ñ‹Ð¹ ÐºÑ€ÑƒÐ³", privF: ["Ð’ÑÑ‘ Ð¸Ð· Premium", "Ð ÐµÐ°Ð»ÑŒÐ½Ñ‹Ð¹ ÑÐ¾Ð²ÐµÑ‚Ð½Ð¸Ðº MFI", "Ð¡Ð¾Ð¿Ñ€Ð¾Ð²Ð¾Ð¶Ð´ÐµÐ½Ð¸Ðµ ÑÐ´ÐµÐ»Ð¾Ðº Ð¸ Ñ€ÐµÐ»Ð¾ÐºÐ°Ñ†Ð¸Ð¸"], requestAccess: "Ð—Ð°Ð¿Ñ€Ð¾ÑÐ¸Ñ‚ÑŒ Ð´Ð¾ÑÑ‚ÑƒÐ¿",
    pwReassure: "Two Futures Ð¾ÑÑ‚Ð°Ñ‘Ñ‚ÑÑ Ð±ÐµÑÐ¿Ð»Ð°Ñ‚Ð½Ñ‹Ð¼ Ð½Ð°Ð²ÑÐµÐ³Ð´Ð°. ÐžÑ‚Ð¼ÐµÐ½Ð° Ð² Ð»ÑŽÐ±Ð¾Ð¹ Ð¼Ð¾Ð¼ÐµÐ½Ñ‚.",
    profile: "Profile", yourProfile: "Ð’Ð°Ñˆ Ð¿Ñ€Ð¾Ñ„Ð¸Ð»ÑŒ", profileSub: "Ð­Ñ‚Ð¸ Ð´Ð°Ð½Ð½Ñ‹Ðµ Ð¿Ð¸Ñ‚Ð°ÑŽÑ‚ Ð¸ Two Futures, Ð¸ Velvet Concierge. Ð—Ð°Ð¿Ð¾Ð»Ð½ÑÑŽÑ‚ÑÑ Ð¾Ð´Ð¸Ð½ Ñ€Ð°Ð·.",
    priorities: "ÐŸÑ€Ð¸Ð¾Ñ€Ð¸Ñ‚ÐµÑ‚Ñ‹", saveProfile: "Ð¡Ð¾Ñ…Ñ€Ð°Ð½Ð¸Ñ‚ÑŒ Ð¿Ñ€Ð¾Ñ„Ð¸Ð»ÑŒ", saved: "Ð¡Ð¾Ñ…Ñ€Ð°Ð½ÐµÐ½Ð¾ âœ“", savedNote: "ÐŸÑ€Ð¾Ñ„Ð¸Ð»ÑŒ Ð¾Ð±Ð½Ð¾Ð²Ð»Ñ‘Ð½ â€” ÐºÐ¾Ð½ÑÑŒÐµÑ€Ð¶ ÑƒÐ¶Ðµ ÑƒÑ‡Ð¸Ñ‚Ñ‹Ð²Ð°ÐµÑ‚ Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ñ.", planLabel: "Ð¢Ð°Ñ€Ð¸Ñ„",
    cWelcomeA: "Ð¡ ÑƒÑ‡Ñ‘Ñ‚Ð¾Ð¼ Ð²Ð°ÑˆÐµÐ³Ð¾ Ð¿Ñ€Ð¾Ñ„Ð¸Ð»Ñ", cWelcomeB: "Ñ ÑƒÐ¶Ðµ Ð² ÐºÑƒÑ€ÑÐµ Ð´ÐµÑ‚Ð°Ð»ÐµÐ¹ â€” Ð¿Ð¾Ð²Ñ‚Ð¾Ñ€ÑÑ‚ÑŒ Ð½Ð¸Ñ‡ÐµÐ³Ð¾ Ð½Ðµ Ð½ÑƒÐ¶Ð½Ð¾. Ð¡ Ñ‡ÐµÐ³Ð¾ Ð½Ð°Ñ‡Ð½Ñ‘Ð¼?", cMoveInterest: "Ð¸Ð½Ñ‚ÐµÑ€ÐµÑ Ðº",
    askPlaceholder: "Ð¡Ð¿Ñ€Ð¾ÑÐ¸Ñ‚Ðµ", cFooter: "Ð˜Ð½Ñ„Ð¾Ñ€Ð¼Ð°Ñ†Ð¸Ñ, Ð½Ðµ ÐºÐ¾Ð½ÑÑƒÐ»ÑŒÑ‚Ð°Ñ†Ð¸Ñ. ÐŸÐ¾ KYC Ð´Ð¾ÐºÑƒÐ¼ÐµÐ½Ñ‚Ñ‹ Ð¿Ð¾Ð´Ð°ÑŽÑ‚ÑÑ Ð½Ð°Ð¿Ñ€ÑÐ¼ÑƒÑŽ Ð² Ð±Ð°Ð½Ðº Ð¸Ð»Ð¸ ÑÐ¾Ð²ÐµÑ‚Ð½Ð¸ÐºÑƒ MFI.",
    nav: { future: "Design Your Future", concierge: "Concierge", banking: "Banking", realestate: "Real Estate", lifestyle: "Lifestyle", events: "Events", credit: "Credit", profile: "Profile" },
    pmcFreeTitle: "MONTAUREO PREMIUM", pmcFreeSub: "ÐžÑ‚ÐºÑ€Ð¾Ð¹Ñ‚Ðµ Velvet Concierge â€” Kate, Jun Ð¸ Emily Ð¿Ñ€ÐµÐ²Ñ€Ð°Ñ‚ÑÑ‚ ÑÑ†ÐµÐ½Ð°Ñ€Ð¸Ð¹ Ð² Ð¿Ð»Ð°Ð½", pmcUnlock: "Ð Ð°Ð·Ð±Ð»Ð¾ÐºÐ¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ",
    pmcPremTitle: "PREMIUM ÐÐšÐ¢Ð˜Ð’Ð•Ð", pmcPremSub: "Ð¥Ð¾Ñ‚Ð¸Ñ‚Ðµ Ñ€ÐµÐ°Ð»ÑŒÐ½Ð¾Ð³Ð¾ ÑÐ¾Ð²ÐµÑ‚Ð½Ð¸ÐºÐ° MFI?", pmcToPrivate: "ÐŸÐµÑ€ÐµÐ¹Ñ‚Ð¸ Ð½Ð° Private", pmcPrivTitle: "PRIVATE", pmcPrivSub: "Ð¡Ð¾Ð²ÐµÑ‚Ð½Ð¸Ðº Monaco Finance International ÑÐ²ÑÐ¶ÐµÑ‚ÑÑ Ñ Ð²Ð°Ð¼Ð¸.",
    dom: { null: ["Velvet Concierge", "Ð‘Ð°Ð½ÐºÐ¸, Ð½ÐµÐ´Ð²Ð¸Ð¶Ð¸Ð¼Ð¾ÑÑ‚ÑŒ, lifestyle, ÑÐ¾Ð±Ñ‹Ñ‚Ð¸Ñ, Ñ€ÐµÐ»Ð¾ÐºÐ°Ñ†Ð¸Ñ â€” ÑÐ¿Ñ€Ð¾ÑÐ¸Ñ‚Ðµ Ñ‡Ñ‚Ð¾ ÑƒÐ³Ð¾Ð´Ð½Ð¾."], Banking: ["Banking", "Ð“Ð´Ðµ Ð¸ ÐºÐ°Ðº Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚ÑŒ ÑÑ‡Ñ‘Ñ‚ â€” Ð¿Ð»ÑŽÑÑ‹ Ð¸ Ð¼Ð¸Ð½ÑƒÑÑ‹ Ð¿Ð¾ Ð±Ð°Ð½ÐºÐ°Ð¼."], RealEstate: ["Real Estate", "Ð“Ð´Ðµ Ð¿Ð¾ÐºÑƒÐ¿Ð°Ñ‚ÑŒ Ð½ÐµÐ´Ð²Ð¸Ð¶Ð¸Ð¼Ð¾ÑÑ‚ÑŒ, Ñ Ð¿Ñ€Ð¸ÐºÐ¸Ð´ÐºÐ¾Ð¹ Ð¿Ð¾ Ñ†ÐµÐ½Ðµ."], Lifestyle: ["Lifestyle", "Ð“Ð´Ðµ Ð¿Ð¾ÑƒÐ¶Ð¸Ð½Ð°Ñ‚ÑŒ, Ñ‡Ð°ÑÑ‚Ð½Ñ‹Ð¹ ÑÐµÑ€Ð²Ð¸Ñ, Ñ‚Ñ€ÐµÐ½Ð´Ñ‹ ÑÐµÐ·Ð¾Ð½Ð°."], Events: ["Events", "ÐœÐµÐ¶Ð´ÑƒÐ½Ð°Ñ€Ð¾Ð´Ð½Ñ‹Ðµ Ñ„Ð¾Ñ€ÑƒÐ¼Ñ‹, ÑÑ€Ð¼Ð°Ñ€ÐºÐ¸, Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ñ‹Ðµ Ð¼ÐµÑ€Ð¾Ð¿Ñ€Ð¸ÑÑ‚Ð¸Ñ."], Credit: ["Credit", "ÐšÑ€ÐµÐ´Ð¸Ñ‚ Ð¸ Lombard â€” Ð³Ð´Ðµ Ð¸ Ð¿Ð¾Ð´ ÐºÐ°ÐºÐ¸Ðµ ÑƒÑÐ»Ð¾Ð²Ð¸Ñ."] },
    partnerBankingTitle: "Ð’ÑÑ‘ Ð² Ð¾Ð´Ð½Ð¾Ð¼ Ð¼ÐµÑÑ‚Ðµ", partnerBankingDesc: "monaco-finance.com â€” Ð½Ð°Ñˆ Ð±ÐµÑÐ¿Ð»Ð°Ñ‚Ð½Ñ‹Ð¹ ÐºÐ»Ð¸ÐµÐ½Ñ‚ÑÐºÐ¸Ð¹ Ð¿Ð¾Ñ€Ñ‚Ð°Ð»: Ð²ÑÐµ ÑÑ‡ÐµÑ‚Ð°, Lombard-Ð»Ð¸Ð½Ð¸Ð¸ Ð¸ Ð¼Ð½Ð¾Ð³Ð¾Ðµ Ð´Ñ€ÑƒÐ³Ð¾Ðµ.", partnerBankingCta: "ÐŸÐµÑ€ÐµÐ¹Ñ‚Ð¸ Ð½Ð° monaco-finance.com",
    suggest: { null: ["Ð›ÑƒÑ‡ÑˆÐ¸Ðµ ÑŽÑ€Ð¸ÑÐ´Ð¸ÐºÑ†Ð¸Ð¸ Ð¿Ð¾Ð´ Ð¼Ð¾Ð¹ Ð¿Ñ€Ð¾Ñ„Ð¸Ð»ÑŒ", "Ð¡Ñ€Ð°Ð²Ð½Ð¸ ÐœÐ¾Ð½Ð°ÐºÐ¾ Ð¸ ÐžÐÐ­ Ð¿Ð¾ Ð½Ð°Ð»Ð¾Ð³Ð°Ð¼", "Ð¡ Ñ‡ÐµÐ³Ð¾ Ð½Ð°Ñ‡Ð°Ñ‚ÑŒ Ñ€ÐµÐ»Ð¾ÐºÐ°Ñ†Ð¸ÑŽ?"], Banking: ["Ð’ ÐºÐ°ÐºÐ¾Ð¼ Ð±Ð°Ð½ÐºÐµ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚ÑŒ ÑÑ‡Ñ‘Ñ‚?", "Ð¡Ñ€Ð°Ð²Ð½Ð¸ Ð¿Ñ€Ð¸Ð²Ð°Ñ‚Ð½Ñ‹Ðµ Ð±Ð°Ð½ÐºÐ¸ ÐœÐ¾Ð½Ð°ÐºÐ¾", "Ð§Ñ‚Ð¾ Ð½ÑƒÐ¶Ð½Ð¾ Ð´Ð»Ñ KYC?"], RealEstate: ["Ð§Ñ‚Ð¾ ÐºÑƒÐ¿Ð¸Ñ‚ÑŒ Ð¿Ð¾Ð´ Ð¼Ð¾Ð¹ Ð±ÑŽÐ´Ð¶ÐµÑ‚?", "ÐÑ€ÐµÐ½Ð´Ð° Ð¸Ð»Ð¸ Ð¿Ð¾ÐºÑƒÐ¿ÐºÐ°?", "Ð›ÑƒÑ‡ÑˆÐ¸Ðµ Ñ€Ð°Ð¹Ð¾Ð½Ñ‹ Ñƒ Ð¼Ð¾Ñ€Ñ"], Lifestyle: ["Ð›ÑƒÑ‡ÑˆÐ¸Ðµ Ñ€ÐµÑÑ‚Ð¾Ñ€Ð°Ð½Ñ‹ ÑÐµÐ·Ð¾Ð½Ð° 2026", "Ð§Ð°ÑÑ‚Ð½Ñ‹Ð¹ ÑÐµÑ€Ð²Ð¸Ñ Ð¸ ÐºÐ»ÑƒÐ±Ñ‹", "Ð§Ñ‚Ð¾ Ð½Ð¾Ð²Ð¾Ð³Ð¾ Ð½Ð° Ð›Ð°Ð·ÑƒÑ€Ð½Ð¾Ð¼ Ð±ÐµÑ€ÐµÐ³Ñƒ"], Events: ["Ð‘Ð»Ð¸Ð¶Ð°Ð¹ÑˆÐ¸Ðµ Ð·Ð°ÐºÑ€Ñ‹Ñ‚Ñ‹Ðµ Ñ„Ð¾Ñ€ÑƒÐ¼Ñ‹", "ÐšÐ°Ð»ÐµÐ½Ð´Ð°Ñ€ÑŒ ÑÑ€Ð¼Ð°Ñ€Ð¾Ðº Ð¸ Ð°ÑƒÐºÑ†Ð¸Ð¾Ð½Ð¾Ð²", "Ð“Ñ€Ð°Ð½-Ð¿Ñ€Ð¸ Ð¸ ÑÑ…Ñ‚-ÑˆÐ¾Ñƒ"], Credit: ["Ð£ÑÐ»Ð¾Ð²Ð¸Ñ Lombard Ð¿Ð¾Ð´ Ð¿Ð¾Ñ€Ñ‚Ñ„ÐµÐ»ÑŒ", "Ð“Ð´Ðµ Ð²Ð·ÑÑ‚ÑŒ ÐºÑ€ÐµÐ´Ð¸Ñ‚ in fine?", "Ð¡Ñ‚Ð°Ð²ÐºÐ¸ Ð¿Ð¾ ÑÑ‚Ñ€Ð°Ð½Ð°Ð¼"] },
    authModalTitle: "Ð’Ð¾Ð¹Ð´Ð¸Ñ‚Ðµ, Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð¿Ñ€Ð¾Ð´Ð¾Ð»Ð¶Ð¸Ñ‚ÑŒ",
    authModalSub: "Ð¡Ð¾Ð·Ð´Ð°Ð¹Ñ‚Ðµ Ð°ÐºÐºÐ°ÑƒÐ½Ñ‚ Ð¸Ð»Ð¸ Ð²Ð¾Ð¹Ð´Ð¸Ñ‚Ðµ, Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚ÑŒ Premium Ð¸ Ð¾Ñ‚ÑÐ»ÐµÐ¶Ð¸Ð²Ð°Ñ‚ÑŒ Ð¿Ð¾Ð´Ð¿Ð¸ÑÐºÑƒ.",
    emailPh: "name@email.com", passwordPh: "ÐŸÐ°Ñ€Ð¾Ð»ÑŒ",
    signIn: "Ð’Ð¾Ð¹Ñ‚Ð¸", signUp: "Ð¡Ð¾Ð·Ð´Ð°Ñ‚ÑŒ Ð°ÐºÐºÐ°ÑƒÐ½Ñ‚ Ð¸ Ð¿Ñ€Ð¾Ð´Ð¾Ð»Ð¶Ð¸Ñ‚ÑŒ",
    newHere: "Ð’Ð¿ÐµÑ€Ð²Ñ‹Ðµ Ð·Ð´ÐµÑÑŒ?", createAcc: "Ð¡Ð¾Ð·Ð´Ð°Ñ‚ÑŒ Ð°ÐºÐºÐ°ÑƒÐ½Ñ‚", haveAcc: "Ð£Ð¶Ðµ ÐµÑÑ‚ÑŒ Ð°ÐºÐºÐ°ÑƒÐ½Ñ‚?", toSignIn: "Ð’Ð¾Ð¹Ñ‚Ð¸",
    authErr: "Ð§Ñ‚Ð¾-Ñ‚Ð¾ Ð¿Ð¾ÑˆÐ»Ð¾ Ð½Ðµ Ñ‚Ð°Ðº. ÐŸÑ€Ð¾Ð²ÐµÑ€ÑŒÑ‚Ðµ email Ð¸ Ð¿Ð°Ñ€Ð¾Ð»ÑŒ.",
    authCheckEmail: "ÐŸÑ€Ð¾Ð²ÐµÑ€ÑŒÑ‚Ðµ Ð¿Ð¾Ñ‡Ñ‚Ñƒ, Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ñ‚ÑŒ Ð°ÐºÐºÐ°ÑƒÐ½Ñ‚, Ð·Ð°Ñ‚ÐµÐ¼ Ð²Ð¾Ð¹Ð´Ð¸Ñ‚Ðµ.",
    signingIn: "Ð’Ñ…Ð¾Ð´â€¦", signingUp: "Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¸Ðµ Ð°ÐºÐºÐ°ÑƒÐ½Ñ‚Ð°â€¦",
    signOut: "Ð’Ñ‹Ð¹Ñ‚Ð¸",
  },
};

/* ===================== KNOWLEDGE + PROMPTS ===================== */
const KB = `
0% income tax: UAE, Qatar, Monaco (NOT for French citizens â€” 1963 treaty), Bahrain, Bahamas, Cayman.
Territorial (foreign income untaxed): Singapore, Hong Kong, Panama, Georgia, Costa Rica, Malaysia, Thailand.
Lump-sum: Italy â‚¬300,000/yr from 2026 (family +â‚¬50K, 15 yrs); Switzerland forfait; Greece â‚¬100,000/yr.
Low/special: Andorra ~10%, Bulgaria 10%, Cyprus non-dom, Malta non-dom.
Closed/narrowed: UK non-dom abolished (2025); Portugal NHR closed (narrower IFICI successor).
High tax (where people leave from): France, Germany, UK, Canada, Scandinavia.
`;

const JLOGIC = `Jurisdiction coverage is OPEN â€” consider ANY relevant jurisdiction worldwide; the knowledge above is a starting set, not a limit. Match the destination to the client's CITIZENSHIP and constraints, never one-size-fits-all:
- French nationals: Monaco does NOT remove French income tax (the 1963 Franceâ€“Monaco treaty taxes French citizens resident in Monaco as if French residents) â€” never propose Monaco to them.
- Wants to stay in the EU: consider Italy (lump-sum flat tax), Portugal, Greece, Cyprus, Malta.
- Open to leaving the EU: consider 0%/territorial or more exotic options (UAE, Costa Rica, Caribbean, Singapore/Hong Kong).
MFI has the deepest expertise and relationships in Monaco, UAE, Qatar, Singapore, Luxembourg, Switzerland, Liechtenstein and Andorra â€” give these priority when they genuinely fit, but never force them.`;

const FUTURE_SYSTEM = `You are Montaureo, a life architect for wealthy international families. You help make a LIFE DECISION, not pick a country.
Knowledge (current 2026):${KB}

The client thinks not "where to move" but "what do I lose if I stay". Build TWO FUTURES to 2036:
- STAY â€” the client stays in the current country;
- MOVE â€” the client moves to the ONE best country for their profile.
Compare them and show the difference. Warm, personal, honest tone.

${JLOGIC}

First â€” a cinematic scene of the MOVE future: NOT the country first, but a MOMENT of life (morning, children, school, airport, capital preserved vs the STAY scenario, weather). 4-6 short second-person sentences. The country is revealed in a separate field, not in the text.
Future Confidence â€” an integer 0-100: how well the MOVE scenario matches the client's PRIORITIES.

All amounts are illustrative estimates under assumptions, not a verdict on a country and not advice.

Return ONLY clean JSON, no markdown:
{"scene":{"month":"<Month 2036>","lines":["â€¦","â€¦","â€¦","â€¦","â€¦"],"country":"<MOVE country>"},
 "confidence":94,
 "stay":{"country":"<current country>","tax":"short","capital2036":"â‚¬X.XM","school":"short","climate":"short"},
 "move":{"country":"<MOVE country>","tax":"short","capital2036":"â‚¬X.XM","school":"short","climate":"short"},
 "difference":["â‚¬X.XM saved","hours/yr saved","lower tax exposure","safer"],
 "assumptions":"1 line of assumptions",
 "disclaimer":"1 line: illustrative, not advice, confirm with an advisor"}
Keep values short.`;

const CONCIERGE_SYSTEM = `You are Velvet Concierge of the Montaureo platform: a private AI concierge for VIP clients with significant capital.
Jurisdiction coverage is open â€” you advise on any relevant jurisdiction worldwide.
Tone: discreet, precise, numbers first, never pushy.
Knowledge (current 2026):${KB}

${JLOGIC}

Agents (pick the right one): Banking, Credit, RealEstate, Lifestyle, Events, KYC, Wealth.

THE CLIENT PROFILE IS ALREADY KNOWN (see the dynamic block).
NEVER re-ask anything already in the profile (capital, liquid assets, family, country, goals, interests).
Rely on the profile and get to the point â€” e.g. "Given your profileâ€¦".
When discussing credit, Lombard lending, or banking thresholds, reference the client's LIQUID assets specifically, not total wealth â€” total wealth may include illiquid real estate or business equity that cannot be pledged or drawn against.

CRITICAL KYC RULE:
For account-opening questions, give a clear list of required documents (passport, proof of address, source of funds, etc.). BUT:
- NEVER ask the client to upload, send or paste documents;
- NEVER offer to check, verify or analyze their documents;
- direct them to submit documents directly to the bank or to their MFI advisor.
You provide ONLY information about requirements; you do not process documents.

FORMAT â€” return ONLY clean JSON, no markdown:
{"agent":"Banking|Credit|RealEstate|Lifestyle|Events|KYC|Wealth",
 "text":"1-3 sentence answer",
 "card": null | {"title":"...","rows":[{"primary":"...","secondary":"...","meta":"...","accent":true|false}]}}
Use a card for lists, comparisons and checklists (3-5 rows); otherwise card=null.`;

/* ===================== PERSONA â†’ MODEL MAPPING ===================== */
const PERSONA_MODEL = {
  Kate: "claude",
  Jun: "qwen-plus",
  Emily: "mistral-medium-2508",
};
const PERSONAS = ["Kate", "Jun", "Emily"];

/* ===================== HELPERS ===================== */
const buildProfileText = (form, matters) => {
  const v = T.en.v;
  return `age ${v[form.age]}, total wealth ${v[form.capital]}, liquid assets ${v[form.liquid]}, income ${v[form.income]}/yr, ${v[form.family]}, citizenship ${v[form.citizen]}, currently lives in ${v[form.from]}, priorities: ${(matters || []).map((m) => v[m]).join(", ") || "family & life"}`;
};

async function designFuture(profile, langName, model = "claude") {
  const langLine = `\n\nRespond entirely in ${langName}. All JSON string values must be written in ${langName}.`;
  try {
    const r = await fetch("/api/future", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile, lang: langName, model }) });
    if (r.ok) { const d = await r.json(); if (d && (d.move || d.scene)) return d; }
    throw new Error("no-backend");
  } catch {
    // Fallback: direct calls (dev/preview only â€” real traffic should always hit /api/future)
    if (model === "qwen-plus") {
      const res = await fetch("https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "qwen-plus", max_tokens: 2048, messages: [{ role: "system", content: FUTURE_SYSTEM + langLine }, { role: "user", content: profile }] }),
      });
      if (!res.ok) throw new Error("api");
      const data = await res.json();
      const raw = data.choices[0].message.content.trim();
      return JSON.parse(raw.replace(/```json|```/g, "").trim());
    } else if (model === "mistral-medium-2508") {
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "mistral-medium-2508", max_tokens: 2048, messages: [{ role: "system", content: FUTURE_SYSTEM + langLine }, { role: "user", content: profile }] }),
      });
      if (!res.ok) throw new Error("api");
      const data = await res.json();
      const raw = data.choices[0].message.content.trim();
      return JSON.parse(raw.replace(/```json|```/g, "").trim());
    } else {
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
}

async function askConcierge({ profileText, persona, focus, moveCountry, messages, langName }) {
  const model = PERSONA_MODEL[persona] || "claude";
  const personaTone = persona === "Kate" ? "warm, attentive" : persona === "Jun" ? "fast, direct, to the point" : "sharp, analytical, structured";
  const dynamic = `Client profile: ${profileText}.${moveCountry ? ` The client is considering moving to ${moveCountry}.` : ""}\nService persona: ${persona} (${personaTone}).${focus ? `\nCurrent focus: ${focus} â€” act as this agent.` : ""}\nDefault response language: ${langName}, unless the client's last message is clearly in another language.`;
  try {
    const r = await fetch("/api/concierge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profileText, persona, focus, moveCountry, messages, lang: langName, model }) });
    if (r.ok) { const d = await r.json(); if (d && d.text) return d; }
    throw new Error("no-backend");
  } catch {
    if (model === "qwen-plus") {
      const res = await fetch("https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "qwen-plus", max_tokens: 1024, messages: [{ role: "system", content: CONCIERGE_SYSTEM + "\n\n" + dynamic }, ...messages] }),
      });
      if (!res.ok) throw new Error("api");
      const data = await res.json();
      const raw = data.choices[0].message.content.trim();
      try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
      catch { return { agent: "Velvet", text: raw, card: null }; }
    } else if (model === "mistral-medium-2508") {
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "mistral-medium-2508", max_tokens: 1024, messages: [{ role: "system", content: CONCIERGE_SYSTEM + "\n\n" + dynamic }, ...messages] }),
      });
      if (!res.ok) throw new Error("api");
      const data = await res.json();
      const raw = data.choices[0].message.content.trim();
      try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
      catch { return { agent: "Velvet", text: raw, card: null }; }
    } else {
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
const SECTIONS = [["future", Compass], ["concierge", Sparkles], ["banking", Landmark], ["realestate", Building2], ["lifestyle", Heart], ["events", Calendar], ["credit", CreditCard], ["profile", User]];
const FOCUS = { banking: "Banking", realestate: "RealEstate", lifestyle: "Lifestyle", events: "Events", credit: "Credit" };
const FIELDS = [["age", ["a30", "a40", "a50", "a60"]], ["capital", ["c1", "c2", "c3", "c4", "c5", "c6"]], ["liquid", ["l1", "l2", "l3", "l4", "l5"]], ["income", ["i1", "i2", "i3", "i4"]], ["family", ["fSingle", "fCouple", "fKids"]], ["citizen", ["zEU", "zUK", "zNA", "zOther"]], ["from", ["pOther", "pMC", "pCH", "pAE", "pLU", "pLI", "pAD", "pSG", "pFR", "pUK", "pDE"]]];
const MATTER_KEYS = ["kids", "safety", "business", "sea", "taxes", "climate"];

/* ===================== APP ===================== */
export default function MontaureoPlatform() {
  const [lang, setLang] = useState("en");
  const [authed, setAuthed] = useState(false); // local "entered the app" flag â€” no login required for this

  // ---- Supabase session (only relevant once the user reaches the paywall) ----
  const [session, setSession] = useState(null);
  const [plan, setPlan] = useState("free");

  // ---- Auth modal state (shown only at paywall) ----
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authErr, setAuthErr] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [pendingStripeUrl, setPendingStripeUrl] = useState(null); // where to send the user after successful auth

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

  const fetchPlan = async (userId) => {
    try {
      const { data, error } = await supabase.from("profiles").select("plan").eq("id", userId).single();
      if (!error && data) setPlan(data.plan || "free");
    } catch { /* fail silently, stays free */ }
  };

  // ---- Passively check for an existing Supabase session (does NOT block the free flow) ----
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchPlan(session.user.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) fetchPlan(newSession.user.id);
      else setPlan("free");
    });
    return () => listener?.subscription?.unsubscribe();
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
      setChat([...next, { role: "assistant", content: r.text || "â€¦", card: r.card || null, agent: r.agent }]);
    } catch {
      setChat([...next, { role: "assistant", content: "â€¦", card: null }]);
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

  // ---- Called when user clicks Subscribe / one-time / Private on the paywall ----
  const requestPaidAccess = (stripeUrl) => {
    if (session) {
      // already logged in â€” go straight to Stripe
      window.location.href = stripeUrl;
      return;
    }
    setPendingStripeUrl(stripeUrl);
    setAuthErr(""); setAuthMsg("");
    setAuthModalOpen(true);
  };

  const handleModalSignIn = async () => {
    setAuthErr(""); setAuthMsg(""); setAuthBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail.trim(), password: authPassword });
    setAuthBusy(false);
    if (error) { setAuthErr(t.authErr); return; }
    setAuthModalOpen(false);
    if (pendingStripeUrl) window.location.href = pendingStripeUrl;
  };

  const handleModalSignUp = async () => {
    setAuthErr(""); setAuthMsg(""); setAuthBusy(true);
    const { error } = await supabase.auth.signUp({ email: authEmail.trim(), password: authPassword });
    setAuthBusy(false);
    if (error) { setAuthErr(t.authErr); return; }
    setAuthMsg(t.authCheckEmail);
    // Note: if email confirmation is required, the user must confirm before their session is active.
    // If confirmation is disabled in Supabase, onAuthStateChange will fire immediately and we can redirect.
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const Chips = ({ fieldKey, opts }) => (
    <div>
      <div style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: C.gold, marginBottom: 9 }}>{t.f[fieldKey]}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {opts.map((o) => { const on = form[fieldKey] === o; return <button key={o} onClick={() => setF(fieldKey, o)} style={{ cursor: "pointer", border: `1px solid ${on ? C.gold : C.line}`, background: on ? "rgba(198,163,90,0.12)" : "transparent", color: on ? C.snow : C.mist, padding: "9px 14px", borderRadius: 99, fontSize: 13, transition: "all .15s" }}>{v(o)}</button>; })}
      </div>
    </div>
  );
  const AuthBtn = ({ icon, children, primary, onClick }) => (
    <button onClick={onClick} className="auth-btn" style={{ cursor: "pointer", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px", borderRadius: 12, fontSize: 14.5, fontWeight: 600, border: primary ? "none" : `1px solid ${C.line}`, color: primary ? "#1A1408" : C.snow, background: primary ? `linear-gradient(140deg, ${C.goldHi}, ${C.gold})` : "rgba(255,255,255,0.03)", position: "relative" }}>
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

  /* ===================== LANDING (no login required) ===================== */
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
              <div style={{ fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: C.gold, marginTop: 12 }}>â€” Montaureo</div>
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
              <Btn onClick={enter}>{t.startFree} <ArrowRight size={18} strokeWidth={2.4} /></Btn>
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
          {session && (
            <button onClick={handleSignOut} style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: `1px solid ${C.line}`, background: "transparent", color: C.mist, borderRadius: 11, padding: "10px", fontSize: 12.5 }}>
              <LogOut size={13} /> {t.signOut}
            </button>
          )}
        </aside>

        {/* ===== MAIN ===== */}
        <main style={{ flex: 1, minWidth: 0, position: "relative", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, padding: "16px 22px 0" }}>
            {langSwitch}
            <button onClick={() => setSection("profile")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 7, border: `1px solid ${C.line}`, background: "rgba(255,255,255,0.02)", color: C.snow, borderRadius: 99, padding: "6px 12px", fontSize: 12.5 }}>
              <User size={13} color={C.gold} /> {v(form.from)} Â· <span style={{ color: plan === "free" ? C.mist : C.goldHi, fontWeight: plan === "free" ? 400 : 600 }}>{PLAN_LABEL[plan]}</span>
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
                              <div style={{ fontSize: 13.5, color: isMove && l === t.cap2036 ? C.goldHi : C.snow, fontWeight: l === t.cap2036 ? 600 : 400, marginTop: 2 }}>{val || "â€”"}</div>
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
                  <button onClick={() => requestPaidAccess("https://buy.stripe.com/plink_1TomhxIRsiHdRprO1oZrxcbN")} className="mt-cta" style={{ marginTop: 18, cursor: "pointer", border: "none", borderRadius: 12, padding: "13px", fontSize: 14.5, fontWeight: 700, color: "#1A1408", background: `linear-gradient(140deg, ${C.goldHi}, ${C.gold})` }}>{t.btnSub}</button>
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
                    {PERSONAS.map((p) => { const on = persona === p; return (
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
                    {m.role === "assistant" && <div style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.gold, marginBottom: 6 }}>{persona}{m.agent && m.agent !== "Velvet" ? ` Â· ${m.agent}` : ""}</div>}
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
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }} placeholder={`${t.askPlaceholder} ${persona}â€¦`} style={{ flex: 1, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 13, padding: "13px 16px", fontSize: 14.5, color: C.snow, fontFamily: "Inter, sans-serif", outline: "none" }} />
                  <button onClick={() => sendChat()} disabled={chatBusy || !chatInput.trim()} style={{ cursor: chatBusy || !chatInput.trim() ? "default" : "pointer", border: "none", borderRadius: 13, width: 48, height: 48, display: "grid", placeItems: "center", flexShrink: 0, color: "#1A1408", background: chatInput.trim() ? `linear-gradient(140deg, ${C.goldHi}, ${C.gold})` : "rgba(198,163,90,0.25)" }}><Send size={18} strokeWidth={2.2} /></button>
                </div>
                <div style={{ fontSize: 10.5, color: C.faint, marginTop: 9, textAlign: "center" }}>{t.cFooter}</div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===== AUTH MODAL â€” only shown when clicking Subscribe on the paywall ===== */}
      {authModalOpen && (
        <div
          onClick={() => setAuthModalOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(5,5,7,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18, backdropFilter: "blur(3px)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-up"
            style={{ width: "100%", maxWidth: 420, borderRadius: 20, border: `1px solid rgba(198,163,90,0.35)`, background: `linear-gradient(180deg, ${C.panelHi}, ${C.panel})`, padding: "26px 24px", boxShadow: "0 30px 90px rgba(0,0,0,0.6)", position: "relative" }}
          >
            <button onClick={() => setAuthModalOpen(false)} style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", cursor: "pointer", color: C.mist }}>
              <X size={18} />
            </button>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 21, color: C.snow, marginBottom: 6 }}>{t.authModalTitle}</div>
            <div style={{ fontSize: 12.5, color: C.mist, marginBottom: 18, lineHeight: 1.5 }}>{t.authModalSub}</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder={t.emailPh}
                style={{ width: "100%", background: C.card, border: `1px solid ${C.line}`, borderRadius: 11, padding: "13px 14px", fontSize: 14.5, color: C.snow, fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box" }}
              />
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder={t.passwordPh}
                style={{ width: "100%", background: C.card, border: `1px solid ${C.line}`, borderRadius: 11, padding: "13px 14px", fontSize: 14.5, color: C.snow, fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box" }}
              />

              {authErr && <div style={{ fontSize: 12, color: "#E08A8A" }}>{authErr}</div>}
              {authMsg && <div style={{ fontSize: 12, color: C.green }}>{authMsg}</div>}

              {authMode === "signin" ? (
                <Btn onClick={handleModalSignIn} disabled={authBusy || !authEmail.trim() || !authPassword}>
                  {authBusy ? t.signingIn : t.signIn}
                </Btn>
              ) : (
                <Btn onClick={handleModalSignUp} disabled={authBusy || !authEmail.trim() || !authPassword}>
                  {authBusy ? t.signingUp : t.signUp}
                </Btn>
              )}
            </div>

            <div style={{ textAlign: "center", fontSize: 13, color: C.mist, marginTop: 16 }}>
              {authMode === "signin" ? (
                <>{t.newHere} <span className="link" onClick={() => { setAuthMode("signup"); setAuthErr(""); setAuthMsg(""); }} style={{ color: C.gold, cursor: "pointer", fontWeight: 500 }}>{t.createAcc}</span></>
              ) : (
                <>{t.haveAcc} <span className="link" onClick={() => { setAuthMode("signin"); setAuthErr(""); setAuthMsg(""); }} style={{ color: C.gold, cursor: "pointer", fontWeight: 500 }}>{t.toSignIn}</span></>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== LEAD MODAL â€” Private Consultation ===== */}
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
  
   
