---
title: "CLAUDE.md Template for Domain-Driven Design with Spring Boot"
short_title: "Spring Boot DDD"
description: "A CLAUDE.md for Spring Boot projects built with Domain-Driven Design: bounded contexts, aggregates, value objects, domain events and test-first rules for your AI coding agent."
lead: "A CLAUDE.md for a Spring Boot service designed with Domain-Driven Design. It keeps your AI agent from mixing bounded contexts and from changing aggregates behind their backs."
file: "CLAUDE.md"
stack: spring-maven
arch: ddd
order: 7
image: /assets/images/claudeMdGeneratorTool.jpg
template: |
  # Booking Service

  Service that manages hotel room bookings: availability, pricing and cancellations.

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

  - Code is organized by bounded context, not by technical layer.
  - An aggregate protects its invariants: change its state only through its own methods.
  - Aggregates reference other aggregates by ID, never by object reference.
  - Value objects are immutable and validate themselves on creation.
  - Use the domain's ubiquitous language for class and method names.
  - Side effects in other aggregates happen through domain events.

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
  - Write a failing test first, then the code that makes it pass.
  - Run the build and the tests before saying a task is done. If they fail, fix them or report the failure; never hide it.
  - Write complete code. No placeholders such as `// rest of the code unchanged` or `TODO: implement`.
  - Keep changes focused on the task. Don't refactor, rename or reformat unrelated code.
  - Ask before adding a new dependency.
  - For changes that touch more than a few files, explain the plan and wait for approval.
  - Never commit secrets, API keys or passwords. Read them from environment variables.
  - Don't commit or push unless asked.

  ## Project notes

  - Bounded contexts are top-level packages: `com.example.booking.reservation`, `com.example.booking.pricing`, `com.example.booking.availability`.
  - Contexts talk to each other only through their `api` package or through domain events, never through each other's internal classes.
  - Repositories exist only for aggregate roots, for example `ReservationRepository`, never for the entities inside an aggregate.
  - Use the terms in `docs/glossary.md`. Ask before introducing a new domain term.
---
Domain-Driven Design lives in details that a compiler can't check: which class is an aggregate root, which terms the business uses, which context owns a rule. An AI agent sees only code, so it takes the shortest path: it sets a field from a service, calls another context's repository, or names a class `BookingManager`. This template writes the design down where the agent reads it.

## Why These Rules

- **Organized by bounded context.** Packages like `reservation` and `pricing` tell the agent where a change belongs. Technical packages like `service` and `repository` don't.
- **Aggregates protect their invariants.** "A reservation can't be cancelled after check-in" belongs in `Reservation.cancel()`, not in a service that sets `status` directly. Without the rule, agents add setters because they are the quickest fix.
- **References by ID.** An aggregate that holds another aggregate as an object reference ends up loading, locking and saving both. Holding `RoomId` instead keeps transactions small.
- **Value objects validate themselves.** A `DateRange` that rejects an end before its start removes that check from every caller. Java records make value objects short enough that the agent has no excuse not to use them.
- **The glossary.** The ubiquitous language works only if code uses the same words as the business. Pointing the agent at a glossary is the simplest way to keep `Guest` from becoming `Customer`, `User` and `Client` in three files.
- **Plan first, test first.** Domain changes often touch several aggregates. Explaining the plan before coding lets you catch a wrong model early, and a failing test shows the rule is really enforced.

<div>
{%- include inArticleAds.html -%}
</div>

## Adapt It to Your Project

- **Replace the contexts** with yours, and say in the notes which context owns which concept when two of them use the same word.
- **Write the glossary.** Even ten terms with one-line definitions help both the agent and new teammates.
- **Combining DDD with ports and adapters?** The [hexagonal architecture template](https://codersite.dev/tools/claude-md-templates/spring-boot-hexagonal/){:target="_blank"} has the layering rules inside each context.
- **Using Gradle or another file name?** Change it in the [generator](https://codersite.dev/tools/claude-md-generator/?stack=spring-maven&arch=ddd){:target="_blank"}.

Aggregates, value objects, bounded contexts and the ubiquitous language all come from one book. Eric Evans' *Domain-Driven Design* explains when each pattern helps and when it doesn't, which is exactly what you need to decide which rules your agent should follow:

<div>
{%- include domainDrivenDesignAd.html -%}
</div>
