---
layout: post
title:  "Java App Slow Under Load? A Step-by-Step Performance Playbook"
description: "A prioritized playbook for Java applications that slow down or crash under concurrent load: measure first, fix connection pools and leaks, add timeouts and caching, use virtual threads, then scale."
author: moises
categories: [ design ]
image: /assets/images/javaAppPerformance.jpg
comments: false
---

Your Java application works fine in testing, then falls over in production: requests pile up, the database runs out of connections, the server stops responding. The fix is rarely "add more servers". Here's the order to work through it, from the cheapest fixes to the most expensive.

## Step 1: Measure Before You Change Anything

Every other step is a guess until you know where the time goes.

- **Collect metrics:** response times, error rates, CPU, memory, active database connections and thread counts. Spring Boot Actuator exposes most of these out of the box (see [Spring Boot Actuator auditing](https://codersite.dev/spring-boot-actuator/){:target="_blank"}).
- **Profile under load:** a profiler such as JDK Flight Recorder shows which methods, queries and locks consume the time.
- **Centralize your logs** so you can follow request patterns and errors across servers. See [Implementing hot-warm architecture in Elasticsearch](https://codersite.dev/hot-warm-architecture-elasticsearch/){:target="_blank"}.

Look for the bottleneck first: a slow query, a full connection pool, a slow external service. Then fix that one thing and measure again.

## Step 2: Fix the Database Layer

In most business applications, the database is where load turns into failures.

**Size the connection pool deliberately.** Spring Boot uses HikariCP, whose pool holds **10 connections by default**. When all 10 are busy, the next request waits up to **30 seconds** for one (`connectionTimeout`) and then fails. A bigger pool is not automatically better: the database has to serve every connection, and too many connections slow it down. Increase the size step by step while you measure.

```properties
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.connection-timeout=5000
spring.datasource.hikari.leak-detection-threshold=10000
```

**Detect connection leaks.** Leak detection is off by default. With `leak-detection-threshold=10000`, HikariCP logs a warning, including the code location, whenever a connection stays out of the pool for more than 10 seconds.

**Always close resources with try-with-resources.** A connection that is never closed never returns to the pool, and after enough requests the pool is empty:

```java
public String findName(long customerId) throws SQLException {
  String sql = "SELECT name FROM customer WHERE id = ?";
  try (Connection con = dataSource.getConnection();
       PreparedStatement ps = con.prepareStatement(sql)) {
    ps.setLong(1, customerId);
    try (ResultSet rs = ps.executeQuery()) {
      return rs.next() ? rs.getString("name") : null;
    }
  }   // connection, statement and result set are closed here, even if an exception is thrown
}
```

*Effective Java* has a whole item on this: prefer try-with-resources to try-finally. It's one of the cheapest ways to prevent leaks:

<div>
{%- include effectiveJava.html -%}
</div>

**Optimize the queries themselves:** add indexes for the columns you filter and join on, avoid unnecessary JOINs, select only the columns you need, and watch for the "N+1" pattern, where a loop runs one query per row.

## Step 3: Stop Waiting Forever

One slow external service can block every thread in your application if your calls have no time limit.

- **Set timeouts** on every outgoing call. Java's `HttpClient` makes it explicit:

```java
private final HttpClient client = HttpClient.newBuilder()
    .connectTimeout(Duration.ofSeconds(2))      // give up connecting after 2 s
    .build();

public String fetchPrice(String url) throws Exception {
  HttpRequest request = HttpRequest.newBuilder(URI.create(url))
      .timeout(Duration.ofSeconds(5))            // give up waiting for the response after 5 s
      .GET()
      .build();
  return client.send(request, HttpResponse.BodyHandlers.ofString()).body();
}
```

  Against a server that never answers, this call fails after about 2 seconds with an `HttpConnectTimeoutException`, instead of holding a thread forever. Spring's `RestClient` can use the same `HttpClient` underneath (see [Replace OAuth2RestTemplate with RestClient](https://codersite.dev/spring-restclient-replace-oauth2resttemplate/){:target="_blank"}).
- **Retry carefully**, with a limit and a delay. See [how a REST client handles a 503 error](https://codersite.dev/how-rest-client-handles-503-error/){:target="_blank"}.
- **Use circuit breakers.** When a service keeps failing, a circuit breaker stops calling it for a while and fails fast, which prevents one failure from cascading through your system.
- **Limit incoming traffic.** [Rate limiting](https://codersite.dev/rate-limit/){:target="_blank"} stops a single client from overwhelming the application and keeps access fair for everyone.

<div>
{%- include inArticleAds.html -%}
</div>

## Step 4: Do Less Work

The fastest request is the one you don't have to process.

- **Cache** frequently read, rarely changed data. In Spring, one annotation caches a method's results (after enabling caching with `@EnableCaching`):

```java
@Cacheable("articles")
public Article findArticle(long articleId) {
  return articleRepository.findById(articleId).orElseThrow();
}
```

- **Move slow work out of the request.** Sending e-mails, generating PDFs or calling partner systems can run asynchronously in the background or through a message queue, so the user gets an answer immediately.
- **Serve static files from a CDN.** Images, JavaScript and CSS don't need your application server at all.

## Step 5: Handle More Concurrent Requests

- **Use virtual threads.** A traditional server has a pool of platform threads, typically around 200. Each request holds one while it waits for the database or another service, and when all are busy, new requests queue up. Virtual threads (Java 21) are cheap enough to give every request its own. In Spring Boot 3.2 and later, it's one setting:

```properties
spring.threads.virtual.enabled=true
```

  Two cautions from the Spring Boot documentation: Java 24 or later is recommended, because older versions can lose throughput with "pinned" virtual threads; and thread-pool settings no longer apply. Virtual threads don't create database capacity either: they still wait for one of the pool's connections from Step 2.
- **Tune the JVM** once you have measurements: heap size and garbage collector settings.
- **Review your code and dependencies.** Remove unnecessary work in hot code paths, choose the right [data structures](https://codersite.dev/data-structures-foundation-efficient-programming/){:target="_blank"}, and update outdated or inefficient libraries. See [Best practices for writing Clean Code](https://codersite.dev/clean-code/){:target="_blank"}.

## Step 6: Scale Out, and Only Then Split

When one well-tuned server isn't enough:

1. **Scale vertically:** give the server more CPU and memory. It's the quickest fix, but it has a ceiling.
2. **Scale horizontally:** run several instances behind a [load balancer](https://codersite.dev/load-balancing-clustering/){:target="_blank"}, and add **autoscaling** so the number of instances follows the real demand. Cloud platforms make both much easier.
3. **Split the monolith** into microservices only when parts of the application have truly different load or release needs. It lets you scale each service separately, but it's the most expensive step, and it adds network calls, which bring you back to Steps 3 and 1.

Deciding where to split a monolith is a design question before it's a technical one:

<div>
{%- include softwareDesignAd1.html -%}
</div>

## The Playbook in One List

1. Measure: find the real bottleneck.
2. Database: pool size, leak detection, try-with-resources, query tuning.
3. Time limits: timeouts, careful retries, circuit breakers, rate limiting.
4. Less work: caching, async processing, CDN.
5. More concurrency: virtual threads, JVM tuning, code and dependency review.
6. Scale: vertical, then horizontal with autoscaling, then microservices.

"How would you find out why an application slows down under load?" is a favorite question in senior Java interviews. Prepare with real interview questions:

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Please support me as a writer. Every contribution helps, and your donation can help add more articles to this website, no matter how small. Thank you!

{% include buymeacoffee.html %}
<br/>
