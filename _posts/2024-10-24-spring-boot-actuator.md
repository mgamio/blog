---
layout: post
title:  "Log Every Login Attempt with Spring Boot Actuator Auditing"
description: "Use Spring Boot Actuator's audit events to log successful and failed authentication attempts, including the one bean you need to enable auditing and how to keep the log file small."
author: moises
categories: [ programming ]
image: /assets/images/springBootActuator.jpg
comments: false
---

When a login fails at 3 a.m., you want to know who tried, how often, and whether it worked. Spring Boot Actuator already publishes these security events; you only have to listen. Here's how to log every token request, successful or not, without flooding your log file.

Spring Boot includes additional features to help you monitor and manage your application when deployed to production.

You can manage and monitor your application by using Loggers, Metrics, Tracing, and Auditing automatically.

To enable these Production-ready Features, you need to add a dependency on the *spring-boot-starter-actuator* starter.

```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
  </dependency>
</dependencies>
```

## Use case

We want to log all OAuth2 token requests from a new Rest API (successful and unsuccessful).

The authorization grant that the API uses is Resource Owner Password Credentials. See [How to implement Spring Boot Security OAuth2](https://codersite.dev/spring-boot-oauth2/){:target="_blank"}.

> **A note for 2026:** this example uses the password grant on a `/oauth/token` endpoint, which Spring Security 7.0 no longer supports. The auditing technique itself works the same with any authentication flow. To modernize the client side, see [Replace OAuth2RestTemplate with RestClient](https://codersite.dev/spring-restclient-replace-oauth2resttemplate/){:target="_blank"}.

![Swagger UI authorization dialog requesting an OAuth2 token with the password flow from /cloud/oauth/token](/assets/images/springOAuthToken.jpg "Swagger UI authorization dialog requesting an OAuth2 token with the password flow from /cloud/oauth/token"){:class="img-responsive"}

We are going to enable **Auditing** to catch authentication and authorization events that the Spring Boot [Actuator](https://docs.spring.io/spring-boot/reference/actuator/auditing.html){:target="_blank"} publishes by default such as *“authentication success”*, *“failure”* and *“access denied”* exceptions.

## Enable Auditing

```java
@Configuration
public class AuditConfig {

  @Bean
  public AuditEventRepository auditEventRepository() {
    return new InMemoryAuditEventRepository();
  }
}
```

Without an `AuditEventRepository` bean, Spring Boot doesn't record audit events, and the listener below never fires. `InMemoryAuditEventRepository` is fine for development. For production, Spring recommends your own implementation, for example one that writes to a database.

## Listen to the Events

We define a bean with a listener method.

```java
@Component
public class LoginAttemptsLogger {

  private static final Logger logger = LoggerFactory.getLogger(LoginAttemptsLogger.class);

  @EventListener
  public void auditEventHappened(AuditApplicationEvent auditApplicationEvent) {

    logger.info(auditApplicationEvent.getAuditEvent().getPrincipal() + " - " +
      auditApplicationEvent.getAuditEvent().getType());
  }
}
```

The previous code logs events from every endpoint of the API, so the log file grows quickly with entries we don't need.

<div>
{%- include inArticleAds.html -%}
</div>

Instead, we can inject the *HttpServletRequest* interface, which provides request information for HTTP servlets, and log only requests to the *oauth/token* URL.

```java
@Component
public class LoginAttemptsLogger {

  private static final Logger logger = LoggerFactory.getLogger(LoginAttemptsLogger.class);

  @Autowired
  private HttpServletRequest httpServletRequest;

  @EventListener
  public void auditEventHappened(AuditApplicationEvent auditApplicationEvent) {

    if (httpServletRequest.getRequestURL().toString().contains("/cloud/oauth/token")) {
      logger.info("Login Attempt in /cloud/oauth/token Principal : " +
        auditApplicationEvent.getAuditEvent().getPrincipal() + " - " +
        auditApplicationEvent.getAuditEvent().getType());
    }
  }
}
```

When the authentication process is successful you can see in your console:

```text
LoginAttemptsLogger   : Login Attempt in /cloud/oauth/token Principal : codersite - AUTHENTICATION_SUCCESS
```

When the authentication process is not successful you can see in your console:

```text
LoginAttemptsLogger   : Login Attempt in /cloud/oauth/token Principal : codersite - AUTHENTICATION_FAILURE
```

## See the Events in the Browser

```properties
management.endpoints.web.exposure.include=health,auditevents
```

Now `GET /actuator/auditevents` returns the most recent events as JSON. Protect this endpoint in production: it reveals who logged in.

See [Implementing hot-warm architecture in Elasticsearch](https://codersite.dev/hot-warm-architecture-elasticsearch/){:target="_blank"} to analyze application server logs.

Security and observability questions are common in backend interviews: how would you detect a brute-force attack on your login? Prepare with real questions:

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Please support me as a writer. Your donation will help add more articles to this website. Thank you!

{% include buymeacoffee.html %}
<br/>
