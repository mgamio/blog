---
layout: post
title:  "Spring Boot, OpenAPI3, and OAuth2"
description: "OAuth is an authorization framework many companies use to secure access to its protected resources."
author: moises
categories: [ Web APIs ]
image: assets/images/oauthRoles.jpg
comments: false
---

This tutorial will show how to integrate OAuth2 with Spring Security in a Spring Boot application with OpenAPI 3.

The Spring Boot application I am going to use is based on my previous article: [Documenting a SpringBoot REST API with OpenAPI 3](https://codersite.dev/documenting-rest-api-openapi3/){:target="_blank"}

## OAuth

[OAuth](https://datatracker.ietf.org/doc/html/rfc6749){:target="_blank"} is an authorization framework many companies use to secure access to their protected resources. It performs this by using access tokens.

The token represents a delegated right of access on behalf of the resource owner.

## Roles

OAuth defines four roles

- The Resource Owner is the user who grants access to a protected resource.

- Resource Server stores users' data and HTTP services and responds to protected resource requests using access tokens.

- The client is the application that requires access to protected resources on behalf of the resource owner and its authorization.

- The authorization server is responsible for authenticating the user's identity and giving an authorization token.

<div>
{%- include inArticleAds.html -%}
</div>

## Authorization grant

An authorization grant is a credential representing the resource owner's authorization used by the client to obtain an access token.

OAuth2 defines four grant types.

- Authorization Code, for web apps that are server-side apps

- Implicit, optimized for clients implemented in a browser using a scripting language such as JavaScript

- Resource Owner Password Credentials are used when there is a high degree of trust between the resource owner and the client

- Client Credentials are used when the client is requesting access to protected resources based on an authorization previously arranged with the authorization server.

The  Client Credentials grant type is the most appropriate for server-to-server applications, such as typical B2B interactions.

### Getting Started

To integrate OAuth2 in a Spring Boot application, we add the Spring Oauth dependency to our pom.xml file.

```kotlin
<dependency>
  <groupId>org.springframework.security.oauth.boot</groupId>
  <artifactId>spring-security-oauth2-autoconfigure</artifactId>
  <version>2.5.1</version>
</dependency>
```

### Enable Authorization Server Support

We open the main application class and add @EnableAuthorizationServer to enable the support for the authorization server. 

```kotlin
@EnableAuthorizationServer
@SpringBootApplication
public class OpenapiApplication {
	public static void main(String[] args) {
		SpringApplication.run(OpenapiApplication.class, args);
	}
}
```

<div>
{%- include primeVideo.html -%}
</div>

@EnableAuthorizationServer enables the client credentials grant type by default.

### Creating ClientId and Client Secret

Open/create the resources/application.yml file and add the following properties:

```kotlin
security:
  oauth2:
    client:
      client-id: codercuy-client
      client-secret: strong-secret
      scope:
        - read
        - write
```

We need to tell Spring which endpoints -resources- must be authenticated. Otherwise, all requests will skip security.

### Enable Resource Server Support

Create a class that extends ResourceServerConfigurerAdapter and add the following code.

```kotlin
@Configuration
@EnableResourceServer
public class OAuth2ResourceServer extends ResourceServerConfigurerAdapter
{
  @Override
  public void configure(HttpSecurity http) throws Exception {
    http
            .authorizeRequests()
            .antMatchers("/api/**").authenticated()
            .antMatchers("/").permitAll();
  }
}
```

Now, run the main application.

<a href="http://localhost:8080/swagger-ui.html" target="_blank">http://localhost:8080/swagger-ui.html</a>

<div>
{%- include dsaAdvDalle.html -%}
</div>

And try to insert a book (Try out button). In the bookAuthorization parameter, write anything ("key," for example).

Then you receive an error.

![oauth2Post](/assets/images/oauth2Post.jpg "unauthorized error"){:class="img-responsive"}

Why does this happen? Well, we need to tell OpenAPI that configures security.

### Configure OpenAPI and Oauth2

To integrate OpenAPI 3 with OAuth2, open the *OpenApiConfig* class and add the new code.

```kotlin
@Configuration
public class OpenApiConfig {

  @Bean
  public OpenAPI customOpenAPI() {
    return new OpenAPI()
        .components(new Components()
                .addSecuritySchemes("spring_oauth", new SecurityScheme()
                        .type(SecurityScheme.Type.OAUTH2)
                        .description("Oauth2 flow")
                        .flows(new OAuthFlows()
                                .clientCredentials(new OAuthFlow()
                                        .tokenUrl("http://localhost:8080" + "/oauth/token")
                                        .scopes(new Scopes()
                                                .addString("read", "for read operations")
                                                .addString("write", "for write operations")
                                        ))))
        )
            .security(Arrays.asList(
                    new SecurityRequirement().addList("spring_oauth")))
        .info(new Info()
            .title("Book Application API")
            .description("This is a sample Spring Boot RESTful service using springdoc-openapi and OpenAPI 3.")
            .termsOfService("terms")
            .contact(new Contact().email("codersitedev@gmail.com").name("Developer: Moises Gamio"))
            .license(new License().name("GNU"))
            .version("2.0")
        );
  }
}
```

<div>
{%- include softwareDesignAd1.html -%}
</div>

From the previous code, you can see that before setting up a security requirement in OpenAPI, we need to define a new security scheme component called "spring_oauth" for example.

Now, rerun the main application, and we can see a new green button called Authorize. Then enter the credentials and the scope.

![oauth2authorize](/assets/images/oauth2authorize.jpg "oauth2 authorize"){:class="img-responsive"}

Close the pop-up and try out again to insert a book.

![oauth2PostOK](/assets/images/oauth2PostOK.jpg "oauth2 Post OK"){:class="img-responsive"}

Yes, you did it!

Now, your endpoints are secured and protected with OAuth2.

Please donate to maintain and improve this website if you find this content valuable.

<form action="https://www.paypal.com/donate" method="post" target="_top">
 <input type="hidden" name="hosted_button_id" value="UF4T364RTPPMJ" />
 <input type="image" src="https://www.paypalobjects.com/en_US/DK/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
 <img alt="" border="0" src="https://www.paypal.com/en_DE/i/scr/pixel.gif" width="1" height="1" />
</form>
<br/>