---
title: "CLAUDE.md Template for Spring Boot"
short_title: "Spring Boot"
description: "A ready-to-use CLAUDE.md for Spring Boot REST APIs: Maven commands, layered architecture, constructor injection, records for DTOs and Testcontainers. Copy it or customize it."
lead: "A CLAUDE.md for a typical Spring Boot REST API with Maven and a layered architecture. Copy it into the root of your repository and adjust the notes at the end."
file: "CLAUDE.md"
stack: spring-maven
arch: layered
order: 1
image: /assets/images/claudeMdGeneratorTool.jpg
template: |
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

  - Database changes are Flyway migrations in `src/main/resources/db/migration`. Never edit a migration that is already merged; add a new one.
  - When an endpoint changes, update the OpenAPI description in the same change.
  - Money amounts are `BigDecimal`, never `double`.
---
This template gives Claude Code what it can't work out from your `pom.xml`: the exact commands to verify its work, where each kind of code belongs, and the Spring conventions your team expects. The same file works for Codex, Cursor and Copilot if you save it as `AGENTS.md`.

## Why These Rules

- **`./mvnw clean verify` as the build command.** It compiles, runs the unit and integration tests and any checks bound to the `verify` phase. With the command in the file, the agent runs it before saying a task is done instead of assuming the code works.
- **"Run one test" with `-Dtest=`.** Running a single test class takes seconds instead of minutes, so the agent tests its changes more often.
- **Constructor injection.** Agents trained on older code still write `@Autowired` on fields. One line in the file stops it, and your classes stay testable without Spring.
- **Records for DTOs, never JPA entities in controllers.** Returning entities leaks your database schema into the API and triggers lazy-loading errors. Stated as a rule, the agent creates request and response records instead.
- **Testcontainers instead of H2.** Tests against H2 pass while the same SQL fails on PostgreSQL. The rule keeps the agent from "fixing" a test by switching databases.
- **Flyway notes.** Editing a merged migration breaks every other environment. No agent can know your team's rule unless you write it down.

<div>
{%- include inArticleAds.html -%}
</div>

## Adapt It to Your Project

- **Gradle instead of Maven?** Use the [Spring Boot Gradle template](https://codersite.dev/tools/claude-md-templates/spring-boot-hexagonal/){:target="_blank"} or switch the preset in the [generator](https://codersite.dev/tools/claude-md-generator/?stack=spring-gradle&arch=layered){:target="_blank"}.
- **Replace the example test class** in "Run one test" with a real one, so the agent sees the naming pattern.
- **Add your own gotchas** to the notes: the profile needed to run locally, the module that must not change, the test that needs Docker.
- **Keep it short.** If a rule applies only to one part of the code, move it to a path-scoped rule in `.claude/rules/`.

Learn how to design the REST API this template describes in the [REST API tutorial](https://codersite.dev/rest-api-overview/){:target="_blank"}, and how to document it in [Documenting a Spring Boot REST API with OpenAPI 3](https://codersite.dev/documenting-rest-api-openapi3/){:target="_blank"}.

Rules like "records for DTOs" and "Optional only for return values" come straight from modern Java best practice. *Effective Java* by Joshua Bloch explains the reasoning behind dozens of them, so you can write rules your agent and your team both understand:

<div>
{%- include effectiveJava.html -%}
</div>
