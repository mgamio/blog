---
layout: post
title:  "Design-First APIs with OpenAPI 3: A Step-by-Step Tutorial"
description: "Design a real REST API before writing any code: a step-by-step OpenAPI 3 tutorial using SwaggerHub, with servers, tags, paths, parameters, responses and live documentation."
author: moises
categories: [ Web APIs ]
image: /assets/images/swaggerHubOpenAPI.jpg
comments: false
---

Most API problems aren't coding problems. They're design problems found too late: a missing field, an inconsistent name, an error nobody documented. Design-first fixes that by agreeing on the contract before anyone writes code. In this tutorial we design a real Finance API with OpenAPI 3, step by step.

**This series:**

1. **Design the API** (this post)
2. [Generate a Spring Boot server with Swagger Codegen](https://codersite.dev/swagger-codegen-server-stubs-openapi/){:target="_blank"}
3. [Implement it with Spring Boot, Gradle and OpenAPI](https://codersite.dev/gradle-building-restful-web-service/){:target="_blank"}

The [OpenAPI Specification](https://www.openapis.org/){:target="_blank"} (OAS) enables business knowledge transfer from API provider to API consumer. It is an open standard for describing your APIs, allowing you to provide an API specification encoded in a JSON or YAML document.

This allows customers and developers to understand how a [RESTful API](https://codersite.dev/rest-api-overview/){:target="_blank"} works and how a sequence of APIs works together. It also lets them generate client code and server stubs, create tests, apply design standards, see the expected results, and much, much more.

[SwaggerHub](https://swagger.io/tools/swaggerhub/){:target="_blank"} is an online platform where you can design your APIs – be it public APIs, internal private APIs, or microservices. The core principle behind SwaggerHub is Design First, Code Later.

**Design-First Approach**. A design-first approach means planning your APIs in detail before any code is written.

Using SwaggerHub, you can design fast and generate documentation automatically with the OpenAPI specification.

## Design-First vs. Code-First

| | Design-first | Code-first |
|---|---|---|
| Contract agreed | Before coding | After the code exists |
| Frontend and backend | Work in parallel | Frontend waits |
| Documentation | Generated from the spec | Written afterwards, often outdated |
| Changing the API | Cheap: edit YAML | Expensive: change code and clients |

<br/>

## Requirement

**What should my API do?** Create a Finance API that returns calculated financial metrics, such as Simple and Compound Interest, Present Value (PV), Future Value (FV), Net Present Value (NPV), Internal Rate of Return (IRR), and many more.

APIs should be designed from the perspective of the consumer and consider the requirement to abstract the underlying representation to reduce coupling.

If you want to go deeper into design-first, this is the book this series follows:

<div>
{%- include designingAPIsWithSwaggerAndOpenAPI.html -%}
</div>

## Getting Started with OpenAPI Specification

Once you have created a free account in [SwaggerHub](https://swagger.io/api-hub/){:target="_blank"}, sign in to the tool and choose "Create API".

![SwaggerHub Create API dialog](/assets/images/swaggerCreateAPI.jpg "SwaggerHub Create API dialog"){:class="img-responsive"}

Then, select a template or create a Blank API:

![SwaggerHub template selection with the Blank API option](/assets/images/swaggerBlankTemplate.jpg "SwaggerHub template selection with the Blank API option"){:class="img-responsive"}

Here is the first result:

![SwaggerHub editor showing the initial blank OpenAPI document](/assets/images/swaggerInitialAPIEditor.jpg "SwaggerHub editor showing the initial blank OpenAPI document"){:class="img-responsive"}

We are going to build an API Description Through Documentation by following the concepts included in [the OpenAPI Specification Explained](https://learn.openapis.org/specification/){:target="_blank"}.

By default, it includes the following minimal fields:

**openapi**: This string MUST be the semantic version number of the OpenAPI Specification version that the OpenAPI document uses.

**info**: Provides metadata about the API (such as title, description, version, and contact information).

**paths**: Holds the relative paths to the individual endpoints and their parameters, and all possible server responses.

Now, we add more metadata.

**servers**: an array to specify one or more **base URLs** for your API.

```yaml
servers:
  - description: SwaggerHub API Auto Mocking
    url: https://virtserver.swaggerhub.com/MGAMIO/apifinance/v1
  - description: Production server
    url: https://codersite.dev/apifinance/v1
```

**tags**: we use a tag to group similar operations. For example:

```yaml
tags:
  - name: timeValueOfMoney
    description: time value of money-related operations
  - name: moneyMarkets
    description: operations related to short-term financial instruments which are based on an interest rate
```

**/{path}**: A relative path to an individual endpoint. 

**Path Item Object**: Describes the operations available on a single path.

**get**: A definition of a GET operation on this path.

**operationId**: Unique string used to identify the operation. It will be exported as a name for the method in our implementation code.

**parameters**: A list of applicable parameters for all the operations described under a specific path.

Here is a code snippet of how we define a *getSimpleInterest* operation:

```yaml
paths: 
  /timeValueOfMoney/simpleInterest:
    get:
      tags:
        - timeValueOfMoney
      summary: Gets the calculated simple interest
      description: Gets the calculated simple interest for the requested parameters
      operationId: getSimpleInterest
      parameters:
        - name: principal
          in: query
          description: is the principal amount
          required: true
          schema:
            type: number
        - name: interestRate
          in: query
          description: is the annual rate of interest
          required: true
          schema:
            type: number
        - name: time
          in: query
          description: is the time for which principal is invested
          required: true
          schema:
            type: number
```

Someone who reads your API specification must understand the purpose of your parameters. See [Best practices for writing Clean Code](https://codersite.dev/clean-code/){:target="_blank"}.

As you write the specification, documentation is automatically generated.

![SwaggerHub editor with the YAML specification and the generated documentation side by side](/assets/images/swaggerEditor.JPG "SwaggerHub editor with the YAML specification and the generated documentation side by side"){:class="img-responsive"}

You can use the [OpenAPI Map](https://openapi-map.apihandyman.io/){:target="_blank"} as a visual tool to navigate this specification.

**responses**: A container for the expected responses of an operation.

**{HTTP status code} property**: Describes the expected response for that HTTP status code.

**content**: A map containing descriptions of potential response payloads.

Here is an extract of what we expect from the *getSimpleInterest* operation:

```yaml
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SimpleInterestResponse'
        '400':
          description: Bad Request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorDetail'

```

We have created a reference to a SimpleInterestResponse Object.

![SimpleInterestResponse schema in the generated documentation](/assets/images/swaggerObjectResponse.JPG "SimpleInterestResponse schema in the generated documentation"){:class="img-responsive"}

Click the "Try it out" button to see an example:

![Swagger UI Try it out result for getSimpleInterest](/assets/images/swaggerTryOut.jpg "Swagger UI Try it out result for getSimpleInterest"){:class="img-responsive"}

Here you can see the API specification: [apifinance/v1](https://app.swaggerhub.com/apis/MGAMIO/apifinance/v1){:target="_blank"}

## Key Takeaways

- The OpenAPI Specification will be the official reference point to understand the final requirements from your users.

- From the OpenAPI Specification, you proceed to design and implement all software components required.

- Any changes to your implementation code must be updated in the OpenAPI Specification and vice versa.

**Next:** a specification is only a plan. In [Part 2](https://codersite.dev/swagger-codegen-server-stubs-openapi/){:target="_blank"}, Swagger Codegen turns this file into a running Spring Boot server in minutes.

Interviews for backend roles increasingly include API design questions, and coding challenges too. Prepare for both:

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

<br/>

Please support me as a writer. Every contribution helps, and your donation can help add more articles to this website, no matter how small. Thank you!

{% include buymeacoffee.html %}
<br/>
