#!/usr/bin/env python3
"""Extract sow_page rows into bilingual Markdown content files.

Produces:
  src/content/pages/zh/{slug}.md
  src/content/pages/en/{slug}.md

The DB content is heavy Weebly-era HTML (inline color/font/size styles, nested
<span>s, &lt;-encoded). We HTML-decode, strip the most egregious noise, and
write the cleaned HTML inside the Markdown file (Astro renders inline HTML).

We also rewrite absolute /attached/image/... URLs to /images/... so the local
asset copy works.
"""
import html
import re
import sys
from pathlib import Path

SQL_PATH = Path(
    "/Users/catochiw/Downloads/sowfoundation/bsciixmy/mysql/bsciixmy_sowcionline.sql"
)
ROOT = Path(__file__).parent.parent
OUT_ZH = ROOT / "src" / "content" / "pages" / "zh"
OUT_EN = ROOT / "src" / "content" / "pages" / "en"

# Map old slugs -> new slugs + group + display order
SLUG_MAP = {
    "home":      {"slug": "home",             "group": "home",     "order":  0, "title_zh": "首頁",       "title_en": "Home"},
    "org":       {"slug": "org",              "group": "about",    "order":  1, "title_zh": "組織",       "title_en": "Organization"},
    "directors": {"slug": "directors",        "group": "about",    "order":  2, "title_zh": "董事",       "title_en": "Directors"},
    "zz":        {"slug": "senior-care",      "group": "programs", "order":  1, "title_zh": "長者關顧",   "title_en": "Senior Care"},
    "jz":        {"slug": "disaster-relief",  "group": "programs", "order":  2, "title_zh": "賑災救援",   "title_en": "Disaster Relief"},
    "fp":        {"slug": "poverty-relief",   "group": "programs", "order":  3, "title_zh": "貧困資助",   "title_en": "Poverty Relief"},
    "zx":        {"slug": "scholarship",      "group": "programs", "order":  4, "title_zh": "愛心助學",   "title_en": "Scholarship"},
    "co":        {"slug": "pandemic-response","group": "programs", "order":  5, "title_zh": "全球抗疫",   "title_en": "Pandemic Response"},
    "ly":        {"slug": "holy-land",        "group": "tours",    "order":  1, "title_zh": "聖地旅遊",   "title_en": "Holy Land Tour"},
    "fz":        {"slug": "ark",              "group": "tours",    "order":  2, "title_zh": "方舟之旅",   "title_en": "Ark Journey"},
    "lc":        {"slug": "longchuan",        "group": "reports",  "order":  1, "title_zh": "龍川行記",   "title_en": "Longchuan Field Report"},
    "donation":  {"slug": "donation",         "group": "donation", "order":  0, "title_zh": "奉獻",       "title_en": "Donation"},
}

# Parse INSERT INTO `sow_page` ... VALUES (...),(...),(...);
TUPLE_RE = re.compile(
    r"""
    \(
      (\d+),                                # id
      '((?:[^'\\]|\\.)*)',                  # slug
      '((?:[^'\\]|\\.)*)',                  # title
      '((?:[^'\\]|\\.)*)',                  # content_en
      '((?:[^'\\]|\\.)*)',                  # content_zh
      '((?:[^'\\]|\\.)*)',                  # banner
      (\d+)                                 # menu_order
    \)
    """,
    re.VERBOSE | re.DOTALL,
)

MYSQL_UNESCAPE = [
    ("\\'", "'"),
    ('\\"', '"'),
    ("\\n", "\n"),
    ("\\r", "\r"),
    ("\\t", "\t"),
    ("\\\\", "\\"),
    ("\\0", ""),
]


def mysql_unescape(s: str) -> str:
    out = []
    i = 0
    while i < len(s):
        if s[i] == "\\" and i + 1 < len(s):
            two = s[i : i + 2]
            for k, v in MYSQL_UNESCAPE:
                if two == k:
                    out.append(v)
                    i += 2
                    break
            else:
                out.append(s[i + 1])
                i += 2
        else:
            out.append(s[i])
            i += 1
    return "".join(out)


