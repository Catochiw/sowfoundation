import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Content collections.
 *
 * - `pages`   — long-form static content (about / programs / tours / reports / donation / home).
 *               Migrated from the legacy `sow_page` MySQL table.
 * - `tours`   — individual tour campaigns (dated, priced, status-tracked).
 * - `reports` — field reports / blog-style updates from sponsored areas.
 */

const pageGroup = z.enum(["home", "about", "programs", "tours", "reports", "donation"]);
const lang = z.enum(["zh", "en"]);

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    group: pageGroup,
    order: z.number().default(0),
    banner: z.string().optional(),
    summary: z.string().optional(),
    lang,
  }),
});

const tours = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/tours" }),
  schema: z.object({
    title: z.string(),
    group: z.literal("tours").default("tours"),
    order: z.number().default(0),
    banner: z.string().optional(),
    summary: z.string().optional(),
    lang,
    dateRange: z.string().optional(),
    priceUSD: z.number().optional(),
    status: z.enum(["upcoming", "past", "draft"]).default("upcoming"),
  }),
});

const reports = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/reports" }),
  schema: z.object({
    title: z.string(),
    group: z.literal("reports").default("reports"),
    order: z.number().default(0),
    banner: z.string().optional(),
    summary: z.string().optional(),
    lang,
    publishedAt: z.coerce.date().optional(),
  }),
});

export const collections = { pages, tours, reports };
