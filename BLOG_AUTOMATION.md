# codersite.dev — Monetization & Content Automation Plan

> Instructions for Claude Code. Read this whole file before making changes.
> Start by inspecting the repo (Jekyll config, layouts, includes, `_posts`, `_data`, tools pages, CI) and propose a plan before writing code.

## 1. Context

- **Site:** https://codersite.dev — Jekyll 3.10, English, author Moisés Gamio (20+ years software engineering).
- **Current content:** Java, Spring Boot, REST/OpenAPI, coding-interview algorithms, software design, AI-agent tooling.
- **Existing assets to reuse:** Tools section (JSON Validator, JSON→Java, CLAUDE.md Generator, LLM API Cost Calculator, SKILL.md Generator), mascot "Kit the Code Fox", two books on Amazon, Spreadshirt shop, "Buy me a coffee".
- **Current monetization:** donations, books, shop, AdSense, the amazon.de links, the Payhip PDFs and the MSIT.

## 2. Goals

1. Monetize with **Google AdSense** + **Amazon Associates (amazon.com)**.
2. Add a new content pillar: **Self-Hosting & Local AI for Developers** (homelab), which pairs tutorials with high-ticket hardware (mini PCs, GPUs, NAS, RAM, SSDs).
3. Automate article production as far as is safe: drafts, code/command verification, images, diagrams, front matter, product data — **with human review before publishing**.

## 3. Non-negotiable rules

