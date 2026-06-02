#!/usr/bin/env python3
"""Aggressive Weebly→clean-Markdown converter.

The migrated pages contain ~10 years of Weebly-era HTML garbage:
deeply nested <span> wrappers, inline color/font/size styles,
<h2><p><span><span><strong>X</strong></span></span></p></h2> patterns,
empty <p><br/></p> runs, etc.

This script walks the inline HTML inside each .md content body and
emits clean Markdown with a small allow-list of inline HTML where
Markdown can't express the structure (figure with caption, blockquote,
table).

Rules:
- Strip all inline style/class/font/color attributes
- Unwrap <span>, <font>, <div>, <section> with no semantic meaning
- Flatten nested same-tag wrappers (h2>h2, strong>strong, etc.)
- Convert <h1..6>, <p>, <ul>/<ol>/<li>, <strong>, <em>, <a>, <img>,
  <br>, <hr>, <blockquote> to Markdown
- Keep <figure>/<figcaption>, <table>/<tr>/<td> as cleaned HTML
- Drop empty tags, empty paragraphs, runs of <br>
- Preserve frontmatter verbatim
"""
from __future__ import annotations

import html
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path("/Users/catochiw/Downloads/sowfoundation/sowfoundation-v2/src/content/pages")

# ---------------------------------------------------------------------------
# Tokenizer + tree builder
# ---------------------------------------------------------------------------

VOID_TAGS = {"br", "img", "hr", "meta", "link", "input"}

# Tags whose content we keep (just unwrap the tag, drop attributes)
UNWRAP_TAGS = {"span", "font", "div", "section", "article", "center"}

# Tags we keep as semantic
SEMANTIC_BLOCK = {"p", "h1", "h2", "h3", "h4", "h5", "h6",
                  "ul", "ol", "li", "blockquote",
                  "figure", "figcaption", "table", "thead", "tbody",
                  "tr", "td", "th", "pre", "hr"}
SEMANTIC_INLINE = {"strong", "b", "em", "i", "u", "s", "code", "sup", "sub",
                   "br", "a", "img"}

KEEP_TAGS = SEMANTIC_BLOCK | SEMANTIC_INLINE


class Node:
    __slots__ = ("tag", "attrs", "children", "text")

    def __init__(self, tag: str | None = None, attrs: dict | None = None, text: str | None = None):
        self.tag = tag
        self.attrs = attrs or {}
        self.children: list[Node] = []
        self.text = text

    def is_text(self) -> bool:
        return self.text is not None

    def is_empty(self) -> bool:
        if self.is_text():
            return not (self.text or "").strip()
        if self.tag in VOID_TAGS:
            return False
        return all(c.is_empty() for c in self.children)


class TreeParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node(tag="__root__")
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        # Normalize tag
        tag = tag.lower()
        attrs_d = {k.lower(): (v or "") for k, v in attrs}
        node = Node(tag=tag, attrs=attrs_d)
        self.stack[-1].children.append(node)
        if tag not in VOID_TAGS:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        # <br />, <img />, etc.
        tag = tag.lower()
        attrs_d = {k.lower(): (v or "") for k, v in attrs}
        node = Node(tag=tag, attrs=attrs_d)
        self.stack[-1].children.append(node)

    def handle_endtag(self, tag):
        tag = tag.lower()
        # Pop back to the matching tag (forgiving — HTML in the wild is sloppy)
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                self.stack = self.stack[: i]
                return
        # Unmatched close: ignore

    def handle_data(self, data):
        if not data:
            return
        self.stack[-1].children.append(Node(text=data))


# ---------------------------------------------------------------------------
# Tree cleanup
# ---------------------------------------------------------------------------

