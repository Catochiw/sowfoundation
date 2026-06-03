# Architecture — sowfoundation-v2

A static, bilingual site built with Astro 5. **Content is migrated verbatim**
from the legacy CodeIgniter/MySQL site; the design is a clean editorial system
built fresh. No database, no PHP, no CMS at runtime — pages are Markdown, built
to static HTML, served from Vercel's edge.

## Data flow

```
src/content/pages/*.md  +  src/data/*.ts        (you edit these)
            │
        astro build
            │
            ▼
   Vercel: static HTML/CSS/JS on the edge CDN
            +  one serverless function: /api/contact → Resend
            │
            ▼
        sowfoundation.org
```

## Repo layout

```
sowfoundation-v2/
├── astro.config.mjs            Astro config (i18n zh/en, Vercel adapter, sitemap)
├── content.config.ts (src/)    one Zod-validated collection: `pages`
├── vercel.json                 301s from legacy URLs + cache/security headers
├── tsconfig.json               strict TS + @/@components/@layouts/@data/@i18n aliases
│
├── public/
│   ├── favicon.ico             original SOW favicon
│   ├── sow-logo.png            horizontal wordmark (header, footer, hero)
│   ├── robots.txt
│   └── images/                 migrated image assets (from legacy /attached/)
│
├── src/
│   ├── content/pages/
│   │   ├── zh/                  12 pages, 繁體中文  (verbatim from DB)
│   │   └── en/                  12 pages, English   (verbatim from DB)
│   │        home · org · directors · senior-care · disaster-relief
│   │        · poverty-relief · scholarship · pandemic-response
│   │        · holy-land · ark · longchuan · donation
│   │
│   ├── data/
│   │   ├── nav.ts              navigation tree (label keys + hrefs)
│   │   └── site.ts             org contact info (footer + contact page)
│   │
│   ├── i18n/ui.ts              UI strings — chrome/nav/form labels ONLY (35 keys);
│   │                           no page content or marketing copy lives here
│   │
│   ├── layouts/Layout.astro    <head> (SEO, OG, hreflang, fonts), header, footer
│   │
│   ├── components/
│   │   ├── Header.astro        logo + nav + lang switcher + mobile drawer
│   │   ├── Footer.astro
│   │   ├── Hero.astro          homepage centered-logo hero
│   │   ├── PageHero.astro      inner-page hero (eyebrow + serif title + banner)
│   │   ├── ContactForm.astro   client fetch → /api/contact (+ Turnstile, honeypot)
│   │   └── LangSwitcher.astro  中 / EN toggle
│   │
│   ├── pages/                  ROUTES
│   │   ├── index.astro                      /            → redirect /zh
│   │   ├── [lang]/index.astro               /zh /en      homepage (renders home.md)
│   │   ├── [lang]/about/index.astro         /zh/about        (index-list)
│   │   ├── [lang]/about/[slug].astro        /zh/about/org …
│   │   ├── [lang]/programs/index.astro      /zh/programs     (index-list)
│   │   ├── [lang]/programs/[slug].astro     /zh/programs/senior-care …
│   │   ├── [lang]/tours/index.astro         /zh/tours        (index-list)
│   │   ├── [lang]/tours/[slug].astro        /zh/tours/holy-land, /ark
│   │   ├── [lang]/reports/[slug].astro      /zh/reports/longchuan
│   │   ├── [lang]/donate.astro              /zh/donate   (renders donation.md)
│   │   ├── [lang]/contact.astro             /zh/contact
│   │   └── api/contact.ts                   POST → Resend  (prerender = false)
│   │
│   └── styles/global.css       design tokens + base + component classes
│
├── scripts/                    one-shot migration & verification tooling
│   ├── extract_churches.py     DB dump → data/internal/churches.csv
│   ├── extract_pages.py        DB dump → content/pages/*.md (HTML→Markdown)
│   ├── clean_pages.py          strips legacy Weebly/CMS markup
│   ├── regenerate_bodies.py    restore a page body verbatim from the DB
│   ├── verify_content.py       diff every page vs the DB — faithfulness gate
│   └── serve.mjs               static preview server for the built site
│
└── data/internal/              PRIVATE, gitignored — churches.csv (≈550 rows)
```

## Key decisions

**One content collection.** Every page is a Markdown file under
`src/content/pages/{lang}/`, with a `group` in its frontmatter
(`home | about | programs | tours | reports | donation`). Routes filter the
collection by `group` + `lang`. There is no separate tours/reports collection.

**Content vs. design split.** Page wording is content (in `*.md`, migrated
verbatim, never paraphrased). Everything in `i18n/ui.ts`, `data/`, components and
CSS is presentation. `scripts/verify_content.py` reads the original MySQL dump,
normalises both sides to plain text, and confirms each page is character-identical
to the original (modulo intentional formatting-junk removal, which it reports).

**Design system.** `global.css` defines one token set —
`--color-ink / -2 / -3 / -4`, `--color-rule / -2`, `--color-canvas`,
`--color-paper`, `--color-brand / -2`, `--color-gold` — plus Source Serif 4 /
Noto Serif TC. Components (`.btn`, `.index-list`, `.prose-content`, `.eyebrow`,
`.read-more`) build on those. No legacy tokens or compatibility aliases remain.

**Donate.** The donate page renders the original `donation.md` verbatim. Its
PayPal hosted-button link is styled into a site-design button by a CSS rule on
`.prose-content a[href*="paypal.com"]` — no legacy PayPal button image.

**Contact.** `ContactForm.astro` POSTs to `/api/contact.ts` (the only
server-rendered route), which validates, checks a honeypot + Cloudflare
Turnstile, and emails the admin list via Resend.

## Editing cheatsheet

| To change… | Edit |
|---|---|
| Any page's words / images | `src/content/pages/{zh,en}/{slug}.md` |
| Add a page | new `.md` with the right `group` (+ a `nav.ts` entry if it needs a menu link) |
| Navigation menu | `src/data/nav.ts` (+ matching label in `i18n/ui.ts`) |
| Office address / phone / email | `src/data/site.ts` |
| Contact-form recipients | `.env` → `CONTACT_TO` |
| Colors / fonts / spacing | `src/styles/global.css` |
| UI labels / form text | `src/i18n/ui.ts` |

## Deployment

Push to `main`; Vercel runs `npm run build`, serves `.vercel/output` from the
edge, and provisions `/api/contact` as a serverless function. Legacy URLs
(`/page/{slug}`, `/SOW_2026_Tour`, …) 301 to their new homes via `vercel.json`.
