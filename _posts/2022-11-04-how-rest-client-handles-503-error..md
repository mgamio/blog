---
layout: post
title:  "REST client error handling - 503 Error"
description: "How a REST client handles 503 Service Unavailable Error. Troubleshooting REST clients"
author: moises
categories: [ Web APIs ]
image: assets/images/503ServiceUnavailableError.jpg
comments: false
---

The HTTP 503 Service Unavailable server error response code indicates that the server is temporarily not ready to handle the request.

Common causes of the 503 HTTP Status Code:

- The server is down for a scheduled maintenance 
- The server is overloaded due to too much traffic 

In any case, the server will relieve itself after some delay.

## A REST client cannot control what happens on the server side

Business-to-business ([B2B](https://codersite.dev/the-ubiquitous-language/){:target="_blank"}) is a typical scenario where one business acts as a client and the other acts as a server.

A client-side company doesn't care if there is a monolithic or microservice architecture on the server side.

![webClient](/assets/images/webClient.png){:class="img-responsive"}

We have implemented a web client that retrieves data from a thousand articles on each request.

We need to send 50 thousand items. We reuse the following method to send a thousand articles every time. But suddenly, the external API throws an HTTP 503 status code. To avoid our REST client aborting the process, we catch the exception and put the error into a logger, and the program continues with the following one thousand articles.

```kotlin
public Response getArticles(StringJoiner arrayOf1000Articles) throws Exception {
   
  MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
  map.add("content", arrayOf1000Articles.toString());
  HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

  Response response = null;
  try {
    response = new RestTemplate().postForObject(URL_SERVER + "/articles/search", request, Response.class);
  } catch (Exception e) {
    logger.error("Error in getArticles " + e.getMessage());
  }

  return response; 
}
```

Well, looking at our internal server logs - *logger* - won't help to retry the request that failed. Sometimes we usually call the company that takes care of the external server. Usually, they report that there was a Service outage response.

What this 503 error suggests is a retry action from our REST client to deal with external server errors.

<div>
{%- include inArticleAds.html -%}
</div>

## How does the REST Client automate a retry action?

As developers, we need to anticipate and automate retrying the request with a certain number of attempts. If the server error persists, we need to inform our users about the failed request's content.

The following code implementation handles 503 Service Unavailable Error.

```kotlin
public Response getArticles(StringJoiner arrayOf1000Articles) throws Exception {
   
  MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
  map.add("content", arrayOf1000Articles.toString());
  HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
  
  boolean success = false;
  int MAX_TRIALS = 3;
  int nextTrial = 1;
  Response response = null;
  do {
    try {
      response = new RestTemplate().postForObject(URL_SERVER + "/articles/search", request, Response.class);
      success = true;
    } catch (Exception e) {
      logger.error("Error in getArticles " + e.getMessage());
      nextTrial++;
    }
  } while (!success && nextTrial <= MAX_TRIALS);
 
  if (!success)
    informError("Error in getArticles " + arrayOf1000Articles.toString());
 
  return response; 
}
```

For simplicity and learning purposes, we assume we receive an HTTP status code of 503 within the try & catch block.