def cleanup(node: Node) -> list[Node]:
    """Recursively clean a node, return its replacement(s).

    May return zero, one, or many siblings (when unwrapping).
    """
    if node.is_text():
        return [node]

    # Clean attrs first
    if node.tag in {"a"}:
        keep = {k: v for k, v in node.attrs.items() if k in {"href", "title", "target", "rel"} and v}
    elif node.tag == "img":
        keep = {k: v for k, v in node.attrs.items() if k in {"src", "alt", "title"} and v}
        # Normalize empty alt
        keep.setdefault("alt", "")
    elif node.tag in {"td", "th"}:
        keep = {k: v for k, v in node.attrs.items() if k in {"colspan", "rowspan", "scope"} and v}
    elif node.tag == "iframe":
        keep = {k: v for k, v in node.attrs.items() if k in {"src", "title", "width", "height"} and v}
    else:
        # Drop all attributes on non-link, non-image elements
        keep = {}
    node.attrs = keep

    # Recurse into children
    new_children: list[Node] = []
    for c in node.children:
        new_children.extend(cleanup(c))

    # Merge adjacent text nodes
    merged: list[Node] = []
    for c in new_children:
        if c.is_text() and merged and merged[-1].is_text():
            merged[-1].text = (merged[-1].text or "") + (c.text or "")
        else:
            merged.append(c)
    new_children = merged
    node.children = new_children

    # Drop pure-whitespace text inside blocks (but allow it inline)
    # Drop empty children
    node.children = [c for c in node.children if not c.is_empty()]

    # Unwrap useless tags
    if node.tag in UNWRAP_TAGS or node.tag == "u":
        # Replace this node with its children
        return node.children if node.children else []

    # Drop tags we don't recognize, keep their children
    if node.tag and node.tag != "__root__" and node.tag not in KEEP_TAGS:
        return node.children if node.children else []

    # Empty?
    if not node.is_text() and node.tag not in VOID_TAGS and node.tag != "__root__":
        if not node.children:
            return []

    # Flatten nested same-tag wrappers (h2>h2, strong>strong, etc.)
    if node.tag in {"strong", "b", "em", "i", "h1", "h2", "h3", "h4", "h5", "h6", "p", "blockquote"}:
        if len(node.children) == 1 and not node.children[0].is_text() and node.children[0].tag == node.tag:
            inner = node.children[0]
            node.children = inner.children

    # Heading containing a single <p>: unwrap p
    if node.tag and node.tag.startswith("h") and len(node.tag) == 2 and node.tag[1].isdigit():
        if len(node.children) == 1 and not node.children[0].is_text() and node.children[0].tag == "p":
            node.children = node.children[0].children

    # Drop <p> that contains a single block element (e.g. heading) — unwrap p
    if node.tag == "p":
        if len(node.children) == 1 and not node.children[0].is_text() and node.children[0].tag in {"h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "ul", "ol", "table", "figure"}:
            return node.children

    return [node]


# ---------------------------------------------------------------------------
# Tree → Markdown
# ---------------------------------------------------------------------------

def text_to_md(s: str) -> str:
    # Within block content we want to flatten newlines from the HTML source
    # (those were just formatting in the original), but preserve user-visible
    # line breaks from <br>. <br> is converted separately.
    s = re.sub(r"[ \t\r\n]+", " ", s)
    return s


def render(nodes: list[Node]) -> str:
    out: list[str] = []
    for n in nodes:
        out.append(render_one(n))
    return "".join(out)


def render_one(n: Node) -> str:
    if n.is_text():
        return text_to_md(n.text or "")
    tag = n.tag

    if tag == "__root__":
        return render(n.children)

    if tag == "br":
        return "  \n"
    if tag == "hr":
        return "\n\n---\n\n"
    if tag == "img":
        src = n.attrs.get("src", "").strip()
        alt = (n.attrs.get("alt", "") or "").strip()
        title = (n.attrs.get("title", "") or "").strip()
        if not src:
            return ""
        if title:
            return f'\n\n![{alt}]({src} "{title}")\n\n'
        return f"\n\n![{alt}]({src})\n\n"

    if tag == "a":
        href = n.attrs.get("href", "").strip()
        inner = render(n.children).strip()
        if not inner:
            return ""
        if not href:
            return inner
        return f"[{inner}]({href})"

    if tag in {"strong", "b"}:
        inner = render(n.children).strip()
        return f"**{inner}**" if inner else ""
    if tag in {"em", "i"}:
        inner = render(n.children).strip()
        return f"*{inner}*" if inner else ""
    if tag == "code":
        inner = render(n.children).strip()
        return f"`{inner}`" if inner else ""

    if tag and tag.startswith("h") and len(tag) == 2 and tag[1].isdigit():
        level = int(tag[1])
        inner = render(n.children).strip()
        if not inner:
            return ""
        return f"\n\n{'#' * level} {inner}\n\n"

    if tag == "p":
        inner = render(n.children).strip()
        if not inner:
            return ""
        return f"\n\n{inner}\n\n"

    if tag in {"ul", "ol"}:
        return "\n\n" + render_list(n, ordered=(tag == "ol"), depth=0) + "\n\n"

    if tag == "li":
        return render(n.children).strip()

    if tag == "blockquote":
        inner = render(n.children).strip()
        if not inner:
            return ""
        quoted = "\n".join("> " + line for line in inner.splitlines())
        return f"\n\n{quoted}\n\n"

    if tag == "figure":
        # Render as HTML <figure> with cleaned img + figcaption
        parts: list[str] = []
        for c in n.children:
            parts.append(render_one(c))
        body = "".join(parts).strip()
        return f"\n\n<figure>{body}</figure>\n\n"
    if tag == "figcaption":
        inner = render(n.children).strip()
        return f"<figcaption>{inner}</figcaption>"

    if tag == "table":
        return "\n\n" + render_table(n) + "\n\n"

    if tag in {"sup", "sub"}:
        inner = render(n.children).strip()
        return f"<{tag}>{inner}</{tag}>"

    if tag == "pre":
        # Preserve as code block
        inner = render(n.children)
        return f"\n\n```\n{inner.strip()}\n```\n\n"

    # Default: render children
    return render(n.children)


def render_list(node: Node, ordered: bool, depth: int) -> str:
    items: list[str] = []
    i = 0
    for c in node.children:
        if c.is_text() or c.tag != "li":
            continue
        i += 1
        marker = f"{i}." if ordered else "-"
        # Render the li, splitting out any nested lists for proper indent
        body_parts: list[str] = []
        nested: list[str] = []
        for cc in c.children:
            if not cc.is_text() and cc.tag in {"ul", "ol"}:
                nested.append(render_list(cc, ordered=(cc.tag == "ol"), depth=depth + 1))
            else:
                body_parts.append(render_one(cc))
        body = "".join(body_parts).strip()
        line = f"{'  ' * depth}{marker} {body}" if body else ""
        if line:
            items.append(line)
        for n2 in nested:
            # indent the nested list
            items.append("\n".join("  " + l if l.strip() else l for l in n2.splitlines()))
    return "\n".join(items)


def render_table(node: Node) -> str:
    """Render simple tables to Markdown pipe table when possible."""
    rows: list[list[str]] = []
    header_row: list[str] | None = None
    for c in node.children:
        if c.is_text():
            continue
        if c.tag in {"thead", "tbody"}:
            for r in c.children:
                if r.is_text() or r.tag != "tr":
                    continue
                cells = [render(cell.children).strip().replace("\n", " ") for cell in r.children if not cell.is_text() and cell.tag in {"td", "th"}]
                if not cells:
                    continue
                if any(cell.tag == "th" for cell in r.children if not cell.is_text()):
                    header_row = cells
                else:
                    rows.append(cells)
        elif c.tag == "tr":
            cells = [render(cell.children).strip().replace("\n", " ") for cell in c.children if not cell.is_text() and cell.tag in {"td", "th"}]
            if not cells:
                continue
            if header_row is None and any(cell.tag == "th" for cell in c.children if not cell.is_text()):
                header_row = cells
            else:
                rows.append(cells)
    if not rows and not header_row:
        return ""
    width = max(len(r) for r in rows + ([header_row] if header_row else []))
    if header_row is None:
        header_row = [""] * width
    while len(header_row) < width:
        header_row.append("")
    out = ["| " + " | ".join(header_row) + " |",
           "| " + " | ".join(["---"] * width) + " |"]
    for r in rows:
        while len(r) < width:
            r.append("")
        out.append("| " + " | ".join(r) + " |")
    return "\n".join(out)


# ---------------------------------------------------------------------------
# Whole-file driver
# ---------------------------------------------------------------------------

SHORTCODE_RE = re.compile(
    r'\[fixedimg\s+url="([^"]+)"\s+title="([^"]+)"\s+title-position="[^"]*"\]'
)


def pre_clean(body_html: str) -> str:
    """Pre-tokenisation cleanup of legacy CI/Weebly artifacts."""
    s = body_html

    # Convert [fixedimg url=X title=Y title-position=Z] -> clean <hr><h2><figure>
    # We emit HTML tags so the structure survives the HTMLParser, which would
    # otherwise collapse '## ...' (Markdown) into inline text.
    def _shortcode(m: re.Match) -> str:
        url = m.group(1)
        title = m.group(2)
        url = re.sub(r"https?://(?:www\.)?sowfoundation\.org/", "/", url)
        url = re.sub(r"^/(?:demo/)?assets/images/homepage/", "/images/homepage/", url)
        url = re.sub(r"^/(?:demo/)?(?:sowsys/)?attached/image/", "/images/", url)
        return (
            f'<hr/><h2>{title}</h2>'
            f'<p><img src="{url}" alt="{title}"/></p>'
        )

    s = SHORTCODE_RE.sub(_shortcode, s)

    # Legacy hardcoded site URLs in remaining content
    s = re.sub(r"https?://(?:www\.)?sowfoundation\.org/", "/", s)
    # Stray relative paths in img/href values
    s = re.sub(r'(="(?:\.\./)+)(images/)', r'="/\2', s)
    s = re.sub(r'(="(?:\.\./)+demo/)(images|attached)/', r'="/images/', s)

    return s


def post_clean_md(md: str) -> str:
    """Post-pass on the rendered markdown."""
    # Drop PayPal tracking-pixel images entirely
    md = re.sub(r"!\[[^\]]*\]\(https?://[^)]*paypal[^)]*pixel[^)]*\)", "", md, flags=re.IGNORECASE)
    md = re.sub(r"!\[[^\]]*\]\(https?://[^)]*paypalobjects\.com/[^)]*\)", "", md, flags=re.IGNORECASE)
    # Collapse adjacent bold runs that came from `<strong>X</strong><strong>Y</strong>`
    # → `**X****Y**` → `**XY**`. Repeat until stable.
    prev = None
    while prev != md:
        prev = md
        md = re.sub(r"\*\*\s*\*\*", "", md)

    # Unwrap paragraph-wide bold: lines that are ENTIRELY `**...**` with no inner `**`.
    lines = md.split("\n")
    out: list[str] = []
    for raw in lines:
        line = raw.rstrip()
        s = line.strip()
        if s.startswith("**") and s.endswith("**") and len(s) >= 4:
            inner = s[2:-2]
            if "**" not in inner:
                indent = line[: len(line) - len(line.lstrip())]
                out.append(indent + inner)
                continue
        out.append(line)
    md = "\n".join(out)

    # Strip leading/trailing bold around heading text
    md = re.sub(r"^(#{1,6}\s+)\*\*(.+?)\*\*\s*$", r"\1\2", md, flags=re.MULTILINE)

    # Empty bold runs
    md = re.sub(r"\*\*\s*\*\*", "", md)
    # Bold immediately followed by colon: keep the colon outside the bold for cleanliness
    md = re.sub(r"\*\*([^*]+?)\*\*[:：]", r"**\1：**", md)

    # Collapse multi-blank lines and trim trailing whitespace
    md = re.sub(r"[ \t]+$", "", md, flags=re.MULTILINE)
    md = re.sub(r"\n{3,}", "\n\n", md)
    return md.strip()


def clean_body(body_html: str) -> str:
    body_html = pre_clean(body_html)
    parser = TreeParser()
    parser.feed(body_html)
    cleaned = cleanup(parser.root)
    md = render(cleaned)
    md = html.unescape(md)
    md = post_clean_md(md)
    return md


def process_file(p: Path) -> None:
    text = p.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return
    end = text.find("\n---", 4)
    if end == -1:
        return
    front = text[: end + 4]      # includes the closing '---'
    body = text[end + 4 :].lstrip("\n")
    cleaned = clean_body(body)
    if not cleaned.strip():
        cleaned = "<!-- 此頁目前沒有內容 / This page has no content yet. -->"
    p.write_text(front + "\n\n" + cleaned + "\n", encoding="utf-8")


def main() -> int:
    count = 0
    for md in sorted(ROOT.rglob("*.md")):
        process_file(md)
        count += 1
    print(f"cleaned {count} files")
    return 0


if __name__ == "__main__":
    sys.exit(main())
