#!/usr/bin/env python3
"""Render a 1200x630 featured image for a post (BLOG_AUTOMATION.md §8.5).

Two styles:
  v2 (default)  a colour theme per pillar, a large title, up to 3 tags, the codersite logo and a
                drawing of the topic, chosen from the title, tags and description (a token bucket
                for rate limiting, a tree, UML classes, a lock, containers, an agent graph...).
                Without a matching drawing it shows the first code example of the post.
  classic       Kit the fox, the title and a short kicker on the brand background.
Everything is drawn from the templates in scripts/templates/ (no third-party images) and rendered
with headless Edge or Chrome to a compressed JPG in assets/images/posts/<slug>.jpg.

Examples
  python scripts/featured_image.py --post _posts/2023-02-02-rate-limit.md --write
  python scripts/featured_image.py --post _posts/2023-02-02-rate-limit.md --motif code --force
  python scripts/featured_image.py --title "Local AI on Windows" --slug local-ai-windows --pillar "Self-Hosting & Local AI"
  python scripts/featured_image.py --list-motifs

Options
  --write        also set `image:` in the post's front matter to the new file
  --force        overwrite an existing image
  --style        v2 (default) or classic
  --motif/--theme  override the automatic choice;  --tags "a,b"  override the tags shown
Requirements: Python 3.10+, Pillow, PyYAML (pip install -r scripts/requirements.txt), Edge or Chrome.
"""
from __future__ import annotations

import argparse
import base64
import json
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
TEMPLATES = {
    "v2": ROOT / "scripts" / "templates" / "featured-v2.html",
    "classic": ROOT / "scripts" / "templates" / "featured.html",
}
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

# Colour theme per pillar (v2)
PILLAR_THEMES = {
    "Java & Spring Boot": "java",
    "Algorithms, Interviews & Career": "algorithms",
    "Software Design & Architecture": "design",
    "AI Agents & Tooling": "ai",
    "Self-Hosting & Local AI": "selfhost",
}
# Short kicker per pillar when a post has no tags (classic)
PILLAR_KICKERS = {
    "Java & Spring Boot": "java & spring boot",
    "Algorithms, Interviews & Career": "coding interviews",
    "Software Design & Architecture": "software design",
    "AI Agents & Tooling": "ai agents",
    "Self-Hosting & Local AI": "local ai",
}
# Topic drawings (v2). The title is checked first, then the tags, then the description;
# within each, the first matching rule wins. No match: the post's first code example ("code").
MOTIF_RULES = [
    ("ratelimit", r"rate.?limit|bucket4j|token bucket|\b429\b|throttl"),
    ("security", r"oauth|\bssl\b|\btls\b|handshake|security|\blogin\b|authenticat|\bjwt\b"),
    ("container", r"docker|kubernetes|\bk3d\b|self-host|homelab|compose stack"),
    ("ai", r"\bllms?\b|\bagents?\b|\bmcp\b|\brag\b|langgraph|claude|prompt engineering|\bai\b|ollama"),
    ("tree", r"binary (search )?tree|\btrees?\b|\bbst\b"),
    ("graph", r"\bgraphs?\b|depth-first|breadth-first|\bdfs\b|\bbfs\b"),
    ("bigo", r"big o\b|complexity"),
    ("hashmap", r"hashmap|hash map|data structures?"),
    ("performance", r"performance|\bslow\b|latency|load-test|profiling"),
    ("distributed", r"cluster|load.?balanc|distributed|elasticsearch|system design|\baws\b|scalab"),
    ("uml", r"\bsolid\b|\buml\b|open-closed|design principles?\b|object-oriented|\boop\b"),
    ("api", r"\brest api|\brest\b.*\bapi|openapi|swagger|\bhttp\b|status codes|\b503\b"),
    ("career", r"career|soft skills?|\bgerman\b|startup|project into tasks|epics"),
]
MOTIFS = [name for name, _ in MOTIF_RULES] + ["code"]


def find_browser() -> str:
    for candidate in BROWSERS:
        if candidate and Path(candidate).exists():
            return candidate
    for name in ("msedge", "google-chrome", "chromium", "chrome"):
        found = shutil.which(name)
        if found:
            return found
    sys.exit("No Edge or Chrome found. Set BROWSER_PATH to the browser executable.")


