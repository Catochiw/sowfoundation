#!/usr/bin/env python3
"""Extract sow_church rows from the MySQL dump into a CSV."""
import csv
import re
import sys
from pathlib import Path

SQL_PATH = Path(
    "/Users/catochiw/Downloads/sowfoundation/bsciixmy/mysql/bsciixmy_sowcionline.sql"
)
OUT_PATH = Path(__file__).parent.parent / "data" / "internal" / "churches.csv"

# Match the multi-row INSERT INTO `sow_church` block and capture all the VALUES tuples
INSERT_RE = re.compile(
    r"INSERT INTO `sow_church` \([^)]+\) VALUES\s*(.+?);\s*$",
    re.MULTILINE | re.DOTALL,
)

# A tuple: (id,'church_name','church_address','login_name','login_pw',
#           'contact1_name','contact1_email','contact1_phone',
#           'contact2_name','contact2_email','contact2_phone')
# Strings may contain escaped quotes (\'), commas, and unicode.
TUPLE_RE = re.compile(
    r"""
    \(
      (\d+),                                # id
      '((?:[^'\\]|\\.)*)',                  # church_name
      '((?:[^'\\]|\\.)*)',                  # church_address
      '((?:[^'\\]|\\.)*)',                  # login_name
      '((?:[^'\\]|\\.)*)',                  # login_pw  (md5)
      '((?:[^'\\]|\\.)*)',                  # contact1_name
      '((?:[^'\\]|\\.)*)',                  # contact1_email
      '((?:[^'\\]|\\.)*)',                  # contact1_phone
      '((?:[^'\\]|\\.)*)',                  # contact2_name
      '((?:[^'\\]|\\.)*)',                  # contact2_email
      '((?:[^'\\]|\\.)*)'                   # contact2_phone
    \)
    """,
    re.VERBOSE,
)

MYSQL_UNESCAPE = {
    r"\'": "'",
    r'\"': '"',
    r"\\": "\\",
    r"\n": "\n",
    r"\r": "\r",
    r"\t": "\t",
    r"\0": "",
}


def mysql_unescape(s: str) -> str:
    for k, v in MYSQL_UNESCAPE.items():
        s = s.replace(k, v)
    return s


def main() -> int:
    sql = SQL_PATH.read_text(encoding="utf-8")
    match = INSERT_RE.search(sql)
    if not match:
        print("No INSERT INTO sow_church found", file=sys.stderr)
        return 1

    values_blob = match.group(1)
    rows = TUPLE_RE.findall(values_blob)
    if not rows:
        print("No tuples parsed", file=sys.stderr)
        return 1

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUT_PATH.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "id",
                "church_name",
                "church_address",
                "login_name",
                "login_pw_md5",
                "contact1_name",
                "contact1_email",
                "contact1_phone",
                "contact2_name",
                "contact2_email",
                "contact2_phone",
            ]
        )
        for row in rows:
            writer.writerow([mysql_unescape(c) for c in row])

    print(f"Wrote {len(rows)} church rows to {OUT_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
