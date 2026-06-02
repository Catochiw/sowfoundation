# Architecture — sowfoundation-v2

This is the complete map of the refactored site. Every file's purpose and
where every piece of content lives.

## High-level flow

```
                ┌──────────────────────────┐
                │  Markdown content        │
                │  + TypeScript data       │
                │  (you edit these)        │
                └──────────────┬───────────┘
                               │
                       astro build
                               │
                               ▼
       ┌───────────────────────────────────────────────┐
       │  Vercel deployment                            │
       │                                               │
       │  ┌──────────────────────┐  ┌──────────────┐  │
       │  │ Static HTML/CSS/JS   │  │ Serverless   │  │
       │  │ on edge CDN          │  │ function     │  │
       │  │                      │  │ /api/contact │  │
       │  │ /, /zh/*, /en/*      │  │ → Resend     │  │
       │  │ /images/*            │  │              │  │
       │  └──────────────────────┘  └──────────────┘  │
       └───────────────────────────────────────────────┘
                               │
                               ▼
                       sowfoundation.org
```

**Zero database. Zero PHP. Zero CMS.** Content is files. Updates = git push.
Vercel rebuilds in ~30s.

---

## Repo layout

```
sowfoundation-v2/
├── README.md                          ← quick-start
├── ARCHITECTURE.md                    ← this file
│
├── package.json                       ← deps + npm scripts
├── astro.config.mjs                   ← Astro 5 config (i18n, adapter, plugins)
├── tsconfig.json                      ← TS strict mode + path aliases (@/, @components/, …)
├── vercel.json                        ← 301 redirects from legacy URLs + cache headers
├── .env.example                       ← copy to .env, fill keys
├── .gitignore                         ← excludes node_modules, dist, data/internal, .env
│
├── public/                            ← copied verbatim to deploy root
│   ├── sow-logo.png                       (28×28 favicon + brand mark)
│   ├── robots.txt
│   └── images/                            (281 migrated content images)
│       ├── 2017xxxx/, 2018xxxx/, …            from legacy /attached/image/
│       ├── homepage/                          from legacy /demo/assets/images/homepage/
│       └── tours/                             2026 tour banner, brochure PDF, etc.
│
├── src/
│   │
│   ├── content.config.ts              ← Zod schemas for content collections
│   │
│   ├── content/                       ← THE EDITABLE CONTENT
│   │   ├── pages/
│   │   │   ├── zh/                    ← 繁體中文 versions of every page
│   │   │   │   ├── home.md
│   │   │   │   ├── org.md             (about > 組織)
│   │   │   │   ├── directors.md       (about > 董事會)
│   │   │   │   ├── senior-care.md     (programs > 長者關顧)
│   │   │   │   ├── disaster-relief.md (programs > 賑災救援)
│   │   │   │   ├── poverty-relief.md  (programs > 貧困資助)
│   │   │   │   ├── scholarship.md     (programs > 愛心助學)
│   │   │   │   ├── pandemic-response.md (programs > 全球抗疫)
│   │   │   │   ├── holy-land.md       (tours > 聖地旅遊)
│   │   │   │   ├── ark.md             (tours > 方舟之旅)
│   │   │   │   ├── longchuan.md       (reports > 龍川行記)
│   │   │   │   └── donation.md        (donate > 奉獻)
│   │   │   └── en/                    ← English mirror
│   │   ├── tours/
│   │   │   ├── zh/2026-greece-turkey.md
│   │   │   └── en/2026-greece-turkey.md
│   │   └── reports/                   ← (empty for now; add field reports here)
│   │
│   ├── data/                          ← runtime config (TypeScript, you edit)
│   │   ├── nav.ts                         site navigation tree
│   │   ├── slides.ts                      6 homepage carousel entries
│   │   └── donation.ts                    PayPal button IDs, check info, Schwab account, contact info
│   │
│   ├── i18n/
│   │   └── ui.ts                      ← All UI strings (chrome, buttons, form labels)
│   │                                     Indexed by locale; t(lang, key) lookup
│   │
│   ├── layouts/
│   │   └── Layout.astro               ← The single page chrome
│   │                                     <html>, <head> (OG, hreflang, canonical),
│   │                                     skip link, Header, <slot/>, Footer
│   │
│   ├── components/                    ← UI building blocks (Astro = zero JS by default)
│   │   ├── Header.astro                   nav bar + lang switcher + mobile drawer
│   │   ├── Footer.astro                   site links + contact info + tagline
│   │   ├── LangSwitcher.astro             pill toggle between /zh and /en
│   │   ├── PageHero.astro                 hero block (with optional banner image)
│   │   ├── HomeSlider.astro               Embla carousel for homepage
│   │   ├── ContactForm.astro              client-side form + fetch to /api/contact
│   │   └── DonateButtons.astro            PayPal forms + check info + Schwab info
│   │
│   ├── pages/                         ← URL ROUTES
│   │   ├── index.astro                    redirect "/" → "/zh"
│   │   ├── [lang]/
│   │   │   ├── index.astro                "/zh", "/en" — homepage
│   │   │   ├── about/
│   │   │   │   ├── index.astro            "/zh/about" — about index
│   │   │   │   └── [slug].astro           "/zh/about/org", "/zh/about/directors"
│   │   │   ├── programs/
│   │   │   │   ├── index.astro            "/zh/programs"
│   │   │   │   └── [slug].astro           "/zh/programs/senior-care", etc.
│   │   │   ├── tours/
│   │   │   │   ├── index.astro            "/zh/tours"
│   │   │   │   └── [slug].astro           dispatches to pages/group=tours OR tours collection
│   │   │   ├── reports/
│   │   │   │   └── [slug].astro           "/zh/reports/longchuan"
│   │   │   ├── donate.astro               "/zh/donate"
│   │   │   └── contact.astro              "/zh/contact"
│   │   └── api/
│   │       └── contact.ts             ← SSR endpoint: POST → Resend email
│   │                                     export const prerender = false
│   │
│   ├── styles/
│   │   └── global.css                 ← Tailwind v4 import + design tokens + .prose-content
│   │
│   └── env.d.ts                       ← type declarations for env vars + window globals
│
├── scripts/                           ← migration tools (one-shot, kept for re-runs)
│   ├── extract_churches.py                MySQL dump → CSV  (gitignored output)
│   ├── extract_pages.py                   MySQL dump → 24 .md files
│   └── clean_pages.py                     Strip Weebly HTML junk, emit clean Markdown
│
└── data/                              ← internal-only data (gitignored)
    └── internal/
        └── churches.csv                   551 churches with login/contact info
                                           (NOT public, NOT deployed)
```

