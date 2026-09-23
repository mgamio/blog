---
layout: post
title:  "Build a RESTful Web Service with Spring Boot, Gradle, and OpenAPI"
description: "This guide walks you through the process of creating a RESTful web service with Spring, Gradle and Openapi."
author: moises
categories: [ Web APIs ]
image: /assets/images/gradleRestfulWebService.jpg
comments: false
---

By the end of this guide you'll have a working Spring Boot [RESTful](https://codersite.dev/rest-api-overview/){:target="_blank"} API, built with Gradle and documented with OpenAPI, and a live Swagger UI page you can show your team or put in your portfolio. We'll build a real Finance API step by step, not a to-do list.

## What You'll Build

You will build a service that will implement a Finance API specified in [API Hub](https://app.swaggerhub.com/apis/MGAMIO/apifinance/v1){:target="_blank"} Powered by Swagger.

## Starting with Spring Initializr

To manually initialize the project:

1. Navigate to [ https://start.spring.io](https://start.spring.io){:target="_blank"} and setup the following configuration:

![Spring Initializr configured for a Gradle project with Spring Web](/assets/images/springInitializrGradle.JPG "Spring Initializr configured for a Gradle project with Spring Web"){:class="img-responsive"}

2. Click GENERATE.

3. Download the resulting ZIP file, which is an archive of a web application that is configured with the choices above.

4. Open the project in your favourite IDE.

## Gradle

[Gradle](https://docs.gradle.org/current/userguide/gradle_basics.html){:target="_blank"} automates the building, testing, and deployment of software from information in build scripts.

Gradle rewards people who understand it and punishes people who copy-paste build files. If you want to know what's happening under the hood, this is the shortest path:

<div>
{%- include introducingGradle.html -%}
</div>

To download all dependencies to your local machine, run the following Gradle command in your IDE terminal:

```shell
C:\..\apifinance> .\gradlew build
```
Next, create the following packages and classes:

![Gradle project structure showing the controller, service, and model packages](/assets/images/gradleProject.JPG "Gradle project structure showing the controller, service, and model packages"){:class="img-responsive"}

To integrate Spring Boot with Swagger UI, add the following library to your project dependencies:

```groovy
dependencies {
  .
  .
  .
  implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.11'
}
```

Then run **.\gradlew clean build** to download the new dependency.

Next, we define an interface that declares the API's operations using Swagger annotations.

```java
@Tags(value = {@Tag(name = "timeValueOfMoney")})
@RequestMapping("/v1/timeValueOfMoney")
public interface TimeValueOfMoneyApi {

  @RequestMapping(value = "/simpleInterest",
    produces = {"application/json"},
    method = RequestMethod.GET)
  ResponseEntity<SimpleInterestResponse> getSimpleInterest() throws Exception;
  
}
```

Now we refactor the *getSimpleInterest* method so every request parameter is declared and documented with Swagger annotations.

Here is the code for the **principal** parameter:

```java
  @Operation(
    summary = "Gets the calculated simple interest",
    description = "Gets the calculated simple interest for the requested parameters",
    tags={ "timeValueOfMoney" })
  @ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "OK", content = @Content(mediaType = "application/json", 
      schema = @Schema(implementation = SimpleInterestResponse.class)))
  })
  @RequestMapping(value = "/simpleInterest",
    produces = {"application/json"},
    method = RequestMethod.GET)
  ResponseEntity<SimpleInterestResponse> getSimpleInterest(
    @Parameter(in = ParameterIn.QUERY, description = "is the principal amount", schema = @Schema())
    @Valid @RequestParam(value = "principal", required = true)
    Integer principal
  ) throws Exception;
```

Annotations like these are only half the story. Designing an API that other teams actually enjoy using is its own skill, and this is the book that teaches it:

<div>
{%- include designingAPIsWithSwaggerAndOpenAPI.html -%}
</div>

Run *ApiFinanceApplication*. By default, Spring Boot starts an embedded Apache Tomcat server. Open the API documentation at http://localhost:8080/swagger-ui/index.html.

![Swagger UI showing the Finance API running on localhost](/assets/images/apiFinanceInLocalhost.JPG "Swagger UI showing the Finance API running on localhost"){:class="img-responsive"}

Next, we create a **@RestController** that receives the request parameters and delegates the actual calculation to a dedicated *TimeValueOfMoneyService* class.

```java
@RestController
public class TimeValueOfMoneyApiController implements TimeValueOfMoneyApi {

  private final TimeValueOfMoneyService timeValueOfMoneyService;

  public TimeValueOfMoneyApiController(
    TimeValueOfMoneyService timeValueOfMoneyService) {
    this.timeValueOfMoneyService = timeValueOfMoneyService;
  }

  @Override
  public ResponseEntity<SimpleInterestResponse> getSimpleInterest(
    Integer principal,
    Integer interestRate,
    String unitOfTime,
    Integer time,
    String yearDaysConvention) throws Exception {

    SimpleInterestResponse response  = timeValueOfMoneyService.getSimpleInterest(
      principal,
      interestRate,
      unitOfTime,
      time,
      yearDaysConvention);

    return new ResponseEntity<SimpleInterestResponse> (response, HttpStatus.OK);
  }
}
```

Finally, we create a class that implements the service.

```java
public class TimeValueOfMoneyServiceImpl implements TimeValueOfMoneyService {
  @Override
  public SimpleInterestResponse getSimpleInterest(
    Integer principal,
    Integer interestRate,
    String unitOfTime,
    Integer time,
    String yearDaysConvention) throws Exception {

    SimpleInterestResponse response = new SimpleInterestResponse();

    // Implement here ...

    return response;
  }
}
```

This is where the fun starts: implementing the formula itself, driven by unit tests. Fork the project from [GitHub](https://github.com/mgamio/apifinance/tree/apifinance-implement-simpleInterest){:target="_blank"} and try it yourself.

New to data structures and algorithms? Start with my guides on [Data Structures](https://codersite.dev/data-structures-foundation-efficient-programming/){:target="_blank"} and [Algorithms](https://codersite.dev/big-o-notation-analysis-of-algorithms/){:target="_blank"}.

> You just built a production-style API. That's exactly the kind of thing interviewers ask you to design on a whiteboard. If you have interviews coming up, this roadmap tells you what to study and in what order:

<div>
{%- include technical_Interview_Preparation_Roadmap.html -%}
</div>

Please support me as a writer. Every contribution helps, and your donation can help add more articles to this website, no matter how small. Thank you!

{% include buymeacoffee.html %}
