---
layout: post
title:  "Production-ready Features - Spring Actuator"
description: "The spring-boot-actuator module provides all of Spring Boot’s production-ready features."
author: moises
categories: [ programming ]
image: /assets/images/springBootActuator.jpg
comments: false
---

Spring Boot includes additional features to help you monitor and manage your application when deployed to production.

You can manage and monitor your application by using Loggers, Metrics, Tracing, and Auditing automatically.

To enable these  Production-ready Features, you need to add a dependency on the *spring-boot-starter-actuator* starter.

```kotlin
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

![oauthToken](/assets/images/springOAuthToken.jpg "springOAuth"){:class="img-responsive"}

We are going to enable **Auditing** to catch authentication and authorization events that the Spring Boot [Actuator](https://docs.spring.io/spring-boot/reference/actuator/auditing.html){:target="_blank"} publishes by default such as  *“authentication success”*, *“failure”* and *“access denied”* exceptions.

We define a bean with a listener method.

```kotlin
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

The previous code works for all endpoints of the API and we will unnecessarily blow up the logfile size.

<div>
{%- include inArticleAds.html -%}
</div>

What we can do, is inject the *HttpServletRequest* interface that provides request information for HTTP servlets. Then we can validate the *oauth/token* URL.

```kotlin
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

```kotlin
LoginAttemptsLogger   : Login Attempt in /cloud/oauth/token Principal : codersite - AUTHENTICATION_SUCCESS
```

When the authentication process is not successful you can see in your console:

```kotlin
LoginAttemptsLogger   : Login Attempt in /cloud/oauth/token Principal : codersite - AUTHENTICATION_FAILURE
```

See [Implementing hot-warm architecture in Elasticsearch](https://codersite.dev/hot-warm-architecture-elasticsearch/){:target="_blank"} to analyze application server logs.

> Arrays, graphs, recursion, dynamic programming — all in one book, all in Java.

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Please support me as a writer. Your donation will help add more articles to this website. Thank you!

{% include buymeacoffee.html %}
<br/>
