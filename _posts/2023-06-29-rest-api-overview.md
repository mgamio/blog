---
layout: post
title:  "REST API Tutorial: Resources, HTTP Methods, Status Codes and a Spring Boot Example"
description: "Learn REST from a real B2B ordering API: resources and representations, the REST constraints, GET/POST/PUT/PATCH/DELETE with valid examples, status codes, and a Spring Boot controller."
author: moises
categories: [ Web APIs ]
image: /assets/images/RESTAPIOverview.jpg
comments: false
---

A restaurant app needs a supplier's food prices; the supplier's system needs the restaurant's orders. Two companies, two technologies, no shared code, and [REST](https://en.wikipedia.org/wiki/Representational_state_transfer){:target="_blank"} is how they talk. This tutorial explains REST through a real B2B ordering API, from resources and HTTP methods to a Spring Boot controller.

## What Is an API?

An API (Application Programming Interface) is an interface with defined functionalities that a software program presents to other programs and, in the case of web APIs, to the rest of the world via the Internet.

APIs are the building blocks that allow businesses to work together on the web. Companies implement APIs to expose internal business processes and data to new customers and partners. For example, APIs are how food data, including allergen information, is shared with hundreds of restaurant apps.

An API is a **contract**: once other companies build on it, you can't change it freely. Breaking changes, such as removing a field, need a new version of the API.

The party offering its services through an API is called the **provider**, and the one requesting these services is the **consumer**. Providers run programs that serve data (API servers), and consumers run programs that request and use that data (API clients):

![API clients of companies A, B and D calling the API servers of companies B and C, each company with its own data](/assets/images/APImesh.jpg "API clients of companies A, B and D calling the API servers of companies B and C, each company with its own data"){:class="img-responsive"}

