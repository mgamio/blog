---
layout: post
title:  "Break Out of Nested Loops in Java: Automating a Real REST API Client"
description: "A real Spring REST client that walks buyers, suppliers, customer numbers and articles to place a test order, and how a labeled break replaces three flags and three if-checks."
author: moises
categories: [ programming ]
image: /assets/images/apiClientRequest.jpg
comments: false
---

Testing an order API by hand means clicking through buyers, suppliers, customer numbers and articles until you find a combination that works. This program does it in seconds: it walks the API, finds the first valid combination, places the order and stops. Along the way it shows the right way to escape four nested loops in Java.

We will create an [API Client](https://codersite.dev/building-rest-api-client/){:target="_blank"} to automate the creation of an Order based on a combination of Buyers, Suppliers, Customer Numbers, and Articles.

You can find the API specification in the following link.

[Order API](https://app.swaggerhub.com/apis-docs/MGAMIO/selly-order_api/3.0.0){:target="_blank"}.

> **A note for 2026:** this client uses `OAuth2RestTemplate` from the Spring Security OAuth project, which is deprecated, and the password grant, which Spring Security 7.0 removed. It still works in projects on those older versions. For new code, see the follow-up: [Replace OAuth2RestTemplate with RestClient](https://codersite.dev/spring-restclient-replace-oauth2resttemplate/){:target="_blank"}. The loop logic in this post stays exactly the same.

## Test Program

Once users are logged in, they can access a pool of Buyers. A Buyer can order articles from different Suppliers. But first, every Buyer must be identified by a unique customer number to proceed with creating orders.

Each call needs the IDs returned by the previous one, because they are required parameters:

| Step | Call | Needs |
|---|---|---|
| 1 | `GET /api/v2/buyers` | nothing |
| 2 | `GET /api/v2/suppliers` | buyerId |
| 3 | `GET /api/v2/customerNumbers` | buyerId, supplierId |
| 4 | `GET /api/v2/articles` | buyerId, supplierId, customerNumberId |
| 5 | `POST /api/v2/orders` | all of the above + one article |

<br/>

![Swagger UI: GET /api/v2/articles requires buyerId, supplierId and customerNumberId](/assets/images/articlesEndpoint.jpg "Swagger UI: GET /api/v2/articles requires buyerId, supplierId and customerNumberId"){:class="img-responsive"}

Once the program finds at least one article by navigating through these entities, it builds an order, sends the request, and stops.

### What we need to use in the Program

**continue statement**

The continue statement skips the rest of the current iteration and moves on to the next one. It works in all Java loops: for, while, and do-while.

**break keyword**

The break keyword terminates a loop or switch statement early. Control moves to the statement immediately after the enclosing loop or switch.

**OAuth2RestTemplate**

A RestTemplate that makes [OAuth2](https://codersite.dev/spring-boot-oauth2/){:target="_blank"}-authenticated REST requests with the credentials of the provided resource.

We define a boolean variable to control when an article is found.

A test helper today, a production tool tomorrow. Small design choices like these decide whether code stays readable as it grows:

<div>
{%- include softwareDesignAd1.html -%}
</div>

Here is the program code.

```java
public final class CreateOrderRandomTest {

  private static final Logger logger = LoggerFactory.getLogger(CreateOrderRandomTest.class);

  private static ResourceOwnerPasswordResourceDetails resourceDetails;
  private static OAuth2RestTemplate restTemplate;
  private static HttpHeaders headers;

  static String apiHost = "http://localhost:41231/cloud";
  static String tokenUri = apiHost + "/oauth/token";
  static String url = apiHost + "/api/v2/";
  static String clientId = System.getenv("API_CLIENT_ID");
  static String secret = System.getenv("API_CLIENT_SECRET");

  public static void main(String[] args) {

    headers = new HttpHeaders();
    restTemplate = buildRestTemplate(clientId, secret);

    try {

      String urlRequest = url + "buyers";

      HttpEntity<String> entity = new HttpEntity<String>(headers);
      ResponseEntity<List<Buyer>> listOfBuyersResponse = restTemplate.exchange(urlRequest,
          HttpMethod.GET, entity, new ParameterizedTypeReference<List<Buyer>>(){});

      List<Buyer> listOfBuyers = listOfBuyersResponse.getBody();

      boolean atLeastOneCustomerNumberWithArticles = false;

      for (Buyer buyer : listOfBuyers) {

        urlRequest = url + "suppliers";

        ResponseEntity<List<Supplier>> listOfSuppliersResponse = restTemplate.exchange(urlRequest + "?buyerId=" + buyer.getBuyerId(),
            HttpMethod.GET, entity, new ParameterizedTypeReference<List<Supplier>>(){});

        List<Supplier> listOfSuppliers = listOfSuppliersResponse.getBody();

        if (listOfSuppliers.size() == 0)
          continue;

        for (Supplier supplier : listOfSuppliers) {

          urlRequest = url + "customerNumbers";

          ResponseEntity<List<CustomerNumber>> listOfCustomerNumbersResponse = restTemplate.exchange(
              urlRequest + "?buyerId=" + buyer.getBuyerId() + "&supplierId=" + supplier.getSupplierId(),
              HttpMethod.GET, entity, new ParameterizedTypeReference<List<CustomerNumber>>(){});

          List<CustomerNumber> listOfCustomerNumbers = listOfCustomerNumbersResponse.getBody();

          if (listOfCustomerNumbers.size() == 0)
            continue;

          for (CustomerNumber customerNumber : listOfCustomerNumbers) {

            urlRequest = url + "articles";

            ResponseEntity<List<Article>> listOfArticlesResponse = restTemplate.exchange(urlRequest + "?buyerId=" + buyer.getBuyerId() +
                "&supplierId=" + supplier.getSupplierId() + "&customerNumberId=" + customerNumber.getCustomerNumberId(),
                HttpMethod.GET, entity, new ParameterizedTypeReference<List<Article>>(){});

            List<Article> listOfArticles = listOfArticlesResponse.getBody();

            if (listOfArticles.size() == 0)
              continue;

            for (Article article : listOfArticles) {

              urlRequest = url + "orders";

              Order order = buildOrder(buyer, supplier, customerNumber, article);
              HttpEntity<Order> orderEntity = new HttpEntity<Order>(order, headers);
              ResponseEntity<Order> responseEntity = restTemplate.exchange(urlRequest, HttpMethod.POST, orderEntity, Order.class);

              Order orderResponse = responseEntity.getBody();
              logger.info(responseEntity.getStatusCode().toString());
              break;
            }

            atLeastOneCustomerNumberWithArticles = true;
            logger.info("buyerId = " + buyer.getBuyerId() + ", supplierId = " + supplier.getSupplierId() +
                ", customerNumberId = " + customerNumber.getCustomerNumberId());
            break;

          } //end-for listOfCustomerNumbers

          if (atLeastOneCustomerNumberWithArticles == true)
            break;

        } //end-for listOfSuppliers

        if (atLeastOneCustomerNumberWithArticles == true)
          break;

      } //end-for listOfBuyers

    } catch (HttpClientErrorException e) {
      //code omitted for brevity
    } catch (Exception e) {
      logger.error("error:  " + e.getMessage());
    }
  }

  private static Order buildOrder(Buyer buyer, Supplier supplier, CustomerNumber customerNumber, Article article) {
    Order order = new Order();
    order.setBuyerId(buyer.getBuyerId());
    order.setSupplierId(supplier.getSupplierId());
    //code omitted for brevity

    return order;
  }

  private static OAuth2RestTemplate buildRestTemplate(String clientId, String secret) {
    resourceDetails = new ResourceOwnerPasswordResourceDetails();
    //code omitted for brevity

    DefaultOAuth2ClientContext clientContext = new DefaultOAuth2ClientContext();
    restTemplate = new OAuth2RestTemplate(resourceDetails, clientContext);
    restTemplate.setMessageConverters(asList(new MappingJackson2HttpMessageConverter()));

    return restTemplate;
  }
}
```

The client ID and secret come from environment variables. Never hard-code credentials in source code: they end up in version control.

Why does the program need `continue`? If a customer number has no articles, `continue` skips to the next one. Without it, the program would set `atLeastOneCustomerNumberWithArticles` to true and stop before placing any order.

## Refactor: One Labeled Break Instead of Three Flags

The flag variable and the three `if (... == true) break;` checks exist only to escape four nested loops. Java has a cleaner tool for exactly this: a **labeled break**.

```java
search:
for (Buyer buyer : getBuyers()) {
  for (Supplier supplier : getSuppliers(buyer)) {
    for (CustomerNumber customerNumber : getCustomerNumbers(buyer, supplier)) {
      List<Article> articles = getArticles(buyer, supplier, customerNumber);
      if (articles.isEmpty())
        continue;
      createOrder(buyer, supplier, customerNumber, articles.get(0));
      break search;   // leaves all three loops at once
    }
  }
}
```

The `get…` helpers wrap the `restTemplate.exchange` calls shown above. The flag variable and the three `if` checks disappear, and an empty list simply means the inner loop never runs.

Escaping nested loops, early exits and API-driven test data are classic interview topics. Practice them on real questions:

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Please support me as a writer. Your donation will help add more articles to this website. Thank you!

{% include buymeacoffee.html %}
<br/>
