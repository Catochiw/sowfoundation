# S.O.W. Foundation — Website v2

Refactor of [sowfoundation.org](https://www.sowfoundation.org). Static, bilingual
(繁體中文 / English), deployed on Vercel.

All page **content** is migrated verbatim from the original site's database;
`scripts/verify_content.py` checks every page against the DB dump. The design is
the project's own editorial system — only presentation changed, not wording.

## Stack

- **Astro 5** + TypeScript (static output, Vercel adapter)
- **Tailwind CSS v4** + a small design system in `src/styles/global.css`
- **Resend** + **Cloudflare Turnstile** for the contact form
- Self-hosted webfonts: Source Serif 4 + Noto Serif TC

## Local dev

```bash
npm install
npm run dev        # http://localhost:4321  (needs Node 22 LTS)
npm run build      # static build → .vercel/output
npm run typecheck  # astro check
```

> Node 26 can't run `astro dev` (a rolldown/Node issue). Use Node 22, or
> `npm run build` + `node scripts/serve.mjs` to preview the built site.

## Required env vars (`.env`)

```
RESEND_API_KEY=re_xxx
CONTACT_TO=thomas.chan@sowfoundation.org,Beatrice.chan@sowfoundation.org,t80819@aol.com,anders@projectsatoz.com
CONTACT_FROM=no-reply@sowfoundation.org
PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
```

## Layout

```
src/
├── content/pages/{zh,en}/   # all page content (Markdown), routed by `group`
├── pages/                   # routes (Astro i18n: /zh, /en)
├── components/              # Header, Footer, Hero, PageHero, ContactForm, LangSwitcher
├── layouts/Layout.astro     # <head>, header, footer, SEO
├── data/                    # nav.ts (menu), site.ts (org contact info)
├── i18n/ui.ts               # UI strings (chrome/nav/form labels only)
└── styles/global.css        # design tokens + components
public/images/               # migrated image assets
scripts/                     # one-shot migration + verification tools
data/internal/               # PRIVATE, gitignored (church directory CSV)
```

## Editing content

Everything visitors read lives in `src/content/pages/{zh,en}/{slug}.md`. Edit the
Markdown, push to `main`, Vercel redeploys. The `group` in each file's frontmatter
decides its URL:

| group | URL |
|---|---|
| `home` | `/{lang}` |
| `about` | `/{lang}/about/{slug}` |
| `programs` | `/{lang}/programs/{slug}` |
| `tours` | `/{lang}/tours/{slug}` |
| `reports` | `/{lang}/reports/{slug}` |
| `donation` | `/{lang}/donate` |

Other knobs: navigation in `src/data/nav.ts`, office contact in `src/data/site.ts`,
colors/fonts in `src/styles/global.css`.

See `ARCHITECTURE.md` for the full picture.