def read_post(path: Path) -> tuple[dict, str, str]:
    """Return (front matter, full text, body)."""
    text = path.read_text(encoding="utf-8")
    match = re.match(r"^---\s*\r?\n(.*?)\r?\n---\s*(\r?\n|$)", text, re.S)
    if not match:
        sys.exit(f"{path}: no front matter found")
    return yaml.safe_load(match.group(1)) or {}, text, text[match.end():]


def slug_from_post(path: Path) -> str:
    name = re.sub(r"^\d{4}-\d{2}-\d{2}-", "", path.stem)
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def pillar_of(front: dict) -> str:
    categories = front.get("categories") or []
    if isinstance(categories, str):
        categories = [categories]
    return categories[0] if categories else ""


def choose_motif(front: dict) -> str:
    sources = [str(front.get("title", "")), " ".join(map(str, front.get("tags") or []))]
    # Interview problems are better shown with their code than with a word from the description
    if not pillar_of(front).startswith("Algorithms"):
        sources.append(str(front.get("description", "")))
    for text in sources:
        for name, pattern in MOTIF_RULES:
            if re.search(pattern, text.lower()):
                return name
    return "code"


CODE_LANGS = {"java", "python", "py", "go", "kotlin", "javascript", "js", "typescript", "ts", "csharp", "rust", "sql"}


def first_code_block(body: str, max_lines: int = 8, width: int = 34) -> dict | None:
    """A representative code example for the code window: the first block in a programming
    language with at least 5 lines (else the longest block), without import/package lines,
    with the common indentation removed and long lines shortened."""
    blocks = []
    for match in re.finditer(r"^```([\w+-]*)[^\n]*\n(.*?)^```", body, re.M | re.S):
        lang = (match.group(1) or "").lower()
        code = [l.replace("\t", "    ").rstrip() for l in match.group(2).splitlines()]
        code = [l for l in code if not re.match(r"\s*(import|package|from \S+ import)\b", l)]
        while code and not code[0].strip():
            code.pop(0)
        if code:
            blocks.append((lang, code))
    if not blocks:
        return None
    lang, code = next(((l, c) for l, c in blocks if l in CODE_LANGS and len([x for x in c if x.strip()]) >= 5),
                      max(blocks, key=lambda b: len(b[1])))
    code = code[:max_lines]
    indent = min((len(l) - len(l.lstrip()) for l in code if l.strip()), default=0)
    lines = []
    for l in code:
        l = l[indent:]
        lines.append(l if len(l) <= width else l[: width - 1] + "…")
    return {"lang": lang or "code", "lines": lines}


STATUS_TEXT = {"200": "200 OK", "201": "201 Created", "202": "202 Accepted", "204": "204 No Content",
               "400": "400 Bad Request", "401": "401 Unauthorized", "403": "403 Forbidden",
               "404": "404 Not Found", "429": "429 Too Many", "503": "503 Unavailable"}


def code_text(body: str) -> str:
    return "\n".join(m.group(1) for m in re.finditer(r"^```[^\n]*\n(.*?)^```", body, re.M | re.S))