- **No mass publishing.** Cadence: 2–3 articles/week max. This is a real-name domain with history; a scaled-content penalty would hit the whole site.
- **Every article goes through a PR.** Claude Code creates a branch `content/<slug>` and opens a PR. The author reviews and merges. Never push content directly to the main branch, it applies only for articles.
- **No fake experience.** Never write "I tested", "in my lab", "after weeks of use" unless the author has added that information. Buying guides are framed as research-based (specs, documented benchmarks, use-case fit).
- **Verify all code and commands** (see §6). Unverified steps must be flagged in the PR description.
- **Amazon images:** never download, screenshot, re-host or edit Amazon product images. Until Creators API access (requires 3 qualifying sales in 180 days), use **text links only**.
- **No prices displayed** on the site (avoids Amazon's price-freshness requirement). Use a "Check price on Amazon" button.
- **Affiliate disclosure** on every page with affiliate links (see §7).
- No AI-generated images that depict specific real products.

## 4. Site restructuring (one-time tasks)

### 4.1 Consolidate categories
The site currently has ~18 categories, many with a single post. Consolidate into ~5 pillars and add redirects if URLs change:

| Pillar | Merges |
|---|---|
| Java & Spring Boot | Web APIs, Language, Project, test-driven development, Coding Practices |
| Algorithms & Interviews | algorithms, data structures, career |
| Software Design & Architecture | design, Object-Oriented, Domain-Driven Design, system-design, distributed-systems, Web Performance |
| AI Agents & Tooling | AI-agent posts, tool-related posts |
| **Self-Hosting & Local AI** (new) | aws, new homelab content |

Propose the final mapping in a PR before applying it. Keep `book-review` and `startup` posts in the closest pillar.

### 4.2 Monetization plumbing
- Add `amazon_tag` (amazon.com tag), `amazon_tag_de`, `amazon_tag_uk`, `onelink_enabled` and `adsense_client` to `_config.yml` (values provided by the author; use placeholders). See §7.0.
- `_includes/adsense.html`: AdSense script in `<head>` only when `jekyll.environment == "production"`.
- Ad placements: one in-article unit after the intro and one at the end of the post. No ads on Tools pages above the tool itself.
- `_includes/affiliate-disclosure.html`, shown automatically when front matter has `affiliate: true`.
- Ensure these pages exist and are linked in the footer: Privacy Policy (updated for AdSense cookies + Amazon), Terms, Impressum, About, Contact.
- Amazon OneLink: add `_includes/onelink.html` (script provided by Associates Central, loaded only when `site.onelink_enabled` is true) so UK/DE visitors are redirected to their local stores with the matching tag.

## 5. New pillar: Self-Hosting & Local AI

### 5.1 Articles
The article order is defined by the **content calendar in §10**. Do not pick topics outside it unless the author asks.

Mix rule: ~60% hands-on tutorials, ~40% buying guides/comparisons/tools.

### 5.2 New tools (client-side, same style as existing Tools)
- **Local LLM Hardware Calculator:** model size + quantization + context length → required RAM/VRAM, suggested hardware tier.
- **Local LLM vs API Cost Calculator:** hardware cost + electricity (kWh price input) + usage → break-even month vs API pricing. Reuse pricing data from the existing LLM API Cost Calculator.
Both tools should link to relevant articles and to hardware recommendations (text affiliate links).

## 6. Article automation pipeline

Implement as a script (e.g. `scripts/new_article.py`) plus a slash command or documented prompt. Parameters: `--title`, `--type {tutorial,comparison,buying-guide,guide}`, `--pillar`, `--asins` (optional).

**Steps:**
1. **Outline:** search intent, H2/H3 structure, internal links to existing posts and tools.
2. **Draft** the Markdown post in `_posts/YYYY-MM-DD-slug.md` with front matter: `title`, `description` (≤155 chars), `categories`, `tags`, `image`, `affiliate`, `last_verified`.
3. **Verify:**
   - Code samples: compile/run them (Java via Gradle, Python, shell) in a container or sandbox.
   - Commands: run them in a disposable Docker container or VM when feasible; capture real output.
   - Record what was verified, and where, in the PR description. Mark anything not verifiable with `<!-- UNVERIFIED -->`.
4. **Images** (see §8).
5. **SEO checks:** single H1, descriptive alt text, internal links ≥ 3, meta description, slug ≤ 6 words.
6. **Open PR** with checklist: verification log, affiliate links used, images and their sources/licenses, open questions for the author.

### Templates by type
- **Tutorial:** problem → prerequisites (hardware/software, with text affiliate links where natural) → steps with verified commands → troubleshooting → next steps.
- **Comparison (X vs Y):** quick verdict → spec table → use-case fit → who should buy which → links.
- **Buying guide:** selection criteria → spec comparison table → picks by use case/budget → methodology note ("based on specs and published benchmarks").
- **Guide/explainer:** concept → diagram → practical example → related tutorials.

## 7. Amazon Associates integration

### 7.0 Marketplace accounts (read first)
- Each Amazon store is a **separate Associates program**. A tag only earns commission on purchases in its own store.
- The author currently has an active **amazon.de** account. The blog's audience is English-speaking (mainly US, then UK), so:
  - **Primary account: amazon.com.** All product links in posts point to `amazon.com` with `site.amazon_tag`.
  - Optional: amazon.co.uk account (`site.amazon_tag_uk`).
  - Existing amazon.de account (`site.amazon_tag_de`) is linked via OneLink for German visitors.
- **OneLink** (configured in amazon.com Associates Central) links the accounts and redirects visitors to their local store with the right tag. Links in content stay as amazon.com links.
- **Creators API access is per marketplace.** The 3 qualifying sales in 180 days must happen on the **amazon.com** account to unlock images for the blog. Sales on amazon.de do not count for amazon.com.
- Until the amazon.com account is approved and the tag is set, `product.html` must still render (title only, no broken link): if `site.amazon_tag` is empty, hide the button.

### Phase 1 — before 3 qualifying sales (now)
- Text links only, via `_includes/product.html` (title + button, no image).
- Product data stored manually in `_data/products.yml`:

```yaml
B0XXXXXXX:
  title: "Example Mini PC N100 16GB"
  image: ""          # empty until Creators API access
```

- Include usage: `{% include product.html asin="B0XXXXXXX" %}`

```liquid
{% assign p = site.data.products[include.asin] %}
<div class="product-card">
  {% if p.image and p.image != "" %}<img src="{{ p.image }}" alt="{{ p.title }}" loading="lazy">{% endif %}
  <h4>{{ p.title }}</h4>
  {% if site.amazon_tag and site.amazon_tag != "" %}
  <a href="https://www.amazon.com/dp/{{ include.asin }}?tag={{ site.amazon_tag }}"
     rel="sponsored nofollow" target="_blank">Check price on Amazon</a>
  {% endif %}
</div>
```

- Amazon short links generated with SiteStripe / "Share → Associates link" (e.g. `link.amazon/...`, `amzn.to/...`) may be used as **plain text links** in content. Never wrap them in third-party shorteners or cloak them.
- **Do not** render link-preview cards for Amazon URLs (no `og:image` scraping, no oEmbed/link-preview plugins). Social networks may show previews when the author shares links there; the blog itself may not.

- Disclosure text (required): *"As an Amazon Associate I earn from qualifying purchases."*
- Also link the author's own books with the affiliate tag.

### Phase 2 — after Creators API access
- Amazon's PA-API has been replaced by the **Creators API** (new OAuth 2.0 credentials from Associates Central). Docs: https://affiliate-program.amazon.com/creatorsapi/docs/en-us/introduction
- `scripts/sync_products.py`: read ASINs from `_data/products.yml`, call GetItems, update `title` and `image` (Amazon-hosted URL — **hotlink, never download**).
- GitHub Action (daily cron): run sync → rebuild → deploy. Credentials stored as repository secrets.

## 8. Image policy

Allowed, in priority order:
1. Author's own hardware photos (added manually by the author; leave placeholders `<!-- PHOTO: description -->`).
2. Real screenshots/terminal captures from verification runs (e.g. rendered with `charmbracelet/freeze` or similar).
3. Diagrams: Mermaid (add client-side Mermaid support to the layout) or generated SVG.
4. Charts generated from tool/calculator data.
5. Featured images: script that renders a branded template (Kit mascot + post title) to `assets/images/posts/<slug>.png`, 1200×630 for Open Graph.
6. Manufacturer press-kit images — only if the author confirms permission; record source in PR.
7. Wikimedia Commons (CC-licensed) with attribution caption; Unsplash/Pexels for generic ambience only.

Forbidden: Amazon images outside the API (including images pulled from link previews / `og:image` of Amazon pages), screenshots of Amazon pages, AI images of specific real products.

## 9. Suggested order of work

1. Inspect repo and report structure + build/deploy setup.
2. Category consolidation proposal (PR).
3. Monetization plumbing: config, AdSense include, disclosure, product include, `_data/products.yml`, legal pages (PR).
4. Featured-image generator + Mermaid support (PR).
5. `scripts/new_article.py` pipeline + templates (PR).
6. Local LLM Hardware Calculator tool (PR).
7. First article: the lowest-numbered `ready` entry of the content calendar (§10) through the full pipeline (PR).
7b. Create `_data/content_calendar.yml` from §10 and the `scripts/next_article.py` helper (§10.4).
8. OneLink include + multi-marketplace config — once the author has the amazon.com account and OneLink set up.
9. Phase 2 Amazon sync + GitHub Action — only after the author confirms Creators API access on the **amazon.com** account.

## 10. Content calendar (6-month learning roadmap)

The author is learning Python, Docker, AI agents, RAG, evals and deployment while writing. **Every article is drafted from a working project in the lab repo that the author built and tested himself.** The blog documents real learning; it never gets ahead of it.

### 10.1 Author's lab environment (use in prerequisites and verification)
- **Hardware:** Minisforum UM870 Slim, AMD Ryzen 7 8745H (8C/16T), Radeon 780M iGPU, 32 GB DDR5 (upgradable to 96 GB), 1 TB NVMe (second M.2 slot free). No NPU, no CUDA.
- **OS:** Windows 11 + WSL2 (Ubuntu 24.04). Office stays on Windows.
- **LLM runtime:** Ollama runs **natively on Windows** (Vulkan backend, `OLLAMA_VULKAN=1`, `OLLAMA_HOST=0.0.0.0:11434`). Containers reach it at `http://host.docker.internal:11434`.
- **Containers:** Docker Desktop with WSL2 backend; `.wslconfig` limits WSL to ~14 GB RAM.
- **Kubernetes:** k3d (k3s in Docker).
- **Hybrid rule:** small models and embeddings run locally; heavy agent reasoning may use a cloud API (Claude). State which one each article uses.
- Never claim results for hardware the author does not own (no 70B models, no NVIDIA benchmarks).

### 10.2 Lab repo
- Separate public repo: https://github.com/mgamio/labAI. Configure as `lab_repo` in `_config.yml` and link it from every article.
- One folder per article: `mNN-<theme>/NN-<slug>/`, containing:

| File | Written by | Purpose |
|---|---|---|
| `README.md` | author (Claude Code may help) | How to run the project |
| `NOTES.md` | **author** | First-hand observations: what worked, errors hit, fixes, timings, opinions. **Primary source for the article's experience sections.** |
| `RESULTS.md` | author / scripts | Measured numbers (tokens/s, RAM use, latency, eval scores). **The only allowed source for numbers in the article.** |
| `screenshots/` | author / capture scripts | Real screenshots and terminal captures |
| code, `docker-compose.yml`, tests | author | The working project |

- If `NOTES.md` or `RESULTS.md` is missing or thin, do not invent content: list the gaps in the PR as questions for the author.

### 10.3 Calendar

Status flow: `planned` → `building` (author working in the lab) → `ready` (author marks it; folder complete) → `drafted` (PR open) → `published`.
🛒 = Amazon hardware links expected. 🧰 = includes a new tool on the Tools page.

| # | Month | Title (working) | Type | Pillar | Lab folder | Notes |
|---|---|---|---|---|---|---|
| 1 | 1 · Foundations | Local AI on Windows with WSL2, Docker and Ollama | tutorial | Self-Hosting & Local AI | `m01-foundations/01-windows-wsl2-ollama` | Exact setup of §10.1 |
| 2 | 1 | Minisforum UM870 as a Local AI Homelab: Real Benchmarks | review | Self-Hosting & Local AI | `m01-foundations/02-um870-benchmarks` | 🛒 First-hand review; author's photos; numbers only from RESULTS.md |
| 3 | 1 | Python for Java Developers: Build an LLM API with FastAPI | tutorial | AI Agents & Tooling | `m01-foundations/03-fastapi-llm-api` | Java↔Python comparisons throughout |
| 4 | 1 | Run Local LLMs with Ollama: Hardware Guide for Developers | buying-guide | Self-Hosting & Local AI | `m01-foundations/04-ollama-hardware-guide` | 🛒 Research-based + UM870 data from #2 |
| 5 | 1 | A Docker Compose Stack for Local AI | tutorial | Self-Hosting & Local AI | `m01-foundations/05-compose-local-ai-stack` | Ollama + Open WebUI + Qdrant |
| 6 | 2 · RAG | Build a Self-Hosted RAG with Ollama and Qdrant (Python) | tutorial | AI Agents & Tooling | `m02-rag/06-rag-python` | |
| 7 | 2 | The Same RAG in Python and Spring AI: A Side-by-Side Comparison | comparison | Java & Spring Boot | `m02-rag/07-rag-spring-ai` | Reuses #6 data/docs |
| 8 | 2 | How Much RAM and VRAM Do You Need for Local LLMs? | guide | Self-Hosting & Local AI | `m02-rag/08-vram-calculator` | 🛒 🧰 Local LLM Hardware Calculator (§5.2) |
| 9 | 3 · Agents + MCP | Expose a Spring Boot Service as an MCP Server with `@McpTool` | tutorial | Java & Spring Boot | `m03-agents-mcp/09-spring-mcp-server` | Spring AI 2.x, Boot 4 |
| 10 | 3 | Connect a Python LangGraph Agent to a Spring Boot MCP Server | tutorial | AI Agents & Tooling | `m03-agents-mcp/10-langgraph-mcp-client` | **Bridge project** Java↔Python; uses #9 |
| 11 | 3 | Run a Local Coding Agent with Ollama | tutorial | Self-Hosting & Local AI | `m03-agents-mcp/11-local-coding-agent` | 🛒 |
| 12 | 4 · Evals + observability | Self-Host Langfuse to Monitor Your LLM Apps | tutorial | Self-Hosting & Local AI | `m04-evals-observability/12-langfuse` | Instruments #6 and #10 |
| 13 | 4 | How to Evaluate a RAG Pipeline with RAGAS | tutorial | AI Agents & Tooling | `m04-evals-observability/13-ragas-evals` | Scores from RESULTS.md |
| 14 | 5 · Production | A Kubernetes Homelab on Windows with k3d | tutorial | Self-Hosting & Local AI | `m05-production/14-k3d-homelab` | 🛒 |
| 15 | 5 | Deploy an AI Agent to Your Home Server with GitHub Actions | tutorial | Self-Hosting & Local AI | `m05-production/15-gha-deploy` | Self-hosted runner |
| 16 | 5 | Securing an MCP Server with OAuth 2.0 | tutorial | Java & Spring Boot | `m05-production/16-mcp-oauth` | Extends #9 |
| 17 | 6 · Capstone | AI System Design Interview Questions (with Answers) | guide | Algorithms & Interviews | `m06-capstone/17-ai-system-design` | Draws on all previous projects |
| 18 | 6 | Local LLM vs API: When Does Owning Hardware Pay Off? | guide | Self-Hosting & Local AI | `m06-capstone/18-local-vs-api-cost` | 🛒 🧰 Local LLM vs API Cost Calculator (§5.2); reuses existing LLM API Cost Calculator data |
| 19 | 6 | Capstone: an End-to-End AI Agent System on a Mini PC | tutorial | AI Agents & Tooling | `m06-capstone/19-capstone` | Architecture diagram + eval results |
| 20 | when it happens | Upgrading a Mini PC to 96 GB for Local LLMs: Before/After | review | Self-Hosting & Local AI | `extras/20-ram-upgrade-96gb` | 🛒 Only if the author does the upgrade |

**Backlog** (only when the calendar is caught up or the author asks; **max 1 backlog article published per week**, counted within the overall 2–3/week cap): Best Mini PCs for a Developer Homelab · Raspberry Pi 5 vs Intel N100 Mini PC · Self-Host a Private Git Server with Gitea · Best NAS for Developer Backups · Self-Host a Spring Boot App with Cloudflare Tunnel.

### 10.4 Calendar tracking
- Create `_data/content_calendar.yml` from the table above (fields: `id`, `month`, `title`, `type`, `pillar`, `lab_folder`, `amazon`, `tool`, `status`, `post_path`). Initial status for all: `planned`.
- `scripts/next_article.py`: prints the lowest-`id` entry with `status: ready`. If none, it lists entries in `building` and stops — **never draft an article whose folder is not `ready`.**
- When a PR is opened, set `status: drafted` and `post_path`; when the author merges, set `published`.
- Cadence: max 2–3 published articles per week overall; it's fine to publish fewer when learning takes longer.
- Backlog cadence: **max 1 backlog article per week**. Track backlog items in `_data/content_calendar.yml` with `backlog: true`; `scripts/next_article.py` must skip a backlog item if another backlog article was drafted or published in the last 7 days.
- Each article links: its lab folder, the previous/next calendar article in the same month, and related tools.

## 11. Monetization channels (beyond AdSense and Amazon)

Priority order: 11.1 → 11.2 → 11.3 now; 11.4–11.6 later. All values marked `{{...}}` are placeholders the author fills in.

### 11.1 "Work with me" page (now)
- Page `/work-with-me/`, linked in the main navigation and from the About page.
- Sections: short intro (20+ years Java/Spring, now building AI agents/RAG/MCP), services, recent work (links to lab-repo projects and articles), contact.
- Services (author confirms/edits): AI integration for Java/Spring teams · MCP server design and implementation · RAG/agent architecture review · Local/self-hosted AI setup · Coding-interview and system-design mock interviews.
- Contact: static form via `{{FORM_PROVIDER}}` (e.g. Formspree) or `mailto:{{CONTACT_EMAIL}}`. No prices unless the author provides them.
- Also add a small "Open to AI engineering roles" note with a link to `{{LINKEDIN_URL}}` (author can toggle it off via `_config.yml: open_to_work: true|false`).

### 11.2 Newsletter (now)
- Provider: `{{NEWSLETTER_PROVIDER}}` (e.g. Buttondown or MailerLite). Embed via `_includes/newsletter.html`, configurable in `_config.yml` (`newsletter_action_url`).
- Placement: end of every post, sidebar/footer, and on the Tools pages below the tool.
- Positioning line: "Local AI & agents for Java developers — one practical email per week."
- GDPR (site operated from Germany): double opt-in enabled at the provider, consent checkbox text linking to the Privacy Policy, update the Privacy Policy with the provider as processor.
- Optional lead magnet later: a PDF checklist from the lab (e.g. "Local AI stack setup checklist").

### 11.3 Affiliate link handling (now)
- Registry `_data/affiliates.yml` for non-Amazon programs:

```yaml
hetzner:            # example key
  name: "{{PROGRAM_NAME}}"
  url: "{{AFFILIATE_URL}}"
  program: "{{NETWORK_OR_DIRECT}}"
  disclosure: "I may earn a commission if you sign up through this link."
```

- `_includes/affiliate-link.html` usage: `{% include affiliate-link.html id="hetzner" text="Hetzner Cloud" %}` → renders `<a href="..." rel="sponsored nofollow" target="_blank">`.
- Any post using `affiliate-link.html` or `product.html` must have `affiliate: true` in front matter so the disclosure renders (§4.2). Add a build check script (`scripts/check_affiliates.py`) that fails if a post uses these includes without `affiliate: true`.
- Candidate categories (author signs up; never invent URLs): VPS/cloud hosting, AI/devtool SaaS (observability, vector DBs, coding tools), mini PC/hardware manufacturers' own programs.
- **Amazon separation rule:** once Amazon API images are enabled (Phase 2), do not render Amazon product images in the same section as non-Amazon affiliate links. The check script should warn when a post mixes `product.html` with images and `affiliate-link.html` in the same H2 section.
- Own books: `_includes/book-cta.html` for contextual links to the author's books (with Amazon tag) in related articles (interviews, design).

### 11.4 Digital products (from month 2–3)
- Page `/products/` listing paid kits sold via `{{STORE_PROVIDER}}` (e.g. Gumroad / Lemon Squeezy). External checkout only; no payment handling on the site.
- First candidate: "Java + Python AI Agent Starter Kit" packaging calendar items #9–#10 (Spring Boot MCP server + LangGraph agent, Docker Compose, docs).
- Free version stays in the lab repo; the paid kit adds extended docs, extra examples and support. Articles may link to the kit in a clearly labeled box.

### 11.5 Developer ad networks (later, optional)
- When traffic is steady, the author may apply to Carbon Ads or EthicalAds. Prepare `_includes/devads.html` behind a `_config.yml` flag (`devads_enabled: false`). Do not enable alongside AdSense on the same page without the author's decision.

### 11.6 Sponsored reviews and freemium tools (month 6+)
- Sponsored posts: front matter `sponsored: true` → renders a "Sponsored" label at the top; tag links `rel="sponsored"`. The review must still follow §3 (no fake experience).
- Freemium tools: no work now; keep current tools free.

### 11.7 Consent and legal
- AdSense in the EEA requires a Google-certified consent management platform (CMP). Consider CMP from Google AdSense. (DONE).
- Keep Privacy Policy and Impressum updated for: AdSense, Amazon Associates, newsletter provider, form provider, any ad network.

### 11.8 Order of work (append to §9)
10. "Work with me" page + `open_to_work` toggle (PR).
11. Newsletter include + privacy policy update (PR).
12. Affiliate registry, `affiliate-link.html`, `book-cta.html`, `check_affiliates.py` (PR).
13. CMP integration (PR). (DONE).
14. `/products/` page — when the first kit exists.
