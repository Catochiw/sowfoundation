import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * One content collection: `pages`. Every page is a Markdown file under
 * src/content/pages/{zh,en}/ and is routed by its `group`:
 *
 *   home      → /{lang}            (homepage body)
 *   about     → /{lang}/about/{slug}
 *   programs  → /{lang}/programs/{slug}
 *   tours     → /{lang}/tours/{slug}
 *   reports   → /{lang}/reports/{slug}
 *   donation  → /{lang}/donate
 *
 * Content is migrated verbatim from the legacy `sow_page` MySQL table;
 * see scripts/verify_content.py for the faithfulness check.
 */
const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    group: z.enum(["home", "about", "programs", "tours", "reports", "donation"]),
    order: z.number().default(0),
    banner: z.string().optional(),
    summary: z.string().optional(),
    lang: z.enum(["zh", "en"]),
    /** Unlisted page: adds robots noindex. Also add its path to UNLISTED in astro.config.mjs. */
    noindex: z.boolean().default(false),
    /** "rows" lays the page out as alternating media/text rows (see rehype-testimony-rows). */
    display: z.enum(["prose", "rows"]).default("prose"),
  }),
});

export const collections = { pages };
