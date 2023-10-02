---
layout: post
title:  "Building a REST API Client"
description: "Building a REST API Client, restTemplate, Spring"
author: moises
categories: [ Web APIs ]
image: assets/images/restApiClient.jpg
comments: false
---

This guide walks you through creating a client application that consumes a [RESTful](https://codersite.dev/rest-api-overview/){:target="_blank"} web service.

We will build a custom client code to test the [rate-limiting](https://codersite.dev/rate-limit/){:target="_blank"} algorithm implemented at an API Server.

Client application uses Spring’s RestTemplate, a synchronous client to perform HTTP requests.

We want to implement several calls to different endpoints. We create an interface with only one method.

```kotlin
public interface IClientAPI {

  static String apiHost = "<here_your_api_host>";
  static String tokenUri = apiHost + "/oauth/token";
  static String url = apiHost + "/v1/";
  
  public void callEndpoint() throws Exception;

}
```

First, we consume data from the Supplier endpoint. So, we implement the above method.

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

Secondly, we retrieve data from the Buyer endpoint. So, we need a new custom implementation for the *callEndpoint* method.

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

<div>
{%- include inArticleAds.html -%}
</div>

We will simulate a more realistic scenario where client requests arrive concurrently to the API Server.

[ForkJoinPool](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ForkJoinPool.html){:target="_blank"} class is an *ExecutorService* that helps speed up parallel processing by attempting to use all available processor cores.

```kotlin
public class RESTFulParallelClientsTest {

  public static void main(String[] args) {

    IClientAPI iClientAPI_suppliers = new GetSuppliers("<here_clientId>","<here_secret>");
    IClientAPI iClientAPI_buyers = new GetBuyers("<here_other_clientId>","<here_other_secret>");

    Callable<Void> runnableTask1 = runnableTask(iClientAPI_suppliers);
    Callable<Void> runnableTask2 = runnableTask(iClientAPI_buyers);
		
    ForkJoinPool.commonPool().invokeAll(asList(
      runnableTask1
     ,runnableTask2
     ));
  }

  private static Callable<Void> runnableTask(IClientAPI iClientAPI) {

    return () -> {
      iClientAPI.callEndpoint();
      return null;
    };
  }

}
```

With this test, you can simultaneously send thousands of requests to all your API endpoints. You can monitor your thread pool at the application server and see how the rate limit algorithm refuses all requests that exceed the rate limit quote.

Please donate if you find this content valuable.

<form action="https://www.paypal.com/donate" method="post" target="_top">
 <input type="hidden" name="hosted_button_id" value="UF4T364RTPPMJ" />
 <input type="image" src="https://www.paypalobjects.com/en_US/DK/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
 <img alt="" border="0" src="https://www.paypal.com/en_DE/i/scr/pixel.gif" width="1" height="1" />
</form>
<br/>
