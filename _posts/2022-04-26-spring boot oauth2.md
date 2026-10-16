---
layout: post
title:  "Secure a Spring Boot REST API with OAuth2 and OpenAPI (Swagger UI)"
description: "Protect a Spring Boot 4 REST API with OAuth2 client credentials and JWT: Spring Authorization Server, resource server, scopes, and a working Authorize button in Swagger UI."
author: moises
categories: [ Web APIs ]
image: /assets/images/oauthRoles.jpg
comments: false
---

Your REST API is documented with OpenAPI, and anyone who finds the URL can call it. This tutorial secures it with **OAuth2**: clients get a short-lived access token and send it with every request, and each endpoint checks that the token has the right *scope*. You'll build it with Spring Boot 4, using Spring Authorization Server to issue tokens, Spring Security's resource server to check them, and springdoc-openapi so that Swagger UI's **Authorize** button works. Every result shown here comes from running the application.

The book API is based on my earlier article, [Documenting a Spring Boot REST API with OpenAPI 3](https://codersite.dev/documenting-rest-api-openapi3/){:target="_blank"}.

## OAuth2 in Two Minutes

[OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749){:target="_blank"} is an authorization framework: it lets a client access protected resources with an **access token** instead of a password. It defines four roles:

- **Resource owner:** the user (or organization) that owns the data.
- **Client:** the application that wants to access the data.
- **Authorization server:** checks who the client is and issues access tokens.
- **Resource server:** the API that holds the data and accepts requests with valid tokens.

The client gets a token through a **grant type**. The original specification defined four, but two of them are no longer recommended ([RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700){:target="_blank"}, OAuth 2.0 Security Best Current Practice):

| Grant type | Use it today? |
|---|---|
| Authorization Code + PKCE | Yes: apps with a user who logs in |
| Client Credentials | Yes: server-to-server |
| Implicit | No: deprecated |
| Resource Owner Password | No: deprecated |

<br/>

For server-to-server calls, such as a B2B integration where a partner's system calls your API, **Client Credentials** is the right choice: the client authenticates with its own ID and secret, and no user is involved. That's what we build here.

<div>
{%- include inArticleAds.html -%}
</div>

## Dependencies

Older tutorials use `spring-security-oauth2-autoconfigure`, `@EnableAuthorizationServer` and `@EnableResourceServer`. That project reached its end of life in 2022 and doesn't work with Spring Boot 3 or 4. Today you use three starters:

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-webmvc</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-oauth2-authorization-server</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>3.1.1</version>
</dependency>
```

I used Spring Boot 4.1.1 and springdoc 3.1.1. For this tutorial, the authorization server and the API run in the same application. In production, the authorization server is usually a separate service, such as Keycloak, Auth0, Microsoft Entra ID or Amazon Cognito, and your API only needs the resource server part.

## Register the Clients

Spring Boot creates the registered clients from `application.yml`. We register two clients: one that can read and write, and one that can only read.

```yaml
spring:
  security:
    oauth2:
      authorizationserver:
        client:
          books-client:
            registration:
              client-id: books-client
              client-secret: ${BOOKS_CLIENT_SECRET}
              client-authentication-methods:
                - client_secret_basic
                - client_secret_post
              authorization-grant-types:
                - client_credentials
              scopes:
                - books.read
                - books.write
          reader-client:
            registration:
              client-id: reader-client
              client-secret: ${READER_CLIENT_SECRET}
              client-authentication-methods:
                - client_secret_basic
              authorization-grant-types:
                - client_credentials
              scopes:
                - books.read
```

The secrets come from environment variables, never from the file itself, and they are stored as hashes. Spring Security reads the `{bcrypt}` prefix and compares the incoming secret with the hash:

```text
BOOKS_CLIENT_SECRET={bcrypt}$2a$10$ivvgg...
```

`client_secret_post` lets Swagger UI send the secret in the request body; other clients use HTTP Basic (`client_secret_basic`).

## Configure Spring Security

Two `SecurityFilterChain`s split the application into the authorization server endpoints (`/oauth2/token`, `/oauth2/jwks` and so on) and the API:

```java
@Configuration
public class SecurityConfig {

  // 1. Authorization server: /oauth2/token, /oauth2/jwks, ...
  @Bean
  @Order(1)
  SecurityFilterChain authorizationServer(HttpSecurity http) throws Exception {
    http
        .oauth2AuthorizationServer(authorizationServer ->
            http.securityMatcher(authorizationServer.getEndpointsMatcher()))
        .authorizeHttpRequests(auth -> auth.anyRequest().authenticated());
    return http.build();
  }

  // 2. Resource server: the book API, protected by scopes
  @Bean
  @Order(2)
  SecurityFilterChain api(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/**").hasAuthority("SCOPE_books.read")
            .requestMatchers("/api/**").hasAuthority("SCOPE_books.write")
            .anyRequest().denyAll())
        .oauth2ResourceServer(resourceServer -> resourceServer.jwt(Customizer.withDefaults()))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .csrf(csrf -> csrf.disable());   // stateless API: no cookies, so no CSRF risk
    return http.build();
  }
}
```

- The resource server reads the token's `scope` claim and turns each scope into an authority with the prefix `SCOPE_`. Reading books needs `books.read`; everything else needs `books.write`.
- `anyRequest().denyAll()` means that an endpoint you forget to list is closed, not open.
- In Spring Security 7, the authorization server is configured with `http.oauth2AuthorizationServer(...)`. In Spring Boot 3 (Spring Authorization Server 1.x), you use `OAuth2AuthorizationServerConfigurer` with `http.with(...)` instead.

The book controller itself contains no security code:

```java
@RestController
@RequestMapping("/api/v1/books")
public class BookController {

  @GetMapping
  public Collection<Book> findAll() { ... }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Book create(@RequestBody Book book) { ... }
}
```

## Try It with curl

Without a token, the API refuses the request:

```text
$ curl -i http://localhost:8080/api/v1/books
HTTP/1.1 401
WWW-Authenticate: Bearer resource_metadata="http://localhost:8080/.well-known/oauth-protected-resource"
```

Get a token with the client credentials grant:

```text
$ curl -u books-client:change-me-books \
    -d grant_type=client_credentials -d "scope=books.read books.write" \
    http://localhost:8080/oauth2/token

{"access_token":"eyJraWQiOi...","scope":"books.write books.read","token_type":"Bearer","expires_in":299}
```

Send it in the `Authorization` header:

```text
$ curl -H "Authorization: Bearer eyJraWQiOi..." -H "Content-Type: application/json" \
    -d '{"title":"Software Design Principles","author":"Moises Gamio"}' \
    http://localhost:8080/api/v1/books

{"id":1,"title":"Software Design Principles","author":"Moises Gamio"}      (201 Created)
```

The access token is a signed JWT. Its payload (shortened) shows who it belongs to, its scopes, and when it expires (five minutes after it was issued):

```json
{
  "sub": "books-client",
  "aud": "books-client",
  "scope": ["books.write", "books.read"],
  "iss": "http://localhost:8080",
  "iat": 1792135161,
  "exp": 1792135461
}
```

The scopes do their job too. The `reader-client` token can read books (200), but creating one fails with **403** and a clear reason:

```text
WWW-Authenticate: Bearer error="insufficient_scope", error_description="The request requires higher privileges than provided by the access token."
```

If `reader-client` asks for `books.write`, the authorization server answers `{"error":"invalid_scope"}`, and a wrong secret returns `401 {"error":"invalid_client"}`.

## Make Swagger UI's Authorize Button Work

Swagger UI needs to know that the API uses OAuth2 and where to get a token. Describe it as a security scheme in the OpenAPI definition:

```java
@Configuration
public class OpenApiConfig {

  private static final String SCHEME = "books_oauth";

  @Bean
  public OpenAPI booksOpenApi() {
    return new OpenAPI()
        .info(new Info()
            .title("Book API")
            .version("2.0")
            .description("A Spring Boot REST API secured with OAuth2 client credentials."))
        .components(new Components()
            .addSecuritySchemes(SCHEME, new SecurityScheme()
                .type(SecurityScheme.Type.OAUTH2)
                .description("OAuth2 client credentials flow")
                .flows(new OAuthFlows()
                    .clientCredentials(new OAuthFlow()
                        .tokenUrl("/oauth2/token")
                        .scopes(new Scopes()
                            .addString("books.read", "Read books")
                            .addString("books.write", "Create and change books"))))))
        .addSecurityItem(new SecurityRequirement().addList(SCHEME));
  }
}
```

`addSecurityItem` applies the scheme to every operation, so each endpoint shows a lock icon. Open `http://localhost:8080/swagger-ui.html`, click **Authorize**, and enter the client ID, the secret and the scopes:

![Swagger UI Available authorizations dialog with client_id books-client, a client secret, and the scopes books.read and books.write selected](/assets/images/oauth2SwaggerAuthorize.png "Swagger UI: Authorize with OAuth2 client credentials"){:class="img-responsive"}

Swagger UI requests a token from `/oauth2/token` and adds it to every request. *Try it out* on `POST /api/v1/books` now returns **201 Created**, and the generated curl command shows the `Authorization: Bearer` header:

![Swagger UI showing the POST request with an Authorization Bearer header and a 201 response with the new book](/assets/images/oauth2SwaggerPost201.png "Swagger UI: POST with a Bearer token returns 201 Created"){:class="img-responsive"}

Security schemes are only one part of a good OpenAPI definition. To design the whole API contract, from resources and errors to versioning, I recommend *Designing APIs with Swagger and OpenAPI* by Josh Ponelat and Lukas Rosenstock:

<div>
{%- include designingAPIsWithSwaggerAndOpenAPI.html -%}
</div>

## Before Production

- **Use a real identity provider** (Keycloak, Auth0, Entra ID, Cognito) or a separately deployed Spring Authorization Server, and point the API to it with `spring.security.oauth2.resourceserver.jwt.issuer-uri`.
- **Persist the signing keys.** Without configuration, this demo creates a new RSA key at every start, so all tokens become invalid after a restart, and every instance in a cluster would have its own key.
- **Check the audience.** By default, the resource server accepts any valid token from the issuer. Add an `aud` check so that a token issued for another API can't be used on yours.
- **Use HTTPS everywhere.** A bearer token works for whoever holds it.
- **Keep tokens short-lived** (minutes, not days), and let clients request a new one.

On the client side, a Spring application gets and renews these tokens automatically. See [how to call an OAuth2-protected API with Spring's RestClient](https://codersite.dev/spring-restclient-replace-oauth2resttemplate/){:target="_blank"}, the counterpart of this post. For handling the API's errors, read [how a REST client should handle a 503](https://codersite.dev/how-rest-client-handles-503-error/){:target="_blank"}.

"Which OAuth2 grant type would you use, and why?" and "What's the difference between authentication and authorization?" come up in almost every backend interview. Practice with real questions:

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Please support me as a writer. Every contribution helps, and your donation can help add more articles to this website, no matter how small. Thank you!

{% include buymeacoffee.html %}
<br/>
