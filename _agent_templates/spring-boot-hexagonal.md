---
title: "AGENTS.md Template for Spring Boot with Hexagonal Architecture"
short_title: "Spring Boot Hexagonal"
description: "An AGENTS.md for Spring Boot with hexagonal (ports and adapters) architecture and Gradle: a framework-free domain, use cases with ports, adapters, and test-first rules for your AI coding agent."
lead: "An AGENTS.md for a Spring Boot service built with hexagonal architecture (ports and adapters) and Gradle. It keeps your AI agent from putting JPA and HTTP code into the domain."
file: "AGENTS.md"
stack: spring-gradle
arch: hexagonal
order: 2
image: /assets/images/claudeMdGeneratorTool.jpg
template: |
  # Order Service

  REST API that manages customer orders.

  ## Tech stack

  - Java 25
  - Spring Boot 4
  - Gradle (Kotlin DSL)

  ## Commands

  - Build: `./gradlew build`
  - Run locally: `./gradlew bootRun`
  - Run all tests: `./gradlew test`
  - Run one test: `./gradlew test --tests OrderServiceTest`

  ## Architecture

  - `domain/` holds the business model and rules. It has no framework, database or HTTP imports.
  - `application/` holds the use cases and the ports (interfaces) they need.
  - `adapters/` (web, persistence, messaging) implement the ports.
  - Dependencies point inward: adapters → application → domain, never the other way.
  - Never put SQL, HTTP calls or framework annotations in `domain/`.

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
  - Never commit secrets, API keys or passwords. Read them from environment variables.
  - Don't commit or push unless asked.

  ## Project notes

  - Packages: `com.example.orders.domain`, `com.example.orders.application`, `com.example.orders.adapters.web`, `com.example.orders.adapters.persistence`.
  - JPA entities live only in `adapters.persistence` and are mapped to domain objects there. Domain classes have no JPA annotations.
  - A new external system gets a new port in `application` and a new adapter; existing adapters don't change.
---
Hexagonal architecture is easy to explain and easy to break: one `@Entity` annotation on a domain class, one repository call from a controller, and the boundaries are gone. AI agents break them all the time, because most Spring Boot code they learned from is layered. This template states the boundaries in a way an agent can check.

## Why These Rules

- **The domain has no framework imports.** It's the single most important rule of the architecture and the easiest for an agent to verify: it can look at the imports of any file in `domain/`.
- **Dependencies point inward.** Adapters know the application, the application knows the domain, never the other way. When the agent needs the database from a use case, the rule leads it to add a port (an interface) instead of a direct call.
- **JPA entities only in the persistence adapter.** Without this note, agents annotate domain classes with `@Entity` because it saves a mapping class. The note says why the mapping class is worth it.
- **New external system, new adapter.** This is the [open-closed principle](https://codersite.dev/open-closed-principle/){:target="_blank"} applied to the whole application: you add code instead of changing code that works.
- **Test first.** A framework-free domain is fast to test without Spring. Writing the test first keeps the agent's changes small and verifiable.

<div>
{%- include inArticleAds.html -%}
</div>

## Adapt It to Your Project

- **Replace the package names** with yours. Concrete package names work better than abstract layer names, because the agent can match them against real paths.
- **List your adapters**, for example `adapters.messaging` for Kafka or `adapters.client` for calls to other services.
- **Using Maven?** Change the preset in the [generator](https://codersite.dev/tools/claude-md-generator/?stack=spring-maven&arch=hexagonal){:target="_blank"}; the architecture rules stay the same.
- **Domain-Driven Design?** The [generator](https://codersite.dev/tools/claude-md-generator/?stack=spring-gradle&arch=ddd){:target="_blank"} has rules for aggregates, value objects and bounded contexts.

The ideas behind ports, adapters and a framework-free domain come from Domain-Driven Design. Eric Evans' book is where they started, and it gives you the vocabulary to write architecture rules that people and agents can follow:

<div>
{%- include domainDrivenDesignAd.html -%}
</div>
