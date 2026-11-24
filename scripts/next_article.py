#!/usr/bin/env python3
"""Which article comes next? Reads _data/content_calendar.yml (BLOG_AUTOMATION.md §10.4).

  python scripts/next_article.py                  next article to draft, or what is still being built
  python scripts/next_article.py --status         the whole calendar with statuses
  python scripts/next_article.py --mark 3 ready   change a status (planned|building|ready|drafted|published)
  python scripts/next_article.py --mark 3 drafted --post _posts/2026-12-01-fastapi-llm-api.md

Rules
- Only entries with status "ready" are ever proposed: the lab folder must be complete first.
- Calendar entries come first, lowest id first. Backlog entries only when no calendar entry is
  ready, and never if another backlog article was drafted or published in the last 7 days.
- At most 3 articles published in any 7 days (the cap in §3); above that, nothing is proposed.
Exit code: 0 = an article is ready, 1 = nothing ready, 2 = paused by the cadence limits.
"""
from __future__ import annotations

import argparse
import re
import sys
from datetime import date, timedelta
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
CALENDAR = ROOT / "_data" / "content_calendar.yml"
STATUSES = ["planned", "building", "ready", "drafted", "published"]
WEEKLY_CAP = 3


def load() -> list[dict]:
    entries = yaml.safe_load(CALENDAR.read_text(encoding="utf-8")) or []
    for e in entries:
        if e.get("status") not in STATUSES:
            sys.exit(f"Entry {e.get('id')}: unknown status {e.get('status')!r}")
    return entries


def as_date(value) -> date | None:
    if value in (None, ""):
        return None
    return value if isinstance(value, date) else date.fromisoformat(str(value))


def within_last_week(value, today: date) -> bool:
    d = as_date(value)
    return d is not None and today - d < timedelta(days=7)


def describe(e: dict) -> str:
    extras = []
    if e.get("amazon"):
        extras.append("Amazon links expected")
    if e.get("tool"):
        extras.append(f"new tool: {e['tool']}")
    if e.get("backlog"):
        extras.append("backlog")
    lines = [
        f"#{e['id']}  {e['title']}",
        f"    type: {e['type']} | pillar: {e['pillar']} | month: {e['month']}",
        f"    lab folder: {e['lab_folder']}",
    ]
    if extras:
        lines.append("    " + " | ".join(extras))
    return "\n".join(lines)


def show_status(entries: list[dict]) -> None:
    for e in entries:
        flag = " (backlog)" if e.get("backlog") else ""
        when = e.get("published_on") or e.get("drafted_on") or ""
        print(f"{e['id']:>4}  {e['status']:<10} {str(when):<11} {e['title']}{flag}")


def next_article(entries: list[dict], today: date) -> int:
    published_7d = [e for e in entries if within_last_week(e.get("published_on"), today)]
    if len(published_7d) >= WEEKLY_CAP:
        print(f"Paused: {len(published_7d)} articles were published in the last 7 days (cap {WEEKLY_CAP}).")
        return 2

    ready = sorted((e for e in entries if e["status"] == "ready"), key=lambda e: e["id"])
    calendar_ready = [e for e in ready if not e.get("backlog")]
    if calendar_ready:
        print("Next article:\n" + describe(calendar_ready[0]))
        return 0

    backlog_ready = [e for e in ready if e.get("backlog")]
    if backlog_ready:
        recent = [e for e in entries if e.get("backlog") and (
            within_last_week(e.get("drafted_on"), today) or within_last_week(e.get("published_on"), today))]
        if recent:
            print(f"Backlog article #{backlog_ready[0]['id']} is ready, but backlog #{recent[0]['id']} "
                  "was drafted or published in the last 7 days (max 1 per week).")
            return 2
        print("Next article (backlog):\n" + describe(backlog_ready[0]))
        return 0

    building = [e for e in entries if e["status"] == "building"]
    print("No article is ready to draft.")
    if building:
        print("Being built in the lab:")
        for e in building:
            print(f"  #{e['id']}  {e['title']}  ({e['lab_folder']})")
    else:
        print("Nothing is being built. Mark the next one with: --mark <id> building")
    return 1


def mark(entry_id: int, status: str, post: str | None, today: date) -> None:
    if status not in STATUSES:
        sys.exit(f"Status must be one of: {', '.join(STATUSES)}")
    text = CALENDAR.read_text(encoding="utf-8")
    newline = "\r\n" if "\r\n" in text else "\n"
    block_re = re.compile(rf"(^- id: {entry_id}\s*$.*?)(?=^- id: |^# ---|\Z)", re.M | re.S)
    match = block_re.search(text)
    if not match:
        sys.exit(f"No entry with id {entry_id}")
    block = match.group(1)

    def set_field(block: str, field: str, value: str) -> str:
        return re.sub(rf"^(  {field}:).*$", rf"\g<1> {value}", block, count=1, flags=re.M)

    block = set_field(block, "status", status)
    if status == "drafted":
        block = set_field(block, "drafted_on", today.isoformat())
        if post:
            block = set_field(block, "post_path", post)
    if status == "published":
        block = set_field(block, "published_on", today.isoformat())
    CALENDAR.write_text(text[:match.start()] + block + text[match.end():], encoding="utf-8", newline="")
    load()  # validate the result
    print(f"#{entry_id} is now {status}.")


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):  # Windows consoles default to cp1252
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--status", action="store_true", help="list every entry with its status")
    parser.add_argument("--mark", nargs=2, metavar=("ID", "STATUS"), help="change an entry's status")
    parser.add_argument("--post", help="with --mark ID drafted: the post file (sets post_path)")
    parser.add_argument("--today", help=argparse.SUPPRESS)  # for testing: YYYY-MM-DD
    args = parser.parse_args()
    today = date.fromisoformat(args.today) if args.today else date.today()

    if args.mark:
        mark(int(args.mark[0]), args.mark[1], args.post, today)
        return
    entries = load()
    if args.status:
        show_status(entries)
        return
    sys.exit(next_article(entries, today))


if __name__ == "__main__":
    main()
