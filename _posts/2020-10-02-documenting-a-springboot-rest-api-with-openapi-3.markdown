---
layout: post
title:  "Documenting a SpringBoot REST API with OpenAPI 3"
date:   2020-10-02 14:18:45 +0100
tags:   rest springboot
categories: rest
---
The main idea for documenting our back-end RESTful APIs is to communicate to third-party developers what our endpoints are doing.

To learn more about REST see [Representational State Transfer](https://en.wikipedia.org/wiki/Representational_state_transfer){:target="_blank"}.

Prerequisites:

- Java 8.x
- Maven 3.x

## Steps

### 1. Create the maven project

Go to [spring initializr](https://start.spring.io/){:target="_blank"} and add the following dependencies:

![spring initializr](/assets/images/start.spring.io.jpg){:class="img-responsive"}

Once you generate the JAR maven project, open it in your favorite IDE.

Below, you can see the pom.xml to use:

{% highlight ruby %}
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
{% endhighlight %}

To generate automatically the API documentation, we add the [springdoc-openapi-ui](https://springdoc.org/){:target="_blank"} dependency to our pom.xml:

{% highlight ruby %}
<dependency>
   <groupId>org.springdoc</groupId>
   <artifactId>springdoc-openapi-ui</artifactId>
   <version>1.3.9</version>
</dependency>
{% endhighlight %}

### 2. Configure H2 Database

The H2 in-memory database is volatile, which means data will be lost when we restart the application. We add the following properties to the application.properties file.

{% highlight ruby %}
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
{% endhighlight %}

### 3. Create JPA Entity – Book.java

{% highlight ruby %}
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
{% endhighlight %}

### 4. Create a String Data Repository – BookRepository.java

{% highlight ruby %}
package com.openapi.respository;
import com.openapi.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {}
{% endhighlight %}

### 5. Create Spring Rest Controller Interface – BookApi

{% highlight ruby %}
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
{% endhighlight %}

### 6. Create Spring Rest Controller Implementation – BookApiController.java

{% highlight ruby %}
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
{% endhighlight %}

### 7. Configure openApi – OpenApiConfig.java

{% highlight ruby %}
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
            .contact(new Contact().email("@codersite.dev"))
            .license(new License().name("GNU"))
            .version("1.0")
        );
  }
}
{% endhighlight %}

### 8. Running Application

This Spring boot application has an entry point Java class called OpenapiApplication.java, which you can run to start the application.

{% highlight ruby %}
package com.openapi;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
@SpringBootApplication
public class OpenapiApplication {
	public static void main(String[] args) {
		SpringApplication.run(OpenapiApplication.class, args);
	}
}
{% endhighlight %}

Then, when we run our application, we can see the online documentation at:

[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html){:target="_blank"}

![openapi3](/assets/images/openapi3.jpg){:class="img-responsive"}

You can see the source code in the following link:

[https://github.com/mgamio/openapi-springboot.git](https://github.com/mgamio/openapi-springboot.git){:target="_blank"}

If you are looking for java interview resources, the following [link](https://amzn.to/2LqceUy){:target="_blank"} can help you.

<iframe type="text/html" width="336" height="550" frameborder="0" allowfullscreen style="max-width:100%" src="https://lesen.amazon.de/kp/card?asin=B086JCK6C4&preview=inline&linkCode=kpe&ref_=cm_sw_r_kb_dp_f2H6Fb7NENATK&tag=codersite20-20" ></iframe>
