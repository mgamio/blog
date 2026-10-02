---
layout: post
title:  "Replace OAuth2RestTemplate with RestClient: A Modern Spring Boot API Client"
description: "OAuth2RestTemplate is deprecated and Spring Security 7.0 removed the password grant. Rebuild a real OAuth2-secured API client with Spring's RestClient, keep your business logic unchanged, and get ready for client credentials."
author: moises
categories: [ programming ]
image: /assets/images/springBootRestClient.jpg
comments: false
---

In the [previous post](https://codersite.dev/spring-boot-automate-api-client/){:target="_blank"}, we built a program that walks an Order API (buyers, suppliers, customer numbers, articles) and places a test order. It works, but it's built on `OAuth2RestTemplate`, and that class has no future. In this post we rebuild the same client with Spring's modern `RestClient`, without changing a single line of the search logic.

## What Changed, and Why It Matters

- **`OAuth2RestTemplate` is deprecated.** It belongs to the old Spring Security OAuth project, which Spring no longer maintains. OAuth2 client support now lives inside Spring Security itself.
- **The password grant is gone.** Spring Security 7.0 removed support for it, because it forces the client application to handle the user's password. The recommended flows are client credentials (machine to machine) and authorization code (on behalf of a user).
- **`RestClient` is the modern HTTP client.** Introduced in Spring Framework 6.1 (Spring Boot 3.2), it has a fluent API like `WebClient`, but it is synchronous like `RestTemplate`.

Our Order API still only offers the password flow. That's common in B2B systems: you can't change the authorization server on your own schedule. So we migrate in two steps:

1. **Today:** drop the deprecated library and keep the existing server.
2. **Later:** switch to client credentials once the server supports it.

## Part 1: RestClient with the Existing Token Endpoint

The only dependency is the Spring Boot web starter, which brings `RestClient` and Jackson:

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

The client gets an access token once, then sends it as a `Bearer` header on every request:

```java
public class SellyApiClient {

  private final RestClient restClient;

  public SellyApiClient(String baseUrl, String tokenUrl,
                        String clientId, String clientSecret,
                        String username, String password) {
    String accessToken = fetchAccessToken(tokenUrl, clientId, clientSecret, username, password);
    this.restClient = RestClient.builder()
        .baseUrl(baseUrl)
        .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
        .build();
  }

  private static String fetchAccessToken(String tokenUrl, String clientId, String clientSecret,
                                         String username, String password) {
    MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
    form.add("grant_type", "password");
    form.add("username", username);
    form.add("password", password);

    TokenResponse token = RestClient.create()
        .post()
        .uri(tokenUrl)
        .headers(headers -> headers.setBasicAuth(clientId, clientSecret))
        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
        .body(form)
        .retrieve()
        .body(TokenResponse.class);

    return token.accessToken();
  }

  public List<Buyer> getBuyers() {
    return restClient.get()
        .uri("/api/v2/buyers")
        .retrieve()
        .body(new ParameterizedTypeReference<List<Buyer>>() {});
  }

  public List<Supplier> getSuppliers(Buyer buyer) {
    return restClient.get()
        .uri("/api/v2/suppliers?buyerId={buyerId}", buyer.getBuyerId())
        .retrieve()
        .body(new ParameterizedTypeReference<List<Supplier>>() {});
  }

  public List<CustomerNumber> getCustomerNumbers(Buyer buyer, Supplier supplier) {
    return restClient.get()
        .uri("/api/v2/customerNumbers?buyerId={buyerId}&supplierId={supplierId}",
            buyer.getBuyerId(), supplier.getSupplierId())
        .retrieve()
        .body(new ParameterizedTypeReference<List<CustomerNumber>>() {});
  }

  public List<Article> getArticles(Buyer buyer, Supplier supplier, CustomerNumber customerNumber) {
    return restClient.get()
        .uri("/api/v2/articles?buyerId={buyerId}&supplierId={supplierId}&customerNumberId={customerNumberId}",
            buyer.getBuyerId(), supplier.getSupplierId(), customerNumber.getCustomerNumberId())
        .retrieve()
        .body(new ParameterizedTypeReference<List<Article>>() {});
  }

  public Order createOrder(Order order) {
    return restClient.post()
        .uri("/api/v2/orders")
        .contentType(MediaType.APPLICATION_JSON)
        .body(order)
        .retrieve()
        .body(Order.class);
  }

  record TokenResponse(@JsonProperty("access_token") String accessToken,
                       @JsonProperty("expires_in") long expiresIn) {}
}
```

What each piece does:

- **`fetchAccessToken`** sends the same request `OAuth2RestTemplate` sent behind the scenes: a form POST to `/oauth/token` with `grant_type=password`, authenticated with the client ID and secret as HTTP Basic credentials.
- **`TokenResponse`** is a Java record that maps the two fields we need from the token response JSON.
- **`defaultHeader`** adds `Authorization: Bearer …` to every request made by this `RestClient`, so the API methods don't repeat it.
- **`uri("…?buyerId={buyerId}", buyer.getBuyerId())`** fills in URI variables and encodes them correctly, instead of concatenating strings.
- **`retrieve().body(…)`** converts the JSON response into Java objects. For lists we pass a `ParameterizedTypeReference`, just as before.

`retrieve()` throws a `RestClientResponseException` for 4xx and 5xx responses, so errors don't fail silently. The token is fetched once; that is fine for a test program that runs in seconds. A long-running service has to renew it before it expires, and Part 2 handles that automatically.

Swapping a deprecated library without touching the business logic is exactly what good design buys you. That idea runs through every chapter of this book:

<div>
{%- include softwareDesignAd1.html -%}
</div>

### The Search Logic Doesn't Change

This is the labeled-break version from the previous post, now calling `SellyApiClient`:

```java
public final class CreateOrderRandomTest {

  private static final Logger logger = LoggerFactory.getLogger(CreateOrderRandomTest.class);

  public static void main(String[] args) {
    SellyApiClient api = new SellyApiClient(
        "http://localhost:41231/cloud",
        "http://localhost:41231/cloud/oauth/token",
        System.getenv("API_CLIENT_ID"),
        System.getenv("API_CLIENT_SECRET"),
        System.getenv("API_USERNAME"),
        System.getenv("API_PASSWORD"));

    search:
    for (Buyer buyer : api.getBuyers()) {
      for (Supplier supplier : api.getSuppliers(buyer)) {
        for (CustomerNumber customerNumber : api.getCustomerNumbers(buyer, supplier)) {
          List<Article> articles = api.getArticles(buyer, supplier, customerNumber);
          if (articles.isEmpty())
            continue;
          Order order = api.createOrder(buildOrder(buyer, supplier, customerNumber, articles.get(0)));
          logger.info("Order {} created for buyerId={}, supplierId={}, customerNumberId={}",
              order.getOrderId(), buyer.getBuyerId(), supplier.getSupplierId(),
              customerNumber.getCustomerNumberId());
          break search;
        }
      }
    }
  }

  //buildOrder(...) as in the previous post
}
```

All the HTTP and security details live in one class, and the program reads like the business process it automates.

## Part 2: Client Credentials with Spring Security

The password flow is the part that still has to go. Once your authorization server supports the **client credentials** flow, Spring Security can fetch, cache and renew tokens for you. Add the OAuth2 client starter:

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
```

Register the client in `application.yml`. The credentials come from environment variables:

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          selly:
            provider: selly
            client-id: ${API_CLIENT_ID}
            client-secret: ${API_CLIENT_SECRET}
            authorization-grant-type: client_credentials
            scope: read,write
        provider:
          selly:
            token-uri: http://localhost:41231/cloud/oauth/token
```

Then build a `RestClient` with Spring Security's `OAuth2ClientHttpRequestInterceptor`. Because a test program or a scheduled job has no web request, we use `AuthorizedClientServiceOAuth2AuthorizedClientManager`:

```java
@Configuration
public class SellyClientConfig {

  @Bean
  public OAuth2AuthorizedClientManager authorizedClientManager(
      ClientRegistrationRepository clientRegistrationRepository,
      OAuth2AuthorizedClientService authorizedClientService) {

    OAuth2AuthorizedClientProvider authorizedClientProvider =
        OAuth2AuthorizedClientProviderBuilder.builder()
            .clientCredentials()
            .build();

    AuthorizedClientServiceOAuth2AuthorizedClientManager authorizedClientManager =
        new AuthorizedClientServiceOAuth2AuthorizedClientManager(
            clientRegistrationRepository, authorizedClientService);
    authorizedClientManager.setAuthorizedClientProvider(authorizedClientProvider);

    return authorizedClientManager;
  }

  @Bean
  public RestClient sellyRestClient(OAuth2AuthorizedClientManager authorizedClientManager) {
    OAuth2ClientHttpRequestInterceptor interceptor =
        new OAuth2ClientHttpRequestInterceptor(authorizedClientManager);
    interceptor.setClientRegistrationIdResolver(request -> "selly");

    return RestClient.builder()
        .baseUrl("http://localhost:41231/cloud")
        .requestInterceptor(interceptor)
        .build();
  }
}
```

- **`authorizedClientManager`** knows how to obtain a token for the `selly` registration with the client credentials flow, and keeps it until it expires.
- **`OAuth2ClientHttpRequestInterceptor`** asks the manager for a valid token before each request and adds the `Authorization` header.
- **`setClientRegistrationIdResolver(request -> "selly")`** tells the interceptor which registration to use for every call made by this `RestClient`.

`SellyApiClient` now receives this `RestClient` in its constructor instead of fetching a token itself. The `fetchAccessToken` method disappears, and the search loop still doesn't change.

## Before and After

| | 2024 version | Part 1 | Part 2 |
|---|---|---|---|
| HTTP client | `OAuth2RestTemplate` (deprecated) | `RestClient` | `RestClient` |
| OAuth2 flow | Password | Password | Client credentials |
| Token handling | Library | Fetched once by our code | Spring Security, renewed automatically |
| Needs a server change | No | No | Yes |
| Business logic | Nested loops + flags | Labeled break | Labeled break |

<br/>

Further reading: [Spring Security: Authorized Client features](https://docs.spring.io/spring-security/reference/servlet/oauth2/client/authorized-clients.html){:target="_blank"} and [What's new in Spring Security 7.0](https://docs.spring.io/spring-security/reference/7.0/whats-new.html){:target="_blank"}.

Migrations like this one come up in interviews too: why a library was deprecated, what replaces it, and how to change it without breaking anything. Prepare with real questions:

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Please support me as a writer. Your donation will help add more articles to this website. Thank you!

{% include buymeacoffee.html %}
<br/>
