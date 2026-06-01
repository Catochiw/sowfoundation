# S.O.W. Foundation — Website v2

Refactored static site for [sowfoundation.org](https://www.sowfoundation.org).

## Stack

- **Astro 5** + TypeScript
- **Tailwind CSS v4**
- **Embla Carousel** for the homepage slider
- **Resend** for contact-form email
- **Cloudflare Turnstile** for spam protection
- Deployed on **Vercel**

## Local dev

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # Static build to ./dist
npm run preview    # Preview the build
```

## Required env vars (`.env`)

```
RESEND_API_KEY=re_xxx
CONTACT_TO=thomas.chan@sowfoundation.org,Beatrice.chan@sowfoundation.org,t80819@aol.com,anders@projectsatoz.com
CONTACT_FROM=no-reply@sowfoundation.org
TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
```

## Project layout

```
src/
├── content/       # Markdown content (pages, tours, reports) — both zh & en
├── components/    # .astro components
├── data/          # Slider, nav, donation config (TS)
├── i18n/          # UI strings
├── layouts/       # Page layout
├── pages/         # Routes — uses Astro i18n routing
└── styles/        # Global CSS
public/
└── images/        # Migrated from legacy /attached/

data/internal/     # PRIVATE — not committed (church directory CSV etc.)
```

## Editing content

All public content lives in `src/content/`. Edit the Markdown file, push to main, Vercel auto-redeploys.

- Pages: `src/content/pages/{zh,en}/{slug}.md`
- Tours: `src/content/tours/{zh,en}/{slug}.md`
- Reports: `src/content/reports/{zh,en}/{slug}.md`
- Slider: `src/data/slides.ts`
- Donation buttons: `src/data/donation.ts`

## Migration history

This v2 replaces a CodeIgniter 3 / PHP 7.4 / MySQL stack that had grown messy over ~8 years. Dead features (church membership system, project/needs/comments, admin backend) were removed. Content was migrated from the `sow_page` table on 2026-06-01.
