---
layout: post
title:  "Spring REST - Automate an API Client Request"
description: "Creating a program to automate an API Client Request."
author: moises
categories: [ programming ]
image: assets/images/apiClientRequest.jpg
comments: false
---

We will create an [API Client](https://codersite.dev/building-rest-api-client/){:target="_blank"} to automate the creation of an Order based on a combination of Buyers, Suppliers, Customer Numbers, and Articles.

You can find the API specification in the following link.

[Order API](https://app.swaggerhub.com/apis-docs/MGAMIO/selly-order_api/3.0.0){:target="_blank"}.

## Test Program

Once a User is logged in, it can access a pool of Buyers. A Buyer can order articles from different Suppliers. But first, every Buyer must be identified by a unique customer number to proceed with creating orders.

We proceed in that way because they are required parameters:

![articlesEndpoint](/assets/images/articlesEndpoint.jpg "springOAuth"){:class="img-responsive"}

Once the program localize at least on article navigating throuhg these entities, we build an order, send the request and abort the program.

### What we need to use in the Program

**continue statement**

The continue statement is used when we want to skip a particular condition and continue the rest execution. Java continue statement is used for all type of loops but it is generally used in for, while, and do-while loops.

**break keyword**

The break keyword in Java is used to terminate the execution of a loop or switch statement prematurely. When a break statement is encountered, control is transferred to the statement immediately following the enclosing loop or switch.

**OAuth2RestTemplate**

Rest template that is able to make [OAuth2](https://codersite.dev/spring-boot-oauth2/){:target="_blank"}-authenticated REST requests with the credentials of the provided resource.

We define a boolean variable to control when an article is found.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Mastering API Architecture: Design, Operate, and Evolve Api-Based Systems <a href="https://t.co/aMS6zALy4Y">https://t.co/aMS6zALy4Y</a> via <a href="https://twitter.com/amazon?ref_src=twsrc%5Etfw">@amazon</a></p>&mdash; Moises Gamio (@MoisesGamio) <a href="https://twitter.com/MoisesGamio/status/1853702456821055859?ref_src=twsrc%5Etfw">November 5, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Here the program code.

```kotlin
public final class CreateOrderRandomTest {

  private static final Logger logger = LoggerFactory.getLogger(CreateOrderRandomTest.class);
  
  private static ResourceOwnerPasswordResourceDetails resourceDetails;
  private static OAuth2RestTemplate restTemplate;
  private static HttpHeaders headers;

  static String apiHost = "http://localhost:41231/cloud";
  static String tokenUri = apiHost + "/oauth/token";
  static String url = apiHost + "/api/v2/";
  static String clientId = "your_clientId"; 
  static String secret = "your_secrret";

  public static void main(String[] args) {

    headers = new HttpHeaders();
    restTemplate = buildRestTemplate(clientId, secret);

    try {

      String urlRequest = url + "buyers";

      HttpEntity<String> entity = new HttpEntity<String>(headers);
      ResponseEntity<List<Buyer>> listOfBuyersResponse = restTemplate.exchange(urlRequest, 
          HttpMethod.GET, entity, new ParameterizedTypeReference<List<Buyer>>(){});

      List<Buyer> listOfBuyers = listOfBuyersResponse.getBody();
	  
      boolean atLeastOneCustomerNumberWithArticles = false;
	  
      for (Buyer buyer : listOfBuyers) {
	  
        urlRequest = url + "suppliers";
		
        ResponseEntity<List<Supplier>> listOfSuppliersResponse = restTemplate.exchange(urlRequest + "?buyerId=" + buyer.getBuyerId(), 
            HttpMethod.GET, entity, new ParameterizedTypeReference<List<Supplier>>(){});
        
        List<Supplier> listOfSuppliers = listOfSuppliersResponse.getBody();
        
        if (listOfSuppliers.size() == 0)
          continue;
		  
          for (Supplier supplier : listOfSuppliers) {
		  
            urlRequest = url + "customerNumbers";
			
            ResponseEntity<List<CustomerNumber>> listOfCustomerNumbersResponse = restTemplate.exchange(
                urlRequest + "?buyerId=" + buyer.getBuyerId() + "&supplierId=" + supplier.getSupplierId(), 
                HttpMethod.GET, entity, new ParameterizedTypeReference<List<CustomerNumber>>(){});

            List<CustomerNumber> listOfCustomerNumbers = listOfCustomerNumbersResponse.getBody();

            if (listOfCustomerNumbers.size() == 0)
              continue;

              for (CustomerNumber customerNumber : listOfCustomerNumbers) {
                
                urlRequest = url + "articles";
				
                ResponseEntity<List<Article>> listOfArticlesResponse = restTemplate.exchange(urlRequest + "?buyerId=" + buyer.getBuyerId() + 
                    "&supplierId=" + supplier.getSupplierId() + "&customerNumberId=" + customerNumber.getCustomerNumberId(), 
                    HttpMethod.GET, entity, new ParameterizedTypeReference<List<Article>>(){});

                List<Article> listOfArticles = listOfArticlesResponse.getBody();

                if (listOfArticles.size() == 0)
                  continue;

                  for (Article article : listOfArticles) {

                    urlRequest = url + "orders";

                    Order order = buildOrder(buyer, supplier, customerNumber, article);
                    HttpEntity<Order> orderEntity = new HttpEntity<Order>(order, headers);
                    ResponseEntity<Order> responseEntity = restTemplate.exchange(urlRequest, HttpMethod.POST, orderEntity, Order.class);

                    Order orderResponse = responseEntity.getBody();
                    logger.info(responseEntity.getStatusCode().toString());
                    break;
                  }
                  
                  atLeastOneCustomerNumberWithArticles = true;
                  logger.info("buyerId = " + buyer.getBuyerId() + ", supplierId = " + supplier.getSupplierId() + 
                      ", customerNumberId = " + customerNumber.getCustomerNumberId());
                  break;


              } //end-for listOfCustomerNumbers

              if (atLeastOneCustomerNumberWithArticles == true)
                break;

          } //end-for listOfSuppliers

          if (atLeastOneCustomerNumberWithArticles == true)
            break;

      } //end-for listOfBuyers
						
    } catch (HttpClientErrorException e) {
      //code omitted for brevity
    } catch (Exception e) {
      logger.error("error:  " + e.getMessage());
    }
  }

  private static Order buildOrder(Buyer buyer, Supplier supplier, CustomerNumber customerNumber, Article article) {
    Order order = new Order();
    order.setBuyerId(buyer.getBuyerId());
    order.setSupplierId(supplier.getSupplierId());
    //code omitted for brevity
	
    return order;
  }
	
  private static OAuth2RestTemplate buildRestTemplate(String clientId, String secret) {
    resourceDetails = new ResourceOwnerPasswordResourceDetails();
    //code omitted for brevity

    DefaultOAuth2ClientContext clientContext = new DefaultOAuth2ClientContext();
    restTemplate = new OAuth2RestTemplate(resourceDetails, clientContext);
    restTemplate.setMessageConverters(asList(new MappingJackson2HttpMessageConverter()));

    return restTemplate;
  }
}
```

Please donate to maintain and improve this website if you find this content valuable.

<form action="https://www.paypal.com/donate" method="post" target="_top">
 <input type="hidden" name="hosted_button_id" value="UF4T364RTPPMJ" />
 <input type="image" src="https://www.paypalobjects.com/en_US/DK/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
 <img alt="" border="0" src="https://www.paypal.com/en_DE/i/scr/pixel.gif" width="1" height="1" />
</form>
<br/>

<div>
{%- include jediJavaInterviewAds.html -%}
</div>
