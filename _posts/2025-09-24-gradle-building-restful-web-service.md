---
layout: post
title:  "Building a RESTful Web Service with Gradle and Openapi"
description: "This guide walks you through the process of creating a RESTful web service with Spring, Gradle and Openapi."
author: moises
categories: [ Web APIs ]
image: assets/images/gradleRestfulWebService.jpg
comments: false
---

This guide walks you through the process of creating a [RESTful](https://codersite.dev/rest-api-overview/){:target="_blank"} web service with Gradle, Spring and Openapi.

## What You Will Building

You will build a service that will implement a Finance API specified in [API Hub](https://app.swaggerhub.com/apis/MGAMIO/apifinance/v1){:target="_blank"} Powered by Swagger.

## Starting with Spring Initializr

To manually initialize the project:

1. Navigate to [ https://start.spring.io](https://start.spring.io){:target="_blank"} and setup the following configuration:

![springInitializrGradle](/assets/images/springInitializrGradle.JPG "spring Initializr Gradle"){:class="img-responsive"}

2. Click GENERATE.

3. Download the resulting ZIP file, which is an archive of a web application that is configured with the choices above.

4. Open the project in your favourite IDE.

## Gradle

[Gradle](https://docs.gradle.org/current/userguide/gradle_basics.html){:target="_blank"} automates the building, testing, and deployment of software from information in build scripts.

<div>
{%- include introducingGradle.html -%}
</div>

To import all dependencies in your local machine, execute in your IDE Terminal the following Gradle command:

```kotlin
C:\..\apifinance> .\gradlew build
```
We create the following packages and classes:

![gradleProject](/assets/images/gradleProject.JPG "gradle Project structure"){:class="img-responsive"}

For the integration between spring-boot and swagger-ui, add the following library to the list of your project dependencies.

```kotlin
dependencies {
  .
  .
  .
  implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.11'
}
```

And execute **.\gradlew clean build** to download all dependencies again.

We create an Interface to declare the funcionalities of this API by using swagger annotations.

```kotlin
@Tags(value = {@Tag(name = "timeValueOfMoney")})
@RequestMapping("/v1/timeValueOfMoney")
public interface TimeValueOfMoneyApi {

  @RequestMapping(value = "/simpleInterest",
    produces = {"application/json"},
    method = RequestMethod.GET)
  ResponseEntity<SimpleInterestResponse> getSimpleInterest() throws Exception;
  
}
```

We refactor the *getSimpleInterest* method to include all request parameters with its documentation by using swagger annotations.

Here is the code that corresponds to the **principal** parameter.

```kotlin
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

<div>
{%- include designingAPIsWithSwaggerAndOpenAPI.html -%}
</div>

Run the ApiFinanceApplication. By default an Apache Tomcat is initialized as a Servlet engine. See the api doc at http://localhost:8080/swagger-ui/index.html.

![apiFinanceInLocalhost](/assets/images/apiFinanceInLocalhost.JPG "api Finance In localhost"){:class="img-responsive"}

We create a **@RestController** to manage the requested parameters. And we delegate the calculus of our formula to a specialized *TimeValueOfMoneyService* Class.

```kotlin
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

We create a class that implements the previous Service.

```kotlin
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

Well, we arrive to the magic of programming. Here is where we use all our creativity to implement a useful service with the help of Unit Testing. Follow me in my next article!

You can also fork the project from [Github](https://github.com/mgamio/apifinance/tree/apifinance-implement-simpleInterest){:target="_blank"} and open it in your IDE or other editor.

You can also buy my little book about [Data structures](https://codersite.dev/data-structures-foundation-efficient-programming/){:target="_blank"} and [Algorithms](https://codersite.dev/big-o-notation-analysis-of-algorithms/){:target="_blank"}.

> As a Java Developer, one is expected to attend interviews every now and then and I am pretty sure this book will be a handy guide.

<div>
{%- include crackCodingInterviewCallToAction1.html -%}
</div>

Please support me as a writer. Every contribution helps, and your donation can help add more articles to this website, no matter how small. Thank you!

<iframe
    src="https://www.paypal.com/giving/campaigns?campaign_id=SR3NH5R4FNH8Q"
    title="PayPal donate campaign card"
    frameborder="0"
    width=382
    height=550
    scrolling="no"
></iframe>


