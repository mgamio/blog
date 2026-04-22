---
layout: post
title:  "Building a REST API Client"
description: "Building a REST API Client, restTemplate, Spring"
author: moises
categories: [ Web APIs ]
image: assets/images/restApiClient.jpg
comments: false
---

This guide walks you through creating a client application that simultaneously consumes different endpoints from a [RESTful](https://codersite.dev/rest-api-overview/){:target="_blank"} web service (API Server).

We will build two different sub-tasks inside the client code to test the [Rate Limiting](https://codersite.dev/rate-limit/){:target="_blank"} algorithm implemented at the API Server.

Client application uses Spring’s RestTemplate, a synchronous client to perform HTTP requests.

To simulate multiple simultaneous calls to different endpoints, we first create an interface with a single method.

```kotlin
public interface IClientAPI {

  static String apiHost = "<here_your_api_host>";
  static String tokenUri = apiHost + "/oauth/token";
  static String url = apiHost + "/v1/";
  
  public void callEndpoint() throws Exception;

}
```

Secondly, we implement the *callEndpoint* method to simulate a scenario where external clients request data from a Supplier endpoint, for example.

```kotlin
public final class GetSuppliers implements IClientAPI {

  private static OAuth2RestTemplate restTemplate;
  private static HttpHeaders headers;

  private static final int NRO_REQUESTS =60;

  public GetSuppliers(String clientId, String secret) {
    headers = new HttpHeaders();
    restTemplate = buildRestTemplate(clientId, secret);
  }
	
  public void callEndpoint() throws Exception {
    for (int idx = 1; idx <= NRO_REQUESTS; idx++) {
      try {
        String urlEndpoint = url + "suppliers";
        headers.set("NroClientRequest", String.valueOf(idx));
        HttpEntity<String> entity = new HttpEntity<String>(headers);
       
        ResponseEntity<List<Supplier>> responseEntity = restTemplate.exchange(urlEndpoint, HttpMethod.GET, entity, List.class);

        logger.info("X-Rate-Limit-Remaining : " + responseEntity.getHeaders().getFirst("X-Rate-Limit-Remaining"));

      } catch (Exception e) {
        logger.error("error:  " + e.getMessage());
      }
    }  
  }
  
}
```

> From monoliths to microservices, learn how to design software that can evolve with your business needs.

<div>
{%- include softwareDesign.html -%}
</div>

Then, in the same way we implement a second sub-task to retrieve data from a Buyer endpoint.

```kotlin
public final class GetBuyers implements IClientAPI {

  private static final int NRO_REQUESTS =140;
  //code omitted for brevity

  public void callEndpoint() throws Exception {
    for (int idx = 1; idx <= NRO_REQUESTS; idx++) {
      try {
        String urlEndpoint = url + "buyers";
        headers.set("NroClientRequest", String.valueOf(idx));
        HttpEntity<String> entity = new HttpEntity<String>(headers);
       
        ResponseEntity<List<Buyer>> responseEntity = restTemplate.exchange(urlEndpoint, HttpMethod.GET, entity, List.class);

        logger.info("X-Rate-Limit-Remaining : " + responseEntity.getHeaders().getFirst("X-Rate-Limit-Remaining"));

      } catch (Exception e) {
        logger.error("error:  " + e.getMessage());
      }
    }  
  }
  
}
```

Note that our *callEndpoint* method does not return a value, because what we want is to display the rate limit error in our log files.

Finally, to simulate concurrent API Calls from multiple endpoints simultaneously, we need an Executor service.

[ForkJoinPool](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ForkJoinPool.html){:target="_blank"} class is an *ExecutorService* that helps speed up parallel processing by attempting to use all available processor cores.

The [**Callable**](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/Callable.html){:target="_blank"} interface is similar to *Runnable*, in that both are designed for classes whose instances are potentially executed by another thread. A *Runnable*, however, does not return a result and cannot throw a checked exception.

One advantage of callable is that we can split heavy tasks into smaller parallel ones.

Here is the final code:

```kotlin
public class RESTFulParallelClientsTest {

  public static void main(String[] args) {

    IClientAPI iClientAPI_suppliers = new GetSuppliers("<here_clientId>","<here_secret>");
    IClientAPI iClientAPI_buyers = new GetBuyers("<here_other_clientId>","<here_other_secret>");

    Callable<Void> callableTask1 = callableTask(iClientAPI_suppliers);
    Callable<Void> callableTask2 = callableTask(iClientAPI_buyers);
		
    ForkJoinPool.commonPool().invokeAll(asList(
      callableTask1
     ,callableTask2
     ));
  }

  private static Callable<Void> callableTask(IClientAPI iClientAPI) {

    return () -> {
      iClientAPI.callEndpoint();
      return null;
    };
  }

}
```
Suppose the API Server set up a limit of 90 requests per minute for the buyer's endpoint. Then, request number 91 is refused, and the client receives an HTTP Error code of 429.

```kotlin
16:10:42.454 [main] INFO RESTFulParallelClientsTest - https://api_host/v1/buyers Client request nro: 91
16:10:42.542 [main] INFO RESTFulParallelClientsTest - 429 {"title":"Too many request","status":429,"detail":"X-Rate-Limit-Retry-After-Seconds: 37","path":"/v1/buyers client: codersite.dev", "timeStamp":1696428642515}
```

With this client code, you can simultaneously send thousands of requests to all your API endpoints. You can monitor your thread pool at the application server and see how the rate limit algorithm refuses all requests that exceed the rate limit quote.

You can design test scenarios where external clients interact with API endpoints. Then, you can detect how well the code and database functions support the functionalities behind your endpoints, especially on critical business days such as Black Fridays.

> Practice With Questions That Companies Actually Ask

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Please support me as a writer. Every contribution helps, and your donation can help add more articles to this website, no matter how small. Thank you!

<form action="https://www.paypal.com/donate" method="post" target="_top">
 <input type="hidden" name="hosted_button_id" value="UF4T364RTPPMJ" />
 <input type="image" src="https://www.paypalobjects.com/en_US/DK/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
 <img alt="" border="0" src="https://www.paypal.com/en_DE/i/scr/pixel.gif" width="1" height="1" />
</form>
<br/>

<div>
{%- include mailchimp.html -%}
</div>

