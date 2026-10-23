/**
 * Turns a flat markdown page into a grid of testimony tiles.
 *
 * Only runs on pages whose frontmatter says `display: rows`, so every other
 * markdown page is left exactly as it was. The markdown itself stays plain —
 * `##` per section, prose, and a <figure> for the media — and this rewrites
 * the tree into:
 *
 *   <div class="testimony-intro"> …everything before the first h2… </div>
 *   <div class="tile-grid">
 *     <article class="tile">
 *       <div class="tile__media"> …figure… </div>
 *       <div class="tile__body">  …h2 + prose… </div>
 *     </article>
 *   </div>
 *
 * A section with no media is simply a tile without a media block. The number
 * of columns is decided in CSS, not here.
 */

const isElement = (node, tag) => node.type === "element" && node.tagName === tag;

/**
 * A figure/iframe wrapper is media; everything else is body copy.
 *
 * Raw HTML written in the markdown reaches this plugin as a single `raw`
 * node per HTML block (the markup is not parsed into elements until later),
 * so both shapes have to be recognised.
 */
function isMedia(node) {
  if (node.type === "raw") {
    const html = node.value.trimStart();
    return html.startsWith("<figure") || html.includes('class="video-embed"');
  }
  if (node.type !== "element") return false;
  if (isElement(node, "figure")) return true;
  const className = node.properties?.className ?? [];
  const classes = Array.isArray(className) ? className : [className];
  return classes.includes("video-embed");
}

const wrap = (className, children) => ({
  type: "element",
  tagName: "div",
  properties: { className: [className] },
  children,
});

export default function rehypeTestimonyRows() {
  return (tree, file) => {
    if (file.data?.astro?.frontmatter?.display !== "rows") return;

    const intro = [];
    const sections = [];
    let current = null;

    for (const node of tree.children) {
      if (isElement(node, "h2")) {
        current = [];
        sections.push(current);
      }
      // Whitespace between block elements carries no meaning here.
      if (node.type === "text" && !node.value.trim()) continue;
      (current ?? intro).push(node);
    }

    const tiles = sections.map((nodes) => {
      const media = nodes.filter(isMedia);
      const body = nodes.filter((n) => !isMedia(n));
      return {
        type: "element",
        tagName: "article",
        properties: { className: ["tile"] },
        children: media.length
          ? [wrap("tile__media", media), wrap("tile__body", body)]
          : [wrap("tile__body", body)],
      };
    });

    const children = [];
    if (intro.length) children.push(wrap("testimony-intro", intro));
    children.push(wrap("tile-grid", tiles));

    tree.children = children;
  };
}
