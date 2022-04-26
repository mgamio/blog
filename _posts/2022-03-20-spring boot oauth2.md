---
layout: post
title:  "Spring Boot and OAuth2"
author: moises
categories: [ Jekyll, tutorial ]
image: assets/images/oauthRoles.jpg
---
This tutorial will show how to integrate OAuth2 with Spring Security in a Spring Boot application.

The Spring Boot application I am going to use is based on my previous article: <a href="https://codersite.dev/documenting-rest-api-openapi3/">Documenting a SpringBoot REST API with OpenAPI 3</a>

## OAuth

<a href="https://datatracker.ietf.org/doc/html/rfc6749">OAuth</a> is an authorization framework many companies use to secure access to its protected resources. It performs this by using access tokens.

The token represents a delegated right of access on behalf of the resource owner.

## Roles

OAuth defines four roles

- Resource Owner – the user who grants access to a protected resource.

- Resource Server – store user’s data and http services and respond to protected resource requests using access tokens.

- Client – the application which require access to protected resources on behalf of the resource owner and with its authorization.

- Authorization Server – responsible for authenticating user’s identity and gives an authorization token.

## Authorization grant

An authorization grant is a credential representing the resource owner's authorization used by the client to obtain an access token.

OAuth defines four grant types.

- Authorization Code, for web apps that are server-side apps

- Implicit, optimized for clients implemented in a browser using a scripting language such as JavaScript

- Resource Owner Password Credentials, used when there is a high degree of trust between the resource owner and the client

- Client Credentials, used when the client is requesting access to protected resources based on an authorization previously arranged with the authorization server.

The  Client Credentials grant type is the most appropriate for server-to-server applications, such as typical B2B interactions.

### Gettin Started

We add the Spring oauth dependency to our pom.xml file.

{% highlight ruby %}
<dependency>
  <groupId>org.springframework.security.oauth.boot</groupId>
  <artifactId>spring-security-oauth2-autoconfigure</artifactId>
  <version>2.5.1</version>
</dependency>
{% endhighlight %}

### Enable Authorization Server Support

We open the main application class and add @EnableAuthorizationServer to enable the support for the authorization server. 

{% highlight ruby %}
@EnableAuthorizationServer
@SpringBootApplication
public class OpenapiApplication {
	public static void main(String[] args) {
		SpringApplication.run(OpenapiApplication.class, args);
	}
}
{% endhighlight %}

@EnableAuthorizationServer enables the client credentials grant type by default.

### Creating ClientId and Client Secret

Open/create the resources/application.yml file and add the following properties:

{% highlight ruby %}
security:
  oauth2:
    client:
      client-id: codercuy-client
      client-secret: strong-secret
      scope:
        - read
        - write
{% endhighlight %}

Now, we need to tell Spring which endpoints -resources- must be authenticated. Otherwise, all requests will skip security.

### Enable Resource Server Support

Create a class that extends ResourceServerConfigurerAdapter and add the following code.

{% highlight ruby %}
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
{% endhighlight %}

Now, run the main application.

<a href="http://localhost:8080/swagger-ui.html" target="_blank">http://localhost:8080/swagger-ui.html</a>

And try to insert a book (Try out button). In bookAuthorization parameter write anything ("key" for example).

Then you receive an error.

![oauth2Post](/assets/images/oauth2Post.jpg){:class="img-responsive"}

Why this happens? Well, we need to tell openapi that configure security.

### Configure openapi and oauth2

Open OpenApiConfig class and add the new code.

{% highlight ruby %}
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
{% endhighlight %}

Now, rerun the main application, and we can see a new green button called Authorize. Then enter the credentials and the scope.

![oauth2authorize](/assets/images/oauth2authorize.jpg){:class="img-responsive"}

Close the pop-up and try out again to insert a book.

![oauth2PostOK](/assets/images/oauth2PostOK.jpg){:class="img-responsive"}

Yes, you did it!

Now, your endpoints are secured.