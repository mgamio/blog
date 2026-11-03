---
title: "SKILL.md Generator: Agent Skills for Claude Code and Other AI Agents"
short_title: "SKILL.md Generator"
description: "Free generator for Agent Skills (SKILL.md). Pick your stack and a task such as writing tests, fixing bugs or reviewing changes, and get a ready-to-use skill for Claude Code and other AI coding agents."
lead: "Create Agent Skills for the tasks you repeat every week: writing tests, fixing bugs, reviewing changes, database migrations and dependency upgrades, adapted to Spring Boot, Next.js, FastAPI, Go or ASP.NET Core."
tool: skill-md-generator
image: /assets/images/skillMdGeneratorTool.jpg
order: 5
---

## How to Use the Generator

1. **Pick your stack.** It fills in the exact commands to build and test your project and the conventions of its frameworks.
2. **Pick a skill**: write tests, fix a bug, add a REST endpoint, review changes, create a database migration, upgrade a dependency, commit, or refactor safely.
3. **Check the name and the description.** They decide whether the agent ever uses your skill. The generator warns you when they break a rule, and the sections below explain how to write them.
4. **Choose who can run it.** Let Claude use the skill when a request matches, or only when you type `/name`.
5. **Add project rules**: the conventions and gotchas of your repository.
6. **Copy or download** the file and save it as `.claude/skills/<name>/SKILL.md` in your repository. In Claude Code, type `/` and the name to run it.

The generator remembers your settings in your browser, so you can come back and build the next skill.

**Start with a `CLAUDE.md` or `AGENTS.md`.** Each skill handles one task; the commands, architecture rules and gotchas that matter for every task belong in the instructions file that the agent reads in every session. Create it with the [CLAUDE.md and AGENTS.md generator](/tools/claude-md-generator/), then add skills for the tasks you repeat.

Want to turn your AI coding skills into a new career? MSIT's AI programs can be fully funded in Germany, and codersite readers get a €500 welcome bonus. [Read the full review](/msit-ai-career-programs-germany/) before you decide.

<div>
{%- include msitReferral.html -%}
</div>

## What Is an Agent Skill?

A skill is a folder with a `SKILL.md` file that teaches an AI agent how to do one task: the steps, the commands and the rules. It can also hold scripts, reference documents and templates:

```text
write-tests/
├── SKILL.md        # required: name, description and instructions
├── scripts/        # optional: code the agent can run
├── references/     # optional: documentation it reads when needed
└── assets/         # optional: templates and data files
```

