---
title: "AGENTS.md Template for Next.js (App Router)"
short_title: "Next.js"
description: "An AGENTS.md for Next.js with the App Router and TypeScript: Server Components by default, strict types, Tailwind CSS, Vitest and Playwright rules for your AI coding agent."
lead: "An AGENTS.md for a Next.js App Router project with strict TypeScript and Tailwind CSS. It keeps your AI agent from writing outdated Pages Router and client-side code."
file: "AGENTS.md"
stack: nextjs
arch: none
order: 4
image: /assets/images/claudeMdGeneratorTool.jpg
template: |
  # Storefront

  Online store front end built with Next.js.

  ## Tech stack

  - TypeScript (strict)
  - Next.js App Router
  - React
  - Tailwind CSS

  ## Commands

  - Build: `npm run build`
  - Run locally: `npm run dev`
  - Run all tests: `npm test`
  - Run one test: `npm test -- src/lib/cart.test.ts`
  - Lint and format: `npm run lint`

  ## Code style

  - TypeScript strict mode. Never use `any`; use `unknown` and narrow it.
  - Components are Server Components by default. Add `"use client"` only for state, effects or browser APIs.
  - Fetch data in Server Components or Server Actions, not in `useEffect`.
  - Style with Tailwind utility classes. No inline styles and no new CSS files.
  - Use named exports, except where Next.js requires a default export (pages, layouts).

  ## Testing

  - Unit tests with Vitest and Testing Library, next to the file they test (`*.test.ts`).
  - Test behavior the user sees, not implementation details.
  - End-to-end tests with Playwright in `e2e/`.

  ## Working rules

  - Every change comes with new or updated tests.
  - Run the build and the tests before saying a task is done. If they fail, fix them or report the failure; never hide it.
  - Write complete code. No placeholders such as `// rest of the code unchanged` or `TODO: implement`.
  - Keep changes focused on the task. Don't refactor, rename or reformat unrelated code.
  - Ask before adding a new dependency.
  - Never commit secrets, API keys or passwords. Read them from environment variables.
  - Don't commit or push unless asked.

  ## Project notes

  - Only variables that start with `NEXT_PUBLIC_` reach the browser. Never put secrets in them.
  - Server-only code (database access, API keys) lives in `src/server/` and imports `server-only`.
  - Use `next/image` for images and `next/link` for internal links.
---
Next.js changed a lot with the App Router, and much of the code that AI models learned from is older: `getServerSideProps`, data fetching in `useEffect`, `"use client"` at the top of every file. This template tells the agent which version of Next.js it is working with.

## Why These Rules

- **Server Components by default.** Adding `"use client"` only where a component needs state, effects or browser APIs keeps JavaScript out of the browser. Agents add it everywhere "to be safe" unless told otherwise.
- **Fetch data on the server.** Fetching in Server Components or Server Actions avoids loading spinners and leaks no API keys. It replaces the `useEffect` pattern agents default to.
- **No `any`.** With strict TypeScript, the compiler catches the agent's mistakes before you do. `any` turns that off, so the rule asks for `unknown` and narrowing.
- **`NEXT_PUBLIC_` variables.** Everything with this prefix is bundled into the browser code. A note about it prevents the most expensive mistake an agent can make in a Next.js app: shipping a secret.
- **Tailwind only.** One styling approach, stated clearly, stops the agent from mixing CSS modules, inline styles and utility classes.

<div>
{%- include inArticleAds.html -%}
</div>

## Adapt It to Your Project

- **Check the test commands.** If you use Jest instead of Vitest, change "Run one test" so the agent can run a single file.
- **Using the Pages Router?** Remove the Server Components rules; they don't apply.
- **Add your folder structure**, for example `src/app` for routes and `src/components/ui` for shared components, so new files land in the right place.
- **pnpm or yarn?** Change the commands in the [generator](https://codersite.dev/tools/claude-md-generator/?stack=nextjs&arch=none){:target="_blank"}.

Clear rules come from clear design. The same principles that keep back-end code easy to change, such as single responsibility, small interfaces and loose coupling, keep React components easy to change too. My book *Software Design Principles* explains them with practical examples:

<div>
{%- include softwareDesign.html -%}
</div>
