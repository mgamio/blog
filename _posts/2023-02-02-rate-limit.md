---
layout: post
title:  "Rate Limiting Algorithm"
description: "Hot to implement a rate limiter in a backend API"
author: moises
categories: [ algorithms ]
image: assets/images/rateLimitAlgorithm.jpg
comments: false
---

A [rate-limiting](https://cloud.google.com/architecture/rate-limiting-strategies-techniques){:target="_blank"} system controls the rate of traffic sent or received on a network interface. APIs will use rate-limiting techniques to control how many times application Clients are allowed to call an API endpoint during a given time interval. Traffic is allowed up to one specified rate, whereas traffic that exceeds that rate is denied – HTTP code 429.

## Reasons to implement a rate limit

- Avoid a denial-of-service (DoS) attack. So, the first principle here will be Availability for our distributed systems.

- We have database functions that use expensive hardware resources when the API requests arrive concurrently or sequentially without limit.

## Token-bucket algorithm

The [token-bucket](https://en.wikipedia.org/wiki/Token_bucket){:target="_blank"} algorithm is explained with the analogy of a bucket with finite capacity, into which tokens are added at a fixed rate. But it can’t fill up infinitely. If a token arrives when the bucket is complete, it’s discarded. On every request, ***n*** number of tokens are removed from the bucket. The request is rejected if there are fewer than ***n*** tokens in the bucket.

When we have somebody that takes out tokens, we also need somebody that puts tokens into the bucket. The *refiller* periodically creates new tokens and puts them into the bucket.

![rate-Limit-Refiller](/assets/images/rateLimitRefiller.jpg){:class="img-responsive"}

## About Bucket4j

[Bucket4j](https://bucket4j.com/8.1.1/toc.html){:target="_blank"} is a Java rate-limiting library implemented on top of ideas of the token-bucket algorithm.

Maven Configuration: We need to add the bucket4j dependency to our pom.xml file.

```kotlin
<dependency>
    <groupId>com.bucket4j</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.1.1</version>
</dependency>
```

You can implement a rate limiter for your clients based on subscription plans or even for each endpoint. For learning purposes, we implement a rate limit based on external IPs.

## Inspirational Quotes About Tech

We implement a web service allowing clients to retrieve a Random Quote about tech.

Firstly, we define a *Repository* class to retrieve Quotes data from a text file, for example.

Secondly, we define a *Service* class to manipulate the previous data and get a random Quote.

Finally, we assemble all these components in a *RestContoller* class.

```kotlin
@RestController
@RequestMapping("/v1")
public class QuoteController {

  @Autowired
  private QuoteService quoteService;

  @GetMapping(value = "/quotes/random", produces = MediaType.APPLICATION_JSON_VALUE)
  public Quote getQuote(HttpServletRequest httpServletRequest) throws Exception {

    return quoteService.getRandomQuote();
  }
}
```

For more information on implementing RESTful web services, visit this [link](https://codersite.dev/documenting-rest-api-openapi3/){:target="_blank"}.

Once you deploy the API service, you can request a random quote from a Web Client like Postman.

![rate-Limit-random](/assets/images/randomQuotePostman.jpg){:class="img-responsive"}

But in reality, web Clients are automated, especially in B2B integrations, where developers on the client side send hundreds or thousands of requests per minute to analyze random data during the implementation stage.

We should implement a rate limit to protect our software infrastructure from unintentional requests that exceed the regular consumption of our web services.

## Implementing Spring MVC HandlerInterceptor

The *preHandle* method of a *HandlerInterceptor* Interface intercepts a client request and adds a preprocess.

```kotlin
@Component
public class RateLimitInterceptor implements HandlerInterceptor {
 
  @Override
  public boolean preHandle(HttpServletRequest request, 
    HttpServletResponse response, Object handler) throws Exception {
    
	//preprocess here
    
	return false;
  }
}
```

Firstly, to detect an external IP, we implement the following method.

```kotlin
  private String getClientIP(HttpServletRequest request) {
    String ip = request.getHeader("X-FORWARDED-FOR");

    if (ip == null || ip.isEmpty()) {
      ip = request.getRemoteAddr();
    }

    return ip;
  }

```

To use the *bucket4j* library, we need to understand their terminology.

**Bucket**  is the Interface that defines the behavior of a rate-limiter - based on the Token Bucket algorithm. A bucket is created using a builder pattern.

```kotlin
Bucket bucket = Bucket.builder()
  .addLimit(...)
  .build();
```

To add a *Limit* to the bucket, we define a *Bandwidth* denoted by the following terms.

**Capacity** specifies how many tokens your bucket has.

**Refill** specifies how fast tokens can be refilled after it was consumed from a bucket.

If we choose the interval refill, the bucket will wait until the whole period is elapsed before regenerating the whole amount of tokens.

```kotlin
// generates 10 tokens each minute
Refill.intervally(10, Duration.ofMinutes(1));

```

For example, if we decide that *one* client request represents a token, and the client sends ten requests over the next 15 seconds, then the client must wait 45 seconds to send the following request; otherwise, the API rejects the request. We will see this implementation later.

The following code defines a bucket with 10 tokens of capacity.

```kotlin
private final Bucket freeBucket = Bucket.builder()
  .addLimit(Bandwidth.classic(10, Refill.intervally(10, Duration.ofMinutes(1))))
  .build();
```