The format is an open standard, [Agent Skills](https://agentskills.io/specification){:target="_blank"}, created by Anthropic and adopted by a growing number of AI agents. `SKILL.md` starts with YAML front matter and continues with Markdown instructions:

```markdown
---
name: write-tests
description: Writes JUnit 5, AssertJ and Mockito tests for Spring Boot code. Use when the user asks to add, write or improve tests.
---

# Write tests

1. Read the code under test and the existing tests near it.
2. ...
```

The big difference from a `CLAUDE.md` file is **when the content is loaded**. A skill loads in three steps:

| What | When it is loaded | Cost |
|---|---|---|
| `name` and `description` | At the start of every session, for every skill | About 100 tokens per skill |
| The instructions in `SKILL.md` | Only when the skill is used | Under 5,000 tokens recommended |
| Files in `scripts/`, `references/`, `assets/` | Only when the instructions need them | Only what is read |

<br/>

So you can install dozens of skills without filling the agent's context. But it also means the agent decides whether to use a skill **by its name and description alone**. That makes them the two most important lines of the file.

**Where Claude Code looks for skills:**

| Location | Path | Use it for |
|---|---|---|
| Project | `.claude/skills/<name>/SKILL.md` | Skills for this repository. Commit them so the whole team gets them. |
| Personal | `~/.claude/skills/<name>/SKILL.md` | Your own skills, in every project |
| Plugin | `<plugin>/skills/<name>/SKILL.md` | Skills you share as a plugin, run as `/plugin-name:skill-name` |

<br/>

Claude Code picks up new and changed skills while it runs. Other agents that support the standard read the same `SKILL.md`; check your agent's documentation for its skills folder, and choose **Any agent** as the format in the generator.

<div>
{%- include inArticleAds.html -%}
</div>

## How to Name a Skill

The `name` is the skill's identifier and, in Claude Code, the command you type: a skill named `write-tests` runs with `/write-tests`. The rules:

- 1 to 64 characters: **lowercase letters, numbers and hyphens** only.
- It can't start or end with a hyphen or contain two hyphens in a row (`--`).
- It **must match the folder name**: `write-tests/SKILL.md` has `name: write-tests`.
- It can't contain the reserved words `anthropic` or `claude` (claude.ai and the Skills API reject them).

A good name says which task the skill does, in words you would type:

| Avoid | Problem | Better |
|---|---|---|
| `helper`, `utils`, `tools` | Says nothing about the task | `write-tests` |
| `Write_Tests` | Uppercase letters and underscores are invalid | `write-tests` |
| `testing`, `database` | Too generic: which task? | `write-tests`, `db-migration` |
| `claude-review` | Contains a reserved word | `review-changes` |
| `spring-junit5-mockito-test-writer-v2` | Long to type; versions belong in `metadata` | `write-tests` |

<br/>

Anthropic's [skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices){:target="_blank"} suggest the gerund form, such as `writing-tests` or `processing-pdfs`, and accept action names such as `write-tests` too. The generator uses action names because they read like commands: `/write-tests`, `/fix-bug`, `/commit`. Whichever style you choose, **use it for all your skills**, so the list stays easy to scan.

## How to Write the Description

The `description` is the most important line in the skill. It is the only text the agent sees before it decides to load the skill, and it may be choosing between dozens of them. A skill with a vague description is never used, or is used for the wrong tasks.

Use this formula:

```text
<What the skill does: specific verbs, objects and technologies>. Use when <the situations and the words that should trigger it>.
```

Four rules make it work:

1. **Write in the third person.** The description is added to the agent's system prompt. Write "Writes tests...", not "I can write tests..." or "You can use this to...".
2. **Say what it does and when to use it.** The first sentence describes the task; the second, starting with "Use when", lists the triggers.
3. **Use the words your users say.** People ask to "bump", "update" or "upgrade" a library; they paste a "stack trace" or say "it crashes". Name the frameworks and file types too: JUnit, Flyway, `pom.xml`, `.tsx`.
4. **Put the main use case first.** The limit is 1,024 characters, and Claude Code shortens long descriptions in its skill list. Two or three sentences are usually enough.

### Example 1: Too vague

```yaml
description: Helps with tests.
```

Helps how? Which tests? This matches almost nothing, so the agent rarely loads it. Better:

```yaml
description: Writes JUnit 5, AssertJ and Mockito unit tests for Spring Boot classes and services, including edge cases and error cases. Use when the user asks to add, write or improve tests, increase test coverage, or test a class, file or endpoint.
```

It names the frameworks, says what kind of tests it writes, and lists the ways people ask for tests.

### Example 2: First person

```yaml
description: I can review your code and find bugs before you commit.
```

The point of view is wrong for a system prompt, and "find bugs" says nothing about the stack. Better:

```yaml
description: Reviews uncommitted Next.js changes for bugs, security issues, missing tests and common TypeScript pitfalls, and reports findings by severity. Use when the user asks for a code review, to check their changes, or before committing or opening a pull request.
```

### Example 3: Too broad

```yaml
description: Handles anything related to the database.
```

This one has the opposite problem: it loads for every question that mentions SQL, and then pushes a migration workflow into tasks that don't need one. Name the one task instead:

```yaml
description: Creates a Flyway database migration for a schema change and checks that it is safe to deploy. Use when the user asks to add or change a table, column, index or constraint, or mentions a database migration.
```

### Example 4: Actions you want to start yourself

Some skills do things with side effects, such as committing, deploying or upgrading. You don't want the agent to commit just because a conversation mentions commits. Keep the description precise and, in Claude Code, turn off automatic use:

```yaml
name: commit
description: Writes a Conventional Commits message for the staged changes and creates the commit. Use when the user asks to commit, or to write a commit message.
disable-model-invocation: true
```

The skill now runs only when you type `/commit`. In the generator, choose **Only when I type /name**.

**Anthropic's own example**, from its best practices, follows the same pattern: *"Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction."*

**When a skill doesn't work as expected:**

- **The agent never uses it:** add the words people actually type to the "Use when" sentence, or run it yourself with `/name`.
- **The agent uses it too often:** make the description more specific, or set `disable-model-invocation: true`.

<div>
{%- include inArticleAds.html -%}
</div>

## How to Write the Instructions

Once the skill is loaded, the agent follows the Markdown body. The skills from the generator use the same structure, which works well for most tasks:

- **Steps**, numbered, in the order the agent should work, with the **exact commands** for your project. The agent already knows what a unit test is; it doesn't know that your tests run with `./mvnw test`.
- **Rules**, including what not to do: "never weaken a test to make it pass", "never push". These prevent the most expensive mistakes.
- **When it's done**: the checks that must pass and what to report. Without them, the agent decides by itself when the task is finished.

Keep `SKILL.md` **under 500 lines**. Every line costs tokens each time the skill runs. Move long reference material, such as an API guide or a style guide, into a file in `references/` and link to it from `SKILL.md`; the agent reads it only when it needs it.

Claude Code adds two features that the generator uses:

- `$ARGUMENTS` is replaced with what you type after the command. `/fix-bug OrderService throws NPE on empty cart` passes the problem to the skill.
- A line like `` !`git diff --stat HEAD` `` runs the command before the agent reads the skill and inserts its output, so the review skill starts with the list of changed files.

**Grow your skills the way you grow a `CLAUDE.md`:** run the skill on a real task, watch what the agent does, and add a rule when it makes the same mistake twice.

Skills are prompts that run on demand, so writing them is prompt engineering. *Prompt Engineering for LLMs* by John Berryman and Albert Ziegler, two of the engineers behind GitHub Copilot, explains how a model reads the context you give it and how to write instructions it follows reliably:

<div>
{%- include promptEngineeringForLLMs.html -%}
</div>

## Claude Code Fields and the Portable Standard

The Agent Skills standard defines a few fields. Claude Code adds more for invocation and permissions:

| Field | Where it works | What it does |
|---|---|---|
| `name` | Standard | Identifier and folder name; the `/command` in Claude Code |
| `description` | Standard | What the skill does and when to use it |
| `license`, `compatibility`, `metadata` | Standard | License, environment requirements, your own key-value data |
| `allowed-tools` | Standard (experimental) | Tools the skill may use without asking, such as `Read` or `Bash(git diff:*)` |
| `argument-hint` | Claude Code | Hint shown after the command, such as `[class or file]` |
| `disable-model-invocation` | Claude Code | `true`: only you can run the skill, with `/name` |
| `user-invocable` | Claude Code | `false`: only Claude can use it; hidden from the `/` menu |
| `context`, `agent` | Claude Code | `context: fork` runs the skill in a separate subagent |
| `model`, `effort` | Claude Code | Model and effort level while the skill runs |
| `paths` | Claude Code | Glob patterns that limit automatic use to matching files |

<br/>

claude.ai uploads and the Claude API accept only the standard fields and reject the others. For those, and for other agents, choose **Any agent** as the format: the generator then leaves out the Claude Code fields and features.

A note on `allowed-tools`: it pre-approves the commands a skill needs, so the agent doesn't stop to ask before running your tests. Approve only read and test commands. Keep commands that change things outside your working copy, such as `git push` or a deploy, behind a permission prompt.

## Skills or CLAUDE.md?

Both are Markdown instructions for the agent, but they load at different times:

- **`CLAUDE.md` or `AGENTS.md`** is loaded in every session. Put there the facts that matter for every task: the build commands, the architecture rules, the gotchas.
- **A skill** is loaded only for its task. Put there procedures: how to write tests, how to review changes, how to create a migration.

If a section of your `CLAUDE.md` starts with "When you ...", it is probably a skill. Moving it out keeps `CLAUDE.md` short, and agents follow short files more reliably. To create the always-loaded file, use the [CLAUDE.md and AGENTS.md generator](/tools/claude-md-generator/){:target="_blank"}.

<div>
{%- include inArticleAds.html -%}
</div>

## Frequently Asked Questions

**What is the difference between a skill and a custom slash command?**
In Claude Code, skills replace custom commands. A Markdown file in `.claude/commands/` still works, but a skill can also hold scripts and reference files, and the agent can use it by itself when a request matches its description.

**Why doesn't the agent use my skill?**
Almost always because of the description. Make sure it says what the skill does, includes a "Use when" sentence with the words you actually type, and is written in the third person. You can always run the skill yourself with `/name`.

**Should I commit skills to Git?**
Yes, project skills in `.claude/skills/` belong with the code, so everyone on the team gets the same procedures. Keep personal skills in `~/.claude/skills/`.

**Do I still need a CLAUDE.md if I use skills?**
Yes. Skills load only for their task, so the facts every task needs, such as the build commands and the architecture rules, still belong in a `CLAUDE.md` or `AGENTS.md`. Skills can then stay short and refer to those commands. Create the file with the [CLAUDE.md and AGENTS.md generator](/tools/claude-md-generator/).

**Can a skill run scripts?**
Yes. Put them in the skill's `scripts/` folder and tell the agent in `SKILL.md` when to run them. The agent runs scripts without loading their code into its context, which makes them a cheap and reliable way to handle exact, repetitive steps.

**Do skills work with agents other than Claude Code?**
Agent Skills is an open standard, and a growing number of agents read `SKILL.md`. Generate the skill with the **Any agent** format, which uses only the standard fields, and save it in your agent's skills folder.

**Is anything I type sent to a server?**
No. The generator is a small JavaScript program that runs in your browser. Your settings are saved only in your browser's local storage.

## Go Further: Build Your Own AI Applications

Skills make you a better *user* of AI agents. If you want to build AI features or agents into your own applications, these two books are the best places to start.

*AI Engineering* by Chip Huyen covers the whole process of building products on top of foundation models: choosing a model, evaluating its answers, retrieval (RAG), agents, fine-tuning and cost:

<div>
{%- include aiEngineering.html -%}
</div>

*Building Applications with AI Agents* by Michael Albada goes deeper into agents themselves: how they plan, use tools and keep memory, how several agents work together, and how to make them reliable enough for real users:

<div>
{%- include buildingApplicationsWithAIAgents.html -%}
</div>
