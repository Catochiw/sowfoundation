/**
 * Homepage slider entries.
 * Each slide links to a destination (typically a /programs/* or /tours/* page).
 * Both zh and en variants are supported; if a locale-specific entry is missing,
 * the default (zh) is used.
 */
export interface Slide {
  /** Image path under /public */
  image: string;
  /** Caption (zh) */
  caption_zh: string;
  /** Caption (en) */
  caption_en: string;
  /** Slug part without lang prefix, e.g. "/tours/2026-greece-turkey" */
  href: string;
}

export const slides: Slide[] = [
  {
    image: "/images/tours/2026-greece-turkey-banner.jpg",
    caption_zh: "2026 拔摩島・啟示錄與保羅腳蹤 — 希臘、土耳其、聖托里尼 13 天",
    caption_en: "2026 Patmos, Revelation & Paul's Footsteps — Greece, Turkey, Santorini",
    href: "/tours/2026-greece-turkey",
  },
  {
    image: "/images/20230620/20230620001047_36094.jpg",
    caption_zh: "聖地旅遊團",
    caption_en: "Holy Land Tour",
    href: "/tours/holy-land",
  },
  {
    image: "/images/20220318/20220318213429_18790.jpg",
    caption_zh: "賑災救援 — 烏克蘭難民支援",
    caption_en: "Disaster Relief — Ukraine refugee support",
    href: "/programs/disaster-relief",
  },
  {
    image: "/images/20190417/20190417223706_92111.jpg",
    caption_zh: "貧困資助 — 在世界最需要的角落",
    caption_en: "Poverty relief in the places most in need",
    href: "/programs/poverty-relief",
  },
  {
    image: "/images/20190417/20190417223819_24942.jpg",
    caption_zh: "愛心助學 — 一對一資助受助學生",
    caption_en: "Scholarship — one-to-one student sponsorship",
    href: "/programs/scholarship",
  },
  {
    image: "/images/20190417/20190417223833_49761.jpg",
    caption_zh: "長者關顧 — 灣區家居免費維修",
    caption_en: "Senior Care — free home repairs in the Bay Area",
    href: "/programs/senior-care",
  },
];
