#!/usr/bin/env python3
"""Render a branded 1200x630 featured image for a post (BLOG_AUTOMATION.md §8.5).

The image shows Kit, the post title, a short kicker (the post's first tag, or its pillar)
and codersite.dev. It is rendered from scripts/templates/featured.html with headless
Microsoft Edge or Google Chrome and saved as a compressed JPG in assets/images/posts/.

Examples
  python scripts/featured_image.py --post _posts/2025-07-03-number-items-closed-compartments.md
  python scripts/featured_image.py --post _posts/2026-12-01-local-ai-windows.md --write
  python scripts/featured_image.py --title "Local AI on Windows" --slug local-ai-windows --kicker "self-hosting"

Options
  --write   also set `image:` in the post's front matter to the new file
  --force   overwrite an existing image
Requirements: Python 3.10+, Pillow, PyYAML (pip install -r scripts/requirements.txt), Edge or Chrome.
"""
from __future__ import annotations

import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.parse import quote

import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "scripts" / "templates" / "featured.html"
OUT_DIR = ROOT / "assets" / "images" / "posts"
WIDTH, HEIGHT = 1200, 630

BROWSERS = [
    os.environ.get("BROWSER_PATH", ""),
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/microsoft-edge",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
]

# Short kicker per pillar when a post has no tags
PILLAR_KICKERS = {
    "Java & Spring Boot": "java & spring boot",
    "Algorithms, Interviews & Career": "coding interviews",
    "Software Design & Architecture": "software design",
    "AI Agents & Tooling": "ai agents",
    "Self-Hosting & Local AI": "local ai",
}


def find_browser() -> str:
    for candidate in BROWSERS:
        if candidate and Path(candidate).exists():
            return candidate
    for name in ("msedge", "google-chrome", "chromium", "chrome"):
        found = shutil.which(name)
        if found:
            return found
    sys.exit("No Edge or Chrome found. Set BROWSER_PATH to the browser executable.")


def read_front_matter(path: Path) -> tuple[dict, str]:
    text = path.read_text(encoding="utf-8")
    match = re.match(r"^---\s*\r?\n(.*?)\r?\n---\s*(\r?\n|$)", text, re.S)
    if not match:
        sys.exit(f"{path}: no front matter found")
    return yaml.safe_load(match.group(1)) or {}, text


def slug_from_post(path: Path) -> str:
    name = re.sub(r"^\d{4}-\d{2}-\d{2}-", "", path.stem)
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def kicker_for(front: dict) -> str:
    tags = front.get("tags") or []
    if tags:
        return str(tags[0])
    categories = front.get("categories") or []
    if isinstance(categories, str):
        categories = [categories]
    pillar = categories[0] if categories else ""
    return PILLAR_KICKERS.get(pillar, pillar.lower() or "codersite.dev")


def render(title: str, kicker: str, out: Path) -> None:
    browser = find_browser()
    url = TEMPLATE.as_uri() + f"?title={quote(title)}&kicker={quote(kicker)}"
    with tempfile.TemporaryDirectory() as tmp:
        png = Path(tmp) / "shot.png"
        cmd = [
            browser, "--headless=new", "--disable-gpu", "--hide-scrollbars",
            "--allow-file-access-from-files", f"--user-data-dir={Path(tmp) / 'profile'}",
            f"--window-size={WIDTH},{HEIGHT}", "--virtual-time-budget=8000",
            f"--screenshot={png}", url,
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)
        if not png.exists():
            sys.exit("The browser did not produce a screenshot.")
        with Image.open(png) as img:
            img = img.convert("RGB")
            if img.size != (WIDTH, HEIGHT):
                img = img.crop((0, 0, WIDTH, HEIGHT))
            out.parent.mkdir(parents=True, exist_ok=True)
            img.save(out, "JPEG", quality=88, optimize=True, progressive=True)


def write_image_line(post: Path, text: str, image_url: str) -> None:
    newline = "\r\n" if "\r\n" in text else "\n"
    head_end = text.index("---", 3)
    head, rest = text[:head_end], text[head_end:]
    if re.search(r"^image:.*$", head, re.M):
        head = re.sub(r"^image:.*$", f"image: {image_url}", head, count=1, flags=re.M)
    else:
        head = head.rstrip("\r\n") + newline + f"image: {image_url}" + newline
    post.write_text(head + rest, encoding="utf-8", newline="")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--post", type=Path, help="path to the post in _posts/")
    parser.add_argument("--title", help="title on the image (default: the post's title)")
    parser.add_argument("--kicker", help="small line above the title (default: first tag or pillar)")
    parser.add_argument("--slug", help="file name without extension (default: from the post's file name)")
    parser.add_argument("--write", action="store_true", help="set image: in the post's front matter")
    parser.add_argument("--force", action="store_true", help="overwrite an existing image")
    args = parser.parse_args()

    front, text = ({}, "")
    if args.post:
        post = args.post if args.post.is_absolute() else ROOT / args.post
        front, text = read_front_matter(post)
    elif not (args.title and args.slug):
        parser.error("use --post, or --title together with --slug")

    title = args.title or front.get("title")
    if not title:
        sys.exit("No title: add --title or a title in the front matter.")
    kicker = args.kicker or kicker_for(front)
    slug = args.slug or slug_from_post(post)
    out = OUT_DIR / f"{slug}.jpg"
    if out.exists() and not args.force:
        sys.exit(f"{out.relative_to(ROOT)} exists. Use --force to overwrite.")

    render(title, kicker, out)
    image_url = "/" + out.relative_to(ROOT).as_posix()
    print(f"Saved {image_url} ({out.stat().st_size // 1024} KB)")
    if args.write:
        if not args.post:
            sys.exit("--write needs --post")
        write_image_line(post, text, image_url)
        shown = post.relative_to(ROOT).as_posix() if post.is_relative_to(ROOT) else str(post)
        print(f"Updated image: in {shown}")


if __name__ == "__main__":
    main()
