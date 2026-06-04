// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

const SITE = "https://www.sowfoundation.org";

export default defineConfig({
  site: SITE,
  // 'static' with per-route opt-in to SSR (the /api/contact endpoint).
  // The Vercel adapter handles both: prerendered pages become static assets,
  // and `prerender = false` routes become serverless functions.
  output: "static",
  adapter: vercel({
    webAnalytics: { enabled: true },
    imageService: true,
  }),
  // Disable Astro's CSRF origin check. Behind Vercel's proxy the request origin
  // Astro computes doesn't match the public Origin header, so the default
  // checkOrigin rejects EVERY form POST — including the legitimate contact form —
  // with "Cross-site POST form submissions are forbidden". /api/contact is a
  // public, unauthenticated endpoint (no session/cookies to forge), so CSRF
  // checking buys no real protection here; spam is handled by the honeypot
  // (and optional Turnstile). See ContactForm.astro / src/pages/api/contact.ts.
  security: {
    checkOrigin: false,
  },
  i18n: {
    locales: ["zh", "en"],
    defaultLocale: "zh",
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "zh",
        locales: { zh: "zh-Hant", en: "en-US" },
      },
    }),
  ],
  vite: {
    // Cast around a vite version-mismatch between Astro's bundled vite
    // and @tailwindcss/vite's peer; runtime is fine.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
  build: {
    inlineStylesheets: "auto",
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
});