def shorten(text: str, width: int) -> str:
    """Shorten at a word boundary when possible, with an ellipsis."""
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= width:
        return text
    cut = text[: width - 1]
    if " " in cut[width // 2:]:
        cut = cut[: cut.rfind(" ")]
    return cut.rstrip(" ,;:-") + "…"


def motif_details(motif: str, body: str) -> dict:
    """Post-specific labels for the generic drawings, so no two images look the same."""
    if motif == "api":
        endpoints = re.findall(r"\b(GET|POST|PUT|PATCH|DELETE)\s+(/[\w/{}.:-]*\w[\w/{}.:-]*)", body)
        for method, path in re.findall(r"@(Get|Post|Put|Patch|Delete)Mapping\(\s*(?:value\s*=\s*)?\"(/[^\"]*)\"", body):
            endpoints.append((method.upper(), path))
        for path, block in re.findall(r"^\s{2}(/[\w/{}.-]+):\s*\n((?:\s{4,}.*\n)+)", code_text(body), re.M):
            for method in re.findall(r"^\s{4}(get|post|put|patch|delete):", block, re.M):
                endpoints.append((method.upper(), path))
        seen, unique = set(), []
        for method, path in endpoints:
            if (method, path) not in seen and len(path) > 1 and not path.startswith("/{"):
                seen.add((method, path))
                unique.append((method, path))
        statuses = [STATUS_TEXT[s] for s in dict.fromkeys(re.findall(r"\b(200|201|202|204|400|401|403|404|429|503)\b", body))]
        result = []
        for i, (method, path) in enumerate(unique[:2]):
            default = "201 Created" if method == "POST" else "200 OK"
            status = next((s for s in statuses if (s.startswith("2") if i == 0 else True)), default) if i == 0 else default
            result.append({"method": method, "path": shorten(path, 18), "status": status})
        if not result and statuses:
            result = [{"method": "GET", "path": "/api/orders/42", "status": statuses[0]}]
        return {"endpoints": result} if result else {}
    if motif == "uml":
        code = code_text(body)
        impls = re.findall(r"\bclass\s+([A-Z]\w+)[^{\n]*\bimplements\s+([A-Z]\w+)", code)
        declared = set(re.findall(r"\binterface\s+([A-Z]\w+)", code))
        by_iface: dict[str, list[str]] = {}
        for cls, iface in impls:
            if iface in declared and cls not in by_iface.get(iface, []):
                by_iface.setdefault(iface, []).append(cls)
        if by_iface:
            iface, classes = max(by_iface.items(), key=lambda kv: len(kv[1]))
            method = re.search(rf"interface\s+{iface}\s*(?:<[^>]*>)?\s*{{\s*(?:@\w+\s*)*[\w<>\[\], ?]+\s+(\w+)\s*\(", code)
            return {"iface": shorten(iface, 20), "method": (method.group(1) + "()") if method else "",
                    "classes": [shorten(c, 22) for c in classes[:2]]}
        return {}
    if motif == "career":
        items = []
        for heading in re.findall(r"^##\s+(.+?)\s*$", body, re.M):
            heading = re.sub(r"^(\d+\.\s*|Step\s+\d+:\s*)", "", heading)
            heading = heading.split(":")[0] if ":" in heading and len(heading.split(":")[0]) > 6 else heading
            items.append(shorten(heading, 27))
            if len(items) == 4:
                break
        return {"items": items} if len(items) >= 3 else {}
    if motif == "security":
        for pattern, label in [(r"\bTLS\s?v?1\.[0-3]\b", None), (r"\bAUTHENTICATION_(SUCCESS|FAILURE)\b", None),
                               (r"\bOAuth2AuthorizedClientManager\b", None),
                               (r"client_credentials", "grant_type=client_credentials"),
                               (r"handshake_failure", "fatal alert: handshake_failure")]:
            match = re.search(pattern, body)
            if match:
                return {"label": shorten(label or match.group(0), 30)}
        return {}
    if motif == "ratelimit":
        match = re.search(r"\b(\d+)\s*(?:requests?|req|calls?)\s*(?:per|/|a|an)\s*(second|minute|hour)", body, re.I)
        if match:
            return {"rate": f"{match.group(1)} req / {match.group(2).lower()[:3]}"}
        return {}
    if motif == "distributed":
        text = body.lower()
        if all(word in text for word in ("hot", "warm", "cold")) and "elasticsearch" in text:
            return {"top": "Elasticsearch", "nodes": ["hot", "warm", "cold"], "store": "snapshots"}
        if "cache" in text and ("queue" in text or "replica" in text):
            return {"top": "API gateway", "nodes": ["cache", "queue", "replica"], "store": "database"}
        return {}
    return {}


def headline(title: str) -> str:
    """Short headline for the image: the part of the title before the first colon, when that
    part is a real phrase (2+ words). "Rate Limiting in Spring Boot with Bucket4j: Token Bucket..."
    becomes "Rate Limiting in Spring Boot with Bucket4j"."""
    for i, ch in enumerate(title):
        if title.startswith(": ", i):
            head = title[:i].strip()
            balanced = head.count("'") % 2 == 0 and head.count('"') % 2 == 0 and head.count("(") == head.count(")")
            if balanced and len(head.split()) >= 2 and len(head) >= 12:
                return head
            if balanced:
                break
    # No usable colon: drop a trailing note in brackets, e.g. "(Coding Interview Problem)"
    short = re.sub(r"\s*\([^()]*\)\s*$", "", title).strip()
    return short if len(short.split()) >= 3 else title


def kicker_for(front: dict) -> str:
    tags = front.get("tags") or []
    if tags:
        return str(tags[0])
    pillar = pillar_of(front)
    return PILLAR_KICKERS.get(pillar, pillar.lower() or "codersite.dev")


def build_url(style: str, params: dict) -> str:
    template = TEMPLATES[style]
    if style == "classic":
        return template.as_uri() + f"?title={quote(params['title'])}&kicker={quote(params['kicker'])}"
    payload = base64.urlsafe_b64encode(json.dumps(params, ensure_ascii=False).encode("utf-8")).decode("ascii")
    return template.as_uri() + "?data=" + payload


def render(url: str, out: Path) -> None:
    browser = find_browser()
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
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--post", type=Path, help="path to the post in _posts/")
    parser.add_argument("--title", help="title on the image (default: the post's title)")
    parser.add_argument("--slug", help="file name without extension (default: from the post's file name)")
    parser.add_argument("--style", choices=sorted(TEMPLATES), default="v2")
    parser.add_argument("--pillar", help="v2: pillar label and colour theme (default: the post's category)")
    parser.add_argument("--theme", choices=sorted(set(PILLAR_THEMES.values())), help="v2: colour theme override")
    parser.add_argument("--motif", choices=MOTIFS, help="v2: topic drawing override ('code' = first code example)")
    parser.add_argument("--tags", help="v2: comma-separated tags to show (default: the post's tags)")
    parser.add_argument("--kicker", help="classic: small line above the title (default: first tag or pillar)")
    parser.add_argument("--full-title", action="store_true", help="show the full title instead of the short headline")
    parser.add_argument("--write", action="store_true", help="set image: in the post's front matter")
    parser.add_argument("--force", action="store_true", help="overwrite an existing image")
    parser.add_argument("--out", type=Path, help="write the JPG here instead of assets/images/posts/<slug>.jpg")
    parser.add_argument("--list-motifs", action="store_true", help="list the topic drawings and exit")
    args = parser.parse_args()

    if args.list_motifs:
        print("Topic drawings (v2), in matching order:")
        for name, pattern in MOTIF_RULES:
            print(f"  {name:<12} {pattern}")
        print("  code         fallback: the first code example of the post")
        return

    front, text, body = ({}, "", "")
    post = None
    if args.post:
        post = args.post if args.post.is_absolute() else ROOT / args.post
        front, text, body = read_post(post)
    elif not (args.title and args.slug):
        parser.error("use --post, or --title together with --slug")

    title = args.title or front.get("title")
    if not title:
        sys.exit("No title: add --title or a title in the front matter.")
    if args.title:
        front = {**front, "title": args.title}
    # The image shows a short headline, not the full title (which the page and the social card
    # already show): `image_title:` from the front matter, else the part before the colon.
    if not args.title and not args.full_title:
        title = front.get("image_title") or headline(title)
    slug = args.slug or slug_from_post(post)
    out = args.out or OUT_DIR / f"{slug}.jpg"
    if out.exists() and not args.force:
        sys.exit(f"{out} exists. Use --force to overwrite.")

    if args.style == "classic":
        params = {"title": title, "kicker": args.kicker or kicker_for(front)}
    else:
        pillar = args.pillar or pillar_of(front) or "codersite.dev"
        tags = [t.strip() for t in args.tags.split(",")] if args.tags else [str(t) for t in front.get("tags") or []]
        motif = args.motif or choose_motif(front)
        code = first_code_block(body) if body else None
        if motif == "code" and not code:
            motif = "api"
        params = {"title": title, "pillar": pillar, "tags": tags[:3], "motif": motif,
                  "theme": args.theme or PILLAR_THEMES.get(pillar, "design"), "code": code,
                  "details": motif_details(motif, body) if body else {}}

    render(build_url(args.style, params), out)
    try:
        image_url = "/" + out.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        image_url = str(out)
    detail = f", drawing: {params['motif']}, theme: {params['theme']}" if args.style == "v2" else ""
    print(f"Saved {image_url} ({out.stat().st_size // 1024} KB{detail})")
    if args.write:
        if not post:
            sys.exit("--write needs --post")
        if not image_url.startswith("/assets/"):
            sys.exit("--write needs the image inside assets/ (don't combine it with --out elsewhere)")
        write_image_line(post, text, image_url)
        shown = post.relative_to(ROOT).as_posix() if post.is_relative_to(ROOT) else str(post)
        print(f"Updated image: in {shown}")


if __name__ == "__main__":
    main()
