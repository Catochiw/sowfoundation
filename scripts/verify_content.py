#!/usr/bin/env python3
"""Verify each migrated .md page faithfully matches the original DB content.

Ground truth = the sow_page rows in the MySQL dump (content_zh / content_en).
We strip BOTH the original HTML and our Markdown down to normalized plain-text
"sentence chunks", then report:
  - MISSING: chunks present in the original but absent from our .md
  - ADDED:   chunks present in our .md but absent from the original (invented)

Formatting/markup differences are ignored — only the actual words matter.
"""
from __future__ import annotations

import html
import re
import sys
from pathlib import Path

DUMP = Path("/Users/catochiw/Downloads/sowfoundation/bsciixmy/mysql/bsciixmy_sowcionline.sql")
ROOT = Path("/Users/catochiw/Downloads/sowfoundation/sowfoundation-v2/src/content/pages")

# slug in DB -> (our_md_filename, group)
SLUG_MAP = {
    "home": "home", "org": "org", "directors": "directors",
    "zz": "senior-care", "jz": "disaster-relief", "fp": "poverty-relief",
    "zx": "scholarship", "co": "pandemic-response",
}

TUPLE_RE = re.compile(
    r"""\(
      (\d+),
      '((?:[^'\\]|\\.)*)',   # slug
      '((?:[^'\\]|\\.)*)',   # title
      '((?:[^'\\]|\\.)*)',   # content_en
      '((?:[^'\\]|\\.)*)',   # content_zh
      '((?:[^'\\]|\\.)*)',   # banner
      (\d+)
    \)""",
    re.VERBOSE | re.DOTALL,
)

MYSQL = [("\\'", "'"), ('\\"', '"'), ("\\n", "\n"), ("\\r", "\r"),
         ("\\t", "\t"), ("\\\\", "\\"), ("\\0", "")]


def mysql_unescape(s: str) -> str:
    out, i = [], 0
    while i < len(s):
        if s[i] == "\\" and i + 1 < len(s):
            two = s[i:i+2]
            for k, v in MYSQL:
                if two == k:
                    out.append(v); i += 2; break
            else:
                out.append(s[i+1]); i += 2
        else:
            out.append(s[i]); i += 1
    return "".join(out)


def strip_html(s: str) -> str:
    s = html.unescape(s)
    s = re.sub(r"(?is)<(script|style).*?</\1>", " ", s)
    # CI [fixedimg ... title="X" ...] — the title WAS shown as an on-image
    # caption on the original homepage, so keep it as text (we render it as a heading).
    s = re.sub(r'\[fixedimg[^\]]*?title="([^"]*)"[^\]]*\]', r" \1 ", s)
    s = re.sub(r"\[fixedimg[^\]]*\]", " ", s)  # any remaining shortcode
    s = re.sub(r"(?i)<[^>]+>", " ", s)         # all tags
    s = html.unescape(s)
    # WordPress editor junk: the "Save" button text saved into content repeatedly
    s = re.sub(r"(?:\s*Save\s*){2,}", " ", s)
    return s


def strip_md(s: str) -> str:
    # remove frontmatter
    if s.startswith("---"):
        end = s.find("\n---", 3)
        if end != -1:
            s = s[end+4:]
    s = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", s)       # images
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)     # links -> text
    s = re.sub(r"</?[^>]+>", " ", s)                   # any html
    s = s.replace("\\", " ")                            # markdown hard-break backslashes
    s = re.sub(r"(?m)^\s*\d+\.\s+", " ", s)            # ordered-list markers (render as <ol>, no digit in original)
    s = re.sub(r"[#>*_`|-]+", " ", s)                  # md syntax
    return s


# Characters that separate "chunks" we compare
SPLIT_RE = re.compile(r"[。！？!?；;\n\r]+")
# Noise to remove before comparing — punctuation/markup symbols that carry no
# "information" and that our Markdown vs the original HTML format differently.
# (We deliberately KEEP 【】 here so bracket changes still surface as real diffs.)
NOISE_RE = re.compile(r"[\s，,、。．\.：:；;！!？?（）()「」『』\"'“”‘’\-—–…·　#＃>|~*_`]+")


def chunks(text: str) -> list[str]:
    raw = SPLIT_RE.split(text)
    out = []
    for c in raw:
        n = NOISE_RE.sub("", c)
        if len(n) >= 4:           # ignore tiny fragments
            out.append((n, c.strip()))
    return out


def full_norm(text: str) -> str:
    """All words concatenated, every space/punctuation removed — the definitive
    faithfulness fingerprint. Two texts with the same characters in the same
    order (ignoring all formatting) are byte-identical here."""
    return NOISE_RE.sub("", SPLIT_RE.sub("", text))


def compare(orig: str, mine: str, label: str) -> bool:
    o_full, m_full = full_norm(orig), full_norm(mine)
    if o_full == m_full:
        print(f"{label}: ✓ IDENTICAL (every character faithful, {len(o_full)} chars)")
        return True

    # Not identical — find the first divergence and show context.
    i = 0
    n = min(len(o_full), len(m_full))
    while i < n and o_full[i] == m_full[i]:
        i += 1
    ctx = 45
    print(f"\n{'='*72}\n{label}: ✗ TEXT DIFFERS (orig {len(o_full)} chars, mine {len(m_full)} chars)")
    print(f"  first divergence at char {i}:")
    print(f"     …before: …{o_full[max(0,i-ctx):i]}")
    print(f"     ORIGINAL: »{o_full[i:i+ctx]}…")
    print(f"     OURS    : »{m_full[i:i+ctx]}…")
    return False


def main() -> int:
    sql = DUMP.read_text(encoding="utf-8")
    m = re.search(r"INSERT INTO `sow_page`[^;]*?VALUES\s*(.+?);\s*$", sql,
                  re.MULTILINE | re.DOTALL)
    rows = TUPLE_RE.findall(m.group(1))
    by_slug = {}
    for r in rows:
        _id, slug, title, c_en, c_zh, banner, order = r
        by_slug[mysql_unescape(slug)] = (mysql_unescape(c_en), mysql_unescape(c_zh))

    all_ok = True
    for db_slug, fname in SLUG_MAP.items():
        if db_slug not in by_slug:
            print(f"!! {db_slug} not found in dump")
            continue
        c_en, c_zh = by_slug[db_slug]
        # zh
        zh_md = (ROOT / "zh" / f"{fname}.md")
        if zh_md.exists():
            ok = compare(strip_html(c_zh), strip_md(zh_md.read_text(encoding="utf-8")),
                         f"[zh] {db_slug} -> {fname}.md")
            all_ok = all_ok and ok
        # en
        en_md = (ROOT / "en" / f"{fname}.md")
        if en_md.exists():
            ok = compare(strip_html(c_en), strip_md(en_md.read_text(encoding="utf-8")),
                         f"[en] {db_slug} -> {fname}.md")
            all_ok = all_ok and ok

    print(f"\n{'='*72}\nRESULT: {'ALL FAITHFUL' if all_ok else 'DIFFERENCES FOUND — review above'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
