---
layout: post
title:  "Open-Closed Principle in Java with a Spring Boot Example (SOLID Part II)"
description: "Learn the open-closed principle with a real Spring Boot example: refactor a rate limiter so you can add new data sources without touching existing code."
author: moises
categories: [ design ]
image: /assets/images/openClosedPrinciple.jpg
comments: false
---

SOLID principles tell you how to arrange your functions into classes and how those classes should depend on each other. Applied well, they make your software easier to change, easier to understand and easier to reuse.

In [Part I of this series](https://codersite.dev/solid-principles-the-definitive-guide/){:target="_blank"}, you learned the *Single Responsibility Principle*. This article covers the second one, the **Open-Closed Principle (OCP)**, with a real example: a rate limiter in a Spring Boot REST API that has to switch from a text file to a database.

## What Is the Open-Closed Principle?

> "Software entities (classes, modules, functions, etc.) should be open for extension, but closed for modification."

- **Open for extension:** you can add new behavior.
- **Closed for modification:** you add it without editing code that already works.

[Bertrand Meyer](https://amzn.to/40ehLzP){:target="_blank"} introduced the principle in 1988 in *Object-Oriented Software Construction*. His solution was inheritance: leave the original class alone and extend it in a subclass. Robert C. Martin later restated it the way we use it today: depend on an **interface**, and add behavior by writing a new class that implements it.

Why does it matter? Every time you edit a class that already works, you risk breaking it and everything that depends on it. If a new requirement only adds a class, the tested code stays untouched.

## The Example: A Rate Limiter That Reads Plans from a File

Imagine your team is [implementing rate limiting](https://codersite.dev/rate-limit/){:target="_blank"} to control how many requests each client can send to a [REST API](https://codersite.dev/rest-api-overview/){:target="_blank"}.

The `RateLimit` class implements Spring's `HandlerInterceptor`, which intercepts HTTP requests before they reach the controller. For each request, it either lets the request through or blocks it with status code **429 Too Many Requests**.

How many requests a client may send depends on its plan. The plans are stored in a text file on the classpath, `apiPlans.txt`, with each plan's number of requests per minute:

```text
FREE:10
PAID:1000
```

The first version of `RateLimit` loads the plans once, when it is created:

```java
public class RateLimit implements HandlerInterceptor {

  private final Map<String, Long> apiPlans;

  public RateLimit() {
    this.apiPlans = loadPlans();
  }

  @Override
  public boolean preHandle(HttpServletRequest request,
      HttpServletResponse response, Object handler) throws Exception {
    // get the client ID, find its plan in apiPlans and its bucket
    // if the bucket is empty: response.setStatus(429) and return false
    return true;
  }

  private Map<String, Long> loadPlans() {
    Map<String, Long> plans = new HashMap<>();
    Resource resource = new ClassPathResource("apiPlans.txt");
    try (BufferedReader reader = new BufferedReader(
        new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
      String line;
      while ((line = reader.readLine()) != null) {
        if (line.isBlank()) {
          continue;
        }
        String[] parts = line.split(":");
        plans.put(parts[0].trim(), Long.parseLong(parts[1].trim()));
      }
    } catch (IOException e) {
      throw new UncheckedIOException("Cannot read apiPlans.txt", e);
    }
    return Map.copyOf(plans);
  }
}
```

**Tip:** read classpath files with `resource.getInputStream()`, not with `Paths.get(resource.getURI())`. The second version works in your IDE, but once Spring Boot runs from a packaged JAR, the file is inside the JAR and `Paths.get` throws `FileSystemNotFoundException`.

The algorithm behind the buckets is explained in [Rate Limiting in Spring Boot with Bucket4j](https://codersite.dev/rate-limit/){:target="_blank"}. Here we focus on the design.

<div>
{%- include inArticleAds.html -%}
</div>

## Then the Requirements Change

The developer who wrote this class leaves the company, and a new one arrives: you. This is how most maintenance work looks: you change code that you didn't write.

A few weeks later, the team decides that the plans must come from a database, so that the sales team can change them without a new release. The obvious solution is to rewrite `loadPlans()` inside `RateLimit`. And next year, when the plans move to Elasticsearch, you rewrite it again.

**That is a violation of the open-closed principle.** `RateLimit` has one job, limiting requests, but it changes every time the *storage* of the plans changes. Each change means editing, retesting and redeploying a class that controls every request to your API. If the code is complex, poorly documented or has many dependencies, each edit is a chance to break something you can't see.

### How to Spot an Open-Closed Violation

The most common sign is a `switch` or `if-else` chain on a type that grows with every new feature:

```java
public Map<String, Long> loadPlans(String source) {
  return switch (source) {
    case "file" -> readFromFile();
    case "database" -> readFromDatabase();
    case "elasticsearch" -> readFromElasticsearch();   // every new source edits this method
    default -> throw new IllegalArgumentException(source);
  };
}
```

Other signs are a class you have to change for unrelated reasons, and a bug fix in one feature that breaks another.

## Refactoring Toward the Open-Closed Principle

Two object-oriented techniques solve the problem:

- **Polymorphism:** one contract, many implementations. Code that calls `loadPlans()` doesn't need to know whether the plans come from a file or a database. Read more in [Understanding OOP Concepts](https://codersite.dev/understanding-oop-concepts/){:target="_blank"}.
- **Constructor injection:** `RateLimit` receives the implementation from outside instead of creating it, so it never depends on a concrete class.

Here is the design we're aiming for (the notation is explained in [UML Diagrams for Java Developers](https://codersite.dev/uml-diagrams-for-java-developers/){:target="_blank"}):

![UML class diagram: RateLimit uses the PlanProvider interface, which FilePlanProvider, DatabasePlanProvider and a later ElasticsearchPlanProvider implement](/assets/images/openClosedRateLimitDiagram.png "The open-closed principle applied to the rate limiter"){:class="img-responsive"}

### Step 1: Define the Contract

Think abstractly: what does `RateLimit` need? Not a file, not a database, just the plans. That is the interface:

```java
public interface PlanProvider {

  Map<String, Long> loadPlans();
}
```

### Step 2: Move the Existing Code into an Implementation

The file-reading code moves, unchanged, into its own class:

```java
public class FilePlanProvider implements PlanProvider {

  @Override
  public Map<String, Long> loadPlans() {
    Map<String, Long> plans = new HashMap<>();
    Resource resource = new ClassPathResource("apiPlans.txt");
    // same code as before
    return Map.copyOf(plans);
  }
}
```

### Step 3: Extend with a New Class

Reading the plans from a database is now a new class, not a change to an old one. This one uses Spring's `JdbcClient`:

```java
public class DatabasePlanProvider implements PlanProvider {

  private final JdbcClient jdbcClient;

  public DatabasePlanProvider(JdbcClient jdbcClient) {
    this.jdbcClient = jdbcClient;
  }

  @Override
  public Map<String, Long> loadPlans() {
    Map<String, Long> plans = new HashMap<>();
    jdbcClient.sql("SELECT name, capacity FROM api_plan")
        .query(rs -> {
          plans.put(rs.getString("name"), rs.getLong("capacity"));
        });
    return Map.copyOf(plans);
  }
}
```

### Step 4: Depend on the Interface

`RateLimit` receives a `PlanProvider` in its constructor. It doesn't know, and doesn't care, where the plans come from:

```java
public class RateLimit implements HandlerInterceptor {

  private final Map<String, Long> apiPlans;

  public RateLimit(PlanProvider planProvider) {
    this.apiPlans = planProvider.loadPlans();
  }

  @Override
  public boolean preHandle(HttpServletRequest request,
      HttpServletResponse response, Object handler) throws Exception {
    // get the client ID, find its plan in apiPlans and its bucket
    // if the bucket is empty: response.setStatus(429) and return false
    return true;
  }
}
```

<div>
{%- include inArticleAds.html -%}
</div>

### Step 5: Choose the Implementation in One Place

Spring Boot creates the objects and passes them in, which is called *dependency injection*. One configuration class decides which provider the application uses:

```java
@Configuration
public class PlanConfig {

  @Bean
  PlanProvider planProvider(JdbcClient jdbcClient) {
    return new DatabasePlanProvider(jdbcClient);   // before: return new FilePlanProvider();
  }
}
```

And the web configuration registers the interceptor with whatever provider Spring injects:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

  private final PlanProvider planProvider;

  public WebConfig(PlanProvider planProvider) {
    this.planProvider = planProvider;
  }

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(new RateLimit(planProvider)).addPathPatterns("/api/**");
  }
}
```

Switching from the text file to the database was a **one-line change in the configuration**. `RateLimit`, `PlanProvider`, `FilePlanProvider` and `WebConfig` were not touched. When the plans move to Elasticsearch, you write an `ElasticsearchPlanProvider` and change the same line. With `@ConditionalOnProperty` on the bean methods, you can even choose the provider with a property in `application.properties`, without recompiling.

The interface is reusable, too: if you later replace the interceptor with a servlet `Filter`, the filter receives the same `PlanProvider`.

## Open-Closed and the Strategy Pattern

What you just built has a name: the **Strategy pattern**. `PlanProvider` is the strategy, each implementation is a concrete strategy, and `RateLimit` is the context that uses one without knowing which. Many classic design patterns, including Strategy, Decorator, Template Method and Observer, are ways to make code open for extension and closed for modification. They were cataloged by the "Gang of Four" in the book that made design patterns part of every developer's vocabulary:

<div>
{%- include designPatternsAd.html -%}
</div>

## When Not to Apply the Open-Closed Principle

The principle doesn't say "never edit existing code":

- **Bugs get fixed where they are.** Writing a subclass to work around a bug is worse than fixing it.
- **Don't add an interface for every class.** An extension point that never gets a second implementation is extra code to read and maintain. This is the classic conflict between open-closed and YAGNI ("You Aren't Gonna Need It"). A practical rule: add the abstraction the *second* time the same kind of change happens. By then, you know what actually varies. See [When Principles Conflict](https://codersite.dev/software-design-principles/#when-principles-conflict){:target="_blank"} in the software design principles overview.
- **Refactoring is allowed.** Making code ready for extension, as we did above, means changing it once. The principle protects the code *after* that.

## Frequently Asked Questions

**Who created the open-closed principle?**
Bertrand Meyer introduced it in 1988 in *Object-Oriented Software Construction*. Robert C. Martin reformulated it in the 1990s, based on interfaces and polymorphism, and made it the "O" in SOLID.

**What is the difference between open-closed and dependency inversion?**
Dependency inversion says that classes should depend on abstractions, such as `PlanProvider`, not on concrete classes, such as `DatabasePlanProvider`. That dependency is what makes open-closed possible: because `RateLimit` depends only on the interface, you can extend the system without modifying it.

**Does open-closed mean I can never change a class?**
No. You fix bugs, refactor and change behavior when requirements truly change. The goal is that *the most common kind of change*, in our case a new data source, means adding code instead of editing working code.

**Is open-closed asked in job interviews?**
Yes, very often. A good answer explains the principle in one sentence, shows a violation (a growing `switch`) and the fix (an interface with one class per variant), and mentions the Strategy pattern.

## Summary

- **Open for extension, closed for modification:** add new behavior as new classes, not as edits to working code.
- **The tool is an interface:** `RateLimit` depends on `PlanProvider`, not on a file or a database.
- **Dependency injection picks the implementation** in one configuration class.
- **Apply it where change actually happens,** not everywhere "just in case".

<br/>

Open-closed is one of the most common SOLID questions in Java interviews, together with design patterns and system design questions like "design a rate limiter". Practice with real interview questions and answers:

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Open-closed is one of many principles that keep code easy to change. My book *Software Design Principles* covers SOLID, DRY, KISS, YAGNI, coupling and cohesion with practical examples, so you can apply them in your own projects:

<div>
{%- include softwareDesign.html -%}
</div>

If you found this article useful, you can support this website:

<div>
{% include buymeacoffee.html %}
</div>
