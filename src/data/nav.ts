import type { Lang } from "@i18n/ui";

export interface NavLink {
  /** UI key from i18n/ui.ts */
  labelKey: string;
  /** Relative path without lang prefix; will be prefixed with /{lang}/ */
  href: string;
  /** Optional children */
  children?: NavLink[];
}

/**
 * Top-level navigation. Mirrors the legacy IA but normalised to clean URLs.
 */
export const nav: NavLink[] = [
  { labelKey: "nav.home", href: "/" },
  {
    labelKey: "nav.about",
    href: "/about",
    children: [
      { labelKey: "nav.about.org", href: "/about/org" },
      { labelKey: "nav.about.directors", href: "/about/directors" },
    ],
  },
  {
    labelKey: "nav.programs",
    href: "/programs",
    children: [
      { labelKey: "nav.programs.senior_care", href: "/programs/senior-care" },
      { labelKey: "nav.programs.disaster_relief", href: "/programs/disaster-relief" },
      { labelKey: "nav.programs.poverty_relief", href: "/programs/poverty-relief" },
      { labelKey: "nav.programs.scholarship", href: "/programs/scholarship" },
      { labelKey: "nav.programs.pandemic_response", href: "/programs/pandemic-response" },
    ],
  },
  {
    labelKey: "nav.tours",
    href: "/tours",
    children: [
      { labelKey: "nav.tours.holy_land", href: "/tours/holy-land" },
      { labelKey: "nav.tours.ark", href: "/tours/ark" },
    ],
  },
  { labelKey: "nav.donate", href: "/donate" },
  { labelKey: "nav.contact", href: "/contact" },
];

export function localizedHref(lang: Lang, href: string): string {
  if (href === "/") return `/${lang}`;
  return `/${lang}${href}`;
}
