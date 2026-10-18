---
title: "CLAUDE.md and AGENTS.md Generator"
short_title: "CLAUDE.md Generator"
description: "Free generator for AGENTS.md, CLAUDE.md, GEMINI.md, Copilot instructions and Cursor rules. Pick your stack and architecture and get a clear instructions file for your AI coding agent."
lead: "Create the instructions file your AI coding agent reads at the start of every session: build commands, architecture rules and guardrails for Claude Code, Codex, Cursor, Copilot and Gemini CLI."
tool: claude-md-generator
image: /assets/images/claudeMdGeneratorTool.jpg
order: 3
---

## How to Use the Generator

1. **Describe your project** in one sentence. The agent reads this first.
2. **Pick a stack preset.** It fills in the tech stack and the exact commands to build, run and test your project. Edit them to match your repository: correct commands are the most useful part of the file.
3. **Pick an architecture** to tell the agent where code belongs, and **choose working rules** such as "test first" or "ask before adding dependencies".
4. **Add project notes**: the things a new teammate would need to be told, and the mistakes your agent keeps making.
5. **Choose the file** for your agent, then **Copy** or **Download** it and save it in the root of your repository.

The generator remembers your settings in your browser, so you can come back and adjust them.

**Prefer to start from a finished file?** Copy one of the ready-made templates:

{% assign templates = site.agent_templates | sort: "order" %}{% for t in templates %}- [{{ t.title }}]({{ t.url | relative_url }})
{% endfor %}

## Which File Does Each AI Coding Agent Read?

Every agent reads a Markdown file from your repository at the start of a session. Most of them now agree on one name, `AGENTS.md`:

| Agent | Reads |
|---|---|
| OpenAI Codex, Jules, Windsurf, Zed, Aider, JetBrains Junie, Amp | `AGENTS.md` |
| Cursor | `AGENTS.md`, and rules in `.cursor/rules/*.mdc` |
| GitHub Copilot | `.github/copilot-instructions.md`, `AGENTS.md`, or a `CLAUDE.md` or `GEMINI.md` in the root |
| Claude Code | `CLAUDE.md`; reads `AGENTS.md` when the repository has no `CLAUDE.md` |
| Gemini CLI | `GEMINI.md`; reads `AGENTS.md` when you add it to `context.fileName` in `settings.json` |

<br/>

**The simplest setup for a team that uses several agents:** keep the rules in one `AGENTS.md`. If you also need Claude-specific instructions, create a `CLAUDE.md` that imports the shared file with `@AGENTS.md` and adds the rest below it. One file to maintain, every agent up to date.

In a monorepo, you can put another `AGENTS.md` in each subproject. Agents use the nearest file to the code they are editing, so each package can have its own commands.

<div>
{%- include inArticleAds.html -%}
</div>

## What to Put in Your CLAUDE.md or AGENTS.md

The file is loaded into the agent's context in **every session**, before you type anything. Every line costs tokens and competes for the agent's attention, so include only what the agent can't find out by itself:

- **Exact commands** to build, test, run one test, and lint. With these, the agent checks its own work instead of guessing.
- **Architecture boundaries**: which package may depend on which, where business logic goes, what must never be imported where.
- **Conventions that differ from the default**: "money is `BigDecimal`", "DTOs are records", "no Lombok".
- **Gotchas**: the generated folder nobody may edit, the test that needs Docker, the legacy module that must not change.
- **Workflow rules**: run the tests before finishing, don't commit unless asked, ask before adding dependencies.

Leave out:

- **What the code already shows.** The agent can read your `pom.xml` or `package.json`.
- **Generic advice** such as "write clean code" or "follow best practices". It changes nothing.
- **Long explanations and tutorials.** Link to the documentation instead.
- **Secrets.** The file is committed with your code.

Anthropic's documentation for Claude Code recommends **under 200 lines** per `CLAUDE.md`, because longer files reduce how closely the agent follows them. The generator shows the line count and an estimate of the tokens the file adds to every session.

## A Real Example: The CLAUDE.md Behind This Website

This blog is maintained with Claude Code. Here is part of its `CLAUDE.md`, slightly shortened. Notice that most of it is **gotchas**: things that look right but break the live site, which no agent could guess from the code:

```markdown
## Workflow

- Work locally first with `bundle exec jekyll serve`.
  Propose changes and have the author review them before editing.
  Only commit or push when asked.
- To build without serving, run `bundle exec jekyll build`.

## Build and deploy gotchas

- `jekyll serve` writes the local server URL into every canonical, og:url
  and JSON-LD URL, so before committing `_site`, regenerate it with
  `bundle exec jekyll build` (which uses `url: https://codersite.dev`).
- Permalinks are `/:title/`, and `:title` comes from the post filename, not
  the front-matter `title`. Changing a title does not change the URL.
- `image:` must start with `/`. Without it, jekyll-seo-tag resolves the path
  relative to the post URL and the og:image breaks.
