---
title: "AGENTS.md Template for Event-Driven Spring Boot with Kafka"
short_title: "Event-Driven Kafka"
description: "An AGENTS.md for event-driven Spring Boot services with Kafka: idempotent consumers, versioned events, the transactional outbox, dead-letter topics and message keys for AI coding agents."
lead: "An AGENTS.md for a Spring Boot service that publishes and consumes Kafka events. It teaches your AI agent the rules that keep messages from being lost or processed twice."
file: "AGENTS.md"
stack: spring-maven
arch: event-driven
order: 8
image: /assets/images/claudeMdGeneratorTool.jpg
template: |
  # Order Service

  Service that accepts orders and publishes order events to Kafka.

  ## Tech stack

  - Java 25
  - Spring Boot 4
  - Maven
  - Spring for Apache Kafka
  - PostgreSQL

  ## Commands

  - Build: `./mvnw clean verify`
  - Run locally: `./mvnw spring-boot:run`
  - Run all tests: `./mvnw test`
  - Run one test: `./mvnw test -Dtest=OrderServiceTest`

  ## Architecture

  - Events describe something that happened and are named in the past tense, for example `OrderPlaced`.
  - Events are immutable and versioned. Add fields; never rename or remove them.
  - Consumers are idempotent: handling the same event twice has the same effect as handling it once.
  - Save the state change and the event in one transaction with the transactional outbox; never publish to the broker inside a business transaction.
  - After a limited number of retries, failed messages go to a dead-letter topic; they never block the partition.
  - Ordering is guaranteed only within a partition: when order matters, use the aggregate ID as the message key.

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

  - Topics are named `<context>.<entity>.<event>`, for example `orders.order.placed`. Event schemas live in `src/main/resources/events/`.
  - Events go to the `outbox_event` table; a scheduled relay publishes them to Kafka. Business code never uses `KafkaTemplate` directly.
  - Consumers store the IDs of handled events in `processed_event` and skip duplicates.
  - Integration tests run Kafka and PostgreSQL with Testcontainers.
---
Event-driven code fails in ways that tests on a laptop rarely show: a message published before the transaction rolled back, the same event delivered twice after a rebalance, a consumer stuck forever on one bad message. AI agents write the happy path well and these failure paths badly, because nothing in the code tells them the failures exist. This template does.

## Why These Rules

- **Events in the past tense.** `OrderPlaced` is a fact other services can react to; `PlaceOrder` is a command that couples the sender to one receiver. The naming rule keeps the agent on the right side of that line.
- **Versioned, append-only events.** Consumers you don't own deserialize your events. Renaming a field breaks them silently, at runtime, in another team's service.
- **Idempotent consumers.** Kafka delivers *at least once*, so every consumer will see duplicates sooner or later. Storing handled event IDs makes a second delivery harmless.
- **The transactional outbox.** Calling `KafkaTemplate.send()` inside a database transaction can publish an event for an order that was then rolled back, or save an order whose event was never sent. Writing the event to an outbox table in the same transaction fixes both. It's the rule agents most need, because the direct call looks correct.
- **Dead-letter topics.** One message that always fails must not stop every message behind it on the partition.
- **Message keys.** Kafka keeps order only within a partition. Keying by order ID keeps all events of one order in sequence.

<div>
{%- include inArticleAds.html -%}
</div>

## Adapt It to Your Project

- **Replace the topic names and the outbox table** with yours. Concrete names let the agent find the existing code instead of writing a second outbox.
- **Using Spring Modulith or Debezium for the outbox?** Say so in the notes, so the agent uses it instead of writing its own relay.
- **RabbitMQ instead of Kafka?** Keep the idempotency, outbox and dead-letter rules, and replace the partition rule with your queue's ordering guarantees.
- **One service in a larger system?** Add the rules from the [microservices template](https://codersite.dev/tools/claude-md-templates/spring-boot-microservices/){:target="_blank"}, or combine both in the [generator](https://codersite.dev/tools/claude-md-generator/?stack=spring-maven&arch=event-driven){:target="_blank"}.

At-least-once delivery, idempotency, ordering by partition and the outbox pattern are all about one question: how do systems stay correct when messages are delayed, duplicated or lost? *Designing Data-Intensive Applications* by Martin Kleppmann answers it better than any other book:

<div>
{%- include designingDataIntensiveApplications.html -%}
</div>
