/**
 * UI strings — site chrome, navigation, form labels only.
 * All page CONTENT lives in src/content/pages/ (migrated verbatim from the
 * original site); nothing user-facing here is invented copy beyond labels.
 */
export const languages = {
  zh: "繁體中文",
  en: "English",
} as const;

export type Lang = keyof typeof languages;
export const defaultLang: Lang = "zh";
export const allLocales: Lang[] = ["zh", "en"];

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

    "footer.copyright": "© {year} S.O.W. - Serving Others Worldwide. 保留所有權利。",
    "footer.tagline": "用實際行動,讓最需要幫助的人感受到上帝的愛。",
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

    "footer.copyright": "© {year} S.O.W. - Serving Others Worldwide. All rights reserved.",
    "footer.tagline": "Practical action so the world feels the love of God.",
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UIKey = keyof (typeof ui)[typeof defaultLang];

export function t(lang: Lang, key: UIKey): string {
  return (
    (ui[lang] as Record<string, string>)[key] ??
    (ui[defaultLang] as Record<string, string>)[key] ??
    key
  );
}

export function tf(lang: Lang, key: UIKey, vars: Record<string, string | number>): string {
  let s = t(lang, key);
  for (const [k, v] of Object.entries(vars)) {
    s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}
