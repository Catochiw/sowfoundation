#!/usr/bin/env python3
"""Surgically restore the BODY of pages I hand-rewrote, from the DB (verbatim).

Keeps each file's existing frontmatter (title/group/order/banner/lang/summary),
drops the `# extract-skip` marker, and replaces only the body with the faithful
DB content run through the exact same extract→clean pipeline that produced the
already-faithful pages.
"""
import importlib.util
import re
import sys
from pathlib import Path

SCRIPTS = Path(__file__).parent
ROOT = SCRIPTS.parent / "src" / "content" / "pages"
DUMP = Path("/Users/catochiw/Downloads/sowfoundation/bsciixmy/mysql/bsciixmy_sowcionline.sql")


def load(name: str):
    spec = importlib.util.spec_from_file_location(name, SCRIPTS / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


ep = load("extract_pages")
cp = load("clean_pages")

# db_slug -> our filename. These are the pages whose bodies I rewrote.
TARGETS = {
    "zz": "senior-care",
    "directors": "directors",
    "donation": "donation",
    "ly": "holy-land",
    "fz": "ark",
}


def db_rows():
    sql = DUMP.read_text(encoding="utf-8")
    m = re.search(r"INSERT INTO `sow_page` \([^)]+\) VALUES\s*(.+?);\s*$",
                  sql, re.MULTILINE | re.DOTALL)
    out = {}
    for r in ep.TUPLE_RE.findall(m.group(1)):
        _id, slug, _title, c_en, c_zh, _banner, _order = r
        out[ep.mysql_unescape(slug)] = (ep.mysql_unescape(c_en), ep.mysql_unescape(c_zh))
    return out


def split_frontmatter(text: str):
    if not text.startswith("---"):
        return None, text
    end = text.find("\n---", 3)
    if end == -1:
        return None, text
    fm = text[: end + 4]
    body = text[end + 4:]
    return fm, body


def clean_fm(fm: str) -> str:
    # drop the extract-skip marker line
    lines = [ln for ln in fm.splitlines() if "extract-skip" not in ln]
    return "\n".join(lines)


def faithful_body(raw_db: str) -> str:
    # exact pipeline: extract_pages.clean_html  ->  clean_pages.clean_body
    return cp.clean_body(ep.clean_html(raw_db))


def main() -> int:
    rows = db_rows()
    for db_slug, fname in TARGETS.items():
        if db_slug not in rows:
            print(f"!! {db_slug} missing from dump"); continue
        c_en, c_zh = rows[db_slug]
        for lang, raw in (("zh", c_zh), ("en", c_en)):
            path = ROOT / lang / f"{fname}.md"
            if not path.exists():
                print(f"!! {path} missing"); continue
            fm, _ = split_frontmatter(path.read_text(encoding="utf-8"))
            if fm is None:
                print(f"!! {path} has no frontmatter, skipping"); continue
            fm = clean_fm(fm)
            body = faithful_body(raw)
            path.write_text(fm + "\n\n" + body + "\n", encoding="utf-8")
            print(f"  ✓ restored {lang}/{fname}.md  ({len(body)} chars)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
