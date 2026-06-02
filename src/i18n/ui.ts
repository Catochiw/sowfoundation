/**
 * UI strings — chrome, buttons, form labels.
 * Page content lives in src/content/pages/.
 */
export const languages = {
  zh: "繁體中文",
  en: "English",
} as const;

export type Lang = keyof typeof languages;
export const defaultLang: Lang = "zh";

export const ui = {
  zh: {
    "site.name": "樂助會",
    "site.tagline": "S.O.W. — Serving Others Worldwide",
    "site.description":
      "樂助會是一個位於北加州灣區的基督教非牟利機構，以實際行動服務有需要的人。",

    "nav.home": "首頁",
    "nav.about": "關於我們",
    "nav.about.org": "組織",
    "nav.about.directors": "董事會",
    "nav.programs": "事工",
    "nav.programs.senior_care": "長者關顧",
    "nav.programs.disaster_relief": "賑災救援",
    "nav.programs.poverty_relief": "貧困資助",
    "nav.programs.scholarship": "愛心助學",
    "nav.programs.pandemic_response": "全球抗疫",
    "nav.tours": "旅遊團",
    "nav.tours.holy_land": "聖地旅遊",
    "nav.tours.ark": "方舟之旅",
    "nav.reports": "事工報導",
    "nav.donate": "奉獻支持",
    "nav.contact": "聯絡我們",
    "nav.menu": "選單",
    "nav.close": "關閉",

    "home.hero.eyebrow": "S.O.W. · Serving Others Worldwide",
    "home.hero.title": "用實際的行動,\n讓世界感受神的愛。",
    "home.hero.subtitle":
      "樂助會自北加州灣區出發,藉著事工、項目與物資援助,服侍世界各地有經濟、身體、心靈需要的人。",
    "home.mission.eyebrow": "願景 · 使命",
    "home.mission.vision_title": "願景",
    "home.mission.vision_body": "用我們的行動,讓最需要幫助的人感受到上帝的愛。",
    "home.mission.mission_title": "使命",
    "home.mission.mission_body":
      "藉著計劃、項目與實際的援助,在全球範圍內服務社區,以滿足人們在經濟、身體、心靈各方面的需求。",
    "home.cta.donate": "立即奉獻",
    "home.cta.learn": "認識我們",

    "home.programs.title": "我們的事工",
    "home.programs.subtitle": "從家居維修到國際賑災,實際的關懷在每個有需要的角落延展。",

    "home.tours.title": "聖地與宣教之旅",
    "home.tours.subtitle": "走過聖經中的土地,讓信仰更真實。",

    "home.donate.title": "你的奉獻,改變一個生命",
    "home.donate.subtitle":
      "所有奉獻可開立抵稅收據。透過 PayPal 即時奉獻,或郵寄支票至我們的辦公地址。",

    "contact.title": "聯絡我們",
    "contact.intro": "歡迎透過下方表單與我們聯繫,我們會盡快回覆。",
    "contact.form.name": "姓名",
    "contact.form.email": "電郵",
    "contact.form.message": "訊息內容",
    "contact.form.submit": "送出",
    "contact.form.submitting": "傳送中…",
    "contact.form.success": "感謝你的訊息！我們會盡快回覆。",
    "contact.form.error": "傳送失敗,請稍後再試。",
    "contact.form.required": "此欄為必填",
    "contact.address": "辦公地址",
    "contact.phone": "電話",
    "contact.email": "電郵",

    "donate.title": "奉獻支持",
    "donate.intro":
      "你的每一份奉獻,都讓我們能延續事工。所有奉獻可開立 501(c)(3) 抵稅收據。",
    "donate.paypal.title": "線上奉獻 (PayPal)",
    "donate.paypal.general": "一般奉獻",
    "donate.paypal.scholarship": "愛心助學",
    "donate.paypal.button": "透過 PayPal 奉獻",
    "donate.check.title": "郵寄支票",
    "donate.check.payee": "支票抬頭",
    "donate.check.mail_to": "請寄往",
    "donate.stock.title": "股票/證券捐贈",
    "donate.stock.intro": "捐贈增值股票可獲全額抵稅,並免去資本利得稅。",
    "donate.stock.brokerage": "券商",
    "donate.stock.account": "賬戶號碼",
    "donate.stock.note": "DTC 編號與接收指示請聯繫我們索取。",
    "donate.tax.note": "樂助會為美國國稅局認可之 501(c)(3) 公益機構,奉獻可作為抵稅之用。",

    "footer.copyright": "© {year} S.O.W. - Serving Others Worldwide. 保留所有權利。",
    "footer.tagline": "用實際行動,讓最需要幫助的人感受到上帝的愛。",

    "lang.switch": "Language",
    "common.read_more": "了解更多",
    "common.back": "返回",
    "common.toc": "目錄",
  },
  en: {
    "site.name": "S.O.W.",
    "site.tagline": "Serving Others Worldwide",
    "site.description":
      "S.O.W. is a Christian nonprofit based in the SF Bay Area, serving people in need through practical action worldwide.",

    "nav.home": "Home",
    "nav.about": "About",
    "nav.about.org": "Organization",
    "nav.about.directors": "Directors",
    "nav.programs": "Programs",
    "nav.programs.senior_care": "Senior Care",
    "nav.programs.disaster_relief": "Disaster Relief",
    "nav.programs.poverty_relief": "Poverty Relief",
    "nav.programs.scholarship": "Scholarship",
    "nav.programs.pandemic_response": "Pandemic Response",
    "nav.tours": "Tours",
    "nav.tours.holy_land": "Holy Land Tour",
    "nav.tours.ark": "Ark Journey",
    "nav.reports": "Field Reports",
    "nav.donate": "Donate",
    "nav.contact": "Contact",
    "nav.menu": "Menu",
    "nav.close": "Close",

    "home.hero.eyebrow": "S.O.W. · Serving Others Worldwide",
    "home.hero.title": "Practical action.\nA world that feels God's love.",
    "home.hero.subtitle":
      "From the SF Bay Area to the world, S.O.W. meets economic, physical, and spiritual needs through programs, projects, and direct aid.",
    "home.mission.eyebrow": "Vision · Mission",
    "home.mission.vision_title": "Vision",
    "home.mission.vision_body":
      "That our action lets those most in need feel the love of God.",
    "home.mission.mission_title": "Mission",
    "home.mission.mission_body":
      "Through programs, projects and direct aid, we serve communities around the world — meeting needs of the body, mind and spirit.",
    "home.cta.donate": "Donate now",
    "home.cta.learn": "Learn about us",

    "home.programs.title": "Our programs",
    "home.programs.subtitle":
      "From home repairs for seniors to international disaster relief — care that meets people where they are.",

    "home.tours.title": "Holy Land & mission journeys",
    "home.tours.subtitle": "Walk where the Bible was written — make your faith tangible.",

    "home.donate.title": "Your gift, a changed life",
    "home.donate.subtitle":
      "All donations are tax-deductible. Give instantly via PayPal, or mail a check to our office.",

    "contact.title": "Contact us",
    "contact.intro": "Send us a message and we'll get back to you soon.",
    "contact.form.name": "Name",
    "contact.form.email": "Email",
    "contact.form.message": "Message",
    "contact.form.submit": "Send",
    "contact.form.submitting": "Sending…",
    "contact.form.success": "Thanks — we received your message and will reply soon.",
    "contact.form.error": "Couldn't send. Please try again in a moment.",
    "contact.form.required": "Required",
    "contact.address": "Office",
    "contact.phone": "Phone",
    "contact.email": "Email",

    "donate.title": "Donate",
    "donate.intro":
      "Every gift sustains the work. All donations are tax-deductible under our 501(c)(3) status.",
    "donate.paypal.title": "Give online (PayPal)",
    "donate.paypal.general": "General fund",
    "donate.paypal.scholarship": "Scholarship",
    "donate.paypal.button": "Donate with PayPal",
    "donate.check.title": "Mail a check",
    "donate.check.payee": "Payable to",
    "donate.check.mail_to": "Mail to",
    "donate.stock.title": "Stock / securities",
    "donate.stock.intro":
      "Gifting appreciated securities lets you deduct full fair market value and avoid capital-gains tax.",
    "donate.stock.brokerage": "Brokerage",
    "donate.stock.account": "Account number",
    "donate.stock.note": "Contact us for DTC number and transfer instructions.",
    "donate.tax.note":
      "S.O.W. is a 501(c)(3) tax-exempt charitable organization. Donations are tax-deductible to the fullest extent of the law.",

    "footer.copyright": "© {year} S.O.W. - Serving Others Worldwide. All rights reserved.",
    "footer.tagline": "Practical action so the world feels the love of God.",

    "lang.switch": "Language",
    "common.read_more": "Read more",
    "common.back": "Back",
    "common.toc": "Contents",
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UIKey = keyof (typeof ui)[typeof defaultLang];

export function t(lang: Lang, key: UIKey): string {
  return (ui[lang] as Record<string, string>)[key] ?? (ui[defaultLang] as Record<string, string>)[key] ?? key;
}

export function tf(lang: Lang, key: UIKey, vars: Record<string, string | number>): string {
  let s = t(lang, key);
  for (const [k, v] of Object.entries(vars)) {
    s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}

/** All known UI locales */
export const allLocales: Lang[] = ["zh", "en"];

/** Convert a path like "/zh/about/foo" into the equivalent path in another lang */
export function pathInLang(path: string, target: Lang): string {
  const stripped = path.replace(/^\/(zh|en)(\/|$)/, "/");
  return `/${target}${stripped === "/" ? "" : stripped}`.replace(/\/$/, "") || `/${target}`;
}
