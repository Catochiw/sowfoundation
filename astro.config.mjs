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