Every company can build its servers and clients with different programming languages, caches, proxies and security mechanisms, in monoliths or microservices, on its own servers or in the cloud. So how can all these different components communicate? They share a common language: the [HTTP](https://en.wikipedia.org/wiki/HTTP){:target="_blank"} protocol and the meaning of its methods.

- API servers (providers) provide **resources** (information).
- API clients (consumers) request **resources**.

## What Is REST?

REST (Representational State Transfer) is an architectural style for building web services. A **RESTful API** is an API that follows its rules. It lets a client, such as a web browser, a mobile app or another company's backend, communicate with a server over HTTP, using standard methods such as GET, POST, PUT, PATCH and DELETE to act on resources.

REST itself says nothing about security: you secure a REST API with HTTPS and authentication, for example [OAuth2](https://codersite.dev/spring-boot-oauth2/){:target="_blank"}.

### The REST Constraints

An API is RESTful when it respects these constraints:

- **Client-server:** the client and the server are separate and evolve independently.
- **Stateless:** every request contains all the information the server needs to process it. The server doesn't keep session state between requests, which makes it easy to run several servers behind a load balancer.
- **Cacheable:** responses say whether, and how long, they may be cached.
- **Uniform interface:** every resource is used in the same, standard way (see below).
- **Layered system:** the client can't tell whether it talks to the server directly or through proxies, gateways or load balancers.

> RESTful APIs are widely used in web and mobile applications due to their simplicity, efficiency, and scalability. They provide a structured way to interact with a system's data and services using standard web technologies. -- <cite>[Restful Web APIs](https://amzn.to/3PSGWmP){:target="_blank"}</cite>

<div>
{%- include restfulWebApis.html -%}
</div>

## Resources

In a REST API, a resource is the **information or data** exposed through the web service: users, suppliers, articles, or any other entity that can be **uniquely identified**. Each resource has a [URL](https://en.wikipedia.org/wiki/URL){:target="_blank"}, a globally unique address. Giving something a URL turns it into a resource.

In our business context, this request retrieves a **representation** of the list of articles:

```http
GET /api/v1/articles HTTP/1.1
Host: codersite.dev
```

### Representations

We have defined an article as a resource, but we can't send a physical article over the Internet. What we can send is information about it, in a form that is useful to the client. That's a **representation**: *a machine-readable description of the current state of a resource*.

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "articleId": 12121,
  "articleName": "Potatoes",
  "articlePrice": 12.3,
  "articleDeliveryDate": "2023-09-10"
}
```

The server sends (in response to a GET request) a representation describing the state of a resource. The client sends (through a POST, PUT or PATCH request) a representation describing the state it would like the resource to have. That's **representational state transfer**.

<div>
{%- include inArticleAds.html -%}
</div>

### Uniform Interface

The uniform interface is what makes every REST API feel familiar. It has four parts:

- **Identification of resources:** every resource is identified by a URI.
- **Manipulation of resources through representations:** clients read and change resources by exchanging representations, such as JSON or XML.
- **Self-descriptive messages:** requests and responses carry enough metadata, such as the HTTP method, the status code and the `Content-Type` header, to be understood on their own.
- **Hypermedia as the engine of application state (HATEOAS):** responses contain links to related resources, so clients can navigate the API.

## HTTP Methods

API clients interact with resources by sending HTTP methods.

**GET**

Retrieves a representation of a resource or a collection of resources.

```http
GET /api/v1/suppliers HTTP/1.1
Host: codersite.dev

HTTP/1.1 200 OK
Content-Type: application/json

{
  "suppliers": [
    {
      "supplierId": 1881,
      "supplierName": "ACME",
      "supplierCurrency": "EUR"
    },
    {
      "supplierId": 132,
      "supplierName": "ROYAL",
      "supplierCurrency": "EUR"
    }
  ],
  "resultCountTotal": 980
}
```

GET is defined as a *safe* method, so your application must make sure a GET request never changes the state of a resource.

**POST**

Creates a new resource. The client sends a representation of the resource it wants to create:

```http
POST /api/v1/buyers HTTP/1.1
Content-Type: application/json
Host: codersite.dev

{
  "buyerName": "XYZ Restaurant",
  "buyerContact": "Mr Bond",
  "buyerAddress": "Berliner Strasse 12"
}
```

The server answers **201 Created** and, as a good practice, tells the client where the new resource lives:

```http
HTTP/1.1 201 Created
Location: /api/v1/buyers/4711
```

What happens if the client sends an attribute that the endpoint doesn't define? That's up to the server. In Spring Boot, unknown JSON properties are **ignored by default**. If you'd rather reject them with an error, set `spring.jackson.deserialization.fail-on-unknown-properties=true`.

**PUT**

Replaces an existing resource with the representation in the request, or creates it if it doesn't exist. The client usually takes the representation from a GET request, modifies it, and sends all of it back:

```http
PUT /api/v1/buyers/4711 HTTP/1.1
Content-Type: application/json
Host: codersite.dev

{
  "buyerName": "XYZ Restaurant",
  "buyerContact": "Herr Olaf",
  "buyerAddress": "Berliner Strasse 12"
}
```

**PATCH**

Changes only part of a resource. The client sends just the fields to update:

```http
PATCH /api/v1/buyers/4711 HTTP/1.1
Content-Type: application/json
Host: codersite.dev

{
  "buyerContact": "Herr Olaf"
}
```

**DELETE**

Removes a resource from the server:

```http
DELETE /api/v1/buyers/4711 HTTP/1.1
Host: codersite.dev
```

**Typical success codes:**

| Method | Success response |
|---|---|
| GET | 200 OK |
| POST | 201 Created, with a `Location` header |
| PUT | 200 OK or 204 No Content; 201 Created if the resource was created |
| PATCH | 200 OK or 204 No Content |
| DELETE | 204 No Content |

<br/>

### Safe and Idempotent Methods

A method is [**safe**](https://httpwg.org/specs/rfc9110.html#safe.methods){:target="_blank"} when it doesn't change the state of a resource on the server. GET, HEAD, OPTIONS and TRACE are safe.

A method is **idempotent** when sending the same request several times has the same effect on the server as sending it once. All safe methods are idempotent, and so are PUT and DELETE: deleting the same buyer twice still leaves it deleted. POST and PATCH are not idempotent by definition, which is why a client must be careful when it retries them.

## Request and Response

REST API requests and responses are usually formatted in [JSON](https://www.json.org/json-en.html){:target="_blank"} (JavaScript Object Notation), sometimes in XML. A request consists of an HTTP method, headers and, optionally, a body. A response includes an HTTP status code indicating the outcome, along with a body containing the requested resource or an error message.

Common error status codes include:

- **400 Bad Request:** the client's input is not well formed. The response body should explain what's wrong.
- **401 Unauthorized:** missing or incorrect authentication credentials.
- **403 Forbidden:** the user is authenticated but not allowed to access the resource.
- **404 Not Found:** the requested resource doesn't exist.
- **405 Method Not Allowed:** the server knows the method but the resource doesn't support it.
- **406 Not Acceptable:** the server can't produce the format the client asked for in its `Accept` header.
- **429 Too Many Requests:** the client has sent too many requests in a given time ([rate limiting](https://codersite.dev/rate-limit/){:target="_blank"}).
- **500 Internal Server Error:** something is broken on the server.
- **503 Service Unavailable:** the server is temporarily overloaded or down. See [how a REST client handles a 503 error](https://codersite.dev/how-rest-client-handles-503-error){:target="_blank"}.

## Building a RESTful Web Service

**Business requirement:** a company wants an API that lets restaurants (the buyers) place orders with suppliers, to get food articles delivered.

The following aggregation/composition [UML diagram](https://codersite.dev/uml-diagrams-for-java-developers/){:target="_blank"} describes how the business entities relate to each other. It models *has-a* associations between objects:

![UML aggregation and composition diagram: a Buyer has Orders, BuyingLists and Assortments that contain Articles, plus an Address and Suppliers](/assets/images/shoppingCar.jpg "UML aggregation and composition diagram: a Buyer has Orders, BuyingLists and Assortments that contain Articles, plus an Address and Suppliers"){:class="img-responsive"}

We use endpoints and HTTP methods to implement each functional requirement. Name the path after the entity you're retrieving or manipulating, using plural nouns:

```http
GET /buyers
```

returns the list of buyers the client can access.

I recommend designing the API first, with an OpenAPI specification in an editor such as [SwaggerHub](https://swagger.io/tools/swaggerhub/){:target="_blank"}. While you design, the documentation is generated automatically, so API consumers and internal users can learn and test your API, and you can generate client SDKs and server code from the same file. The step-by-step guide is in [Design-First APIs with OpenAPI 3](https://codersite.dev/designing-apis-with-swagger-and-openapi/){:target="_blank"}.

Here is the documentation SwaggerHub generates for the buyer operations:

![SwaggerHub documentation of the buyer operations: GET, POST, PUT and DELETE on /buyers and /buyers/{buyerId}](/assets/images/buyerOperations.jpg "SwaggerHub documentation of the buyer operations: GET, POST, PUT and DELETE on /buyers and /buyers/{buyerId}"){:class="img-responsive"}

We will use the Spring portfolio to build the RESTful service.

### Separate the REST Controller from the Business Logic

Following the *separation of concerns* principle, a REST controller (*BuyersApiController*) handles the HTTP requests and responses, and a service class (*BuyersService*) handles the business logic, the mappings and the database access.

The *@RestController* annotation marks a class whose methods handle HTTP requests. We inject the *BuyersService* dependency through the constructor:

```java
@RestController
@Validated
public class BuyersApiController implements BuyersApi {

  private final BuyersService buyersService;

  public BuyersApiController(BuyersService buyersService) {
    this.buyersService = buyersService;
  }
}
```

> Software design principles provide guidelines to handle the design process's complexity, prepare your code when changes arise, and minimize the impact of introducing bugs. -- <cite>[Software Design Principles](https://amzn.to/3Csx3sR){:target="_blank"}</cite>

<div>
{%- include softwareDesign.html -%}
</div>

The following listing shows common operations in the controller. The controller implements the `BuyersApi` interface generated from the OpenAPI specification; with hand-written controllers, you'd use the shorter `@GetMapping`, `@PostMapping`, `@PutMapping` and `@DeleteMapping` annotations instead of `@RequestMapping`.

```java
@Override
@RequestMapping(value = "/api/v1/buyers", method = RequestMethod.POST)
public ResponseEntity<Buyer> addBuyer(Buyer body) throws Exception {

  Buyer newBuyer = buyersService.addBuyer(body);

  return new ResponseEntity<Buyer>(newBuyer, HttpStatus.CREATED);
}

@Override
@RequestMapping(value = "/api/v1/buyers/{buyerId}", method = RequestMethod.DELETE)
public ResponseEntity<Void> deleteBuyer(Integer buyerId) throws Exception {

  buyersService.deleteBuyer(buyerId);

  return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
}

@Override
@RequestMapping(value = "/api/v1/buyers/{buyerId}", method = RequestMethod.GET)
public ResponseEntity<Buyer> getBuyerById(Integer buyerId) throws Exception {

  Buyer buyer = buyersService.getBuyerById(buyerId);

  if (buyer == null)
    throw new ResourceNotFoundException("The buyerId does not exist");

  return new ResponseEntity<Buyer>(buyer, HttpStatus.OK);
}

@Override
@RequestMapping(value = "/api/v1/buyers/{buyerId}", method = RequestMethod.PUT)
public ResponseEntity<Buyer> updateBuyer(Integer buyerId, Buyer body) throws Exception {

  Buyer updatedBuyer = buyersService.updateBuyer(buyerId, body);

  return new ResponseEntity<Buyer>(updatedBuyer, HttpStatus.OK);
}

@Override
@RequestMapping(value = "/api/v1/buyers", method = RequestMethod.GET)
public ResponseEntity<List<Buyer>> listBuyers(
  String buyerCompanyName,
  String sortBy,
  String sortOrder,
  Integer offset,
  Integer limit) throws Exception {

  ListBuyersResponse response = buyersService.listBuyers(
    buyerCompanyName, sortBy, sortOrder, offset, limit);

  HttpHeaders responseHeaders = new HttpHeaders();
  responseHeaders.set("X-TotalResultCount", String.valueOf(response.getTotalResultCount()));

  return new ResponseEntity<List<Buyer>>(response.getListBuyers(), responseHeaders, HttpStatus.OK);
}
```

`listBuyers` supports filtering (`buyerCompanyName`), sorting (`sortBy`, `sortOrder`) and pagination (`offset`, `limit`), and returns the total number of results in the `X-TotalResultCount` header, so clients know how many pages there are.

## Include Loggers

Log every incoming request. When a client reports an error, you can reproduce the original request and debug it in your backend:

```java
@Override
@RequestMapping(value = "/api/v1/buyers/{buyerId}", method = RequestMethod.DELETE)
public ResponseEntity<Void> deleteBuyer(Integer buyerId) throws Exception {

  logger.info(request.getMethod() + UtilitiesService.REQUESTED_PARAMETERS + utilitiesService.getRequestURLWithQueryParam(request));

  buyersService.deleteBuyer(buyerId);

  return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
}
```

The controller gets a new dependency, a utility service that rebuilds the full request URL:

```java
public class UtilitiesServiceImpl implements UtilitiesService {

  @Override
  public String getRequestURLWithQueryParam(HttpServletRequest request) {

    StringBuffer requestURL = request.getRequestURL();
    if (request.getQueryString() != null) {
      requestURL.append('?').append(request.getQueryString());
    }
    return requestURL.toString();
  }
}
```

```text
[12/4/23 15:48:27:888 CET] 00000121 SystemOut     INFO 19484 BuyersApiController : DELETE_REQUESTED_PARAMETERS: https://yourapidomain/api/v1/buyers/12345
```

You can even build statistics of how many requests per minute arrive at each endpoint by [implementing a hot-warm architecture in Elasticsearch](https://codersite.dev/hot-warm-architecture-elasticsearch/){:target="_blank"}.

## When the API Strategy Is Not Aligned with the IT Infrastructure

In many companies, the decision to open existing functionality to new clients through an API comes before the IT systems are ready for it.

For example, one requirement is to retrieve an assortment by its unique ID. As the API designer, you create this endpoint:

![First design: GET an assortment by its assortmentId only](/assets/images/assortmentEndpoint1.jpg "First design: GET an assortment by its assortmentId only"){:class="img-responsive"}

Retrieving a resource by its unique ID seems logical. But your IT department says the backend needs additional parameters to find an assortment, because that's how your business model works. So you add the required query parameters:

![Second design: the same endpoint with supplierId and customerNumberId as required query parameters](/assets/images/assortmentEndpoint2.jpg "Second design: the same endpoint with supplierId and customerNumberId as required query parameters"){:class="img-responsive"}

If we follow the relationships between our business entities instead, we can redesign the endpoint into its final version:

![Final design: GET /api/v2/suppliers/{supplierId}/customerNumbers/{customerNumberId}/assortments/{assortmentId}](/assets/images/assortmentEndpoint3.jpg "Final design: the assortment reached through its supplier and customer number"){:class="img-responsive"}

Clear, navigable endpoints and understandable documentation are what make developers enjoy using your API.

## Designing Endpoints from Aggregation/Composition Relationships

Once you have a class design of your business model, think in ***entities*** and ***relationships*** to create functional endpoints.

For example, the following figure shows that a **Buyer** has one or more **BuyingLists**:

![UML diagram highlighting the path from Buyer to BuyingList to Article](/assets/images/shoppingCarNavigation.jpg "UML diagram highlighting the path from Buyer to BuyingList to Article"){:class="img-responsive"}

So we connect them with this endpoint:

```http
GET /api/v2/buyers/{buyerId}/buyingLists
```

Each **BuyingList** in turn contains one or more **Articles**, so we can navigate down to them:

```http
GET /api/v2/buyers/{buyerId}/buyingLists/{buyingListId}/articles
```

When your API grows into many services and large amounts of data, you face new questions: consistency, replication, partitioning. This is the book that answers them:

<div>
{%- include designingDataIntensiveApplications.html -%}
</div>

## Where to Go Next

This post is the starting point of a series. Follow it in this order to go from concepts to a running, tested API:

1. [Design-first APIs with OpenAPI 3](https://codersite.dev/designing-apis-with-swagger-and-openapi/){:target="_blank"}
2. [Generate a Spring Boot server from the spec with Swagger Codegen](https://codersite.dev/swagger-codegen-server-stubs-openapi/){:target="_blank"}
3. [Implement it with Spring Boot, Gradle and OpenAPI](https://codersite.dev/gradle-building-restful-web-service/){:target="_blank"}
4. [Call it with Spring's RestClient](https://codersite.dev/spring-restclient-replace-oauth2resttemplate/){:target="_blank"}
5. [Protect it with rate limiting](https://codersite.dev/rate-limit/){:target="_blank"}
6. [Handle 503 errors in the client](https://codersite.dev/how-rest-client-handles-503-error){:target="_blank"}
7. [Load-test it with concurrent clients](https://codersite.dev/building-rest-api-client/){:target="_blank"}

REST questions are standard in backend interviews: what makes an API RESTful, PUT vs PATCH, which methods are idempotent. Practice with real interview questions:

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Please support me as a writer. Every contribution helps, and your donation can help add more articles to this website, no matter how small. Thank you!

{% include buymeacoffee.html %}
<br/>