---

## How each piece works

### 1 · Routing & i18n

Astro 5 has built-in i18n routing. Configured in `astro.config.mjs`:

```js
i18n: {
  locales: ["zh", "en"],
  defaultLocale: "zh",
  routing: { prefixDefaultLocale: true }
}
```

Every page lives under `src/pages/[lang]/*` and `getStaticPaths` returns the two
locales. The result: every URL is `/{zh|en}/{rest}`. Root `/` redirects to `/zh`.

`hreflang` alternates are emitted in `Layout.astro` so Google indexes both
languages correctly.

### 2 · Content collections

`src/content.config.ts` defines three Zod-validated collections:

- **pages** — long-form content (one .md per page × per language)
- **tours** — campaign-style entries with `dateRange`, `priceUSD`, `status`
- **reports** — blog-style field updates (currently empty, ready for use)

To add a page: drop a `.md` file in the right folder. The build picks it up.

### 3 · Data files (`src/data/`)

Things that aren't content but aren't UI either — site nav, slider entries,
PayPal button IDs, contact info. Lives in TypeScript because:
- compile-time type-checking
- you can `import` them in components
- comments + structure feel native

### 4 · UI strings (`src/i18n/ui.ts`)

A flat `{ zh: { key: "..." }, en: { key: "..." } }` map of every visible
string in the chrome. The `t(lang, key)` helper looks them up. Untranslated
keys fall back to `defaultLang`.

### 5 · Components are zero-JS by default

Every `.astro` component is server-rendered at build time. The only
client-side JS shipped:
- Header — mobile menu toggle (~10 lines)
- HomeSlider — Embla Carousel (~3KB minified)
- ContactForm — fetch + result rendering (~20 lines)
- DonateButtons — none (uses native `<form>` POST to PayPal)
- LangSwitcher — none (just `<a>` tags)
- Cloudflare Turnstile widget — loaded async from CF CDN

### 6 · Contact form pipeline

