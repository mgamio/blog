---
title: "AGENTS.md Template for Spring Boot Microservices"
short_title: "Spring Boot Microservices"
description: "An AGENTS.md for Spring Boot microservices: each service owns its data, backward-compatible API changes, timeouts on every call, and contract-first OpenAPI rules for AI coding agents."
lead: "An AGENTS.md for one service in a Spring Boot microservices system. It teaches your AI agent the rules that keep services independent."
file: "AGENTS.md"
stack: spring-maven
arch: microservices
order: 3
image: /assets/images/claudeMdGeneratorTool.jpg
template: |
  # Payment Service

  Microservice that authorizes and captures payments for orders.

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

  - Each service owns its data. Never read or write another service's database.
  - Services talk through documented APIs (OpenAPI) or events.
  - Public API changes must be backward compatible; breaking changes need a new version.
  - Every call to another service has a timeout and handles failure.

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

  - The API contract is `src/main/resources/openapi.yaml`. Change the contract first, then the code.
  - Calls to other services use the shared `RestClient` beans, which have timeouts configured. Never create a client inline.
  - Events are published to Kafka topics named `<service>.<entity>.<event>`, for example `payments.payment.captured`.
---
In a microservices system, an agent working on one service can't see the others, so it doesn't know that a renamed JSON field breaks three consumers or that reading another service's table creates a hidden dependency. This template writes those system-level rules into the service's own repository.

## Why These Rules

- **Each service owns its data.** Sharing a database is the fastest way to turn microservices into a distributed monolith. An agent asked for "the customer's address" will happily join another service's table unless the rule says no.
- **Backward-compatible API changes.** Adding a field is safe; renaming or removing one breaks clients you can't see. The rule makes the agent add instead of change, and version real breaking changes.
- **A timeout on every call.** A call without a timeout can block threads until the whole service hangs. Pointing the agent at preconfigured `RestClient` beans is simpler than explaining timeouts in every task. See [how a REST client handles 503 errors](https://codersite.dev/how-rest-client-handles-503-error/){:target="_blank"}.
- **Contract first.** When the OpenAPI file changes first, the change is reviewed as an API change, not hidden in a code diff. More in [Designing APIs with Swagger and OpenAPI](https://codersite.dev/designing-apis-with-swagger-and-openapi/){:target="_blank"}.
- **Topic naming.** One naming pattern, written down, means the agent creates `payments.payment.captured` instead of inventing a new style.

<div>
{%- include inArticleAds.html -%}
</div>

## Adapt It to Your Project

- **Replace the service name and summary** in each repository. An agent that knows "this is the payment service" makes better decisions about what belongs there.
- **Name the services this one talks to** in the notes, and how: REST, events or both.
- **Add your resilience rules**, such as retries only for idempotent calls, or a circuit breaker library you use.

The hardest microservices questions, such as who owns the data, how services stay consistent and what happens when a call fails, are data questions. *Designing Data-Intensive Applications* by Martin Kleppmann is the book that answers them, and it will make your agent rules much sharper:

<div>
{%- include designingDataIntensiveApplications.html -%}
</div>