def clean_html(s: str) -> str:
    """Strip the worst Weebly-era noise but keep semantic structure."""
    # HTML-decode (content is double-encoded: &lt;p&gt; etc.)
    s = html.unescape(s)

    # Strip inline noise styles repeatedly
    noise_patterns = [
        # whole style="..." attribute when it only contains color/font/background
        r'\sstyle="[^"]*?(?:color|font-family|font-size|background-color|background|font-weight)\s*:[^"]*"',
        # weebly classes
        r'\sclass="wsite-[^"]*"',
        r'\sclass="paragraph"',
        # empty spans
        r"<span>\s*</span>",
        # span without any meaningful attribute (after stripping)
        r"<span>([^<]*)</span>",
        # broken Weebly-attributes that survived: font-size:14px;"=""
        r'\s*font-size:\d+px;"=""',
        # &nbsp; runs
        r"(&nbsp;\s*){2,}",
        # empty paragraph runs
        r"(<p>\s*<br\s*/?>\s*</p>\s*){2,}",
    ]
    for pat in noise_patterns:
        if pat == r"<span>([^<]*)</span>":
            s = re.sub(pat, r"\1", s)
        elif pat == r"(&nbsp;\s*){2,}":
            s = re.sub(pat, "&nbsp;", s)
        elif pat == r"(<p>\s*<br\s*/?>\s*</p>\s*){2,}":
            s = re.sub(pat, "<p><br/></p>", s)
        else:
            s = re.sub(pat, "", s, flags=re.IGNORECASE)

    # Rewrite image URLs:
    # https://www.sowfoundation.org/attached/image/xxx/yyy.jpg -> /images/xxx/yyy.jpg
    # /sowsys/attached/image/xxx/yyy.jpg -> /images/xxx/yyy.jpg
    # /attached/image/xxx/yyy.jpg -> /images/xxx/yyy.jpg
    s = re.sub(
        r'https?://(?:www\.)?sowfoundation\.org/attached/image/',
        "/images/",
        s,
    )
    s = re.sub(r"/sowsys/attached/image/", "/images/", s)
    s = re.sub(r"/attached/image/", "/images/", s)

    # Legacy weebly upload URLs (some pages reference these):
    # http://sowfoundation.org/uploads/1/0/4/4/104496423/xxx.jpg -> leave a TODO
    # They're not in /attached/, so we drop them with a note.
    s = re.sub(
        r'<img[^>]+src="https?://(?:www\.)?sowfoundation\.org/uploads/[^"]+"[^>]*/?>',
        "<!-- TODO migrate legacy weebly upload image -->",
        s,
    )

    # Final tidy: collapse 3+ blank lines into 2
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()


def write_md(out_dir: Path, slug: str, title: str, group: str, order: int,
             content: str, lang: str, banner: str) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    # YAML frontmatter
    fm_lines = ["---"]
    fm_lines.append(f'title: "{title}"')
    fm_lines.append(f"group: {group}")
    fm_lines.append(f"order: {order}")
    if banner:
        fm_lines.append(f'banner: "{banner}"')
    fm_lines.append(f'lang: {lang}')
    fm_lines.append("---\n")
    out_dir.joinpath(f"{slug}.md").write_text(
        "\n".join(fm_lines) + "\n" + content + "\n",
        encoding="utf-8",
    )


def main() -> int:
    sql = SQL_PATH.read_text(encoding="utf-8")
    # Narrow to the sow_page INSERT block first
    m = re.search(
        r"INSERT INTO `sow_page` \([^)]+\) VALUES\s*(.+?);\s*$",
        sql,
        re.MULTILINE | re.DOTALL,
    )
    if not m:
        print("sow_page INSERT not found", file=sys.stderr)
        return 1
    values_blob = m.group(1)
    rows = TUPLE_RE.findall(values_blob)
    if not rows:
        print("No page rows parsed", file=sys.stderr)
        return 1

    print(f"Parsed {len(rows)} pages")
    for row in rows:
        _id, old_slug, _title_raw, content_en_raw, content_zh_raw, banner_raw, order = row
        old_slug = mysql_unescape(old_slug)
        if old_slug not in SLUG_MAP:
            print(f"  ! unknown slug {old_slug!r}, skipping")
            continue
        meta = SLUG_MAP[old_slug]
        banner = mysql_unescape(banner_raw)
        # Rewrite banner URL too
        if banner:
            banner = re.sub(
                r"https?://(?:www\.)?sowfoundation\.org/attached/image/",
                "/images/",
                banner,
            )
            banner = re.sub(r"^/attached/image/", "/images/", banner)

        content_en = clean_html(mysql_unescape(content_en_raw))
        content_zh = clean_html(mysql_unescape(content_zh_raw))

        write_md(
            OUT_ZH,
            meta["slug"],
            meta["title_zh"],
            meta["group"],
            meta["order"],
            content_zh or f"<!-- TODO: 內容暫缺，從英文版翻譯 -->\n{content_en}",
            "zh",
            banner,
        )
        write_md(
            OUT_EN,
            meta["slug"],
            meta["title_en"],
            meta["group"],
            meta["order"],
            content_en or f"<!-- TODO: translate from Chinese -->\n{content_zh}",
            "en",
            banner,
        )
        print(f"  ✓ {old_slug} -> {meta['slug']}.md  ({meta['group']})")

    return 0


if __name__ == "__main__":
    sys.exit(main())
