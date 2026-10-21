---
layout: post
title: "Document a Spring Boot REST API with OpenAPI 3 and Swagger UI (springdoc)"
description: "Code-first OpenAPI 3 docs for Spring Boot 4 with springdoc: annotate a real CRUD API, document errors with Problem Details, customize Swagger UI and export the spec."
author: moises
categories: [ Web APIs ]
image: /assets/images/apiDocumentation.jpg
comments: false
---

Developers outside your team can't read your code. They read your API documentation, and if it's missing, out of date or wrong, they guess, open tickets, or pick another provider.

This tutorial documents a Spring Boot REST API **code-first** with [springdoc-openapi](https://springdoc.org/){:target="_blank"}: you add annotations to your Java code, and springdoc generates an OpenAPI 3 document and an interactive Swagger UI page from it. Because the documentation comes from the code, it changes when the code changes.

You'll build a small Book API and learn how to:

- write the API contract as a Java interface with OpenAPI annotations;
- keep the documented request and response separate from your JPA entity;
- show validation rules, such as required fields and patterns, in the documentation;
- document errors in the standard Problem Details format;
- save the generated OpenAPI file with your code and hide Swagger UI in production.

I used Spring Boot 4.1.1, springdoc-openapi 3.1.1 and Java 25. Every response in this post comes from running the application. The complete project is on GitHub: [mgamio/openapi-springboot](https://github.com/mgamio/openapi-springboot){:target="_blank"}.

New to REST API design? Start with [REST API Overview](https://codersite.dev/rest-api-overview/){:target="_blank"}.

## 1. Create the project

Go to [Spring Initializr](https://start.spring.io/){:target="_blank"}, choose Maven, Java 25 (any version from 17 works) and Spring Boot 4.1, and add these dependencies: **Spring Web**, **Validation**, **Spring Data JPA** and **H2 Database**. Generate the project and open it in your IDE.

springdoc isn't in Spring Initializr, so add it to `pom.xml` yourself:

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>3.1.1</version>
</dependency>
```

Pick the springdoc version that matches your Spring Boot version:

| Spring Boot | springdoc-openapi | Artifact |
|---|---|---|
| 4.x | 3.x | `springdoc-openapi-starter-webmvc-ui` |
| 3.x | 2.x | `springdoc-openapi-starter-webmvc-ui` |
| 2.x | 1.x | `springdoc-openapi-ui` (no longer maintained) |

The old `springdoc-openapi-ui` artifact doesn't work with Spring Boot 3 or 4. If you upgrade an older project and Swagger UI disappears, this is the most common reason.

Then configure the database and springdoc in `src/main/resources/application.properties`:

```properties
spring.application.name=openapi

# In-memory database: the data is lost when the application stops
spring.datasource.url=jdbc:h2:mem:books
spring.jpa.open-in-view=false

# Return errors as Problem Details (RFC 9457)
spring.mvc.problemdetails.enabled=true

# springdoc-openapi
springdoc.api-docs.path=/v3/api-docs
springdoc.default-produces-media-type=application/json
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.operations-sorter=alpha
springdoc.swagger-ui.try-it-out-enabled=true
```

The `springdoc` properties do the following:

- **`api-docs.path`** and **`swagger-ui.path`** are the defaults, written out so you know where to look.
- **`default-produces-media-type`** documents responses as `application/json` instead of `*/*`.
- **`operations-sorter=alpha`** sorts the operations by path, so the list starts with `GET /api/v1/books`.
- **`try-it-out-enabled`** opens every operation ready to send a request.

<div>
{%- include inArticleAds.html -%}
</div>

## 2. Separate the API model from the database model

The original version of this tutorial used the JPA entity as the request body. That has a problem you can see in the documentation: the entity has an `id`, so the docs told clients to send an `id` when creating a book, which only the server can know.

Instead, use three classes, each with one job:

- **`Book`**, the JPA entity, which is how the database stores a book;
- **`BookRequest`**, which is what a client sends;
- **`BookResponse`**, which is what the API returns.

The entity has no OpenAPI annotations at all:

```java
package com.openapi.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "books")
public class Book {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 100)
  private String title;

  @Column(nullable = false, length = 60)
  private String author;

  @Column(nullable = false, length = 13)
  private String isbn;

  protected Book() {
  }

  public Book(String title, String author, String isbn) {
    this.title = title;
    this.author = author;
    this.isbn = isbn;
  }

  public void update(String title, String author, String isbn) {
    this.title = title;
    this.author = author;
    this.isbn = isbn;
  }

  // getters omitted for brevity
}
```

The request is a record with Bean Validation constraints and `@Schema` descriptions:

```java
package com.openapi.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "The data a client sends to create or replace a book")
public record BookRequest(

    @Schema(description = "Title of the book", example = "Refactoring")
    @NotBlank @Size(max = 100)
    String title,

    @Schema(description = "Full name of the author", example = "Martin Fowler")
    @NotBlank @Size(max = 60)
    String author,

    @Schema(description = "ISBN-13, digits only", example = "9780134757599")
    @NotBlank @Pattern(regexp = "\\d{13}")
    String isbn) {
}
```

You don't have to repeat the validation rules in the documentation. springdoc reads the constraints: `@NotBlank` makes a field *required*, `@Size(max = 100)` becomes `maxLength: 100`, and `@Pattern` becomes `pattern`. The rules that Spring checks and the rules that the documentation shows are the same annotations, so they can't drift apart.

The response is a record with a factory method that converts the entity:

```java
@Schema(description = "A book as the API returns it")
public record BookResponse(

    @Schema(description = "Unique identifier of the book, set by the server", example = "1")
    long id,

    @Schema(description = "Title of the book", example = "Refactoring")
    String title,

    @Schema(description = "Full name of the author", example = "Martin Fowler")
    String author,

    @Schema(description = "ISBN-13, digits only", example = "9780134757599")
    String isbn) {

  public static BookResponse from(Book book) {
    return new BookResponse(book.getId(), book.getTitle(), book.getAuthor(), book.getIsbn());
  }
}
```

Keeping the API model separate from the database model is the *separation of concerns* principle: you can rename a column or add an internal field without changing your public API contract. My book *Software Design Principles* explains this principle, and the others behind maintainable APIs, with worked Java examples.

<div>
{%- include softwareDesign.html -%}
</div>

The repository needs no code:

```java
package com.openapi.repository;

import com.openapi.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepository extends JpaRepository<Book, Long> {
}
```

## 3. Write the API contract as an interface

Put the endpoints and all OpenAPI annotations in an interface. The controller then implements it with no annotations of its own, so the contract and the code that fulfills it stay in separate files, and the controller stays readable.

```java
package com.openapi.controller;

// imports omitted for brevity

@Tag(name = "Books", description = "Create, read, update and delete books")
@RequestMapping("/api/v1/books")
public interface BookApi {

  @Operation(summary = "List all books", description = "Returns every book, sorted by title.")
  @ApiResponse(responseCode = "200", description = "The list of books, possibly empty")
  @GetMapping
  List<BookResponse> findAll();

  @Operation(summary = "Find a book by ID")
  @ApiResponse(responseCode = "200", description = "The book")
  @ApiResponse(responseCode = "404", description = "There is no book with this ID",
      content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = Problem.class)))
  @GetMapping("/{id}")
  BookResponse findById(@Parameter(description = "ID of the book", example = "1") @PathVariable long id);

  @Operation(summary = "Create a book")
  @ApiResponse(responseCode = "201", description = "The book was created",
      headers = @Header(name = "Location", description = "URL of the new book", schema = @Schema(type = "string")))
  @ApiResponse(responseCode = "400", description = "A field is missing or invalid",
      content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ValidationProblem.class)))
  @PostMapping
  ResponseEntity<BookResponse> create(@Valid @RequestBody BookRequest request);

  @Operation(summary = "Replace a book", description = "Replaces all fields of an existing book.")
  @ApiResponse(responseCode = "200", description = "The updated book")
  @ApiResponse(responseCode = "400", description = "A field is missing or invalid",
      content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ValidationProblem.class)))
  @ApiResponse(responseCode = "404", description = "There is no book with this ID",
      content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = Problem.class)))
  @PutMapping("/{id}")
  BookResponse update(@Parameter(description = "ID of the book", example = "1") @PathVariable long id,
                      @Valid @RequestBody BookRequest request);

  @Operation(summary = "Delete a book")
  @ApiResponse(responseCode = "204", description = "The book was deleted")
  @ApiResponse(responseCode = "404", description = "There is no book with this ID",
      content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = Problem.class)))
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void delete(@Parameter(description = "ID of the book", example = "1") @PathVariable long id);
}
```

The annotations you'll use most:

| Annotation | Documents |
|---|---|
| `@Tag` | A group of operations, shown as a section in Swagger UI |
| `@Operation` | One endpoint: a one-line `summary` and a longer `description` |
| `@Parameter` | A path, query or header parameter, with an example value |
| `@ApiResponse` | One possible response: status code, description, body and headers |
| `@Schema` | A model or one of its fields |

A few details matter here:

- **Document every response, not only 200.** Clients need to know that `GET /{id}` can return 404, and what the body looks like when it does.
- **POST returns 201 with a `Location` header.** The `@Header` annotation documents it, so clients know where to find the new book.
- **No trailing slash.** Use `@GetMapping`, not `@GetMapping("/")`. Since Spring Boot 3, `/api/v1/books/` and `/api/v1/books` are different URLs, and the trailing-slash version returns 404.

`@ApiResponse` can be repeated directly on a method. You don't need the `@ApiResponses({...})` wrapper that older examples use.

Designing a contract this carefully is easier when you've seen many good ones. *Designing APIs with Swagger and OpenAPI* teaches you to write OpenAPI documents by hand, review them with your team and evolve them without breaking clients. It's the natural next step after this tutorial.

<div>
{%- include designingAPIsWithSwaggerAndOpenAPI.html -%}
</div>

## 4. Implement the controller

The controller only implements the interface. Spring reads the mappings, `@Valid` and `@RequestBody` from the interface, so the implementation stays short:

```java
package com.openapi.controller;

// imports omitted for brevity

@RestController
public class BookController implements BookApi {

  private final BookRepository repository;

  public BookController(BookRepository repository) {
    this.repository = repository;
  }

  @Override
  public List<BookResponse> findAll() {
    return repository.findAll(Sort.by("title")).stream()
        .map(BookResponse::from)
        .toList();
  }

  @Override
  public BookResponse findById(long id) {
    return BookResponse.from(findBook(id));
  }

  @Override
  public ResponseEntity<BookResponse> create(BookRequest request) {
    Book book = repository.save(new Book(request.title(), request.author(), request.isbn()));
    URI location = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{id}")
        .buildAndExpand(book.getId())
        .toUri();
    return ResponseEntity.created(location).body(BookResponse.from(book));
  }

  @Override
  public BookResponse update(long id, BookRequest request) {
    Book book = findBook(id);
    book.update(request.title(), request.author(), request.isbn());
    return BookResponse.from(repository.save(book));
  }

  @Override
  public void delete(long id) {
    repository.delete(findBook(id));
  }

  private Book findBook(long id) {
    return repository.findById(id).orElseThrow(() -> new BookNotFoundException(id));
  }
}
```

`BookNotFoundException` is a plain `RuntimeException` with the message `"No book with ID " + id`.

<div>
{%- include inArticleAds.html -%}
</div>

## 5. Return and document errors as Problem Details

An API that returns errors in a different shape from every endpoint is hard to use. [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457){:target="_blank"} defines a standard JSON error body with the content type `application/problem+json`, and Spring supports it with the `ProblemDetail` class.

One `@RestControllerAdvice` turns both kinds of errors into Problem Details:

```java
package com.openapi.exception;

// imports omitted for brevity

@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

  @ExceptionHandler(BookNotFoundException.class)
  public ProblemDetail handleBookNotFound(BookNotFoundException ex) {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    problem.setTitle("Book not found");
    return problem;
  }

  @Override
  protected ResponseEntity<Object> handleMethodArgumentNotValid(
      MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
    Map<String, String> errors = new TreeMap<>();
    for (FieldError error : ex.getBindingResult().getFieldErrors()) {
      errors.putIfAbsent(error.getField(), error.getDefaultMessage());
    }
    ProblemDetail problem = ex.getBody();
    problem.setDetail("The request has invalid fields");
    problem.setProperty("errors", errors);
    return handleExceptionInternal(ex, problem, headers, status, request);
  }
}
```

The 400 response gets an extra `errors` field that lists each invalid field, so the client can show the message next to the right input.

There is one catch in the documentation. If you write `@Schema(implementation = ProblemDetail.class)`, springdoc documents Spring's Java class, which has a nested `properties` object that never appears in the real JSON. To document what clients actually receive, describe the error body with two small records that exist only for the documentation:

```java
@Schema(description = "An error in the Problem Details format (RFC 9457)")
public record Problem(
    @Schema(description = "Short summary of the problem", example = "Book not found") String title,
    @Schema(description = "HTTP status code", example = "404") int status,
    @Schema(description = "Explanation of this occurrence of the problem", example = "No book with ID 99") String detail,
    @Schema(description = "Path of the request that failed", example = "/api/v1/books/99") String instance) {
}
```

`ValidationProblem` has the same fields plus `Map<String, String> errors`. The full code is in the [GitHub repository](https://github.com/mgamio/openapi-springboot){:target="_blank"}.

## 6. Add the API description

The `OpenAPI` bean describes the API as a whole: its title, version, description, contact and servers. Swagger UI shows this information at the top of the page.

```java
package com.openapi.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

  @Bean
  public OpenAPI bookApiDocumentation() {
    return new OpenAPI()
        .info(new Info()
            .title("Book API")
            .version("1.0.0")
            .description("Create, read, update and delete books. A sample Spring Boot REST API documented with springdoc-openapi.")
            .contact(new Contact().name("codersite.dev").url("https://codersite.dev")))
        .servers(List.of(new Server().url("http://localhost:8080").description("Local development")));
  }
}
```

## 7. Run the application and open Swagger UI

Start the application from your IDE, or with the Maven wrapper:

```bash
./mvnw spring-boot:run
```

When the log shows `Started OpenapiApplication`, the application is running:

```text
o.s.boot.tomcat.TomcatWebServer          : Tomcat started on port 8080 (http) with context path '/'
com.openapi.OpenapiApplication           : Started OpenapiApplication in 4.859 seconds (process running for 5.306)
o.s.core.events.SpringDocAppInitializer  : SpringDoc /v3/api-docs endpoint is enabled by default. To disable it in production, set the property 'springdoc.api-docs.enabled=false'
```

The last line is springdoc reminding you to hide the docs in production; step 9 does that.

Open [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html){:target="_blank"}. It redirects to `/swagger-ui/index.html` and shows the API description and the five operations:

![Swagger UI showing the Book API title, the local server and five operations](/assets/images/openapi3-swagger-ui.png "Swagger UI for the Book API"){:class="img-responsive"}

Expand an operation to see its parameters and every documented response, with example values taken from your `@Schema` annotations. For `GET /api/v1/books/{id}`, the 200 response shows a book and the 404 response shows the Problem Details body:

![The Find a book by ID operation in Swagger UI with its 200 and 404 responses](/assets/images/openapi3-find-book-by-id.png "Find a book by ID in Swagger UI"){:class="img-responsive"}

Swagger UI is not only documentation. With **Try it out**, you edit the request body, click **Execute**, and Swagger UI sends a real request to your API. It also shows the matching curl command, the response body and the response headers, including the `Location` of the new book:

![Creating a book with Try it out in Swagger UI and the 201 Created response](/assets/images/openapi3-try-it-out.png "Try it out in Swagger UI"){:class="img-responsive"}

The same requests work from the command line. Creating a book returns 201 and the new book's URL:

```bash
curl -i -X POST http://localhost:8080/api/v1/books \
  -H "Content-Type: application/json" \
  -d '{"title": "Refactoring", "author": "Martin Fowler", "isbn": "9780134757599"}'
```

```text
HTTP/1.1 201
Location: http://localhost:8080/api/v1/books/1
Content-Type: application/json

{"id":1,"title":"Refactoring","author":"Martin Fowler","isbn":"9780134757599"}
```

A book that doesn't exist returns a Problem Details body:

```text
HTTP/1.1 404
Content-Type: application/problem+json

{"detail":"No book with ID 99","instance":"/api/v1/books/99","status":404,"title":"Book not found"}
```

An invalid book returns 400 with the list of invalid fields:

```bash
curl -i -X POST http://localhost:8080/api/v1/books \
  -H "Content-Type: application/json" \
  -d '{"title": "", "author": "Martin Fowler", "isbn": "123"}'
```

```text
HTTP/1.1 400
Content-Type: application/problem+json

{"detail":"The request has invalid fields","instance":"/api/v1/books","status":400,"title":"Bad Request","errors":{"isbn":"must match \"\\d{13}\"","title":"must not be blank"}}
```

<div>
{%- include inArticleAds.html -%}
</div>

## 8. Save the OpenAPI document with your code

Swagger UI is generated from the OpenAPI document at [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs){:target="_blank"} (JSON) or `/v3/api-docs.yaml` (YAML). springdoc 3 generates OpenAPI 3.1. This is the part for `POST /api/v1/books`:

```text
post:
  tags:
  - Books
  summary: Create a book
  operationId: create
  requestBody:
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/BookRequest"
    required: true
  responses:
    "201":
      description: The book was created
      headers:
        Location:
          description: URL of the new book
          style: simple
          schema:
            type: string
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/BookResponse"
    "400":
      description: A field is missing or invalid
      content:
        application/problem+json:
          schema:
            $ref: "#/components/schemas/ValidationProblem"
```

And this is the `BookRequest` schema that springdoc built from the record's annotations:

```yaml
BookRequest:
  type: object
  description: The data a client sends to create or replace a book
  properties:
    title:
      type: string
      description: Title of the book
      example: Refactoring
      maxLength: 100
      minLength: 0
    author:
      type: string
      description: Full name of the author
      example: Martin Fowler
      maxLength: 60
      minLength: 0
    isbn:
      type: string
      description: "ISBN-13, digits only"
      example: "9780134757599"
      minLength: 1
      pattern: "\\d{13}"
  required:
  - author
  - isbn
  - title
```

`minLength: 0` comes from `@Size`, whose minimum defaults to 0. The fields are still mandatory, because `@NotBlank` puts them in the `required` list.

Save this file in your repository and update it whenever the API changes:

```bash
curl -s http://localhost:8080/v3/api-docs.yaml -o openapi.yaml
```

Now every pull request that changes the API also changes `openapi.yaml`, and reviewers see the contract change next to the code change. You can also give the file to other teams, import it into Postman, or generate client code from it with [OpenAPI Generator](https://openapi-generator.tech/){:target="_blank"}.

## 9. Hide Swagger UI in production

Public Swagger UI and `/v3/api-docs` pages show attackers every endpoint and every parameter of your API. Unless your API is public, turn them off in production. Create `application-prod.properties`:

```properties
# Don't publish the API documentation in production
springdoc.api-docs.enabled=false
springdoc.swagger-ui.enabled=false
```

Run with the `prod` profile and the documentation URLs return 404, while the API keeps working:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```

If your API is public, keep the documentation and protect the endpoints instead. See [Secure a Spring Boot REST API with OAuth2 and OpenAPI (Swagger UI)](https://codersite.dev/spring-boot-oauth2/){:target="_blank"}, which also makes the **Authorize** button in Swagger UI work.

<div>
{%- include inArticleAds.html -%}
</div>

## Code-first or design-first?

This tutorial is **code-first**: you write the code, and the OpenAPI document is generated from it. The other approach is **design-first**: you write the OpenAPI document first, agree on it with the teams that will use the API, and then implement it.

| | Code-first | Design-first |
|---|---|---|
| **Source of truth** | The Java code | The OpenAPI document |
| **Best when** | One team owns the API and its clients | Several teams or external partners depend on the API |
| **Docs out of date?** | Not possible: they're generated | Possible, unless you generate the server code from the document |
| **Feedback before coding** | None: clients see the API when it's built | Clients review the contract before any code exists |

Many teams combine them: they design the contract first, and then check that the generated document of the running service still matches it. To try design-first, read [Design-First APIs with OpenAPI 3](https://codersite.dev/designing-apis-with-swagger-and-openapi/){:target="_blank"} and then [generate a Spring Boot server from the OpenAPI spec](https://codersite.dev/swagger-codegen-server-stubs-openapi/){:target="_blank"}. If your design starts from [UML diagrams](https://codersite.dev/uml-diagrams-for-java-developers/){:target="_blank"}, the class diagram becomes your schemas and the use cases become your operations.

Documentation is one part of a good REST API. *RESTful Web APIs* covers the rest: resources and representations, hypermedia, and how to design APIs that clients can use without reading your code. If you want to understand *why* REST APIs are designed the way they are, read it after this tutorial.

<div>
{%- include restfulWebApis.html -%}
</div>

## FAQ

### springdoc or Springfox?

springdoc. Springfox hasn't had a release since 2020 and doesn't work with Spring Boot 3 or 4. springdoc is actively maintained, supports OpenAPI 3.1, and needs no configuration class to start: adding the dependency is enough.

### Why does /swagger-ui.html return 404?

The most common causes are:

1. **The wrong artifact:** `springdoc-openapi-ui` on Spring Boot 3 or 4. Use `springdoc-openapi-starter-webmvc-ui`, or `springdoc-openapi-starter-webflux-ui` for WebFlux.
2. **The wrong version:** springdoc 2.x is built for Spring Boot 3. On Spring Boot 4, use springdoc 3.x.
3. **Disabled in this profile:** `springdoc.swagger-ui.enabled=false` is set, as in step 9.
4. **Blocked by Spring Security:** allow `/swagger-ui/**` and `/v3/api-docs/**`.

### My tools only support OpenAPI 3.0. What can I do?

springdoc 3 generates OpenAPI 3.1 by default. To generate 3.0 instead, set `springdoc.api-docs.version=openapi_3_0` in `application.properties`.

### Do I need an annotation on every endpoint?

No. Without annotations, springdoc still documents every endpoint from your Spring MVC mappings, parameter types and return types. The annotations add what springdoc can't guess: descriptions, examples, and the error responses.

### Should I put the annotations on the controller or on an interface?

Both work. An interface keeps a long list of annotations away from your code, and makes the contract easy to find in one file. For a small API, annotating the controller directly is fine.

<div>
{% include buymeacoffee.html %}
</div>
