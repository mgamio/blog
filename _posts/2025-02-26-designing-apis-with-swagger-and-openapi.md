---
layout: post
title:  "Designing APIs with Swagger and OpenAPI"
description: "The OpenAPI Specifications provides a formal standard for describing HTTP APIs"
author: moises
categories: [ Web APIs ]
image: assets/images/swaggerHubOpenAPI.jpg
comments: false
---

In this series of articles, we will follow a real API project from concept to production, and learn hands-on how to describe and design APIs using OpenAPI in the Swagger Editor.

The [OpenAPI Specification](https://www.openapis.org/){:target="_blank"} (OAS) enables business knowledge transfer from API provider to API consumer. It is an open standard for describing your APIs, allowing you to provide an API specification encoded in a JSON or YAML document.

This allows customers and developers to understand how a [RESTful API](https://codersite.dev/rest-api-overview/){:target="_blank"} works, how a sequence of APIs work together, generate client code, generate server stub, create tests, apply design standards, what are the expected results, and much, much more.

[SwaggerHub](https://swagger.io/tools/swaggerhub/){:target="_blank"} is an online platform where you can design your APIs – be it public APIs, internal private APIs, or microservices. The core principle behind SwaggerHub is Design First, Code Later.

**Design-First Approach**. A design-first approach means planning your APIs in detail before any code is written.

Using SwaggerHub, you can design fast and generate documentation automatically with the OpenAPI specification.

## Requirement

**What should my API do?**. Create a Finance API that returns calculated financial metrics, such as Simple and Compound Interest, Present Value (PV), Future Value (FV), Net Present Value (NPV), Internal Rate of Return (IRR), and many more.

APIs should be designed from the perspective of the consumer and consider the requirement to abstract the underlying representation to reduce coupling.

<div>
{%- include amazonWebServicesInAction.html -%}
</div>

## Getting Started with OpenAPI Specification

Once you have created a Free Account in the [Swagger editor](https://swagger.io/api-hub/){:target="_blank"}, sign in to the tool and choose "Create API".

![swaggerCreateAPI](/assets/images/swaggerCreateAPI.jpg "swagger OpenAPI"){:class="img-responsive"}

Then, select a template or create a Blank API:

![swaggerBlankTemplate](/assets/images/swaggerBlankTemplate.jpg "swagger Blank Template"){:class="img-responsive"}

Here, the first result:

![swaggerInitialAPIEditor](/assets/images/swaggerInitialAPIEditor.jpg "swagger Initial API Editor"){:class="img-responsive"}

We are going to build an API Description Through Documentation by following the concepts included in [the OpenAPI Specification Explained](https://learn.openapis.org/specification/){:target="_blank"}.

By default, it includes the following minimal fields:

**openapi**: This string MUST be the semantic version number of the OpenAPI Specification version that the OpenAPI document uses.

**info**: Provides metadata about the API (such as title, description, version, and contact information).

**paths**: Holds the relative paths to the individual endpoints and their parameters, and all possible server responses.

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Now, we add more metadata

**servers**: an array to specify one or more **base URLs** for your API.

```kotlin
servers:
  - description: SwaggerHub API Auto Mocking
    url: https://virtserver.swaggerhub.com/MGAMIO/apifinance/v1
  - description: Production server
    url: https://codersite.dev/apifinance/v1
```

**tags**: we use a tag to group similar operations. For example:

```kotlin
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

```kotlin
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

Someone who reads your API specification must understand the purpose of your parameters. See [Best practices for writing Clean Code](https://codersite.dev/clean-code/){:target="_blank"}

<div>
{%- include designingAPIsWithSwaggerAndOpenAPI.html -%}
</div>

As you write the specification, documentation is automatically generated.

![swaggerEditor](/assets/images/swaggerEditor.JPG "swagger Editor"){:class="img-responsive"}

You can use the [OpenAPI Map](https://openapi-map.apihandyman.io/){:target="_blank"} as a visual tool to navigate this specification.

**responses**: A container for the expected responses of an operation.

**{HTTP status code} property**:  Describe the expected response for that HTTP status code.

**content**: A map containing descriptions of potential response payloads.

Here is an extract of what we expect from the *getSimpleInterest* operation:

```kotlin
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

![swaggerObjectResponse](/assets/images/swaggerObjectResponse.JPG "swagger Object Response"){:class="img-responsive"}

You can execute the "Try Out" button and see an example:

![swaggerTryOut](/assets/images/swaggerTryOut.jpg "swagger Try Out"){:class="img-responsive"}

Here you can see the API specification: [apifinance/v1](https://app.swaggerhub.com/apis/MGAMIO/apifinance/v1){:target="_blank"}

## Notes

- The OpenAPI Specification will be the official reference point to understand the final requirements from your users.

- From the OpenAPI Specification, you proceed to design and implement all software components required.

- Any changes to your implementation code must be updated in the OpenAPI Specification and vice versa.

But what we need is a real implementation of this API specification. In my next article, I will explain the Codegen utility to export this specification to Java code.

<div>
{%- include mailchimp.html -%}
</div>

<br/>

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




