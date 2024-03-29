---
layout: post
title: "Documenting a SpringBoot REST API with OpenAPI 3"
description: "The main idea for documenting your back-end RESTful APIs with openAPI 3 to communicate to third-party developers what your endpoints are doing"
author: moises
categories: [ Web APIs ]
image: assets/images/apiDocumentation.jpg
comments: false
---

The main idea for documenting our back-end RESTful APIs is to communicate to third-party developers what our endpoints are doing.

To learn more about REST API design, see [REST API Overview](https://codersite.dev/rest-api-overview/){:target="_blank"}.

In this tutorial, we are going to write clear and concise API documentation using OpenAPI 3.

Prerequisites:

- Java 8.x
- [Maven 3.x](https://amzn.to/3JLvxAX){:target="_blank"}

## Steps

### 1. Create the maven project

Go to [spring initializr](https://start.spring.io/){:target="_blank"} and add the following dependencies:

![spring initializr](/assets/images/start.spring.io.jpg "spring initializr"){:class="img-responsive"}

Once you generate the JAR maven project, open it in your favorite IDE.

Below, you can see the pom.xml to use:

<div>
{%- include inArticleAds.html -%}
</div>

```kotlin
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.3.4.RELEASE</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>com</groupId>
	<artifactId>openapi</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>openapi</name>
	<description>openapi in Spring Boot</description>
	<properties>
		<java.version>1.8</java.version>
	</properties>
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
			<exclusions>
				<exclusion>
					<groupId>org.junit.vintage</groupId>
					<artifactId>junit-vintage-engine</artifactId>
				</exclusion>
			</exclusions>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-validation</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa</artifactId>
		</dependency>
		<dependency>
			<groupId>com.h2database</groupId>
			<artifactId>h2</artifactId>
			<scope>runtime</scope>
		</dependency>
	</dependencies>
	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>
</project>
```

To generate the API documentation with OpenAPI 3, we add the [springdoc-openapi-ui](https://springdoc.org/){:target="_blank"} dependency to our pom.xml file.

<div>
{%- include inArticleAds.html -%}
</div>

The main idea for documenting our back-end RESTful APIs is to communicate what our endpoints are doing to third-party developers.

```kotlin
<dependency>
   <groupId>org.springdoc</groupId>
   <artifactId>springdoc-openapi-ui</artifactId>
   <version>1.3.9</version>
</dependency>
```

### 2. Configure H2 Database

The H2 in-memory database is volatile, which means data will be lost when we restart the application. We add the following properties to the application.properties file.

```kotlin
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
```

### 3. Create JPA Entity – Book.java

JPA stands for Java Persistence API and is a Java specification about how to handle relational data.

Even when Spring Data provides a standard programming model for different databases, switching from a SQL database to a [NoSQL database](https://codersite.dev/hot-warm-architecture-elasticsearch/){:target="_blank"} is impossible without touching the source code.

@Entity annotation describes the Book data that will be stored by Spring Data and makes our Book object ready for storage in a JPA-based relational data store.

```kotlin
package com.openapi.model;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
@Schema(description = "Book object")
@Entity
@Table(name="books")
public class Book {
  @JsonProperty(value="id", required=true, index = 10)
  @Schema(description = "Unique identifier of the Book.",
      example = "1", required = true)
  private long id;
  @JsonProperty(value="title", required=true, index = 20)
  @Schema(description = "Name of the title.",
      example = "Java", required = true)
  @NotBlank
  @Size(min = 0, max = 20)
  private String title;
  @JsonProperty(value="author", required=true, index = 30)
  @Schema(description = "Name of the author.",
      example = "Max Abi", required = true)
  @NotBlank
  @Size(min = 0, max = 30)
  private String author;
  public  Book() {}
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  public long getId() {
    return id;
  }
  public void setId(long id) {
    this.id = id;
  }
  @Column(name = "title", nullable = false)
  public String getTitle() {
    return title;
  }
  public void setTitle(String title) {
    this.title = title;
  }
  @Column(name = "author", nullable = false)
  public String getAuthor() {
    return author;
  }
  public void setAuthor(String author) {
    this.author = author;
  }
}
```

<div>
{%- include inArticleAds.html -%}
</div>

### 4. Create a String Data Repository – BookRepository.java

Repositories are used to store and access data from different types of databases.

Spring Data JPA repository supports creating, reading, updating, and deleting records against our back-end datastore.

```kotlin
package com.openapi.respository;
import com.openapi.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {}
```

### 5. Create Spring Rest Controller Interface – BookApi

We create an Interface to describe the API functionalities with the openapi annotations. In this way, we separate our API contract from the implementation Class.

```kotlin
package com.openapi.controller;
import com.openapi.model.Book;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.util.Collection;
@Tag(name = "book", description = "the book API")
@RequestMapping("/api/v1/books")
public interface BookApi {
  @Operation(summary = "Find book by ID", description = "Returns a single book", tags = { "book" })
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "successful operation", content = @Content(schema = @Schema(implementation = Book.class))),
      @ApiResponse(responseCode = "400", description = "Invalid ID supplied", content = @Content),
      @ApiResponse(responseCode = "404", description = "Book not found", content = @Content) })
  @RequestMapping(value = "/{id}", produces = { "application/json",  "application/vnd.api+json"}, method = RequestMethod.GET)
  @ResponseStatus(HttpStatus.OK)
  public ResponseEntity<Book> findById(
      @Parameter(description = "ID of book", required = true)
      @PathVariable long id,
      @NotNull @Parameter(description = "select which kind of data to fetch", required = true)
      @Valid @RequestHeader(value="bookAuthorization", required = true) String bookAuthorization)
      throws Exception;
  @Operation(summary = "Get books", description = "Returns a books collection", tags = { "book" })
  @GetMapping("/")
  @ResponseStatus(HttpStatus.OK)
  public Collection<Book> findBooks();
  @PutMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public Book updateBook(@PathVariable("id") final String id, @RequestBody final Book book);
  @PatchMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public Book patchBook(@PathVariable("id") final String id, @RequestBody final Book book);
  @Operation(summary = "Create book", description = "This can only be done by the logged in book.", tags = { "book" })
  @ApiResponses(value = { @ApiResponse(description = "successful operation", content = { @Content(mediaType = "application/json", schema = @Schema(implementation = Book.class)), @Content(mediaType = "application/xml", schema = @Schema(implementation = Book.class)) }) })
  @PostMapping(value = "/", consumes = { "application/json", "application/xml", "application/x-www-form-urlencoded" })
  @ResponseStatus(HttpStatus.CREATED)
  public ResponseEntity<Book> postBook(
      @NotNull
      @Parameter(description = "Created book object", required = true)
      @Valid @RequestBody Book body,
      @NotNull @Parameter(description = "select which kind of data to fetch", required = true)
      @Valid @RequestHeader(value="bookAuthorization", required = true) String bookAuthorization)
      throws Exception;
  @RequestMapping(method = RequestMethod.HEAD, value = "/")
  @ResponseStatus(HttpStatus.OK)
  public Book headBook();
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public long deleteBook(@PathVariable final long id);
}
```

> Any software design is generally a matter of opinion. There is no definitive Guide. -- <cite>codersite.dev</cite>

<div>
{%- include softwareDesign.html -%}
</div>

### 6. Create Spring Rest Controller Implementation – BookApiController.java

@RestController annotation tells Spring that this Class describes endpoints that should be made available over the web. The data returned by each method will be included in the response body.

```kotlin
package com.openapi.controller;
import java.util.Collection;
import com.openapi.exception.BookNotFoundException;
import com.openapi.model.Book;
import com.openapi.respository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
@RestController
public class BookApiController implements BookApi {
  @Autowired
  private BookRepository repository;
  @Override
  public ResponseEntity<Book> findById(
      long id,
      String bookAuthorization) throws Exception {
    Book book = repository.findById(id)
        .orElseThrow(() -> new BookNotFoundException("Employee not found for this id :: " + id));
    return ResponseEntity.ok().body(book);
  }
  @Override
  public Collection<Book> findBooks() {
    return repository.findAll();
  }
  @PutMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public Book updateBook(@PathVariable("id") final String id, @RequestBody final Book book) {
    return book;
  }
  @PatchMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public Book patchBook(@PathVariable("id") final String id, @RequestBody final Book book) {
    return book;
  }
  @Override
  public ResponseEntity<Book> postBook(
      Book body,
      String bookAuthorization) throws Exception {
    return new ResponseEntity<Book>(repository.save(body), HttpStatus.CREATED);
  }
  @RequestMapping(method = RequestMethod.HEAD, value = "/")
  @ResponseStatus(HttpStatus.OK)
  public Book headBook() {
    return new Book();
  }
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public long deleteBook(@PathVariable final long id) {
    return id;
  }
}
```

<div>
{%- include inArticleAds.html -%}
</div>

### 7. Configure openApi – OpenApiConfig.java

The *OpenAPI* class is the root document object that describes an API or elements of an API

```kotlin
package com.openapi.config;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
@Configuration
public class OpenApiConfig {
  @Bean
  public OpenAPI customOpenAPI() {
    return new OpenAPI()
        .components(new Components())
        .info(new Info()
            .title("Book Application API")
            .description("This is a sample Spring Boot RESTful service using springdoc-openapi and OpenAPI 3.")
            .termsOfService("terms")
            .contact(new Contact().email("codersitedev@gmail.com"))
            .license(new License().name("GNU"))
            .version("1.0")
        );
  }
}
```

### 8. Running Application

This [Spring boot](https://amzn.to/3JQ440Q){:target="_blank"} application has an entry point Java class called OpenapiApplication.java, which you can run to start the application.

```kotlin
package com.openapi;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
@SpringBootApplication
public class OpenapiApplication {
	public static void main(String[] args) {
		SpringApplication.run(OpenapiApplication.class, args);
	}
}
```

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

@SpringBootApplication add the following functionalities:

- OpenApiApplication Class becomes a Configuration class.
- It enables Component scan, which means looking for other components, configurations, controllers, and services in the com.openapi package.
- It enables autoconfiguration; Spring Boot looks for other JAR files in the classpath and configures it automatically, e.g., H2 database, JPA.

Spring Boot will detect and start an embedded Tomcat webserver.

{% highlight ruby %}
2021-10-28 12:48:02.659  INFO 9312 --- [  restartedMain] .s.d.r.c.RepositoryConfigurationDelegate : Bootstrapping Spring Data JPA repositories in DEFERRED mode.
2021-10-28 12:48:02.881  INFO 9312 --- [  restartedMain] .s.d.r.c.RepositoryConfigurationDelegate : Finished Spring Data repository scanning in 201ms. Found 1 JPA repository interfaces.
2021-10-28 12:48:04.812  INFO 9312 --- [  restartedMain] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port(s): 8080 (http)
2021-10-28 12:48:04.847  INFO 9312 --- [  restartedMain] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2021-10-28 12:48:04.848  INFO 9312 --- [  restartedMain] org.apache.catalina.core.StandardEngine  : Starting Servlet engine: [Apache Tomcat/9.0.38]
2021-10-28 12:48:05.131  INFO 9312 --- [  restartedMain] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
.
.
.
2021-10-28 12:48:11.700  INFO 9312 --- [  restartedMain] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http) with context path ''
2021-10-28 12:48:11.703  INFO 9312 --- [  restartedMain] DeferredRepositoryInitializationListener : Triggering deferred initialization of Spring Data repositories…
2021-10-28 12:48:12.668  INFO 9312 --- [  restartedMain] DeferredRepositoryInitializationListener : Spring Data repositories initialized!
2021-10-28 12:48:12.704  INFO 9312 --- [  restartedMain] com.openapi.OpenapiApplication           : Started OpenapiApplication in 14.363 seconds (JVM running for 18.621)
{% endhighlight %}

Then, when we run our application, we can see the online documentation at:

[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html){:target="_blank"}

![openapi3](/assets/images/openapi-3.jpg "openapi 3"){:class="img-responsive"}

OpenAPI includes a “Try it out” button, which can be used to actually try out the API, not just read its documentation.

You can see the source code in the following link:

[https://github.com/mgamio/openapi-springboot.git](https://github.com/mgamio/openapi-springboot.git){:target="_blank"}

Most of the companies usually follow a [Design-First API](https://swagger.io/blog/api-design/design-first-or-code-first-api-development/){:target="_blank"} Strategy using SwaggerHub product for example. But the export plugins are not always aligned with the most updated version of OpenAPI.

Once you receive the [technical specifications in UML](https://codersite.dev/uml-diagrams-for-java-developers/){:target="_blank"}, you need to decide whether to take the Design First approach or the Code First approach.

Documenting API endpoints with OpenAPI 3 facilitates interaction between internal development teams that build different web services for the same product.

Please donate to maintain and improve this website if you find this content valuable.

<form action="https://www.paypal.com/donate" method="post" target="_top">
 <input type="hidden" name="hosted_button_id" value="UF4T364RTPPMJ" />
 <input type="image" src="https://www.paypalobjects.com/en_US/DK/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
 <img alt="" border="0" src="https://www.paypal.com/en_DE/i/scr/pixel.gif" width="1" height="1" />
</form>
<br/>

Let's now see how to integrate [OAuth2](https://codersite.dev/spring-boot-oauth2/){:target="_blank"} to protect our endpoints.
