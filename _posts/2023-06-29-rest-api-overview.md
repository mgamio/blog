---
layout: post
title:  "REST API Overview"
description: "Key Concepts, Best Practices, and Benefits"
author: moises
categories: [ Web APIs ]
image: assets/images/RESTAPIOverview.jpg
comments: false
---

APIs (Application Programming Interfaces) enable communication and data exchange between systems. Among the various types of APIs, [REST](https://en.wikipedia.org/wiki/Representational_state_transfer){:target="_blank"} (Representational State Transfer) has emerged as a popular architectural style for building web services. This article will delve into the fundamental concepts of REST API, its principles, its benefits in modern web development, and how to design a RESTful API.

## What is an API?

An API is an interface with defined functionalities that a software program presents to other programs and, in the case of web APIs, to the rest of the world via the Internet.

APIs are the building blocks that allow interoperability between businesses on the web. Companies implement APIs to expose internal business processes and data to new customers and partners. APIs are how food data containing information about allergens are shared with hundreds of restaurant apps specializing in their presentation to final customers.

## What is REST API?

REST API is an architectural style that defines a set of guidelines for creating web services. It stands for Representational State Transfer and emphasizes a stateless, client-server communication model. REST APIs use HTTP (Hypertext Transfer Protocol) as the primary protocol for data transmission and rely on standard operations such as GET, POST, PUT, and DELETE to perform actions on resources.

The Hypertext Transfer Protocol (HTTP) is a stateless application-level protocol for distributed, collaborative, hypertext information systems.

## Resources

In REST API, a resource is the **information or data** exposed through the web service. Resources can be entities such as users, suppliers, articles, or any other data entity that can be **uniquely identified**. Each resource on the Web is typically represented by a URL (Uniform Resource Locator) or endpoint defining a globally unique address. Giving something a URL turns it into a resource.

In a business context, the following endpoint retrieves a representation of an array of article data under the following URL.

```
GET /api/v1/articles HTTP/1.1
Host: codersite.dev
```

<div>
{%- include inArticleAds.html -%}
</div>

## Representations

We have defined an article as an HTTP resource but cannot transmit a physical article over the Internet. But as an information resource, we can send It over the Internet. The information must be helpful for the client. That’s a representation, **a machine-readable description of the current state of a resource**.

```
HTTP/1.1 200 OK
Content-Type: application/json
{
  articleID : 12121,
  articleName : "Potatoes"
  articlePrice : 12,3
  articleDeliveryDate : 20230910
}
```

The server sends (because of GET requests from the client) a representation describing the state of a resource. The client sends (through a POST, PUT, or PATCH request) a representation describing the state it would like the resource to have. That’s **representational state transfer**.

## Uniform Interface

A fundamental principle of REST API is the uniform interface, which establishes a standardized way of interacting with resources. It encompasses several constraints, including:

- Identification of resources: Resources should be uniquely identified by URIs.

- **Stateless communication**: Each request from the client to the server should contain all the necessary information to process the request without relying on the server's previous state.

- Manipulation of resources through representations: Resources can be accessed and modified through representations, such as JSON or XML.

- Self-descriptive messages: Requests and responses should include sufficient metadata to describe the meaning and format of the data.

- Hypermedia as the engine of application state (HATEOAS): The API should provide links to related resources, allowing clients to navigate the application's state.

## Common HTTP Method Properties

**Safe Methods**

Request methods are considered [safe](https://httpwg.org/specs/rfc9110.html#safe.methods){:target="_blank"} if their defined semantics are essentially read-only; i.e., the client does not request, and does not expect, any state change on the origin server as a result of applying a safe method to a target resource.

The GET, HEAD, OPTIONS, and TRACE methods are defined to be safe.

**Idempotent Methods**

A request method is considered idempotent if the intended effect on the server of multiple identical requests with that method is the same as the effect for a single such request.

The PUT, and DELETE methods are defined to be idempotent.

<div>
{%- include inArticleAds.html -%}
</div>

## HTTP Methods

API clients can interact with APIs by sending HTTP methods to perform actions on resources. The four commonly used HTTP methods are:

**GET**

Retrieves a representation of a resource or a collection of resources.

```
GET /api/v1/suppliers HTTP/1.1
Host: codersite.dev

HTTP/1.1 200 OK
Content-Type: application/json

{
  "suppliers" : {
    "supplier" : [
      {
        "supplierId": 1881,
        "supplierName": "ACME"
        "supplierCurrency": "EUR"
      },
      {
        "supplierId": 132,
        "supplierName": "ROYAL"
        "supplierCurrency": "EUR"
      },
      .
      .
    ]
  },
  "resultCountTotal" : 980
}
```

Even when a GET method is defined as a *safe* HTTP method, your application MUST ensure that it never changes the resource state.

The success response code to a GET request is 200 (OK).

**POST**

Creates a new resource.

When a client sends a POST request, it sends a representation of the resource it wants to create that corresponds with the semantics defined for the endpoint.

```
POST /api/v1/buyers HTTP/1.1
Content-Type: application/json
Host: codersite.dev

{
  "buyerName" : "XYZ Restaurant",
  "buyerContact" : "Mr Bond",
  "buyerAddress" : "Berliner strasse 12",
}
```

If you include an extra attribute in the body request not defined in the endpoint representation, you probably receive an Error from the server.

The success response code to a POST request is 201 (Created).

**PUT**

Updates an existing resource or creates it if it doesn't exist.

The client usually takes the representation from a GET request, modifies it, and sends it back as the body of a PUT request. 

```
PUT /api/v1/buyers/{buyerId} HTTP/1.1
Content-Type: application/json
Host: codersite.dev

{
  "buyerName" : "XYZ Restaurant",
  "buyerContact" : "Herr Olaf",
  "buyerAddress" : "Berliner strasse 12",
}
```

The success response code to a PUT request is 200 (OK).

**DELETE**

Removes a resource from the server.

```
DELETE /api/v1/buyers/{buyerId} HTTP/1.1
Content-Type: application/json
Host: codersite.dev
```

The success response code to a DELETE request is 204 (No Content).

## Request and Response

REST API requests and responses are typically formatted in [JSON](https://www.json.org/json-en.html){:target="_blank"} (JavaScript Object Notation) or XML (eXtensible Markup Language). Requests consist of an HTTP method, headers, and, optionally, a request body containing data. Responses include an HTTP status code indicating the outcome of the request, along with the response body containing the requested resource or an error message.

<div>
{%- include softwareDesign.html -%}
</div>

## Building a RESTful Web Service

The following diagram shows how a Restaurant (represented as a buyer) aims to place orders at suppliers to get food articles delivered.

![shopping-car](/assets/images/shoppingCar.jpg){:class="img-responsive"}

It is highly recommended to use the SwaggerHub editor to create a consistent API design compliant with the OpenAPI Specifications. [Create a Free Account](https://swagger.io/tools/swaggerhub/){:target="_blank"}.

While you are designing, SwaggerHub can generate documentation automatically, making it easy for both API consumers and internal users to learn and test your APIs. You can create a Client SDK for different programming languages from the Editor and generate the object model and API controllers on your server side.

The following figure shows an example of how SwaggerHub generates the documentation.

![buyer-swagger](/assets/images/buyerOperations.jpg){:class="img-responsive"}

We will use the Spring portfolio to build a RESTful service.

Following the "separation of concerns" principle, we delegated the responsibility for managing all HTTP requests and responses to a REST Controller (*BuyersApiController*) and managing all business logic, mappings, and the database connection to a Service class (*BuyersService*).

```
@RestController
@Validated
public class BuyersApiController implements BuyersApi {
	
  private final BuyersService buyersService;

  @Autowired
  public BuyersApiController(
    BuyersService buyersService) {
    this.buyersService = buyersService;
  }
}
```

The following listing shows common operations in a REST Controller.

```
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

## Benefits of REST API

REST APIs offer several advantages that contribute to their widespread adoption in modern web development:

- Scalability: REST API's stateless nature allows for horizontal scalability, where multiple servers can handle requests independently, improving performance and accommodating a growing user base.

- Interoperability: REST APIs leverage standardized HTTP methods and formats, enabling communication between different systems regardless of their underlying technologies.

- Simplicity and ease of use: REST APIs have a straightforward design, making them easy to understand, implement, and consume. Developers can quickly grasp the concepts and start building applications around the exposed resources.

- Flexibility: REST APIs support various data formats and can be used with different client applications, including web browsers, mobile devices, and third-party services.

## Conclusion

REST API concepts provide a foundation for building scalable, interoperable, and easily consumable web services. Understanding the principles of REST, such as resources, uniform interface, HTTP methods, and request/response formats, is crucial for designing and consuming RESTful APIs effectively. 

<div>
{%- include mailchimp.html -%}
</div>