```

Each rule is there because a mistake happened once. That is the best way to grow the file: **when the agent makes the same mistake twice, add a line.**

<div>
{%- include inArticleAds.html -%}
</div>

## Rules That Agents Actually Follow

**Be specific.** "Use constructor injection; never use `@Autowired` on fields" is followed. "Write good Spring code" is not.

**Give the reason for unusual rules.** "Don't edit `src/generated/`: it is overwritten by the OpenAPI build" lets the agent handle cases the rule doesn't mention.

**Don't contradict yourself.** When two rules conflict, the agent picks one at random. Review the file when the project changes.

**Use tools for hard guarantees.** The instructions file is context, not enforcement: an agent can still ignore a rule. For things that must never happen, such as pushing to `main` or editing secrets, use your agent's permission settings or hooks and your CI pipeline.

**Scope rules to the files they apply to.** In a large repository, rules for one area shouldn't load for every task. Claude Code reads path-scoped rules from `.claude/rules/`, Copilot from `.github/instructions/*.instructions.md` with `applyTo`, and Cursor from `.cursor/rules/*.mdc` with `globs`.

An instructions file is a prompt that runs at the start of every session, so writing a good one is prompt engineering. *Prompt Engineering for LLMs* by John Berryman and Albert Ziegler, two of the engineers behind GitHub Copilot, explains how a model reads the context you give it and how to structure instructions so it follows them:

<div>
{%- include promptEngineeringForLLMs.html -%}
</div>

## Architecture Rules Your Agent Can Follow

An agent writes code where it fits best *in its own opinion*, unless you tell it where code belongs. The architecture presets give it clear boundaries:

- **Layered:** controllers handle HTTP, services hold the business logic, repositories access the database. The best default for a typical Spring Boot REST API.
- **Hexagonal / Clean Architecture:** the domain has no framework imports, and adapters implement interfaces (ports) that the application defines. The [open-closed principle](https://codersite.dev/open-closed-principle/){:target="_blank"} applied to a whole application.
- **Domain-Driven Design:** code organized by business area, with aggregates that protect their own rules.
- **Microservices** and **modular monolith:** rules about who owns which data and which module may call which.

The rules work only if you can state your design clearly, and that is a skill worth learning for its own sake. Review the principles behind them in [Software Design Principles Explained with Java Examples](https://codersite.dev/software-design-principles/){:target="_blank"} and the [SOLID principles guide](https://codersite.dev/solid-principles-the-definitive-guide/){:target="_blank"}.

An agent follows your architecture only as well as you can describe it. My book *Software Design Principles* explains SOLID, coupling, cohesion and the trade-offs between them with practical examples, the vocabulary you need to write rules an agent can follow:

<div>
{%- include softwareDesign.html -%}
</div>

<div>
{%- include inArticleAds.html -%}
</div>

## Frequently Asked Questions

**What is the difference between CLAUDE.md and AGENTS.md?**
Only the name and the agents that read them. `CLAUDE.md` is Claude Code's file; `AGENTS.md` is the shared standard that most other agents read. The content is the same kind of Markdown. Claude Code reads `AGENTS.md` when there is no `CLAUDE.md`, and a `CLAUDE.md` can import it with `@AGENTS.md`.

**Should I commit the file to Git?**
Yes. It describes the project, so it belongs with the code and helps everyone on the team. Personal preferences go in a file you don't commit, such as `CLAUDE.local.md` (add it to `.gitignore`).

**How long should the file be?**
As short as possible while still covering the commands, the architecture rules and the gotchas. Most projects need 30 to 100 lines. Above 200 lines, move rules that apply to only part of the code into path-scoped rules.

**Does the agent always follow the instructions?**
No. The file is context that strongly guides the agent, not a configuration it must obey. Clear, specific, consistent rules are followed far more reliably than long or vague ones. For anything that must never happen, use permissions, hooks and CI checks.

**Can I generate the file with the agent itself?**
Yes. Claude Code's `/init` command, for example, analyzes the repository and writes a first `CLAUDE.md`. Use it together with this generator: `/init` finds the commands, and the generator adds the architecture and working rules that an agent can't discover from the code.

**Is anything I type sent to a server?**
No. The generator is a small JavaScript program that runs in your browser. Your settings are saved only in your browser's local storage.

## Go Further: Build Your Own AI Applications

An instructions file makes you a better *user* of AI agents. If you want to build AI features or agents into your own applications, these two books are the best places to start.

*AI Engineering* by Chip Huyen covers the whole process of building products on top of foundation models: choosing a model, evaluating its answers, retrieval (RAG), agents, fine-tuning and cost. It's the book to read before your first AI feature goes to production:

<div>
{%- include aiEngineering.html -%}
</div>

*Building Applications with AI Agents* by Michael Albada goes deeper into agents themselves: how they plan, use tools and keep memory, how several agents work together, and how to make them reliable enough for real users:

<div>
{%- include buildingApplicationsWithAIAgents.html -%}
</div>
