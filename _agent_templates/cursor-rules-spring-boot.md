---
title: "Cursor Rules Template for Spring Boot (.cursor/rules)"
short_title: "Cursor Rules Spring Boot"
description: "A ready-to-use Cursor rules file for Spring Boot in the .mdc format: front matter, alwaysApply, path-scoped rules with globs, and how to migrate from the old .cursorrules file."
lead: "A Cursor project rule for a Spring Boot REST API, in the .mdc format Cursor uses today. Save it as .cursor/rules/project.mdc and add path-scoped rules next to it."
file: "project.mdc"
file_path: ".cursor/rules/project.mdc"
stack: spring-maven
arch: layered
order: 10
image: /assets/images/claudeMdGeneratorTool.jpg
template: |
  ---
  description: Project rules for Order Service
  alwaysApply: true
  ---

  # Order Service

  REST API that manages customer orders.

  ## Tech stack

  - Java 25
  - Spring Boot 4
  - Maven

  ## Commands

  - Build: `./mvnw clean verify`
  - Run locally: `./mvnw spring-boot:run`
  - Run all tests: `./mvnw test`
  - Run one test: `./mvnw test -Dtest=OrderServiceTest`

  ## Architecture

  - Three layers: controller (HTTP only) → service (business logic, transactions) → repository (data access).
  - Controllers never call repositories directly.
  - Business rules live in services, not in controllers or in persistence code.
  - Each layer depends only on the layer below it.

  ## Code style

  - Use constructor injection. Never use field injection with `@Autowired`.
  - Use records for DTOs. Never return JPA entities from controllers.
  - Validate request bodies with Bean Validation (`@Valid`) and map errors in one `@RestControllerAdvice`.
  - Use `java.time` types, never `java.util.Date`.
  - Return `Optional` for values that can be absent; never use it for fields or parameters.
  - Log with SLF4J. Never use `System.out.println`.

  ## Testing

  - JUnit and AssertJ for all tests; Mockito for unit tests.
  - Use test slices (`@WebMvcTest`, `@DataJpaTest`) instead of `@SpringBootTest` when one layer is enough.
  - Integration tests run against a real database with Testcontainers, not H2.

  ## Working rules

  - Every change comes with new or updated tests.
  - Run the build and the tests before saying a task is done. If they fail, fix them or report the failure; never hide it.
  - Write complete code. No placeholders such as `// rest of the code unchanged` or `TODO: implement`.
  - Keep changes focused on the task. Don't refactor, rename or reformat unrelated code.
  - Ask before adding a new dependency.
  - Never commit secrets, API keys or passwords. Read them from environment variables.
  - Don't commit or push unless asked.

  ## Project notes

  - Package by feature: `com.example.orders.order`, `com.example.orders.customer`, each with its own controller, service and repository.
  - Error responses use RFC 9457 Problem Details (`ProblemDetail`).
  - Database changes are Flyway migrations in `src/main/resources/db/migration`.
---
Cursor no longer reads its rules from a single `.cursorrules` file. Project rules now live in `.cursor/rules/`, one `.mdc` file per topic, and each file starts with front matter that says when Cursor loads it. This template is a complete project rule for a Spring Boot REST API, ready to save as `.cursor/rules/project.mdc`.

## How Cursor Rules Work

The front matter at the top of the file controls when the rule is loaded:

- **`alwaysApply: true`** loads the rule in every chat and agent session. Use it for the rules in this template, which apply to the whole project.
- **`globs`** attaches a rule automatically when the agent works on matching files, for example only on migrations or only on tests.
- **`description`** lets the agent decide when the rule is relevant, so describe the rule's purpose in one clear sentence.

A path-scoped rule keeps the main file short. For example, `.cursor/rules/migrations.mdc`:

```markdown
---
description: Rules for Flyway database migrations
globs: src/main/resources/db/migration/**
alwaysApply: false
---
- Never edit a migration that is already merged; add a new one.
- Name files `V<number>__<description>.sql`.
- Every migration must run on an empty database and on production data.
```

Cursor also reads an `AGENTS.md` in the root of the repository. If your team uses several AI coding agents, put the shared rules in `AGENTS.md` and keep only the Cursor-specific ones in `.cursor/rules/`.

<div>
{%- include inArticleAds.html -%}
</div>

## Why These Rules

- **Exact Maven commands.** Cursor's agent can run terminal commands. With `./mvnw clean verify` in the rules, it checks its own work instead of stopping at code that only looks right.
- **Constructor injection and records for DTOs.** Much of the Spring code models learned from is older and uses field injection and entities in controllers. One rule each fixes both.
- **Package by feature.** With the layers inside each feature package, the agent puts a new endpoint next to the code it belongs to.
- **Problem Details for errors.** Spring Boot supports RFC 9457 out of the box. Naming it gives every error the same JSON shape.

## Migrating from .cursorrules

1. Create `.cursor/rules/project.mdc` and paste the template.
2. Move the rules from your old `.cursorrules` into it, or into separate `.mdc` files with `globs` if they apply only to part of the code.
3. Delete `.cursorrules`, so Cursor doesn't load two different sets of rules.

To get the same rules as `AGENTS.md`, `CLAUDE.md` or Copilot instructions, open the [generator](https://codersite.dev/tools/claude-md-generator/?stack=spring-maven&arch=layered){:target="_blank"} and switch the file at the top of the preview.

Cursor follows your design only as well as your rules describe it. My book *Software Design Principles* explains SOLID, coupling and cohesion with practical Java examples, so you can turn "write clean code" into rules an agent can check:

<div>
{%- include softwareDesign.html -%}
</div>
