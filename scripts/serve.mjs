#!/usr/bin/env node
// Tiny static file server for the built site.
// Avoids the Astro dev server's incompatibility with Node 26.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, normalize, extname } from "node:path";

const ROOT = "/Users/catochiw/Downloads/sowfoundation/sowfoundation-v2/.vercel/output/static";
const PORT = Number(process.env.PORT || 4321);
const HOST = process.env.HOST || "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function safe(pathname) {
  // strip leading slash, decode, normalise
  const raw = decodeURIComponent(pathname.replace(/^\/+/, ""));
  const n = normalize(raw);
  if (n.startsWith("..")) return null;
  return n;
}

async function tryFile(p) {
  try {
    const s = await stat(p);
    return s.isFile() ? p : null;
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let rel = safe(url.pathname);
    if (rel === null) {
      res.writeHead(400); res.end("bad path"); return;
    }
    if (rel === "" || rel.endsWith("/")) rel = (rel || "") + "index.html";
    let file = join(ROOT, rel);

    // Vercel-style: try /foo.html, /foo/index.html
    let found = await tryFile(file);
    if (!found) found = await tryFile(file + ".html");
    if (!found) found = await tryFile(join(file, "index.html"));

    if (!found) {
      // Fallback to 404 page
      const fallback = await tryFile(join(ROOT, "404.html"));
      if (fallback) {
        const buf = await readFile(fallback);
        res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
        res.end(buf);
        return;
      }
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("Not Found: " + rel);
      return;
    }

    const buf = await readFile(found);
    const ct = MIME[extname(found).toLowerCase()] ?? "application/octet-stream";
    res.writeHead(200, {
      "content-type": ct,
      "cache-control": found.includes("/images/") || found.includes("/_astro/")
        ? "public, max-age=31536000, immutable"
        : "no-cache",
    });
    res.end(buf);
  } catch (err) {
    console.error("[serve]", err);
    res.writeHead(500); res.end("server error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Serving ${ROOT}`);
  console.log(`http://${HOST}:${PORT}/`);
});