```
ContactForm.astro
   │
   │  on submit: e.preventDefault();
   │  fetch("/api/contact", { method: POST, body: FormData })
   ▼
src/pages/api/contact.ts        (Vercel serverless function)
   │
   │  zod validate → check honeypot → verify Turnstile token →
   │
   ▼
Resend API
   │
   │  send HTML+text email to CONTACT_TO (4 admin addresses)
   ▼
Inboxes of admins
```

`prerender = false` on the endpoint tells Astro to skip static generation
and let the Vercel adapter create a serverless function.

### 7 · Donation pipeline

```
DonateButtons.astro renders:
  ┌─ <form action="https://www.paypal.com/cgi-bin/webscr" method="POST">
  │    <input name="cmd" value="_s-xclick" />
  │    <input name="hosted_button_id" value="..." />
  │    <button>Donate via PayPal</button>
  │  </form>
  │
  ├─ Mail-in check info (static text)
  ├─ Charles Schwab brokerage account
  └─ 501(c)(3) tax-deductible note
```

No payment processing on our side. PayPal/Schwab handle it; we just embed
the entry points. Hosted button IDs verified from the legacy SQL dump.

### 8 · SEO

- `@astrojs/sitemap` auto-generates `/sitemap-index.xml` at build time
- `robots.txt` points to it
- Every page's `<head>` has: canonical, OpenGraph, Twitter cards, hreflang
  (zh-Hant, en, x-default)
- Old URLs (`/page/zz`, `/SOW_2026_Tour`, etc.) are 301-redirected in
  `vercel.json` so search rankings transfer

### 9 · Performance

- Static HTML/CSS/JS served from Vercel's edge CDN
- Images served with `Cache-Control: max-age=31536000, immutable`
  (URLs include version-y date subdir so cache busting is free)
- Astro `prefetch.prefetchAll: true` — links visible in viewport preload
- No JS framework runtime — only the small islands listed above

---

## Editing workflow (you, the maintainer)

| To change… | Edit… | Then… |
|---|---|---|
| Body of a page | `src/content/pages/{zh,en}/{slug}.md` | git push → auto-redeploy |
| Add new program/about/tour page | New `.md` + add nav entry | … |
| Homepage slider | `src/data/slides.ts` | … |
| Site navigation | `src/data/nav.ts` (+ matching strings in `i18n/ui.ts`) | … |
| Contact form recipients | `.env` → `CONTACT_TO` | Vercel env var update |
| PayPal button | `src/data/donation.ts` (just the ID) | … |
| Office address / phone / email | `src/data/donation.ts` → `contactInfo` | … |
| Translations | `src/i18n/ui.ts` | … |
| Design tokens (colors, fonts, spacing) | `src/styles/global.css` | … |

---

## What's deliberately NOT here (compared to legacy)

| Removed | Why |
|---|---|
| MySQL databases (×5) | No dynamic data needed |
| CodeIgniter framework | Replaced by Astro |
| `sow_church` table (~150 churches) | Was used by church-login feature — dead since launch |
| Project / needs / comments tables | Same — entire feature unused for years |
| Admin backend (`/admin/*`) | The dev is now the maintainer; edits via git |
| KindEditor / TinyMCE | No CMS = no editor needed |
| `/signup`, `/login`, `/reset` routes | No member system |
| Demo subdomain (`demo.sowfoundation.org`) | Was a duplicate of the live site |
| WordPress (`bsciixmy_WPXOV`) | Separate concern; if still in use, runs elsewhere |
| Weebly CSS / shortcode `[fixedimg ...]` | Replaced with proper Markdown + Apple-style design |
| All inline `style=""` and `class="wsite-*"` | Stripped during migration |
| MD5 password hashes | No accounts to protect |

---

## Deployment

```bash
# One-time: connect repo to Vercel
vercel link
# or push to GitHub and import via the Vercel dashboard

# Subsequent deploys: just push to main
git push origin main
```

Vercel will:
1. Run `npm install`
2. Run `npm run build`
3. Upload `/dist/*` to its edge CDN
4. Provision `/api/contact` as a serverless function
5. Apply the redirects from `vercel.json`
6. Invalidate the CDN

Total build time ≈ 30-60 seconds for this size.

DNS: point `sowfoundation.org` A record to Vercel (or use Cloudflare and
proxy). Vercel issues a Let's Encrypt cert automatically.
