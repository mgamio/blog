---
layout: post
title:  "Best practices for writing Clean Code"
description: "Software development best practices. Writing maintainable code. Clean code examples for real-world scenarios"
author: moises
categories: [ Coding Practices ]
image: assets/images/cleanCode.jpg
comments: false
---

Clean code can be read and enhanced by a developer other than its original author. 

This kind of practice [Robert C Martin](https://amzn.to/3rAejgU){:target="_blank"} introduced it.

If you want to be a better programmer, you must follow these recommendations.

## Clean Code has Intention-Revealing names

Names reveal intent. Someone who reads your code must understand the purpose of your variable, function, or class.

Real situation:

```kotlin
int sId; //supplier Id
int artDelPrice;
```

It must be refactored to this:

```kotlin
int supplierId;
int articleDeliveredPrice;
```

Even with external dependencies:

```kotlin
private Z_E2F_RS_Result e2fResult; //ingredients recordset
```

It must be refactored to this:

```kotlin
private Z_E2F_RS_Result ingredients;
```

<div>
{%- include inArticleAds.html -%}
</div>

Imagine that we dont have the //ingredients comment in e2fResult variable. Then, further in any part of our code, when we try to process this variable, we have the following sentence:

```kotlin
e2f = e2fResult[i];
```

And we don’t know what does e2f means!. Well, someone suggests asking the person responsible for this code. But that guy is not at the office. Well, send it an email, and he is on holiday!.

But if instead we adopt names which reveal intent from beginning, we could avoid these catastrophic scenarios.

```kotlin
ingredient = ingredients[i];
```

## Clean Code tells a story

When we try to fix bugs, when analyzing the secuence of actions (functions, methods), we realize the code does not communicate well the logical flow of these actions. It’s a nightmare to decode the meaning of these actions.

This will always happen because our initial design based on the initial requirements change over time. As developers, we are responsible for refactoring our code to made it a simple story that everybody can understand. For example, look at the following code:

```kotlin
ACMEWebServiceClient.login();
if (process.equals("core") {
    ACMEWebServiceClient.transfer_buyersCoreData_to_ACME();
}
if (process.equals("status")) {
    ACMEWebServiceClient.transfer_buyersStatusChanges_to_ACME();
}
if (process.equals("events")) {
    ACMEWebServiceClient.transfer_events_to_ACME();
}
ACMEServiceClient.logout();
```

<div>
{%- include inArticleAds.html -%}
</div>

## Functions should do one thing

Imagine we want to retrieve image objects from an external web service. 

Firstly, we receive image metadata that informs different values to decide if an image is valid or not, and one of these values is an image identifier to retrieve the final image object.

```kotlin
private String retrieveImageId(String[] values) {
  
  if (!values[2].equals("Y") || !values[3].equals("Y"))
    return null;
	
    String imageId = null;
    //get the first not null value as the imageId
    if (values[4] != null) {
      imageId = values[4]; //imageAIXId
    } else if (values[5] != null) {
      imageId = values[5]; //imageLIXId
    } else if (values[6] != null) {
      imageId = values[6]; //imageOIXId
    }

    return imageId;
}
```

The previous code is doing more than one thing: validate and retrieve.

Each thing should implement only one level of abstraction. Therefore we proceed to refactor it.

```kotlin
private boolean validateImage(String[] values) {
  
  if (!values[2].equals("Y") || !values[3].equals("Y"))
    return false;
	
  return true;
}
```

<div>
{%- include inArticleAds.html -%}
</div>

```kotlin
private String retrieveImageId(String[] values) {
  
  String imageId = null;
  //get the first not null value as the immageId
  if (values[4] != null) {
    imageId = values[4]; //imageAIXId
  } else if (values[5] != null) {
    imageId = values[5]; //imageLIXId
  } else if (values[6] != null) {
    imageId = values[6]; //imageOIXId
  }

  return imageId;
}
```

Here is an example of how to use these new smaller functions.

```kotlin
public void syncronizeImages () {
  
  Response response = api.getImages();
  Row[] rows = response.getRows();
  for (Row row : rows) {
    String[] values = row.getValues();
    if (validateImage(values)) {
      String imageId = retrieveImageId(values);
      //call ULR to retrieve image object
      //code omitted for brevity
    }
  }
}
```

<div>
{%- include inArticleAds.html -%}
</div>

## Don't comment bad code, rewrite it

Imagine you requested metadata from a list of articles, but the external API, for any reason, includes additional articles in its response object. Before processing their metadata, you want to check that retrieved articles are inside your temporal map of requested articles. Introduces a comment to alert your colleagues.

```kotlin  
public void syncronizeImages () {

  Response response = api.getImages(mapOfArticles);
  Row[] rows = response.getRows();
  for (Row row : rows) {
    String[] values = row.getValues();
    String articleId = values[1];
    
    //only requested articles
    if (!mapOfArticles.containsKey(articleId))
      continue;
	  
    //code omitted for brevity
  }
}
```

You can avoid this extra unnecessary comment if you express in your code what you want to communicate by renaming the map variable name.

```kotlin  
public void syncronizeImages () {

  Response response = api.getImages(mapOfRequestedArticles);
  Row[] rows = response.getRows();
  for (Row row : rows) {
    String[] values = row.getValues();
    String articleId = values[1];
    
    if (!mapOfRequestedArticles.containsKey(articleId))
      continue;
	  
    //code omitted for brevity
  }
}
```

Now, your code is more expressive.

<div>
{%- include inArticleAds.html -%}
</div>

## Choose simplicity over complexity

As developers, sometimes we use ternary conditional operators that take less space, but when we introduce more variables, the code is not readable or is more difficult to evolve.

For example, when we try to build the article’s image URL, we need to evaluate if an image is valid and if the image is not restricted; if it is restricted, we need to assess whether a partner can retrieve this image.

```kotlin  
String articleImageURL = (imageId <= 0 || (imageIdIsRestricted && !partnerCanSeeImage)) ? null : IMAGE_URL + imageId;
```

The previous code can be refactored using nested if-else statements, which is easier to understand.

```kotlin  
String articleImageURL = null;
if (imageId > 0) {
  if (imageIdIsRestricted) {
    if (partnerCanSeeImage) {
      articleImageURL = IMAGE_URL + imageId;
    }
  } else {
    articleImageURL = IMAGE_URL + imageId;
  }
}
```

Even the KISS (Keep It Simple, Stupid) principle suggests that developers should strive for simplicity and avoid unnecessary complexity. This makes code easier to understand, maintain, and debug.

> Any software design is generally a matter of opinion. There is no definitive Guide. -- <cite>codersite.dev</cite>

<div>
{%- include softwareDesign.html -%}
</div>

## Avoid hard coding

Hard coding is embedding data directly into the source code instead of obtaining the data from external sources.

Sometimes we can't avoid including conditional statements using hardcoded values because we need to implement them in a production environment immediately. There are hundreds of reasons why this happens because every company is different.

A company wants to implement in its code validation of customers who have the right to view images from certain providers.

The standard procedure in this company starts with a requirement to the DBA to implement a database function to retrieve a list of providers with this kind of restriction, create param classes for the developers, a period of implementation in a development environment, and its tests in a test environment, and deliver to the production environment.

But the company is facing problems with image author property rights and does not have the resources to implement the requirement, then decides to introduce hard-coded values.

```kotlin  
 boolean picIsRestricted = result.getProviderId() == "530636" || result.getProviderId() == "36507"; 
```

We usually forget the standard procedure to implement the solution because our code is already working. But these hard code values are required in other modules, packages, and classes and may need to validate more providers, etc., and the effort to maintain the code increase exponentially. And I think you know the rest of the history.

You can implement a little function to retrieve external data from a text file.

```kotlin  
public interface DataService {

  public List<String> getRestrictedProviders() throws Exception;

}
```

Then, you can implement your hard-coded values in an implementation class.

```kotlin  
public class DataServiceImpl implements DataService {

  @Override
  public List<String> getRestrictedProviders() throws Exception {
    List<String> listOfRestrictedProviders = new ArrayList<>();
    Resource resource = new ClassPathResource("providers.txt");
      try {
        List<String> allLines = Files.readAllLines(Paths.get(resource.getURI()));
        for (String provider : allLines) {
          listOfRestrictedProviders.add(provider);
          //TODO retrieve data from a standard database function
        }
      } catch (IOException e) {
        e.printStackTrace();
      }
    return listOfRestrictedProviders;
  }
}
```

<div>
{%- include inArticleAds.html -%}
</div>

Then, you can always reuse the same validation in any place of your code.

```kotlin  

  List<String> listOfRestrictedProviders = dataService.getRestrictedProviders();

  boolean picIsRestricted = listOfRestrictedProviders.contains(result.getProviderId());

}
```

The day you decide to implement the standard procedure - database function - your effort in refactoring your code will be minimal.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Clean Code: A Handbook of Agile Software Craftsmanship (Robert C. Martin) <a href="https://t.co/ARf0FUDzRw">https://t.co/ARf0FUDzRw</a> via <a href="https://twitter.com/amazon?ref_src=twsrc%5Etfw">@amazon</a></p>&mdash; Moises Gamio (@MoisesGamio) <a href="https://twitter.com/MoisesGamio/status/1838935023786905637?ref_src=twsrc%5Etfw">September 25, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## Name your variables according to the context

It is usual to have an attribute that applies to two different objects. For example, an Buyer Object has an email address.

```kotlin  
public class Buyer {

  private int buyerId;
  private String lastName;
  private String email;
  
  //code omitted for brevity
}
```

We can see the same attribute in a Supplier Object.

```kotlin  
public class Supplier {

  private int supplierId;
  private String contact;
  private String email;
  
  //code omitted for brevity
}
```

When retrieving an email from a supplier object, we may lose the context.

```kotlin  
String email = supplier.getEmail();
```

Further in our code, we may be unsure if the email variable refers to a Supplier or a Buyer.

I prefer to define the schemas of our Objects based on the context.

```kotlin  
public class Buyer {

  private int buyerId;
  private String buyerLastName;
  private String buyerEmail;
  
  //code omitted for brevity
}
```

We do the same for the Supplier object.

```kotlin  
public class Supplier {

  private int supplierId;
  private String supplierContact;
  private String supplierEmail;
  
  //code omitted for brevity
}
```

The most advanced editors provide coding assistance features such as variable name suggestions as you type.

```kotlin  
String supplierEmail = supplier.getSupplierEmail();

String buyerEmail = buyer.getBuyerEmail();
```

## Method Overloading

Suppose we already have a function communicating well with an external service.

We send data to subscribe to the external service for a new buyer.

```kotlin  
public int subscribe(String email, Buyer buyer) {
  //code omitted for brevity
}
```

This function is called from several parts of a program.

```kotlin  
subscriberId = WSClient.subscribe(email, buyer);
}
```

Now, we want to send new buyers, but at the same time, we want to inform the external service to take action based on a specific tagged attribute.

If we decide to refactor the function to accept a new argument, we need to change our program in all parts that call the function, even when they dont need to pass the new attribute.

```kotlin  
subscriberId = WSClient.subscribe(email, buyer, null);
}
```

We can introduce a new function with the same name but with a new parameter.

```kotlin  
public int subscribe(String email, Buyer buyer, Integer tagId) {
  //code omitted for brevity
}

public int subscribe(String email, Buyer buyer) {
  //code omitted for brevity
}
```

Only new parts of the program that need to use the new functionality call the new method.

```kotlin  
subscriberId = WSClient.subscribe(email, buyer, 102911);
}
```

Method overloading increases the readability and reusability of the program.

## Avoid Too Many Arguments In Functions

Sometimes, we write functions containing more than three arguments, like this function:

```kotlin
public boolean validateAddress(String street, int number, String postalCode, String city, String country) {
  //code omitted for brevity
}
```

As all these arguments belong to an Address concept, we can pass an Object as an argument.

```kotlin
public boolean validateAddress(Address address) {
  //code omitted for brevity
}
```
 
Applications of clean code:

* Refactoring techniques for improving code cleanliness
* Achieving maintainability through clean code practices
* Clean code practices for agile software development teams
* Code review checklist for ensuring clean code
* Clean code in object-oriented programming
* Clean code practices for improving software security
* Clean code practices for improving code collaboration
* Clean code and continuous integration/continuous deployment (CI/CD)

Please donate to maintain and improve this website if you find this content valuable.

<form action="https://www.paypal.com/donate" method="post" target="_top">
 <input type="hidden" name="hosted_button_id" value="UF4T364RTPPMJ" />
 <input type="image" src="https://www.paypalobjects.com/en_US/DK/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
 <img alt="" border="0" src="https://www.paypal.com/en_DE/i/scr/pixel.gif" width="1" height="1" />
</form>
<br/>

You can see a lot of typical algorithms implemented with Clean Code principles in the following [link](https://amzn.to/3PiUs0w){:target="_blank"}

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

<p><iframe style="width:100%;" height="550" src="https://www.youtube.com/embed/qf4vJrhNQn0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></p>
