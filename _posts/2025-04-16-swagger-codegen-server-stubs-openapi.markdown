---
layout: post
title:  "Swagger Codegen: Moving from design to API development"
description: "Swagger Codegen can simplify your build process by generating server stubs and client SDKs for any API, defined with the OpenAPI"
author: moises
categories: [ Web APIs ]
image: /assets/images/swaggerCodegen.jpg
comments: false
---

Swagger Codegen can simplify your build process by generating server stubs and client SDKs for any API, defined with the OpenAPI.

Once you have learned how to [design APIs with Swagger and OpenAPI](https://codersite.dev/designing-apis-with-swagger-and-openapi/){:target="_blank"}, we will proceed to generate the stub code for a [RESTful web service](https://codersite.dev/rest-api-overview/){:target="_blank"} with Spring.

In programming, a stub is an incomplete method. It already has the interface of the final method, but it doesn’t yet perform the full functionality. Instead, it returns “mock” or “dummy” data. 

## Generating the backend

1. Open your OpenAPI file ([apifinance](https://github.com/mgamio/openapi/blob/main/ch01/apifinance.yaml){:target="_blank"}) in [Swagger Editor](https://swagger.io/tools/swagger-editor/){:target="_blank"}.

2. Click **Codegen** -> **Server Stub** in the menu bar. Swagger Editor will show you the backend technologies for which it can build code.

3. Click **spring**. Within seconds, your browser will prompt you to download a zip file.

4. Save the file on your drive.

5. Extract the zip file into a directory.

6. Open the directory in a code editor or IDE, such as Intellij IDEA.

By default swagger codegen creates a springBoot project with Maven. Let's see the project structure:

![swaggerSpringBoot](/assets/images/swaggerSpringBoot.JPG "swagger SpringBoot"){:class="img-responsive"}

The underlying library integrating swagger to SpringBoot is [springdoc-openapi](https://github.com/springdoc/springdoc-openapi){:target="_blank"}.

<div>
{%- include designingAPIsWithSwaggerAndOpenAPI.html -%}
</div>

We typically use a backend composed of controllers and services in many projects.

The *TimeValueOfMoneyApiController* class that implements *TimeValueOfMoneyApi* interface contains dummy data - NOT_IMPLEMENTED.

```kotlin
public class TimeValueOfMoneyApiController implements TimeValueOfMoneyApi {

  private static final Logger log = LoggerFactory.getLogger(TimeValueOfMoneyApiController.class);

  private final ObjectMapper objectMapper;

  private final HttpServletRequest request;

  @org.springframework.beans.factory.annotation.Autowired
  public TimeValueOfMoneyApiController(ObjectMapper objectMapper, HttpServletRequest request) {
    this.objectMapper = objectMapper;
    this.request = request;
  }

  public ResponseEntity<SimpleInterestResponse> getSimpleInterest(
    BigDecimal principal,
    BigDecimal interestRate,
    BigDecimal time,
    String unitOfTime,
    BigDecimal yearCountConvention) {
    String accept = request.getHeader("Accept");
    if (accept != null && accept.contains("application/json")) {
      try {
        return new ResponseEntity<SimpleInterestResponse>(
        objectMapper.readValue("{\n  \"simpleInterest\" : 0\n}",
        SimpleInterestResponse.class), HttpStatus.NOT_IMPLEMENTED);
      } catch (IOException e) {
        log.error("Couldn't serialize response for content type application/json", e);
        return new ResponseEntity<SimpleInterestResponse>(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    return new ResponseEntity<SimpleInterestResponse>(HttpStatus.NOT_IMPLEMENTED);
  }
}
```

The functionality of the application resides in services that the controllers can call as needed, but at the moment are not implemented.

Let's run the **main** method of the *Swagger2SpringBoot* class. The Apache Tomcat WebServer is embedded.

```kotlin
INFO 20364 --- [           main] io.swagger.Swagger2SpringBoot            : Starting Swagger2SpringBoot
INFO 20364 --- [           main] io.swagger.Swagger2SpringBoot            : No active profile set, falling back to default profiles: default
INFO 20364 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port(s): 8080 (http)
INFO 20364 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
INFO 20364 --- [           main] org.apache.catalina.core.StandardEngine  : Starting Servlet engine: [Apache Tomcat/9.0.37]
INFO 20364 --- [           main] o.a.c.c.C.[.[.[/MGAMIO/apifinance/v1]    : Initializing Spring embedded WebApplicationContext
INFO 20364 --- [           main] o.s.web.context.ContextLoader            : Root WebApplicationContext: initialization completed in 6680 ms
INFO 20364 --- [           main] o.s.s.concurrent.ThreadPoolTaskExecutor  : Initializing ExecutorService 'applicationTaskExecutor'
INFO 20364 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http) with context path '/MGAMIO/apifinance/v1'
INFO 20364 --- [           main] io.swagger.Swagger2SpringBoot            : Started Swagger2SpringBoot in 11.265 seconds (JVM running for 12.701)
INFO 20364 --- [nio-8080-exec-2] o.a.c.c.C.[.[.[/MGAMIO/apifinance/v1]    : Initializing Spring DispatcherServlet 'dispatcherServlet'
INFO 20364 --- [nio-8080-exec-2] o.s.web.servlet.DispatcherServlet        : Initializing Servlet 'dispatcherServlet'
INFO 20364 --- [nio-8080-exec-2] o.s.web.servlet.DispatcherServlet        : Completed initialization in 19 ms
INFO 20364 --- [nio-8080-exec-3] o.springdoc.api.AbstractOpenApiResource  : Init duration for springdoc-openapi is: 2071 ms
```

> Don’t just code—design. Your next promotion or job offer depends on it

<div>
{%- include softwareDesign.html -%}
</div>

You can view the api documentation in swagger-ui by pointing to:

http://localhost:8080/MGAMIO/apifinance/v1

![swaggerSpringBootDeployed](/assets/images/swaggerSpringBootDeployed.JPG "swagger SpringBoot Deployed"){:class="img-responsive"}

Here is the exported code from codegen:

[codegen github](https://github.com/mgamio/openapi/tree/9dbe77c86407a76dd1e11a267d262eb2a729b977/ch01/spring-server-generated){:target="_blank"}

## Using Swagger Codegen project

At the moment to write this article is not possible to use codegen from Swagger Editor anymore. You need to upgrade your license.

But we can generate the stub code with swagger codegen open project

1. git clone https://github.com/swagger-api/swagger-codegen

2. cd swagger-codegen

3. mvn clean package (at least maven vesion 3.7)

```kotlin
4. java -jar modules/swagger-codegen-cli/target/swagger-codegen-cli.jar generate -i https://petstore.swagger.io/v2/swagger.json -l spring -o samples/server/petstore/springboot
```

## Summary

Swagger Codegen takes an OpenAPI definition and converts it into client-side or server-side code in various languages. In the case of server-side code generation, the generated code constitutes a complete application with a framework based on controllers and services. It contains snippets with mock data, so it can execute immediately. The blanks need to be filled with the application's business logic, such as retrieving data from a database.

> Stop losing interviews because you can’t master algorithms: learn to solve problems like top engineers do

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Please support me as a writer. Your donation will help add more articles to this website. Thank you!

{% include buymeacoffee.html %}
<br/>
