---
layout: post
title:  "Introduce business terminology into your variable names"
description: "Domain Driven Design aims to build strategic software based on domain models."
author: moises
categories: [ Domain-Driven Design ]
image: assets/images/theUbiquitousLanguage.jpg
comments: false
---

A *Domain* is an area of knowledge associated with a problem we are trying to solve.

A *Domain Model* represents those aspects of a domain that are relevant to a particular problem.

[Domain Driven Design](https://codercuy.com/domain-driven-design/){:target="_blank"} aims to build strategic software based on domain models and defines two fundamental concepts to achieve it.

- *Bounded Context* is a subsystem that defines a specific responsibility with an explicit boundary. For example, in a shopping application, we build specific components to support the *Sales Context* and others to support the *Buyer Context*.

- The *Ubiquitous Language* reflects a language spoken among team members working in the Bounded Context.

Using bounded contexts reduces coupling between subsystems, and we can exchange data between them via explicit [API](https://codersite.dev/documenting-rest-api-openapi3/){:target="_blank"}, avoiding dependencies.

As developers, we need to choose appropriate names for our variables that reflect the business terms used in all communication channels during the design stage of our domain models.

## Case study

Business-to-business (B2B) is a business conducted between one company and another.

A leading company implements an e-commerce portal to sell t-shirt products from various vendors and manufacturers.

A vendor wants to avoid duplication of effort to manually upload images on both sides and asks the lead company to use an internal API to update their product images.

<div>
{%- include inArticleAds.html -%}
</div>

During the integration process, business experts and developers are in constant communication to clarify requirements. For example.

- The vendor communicates to the development team that its internal API describes a *mediaAssetID* attribute to uniquely identify an image object in its domain.
- Email interactions occur to clarify how to build a URL path to retrieve the final image object using the *mediaAssetID* attribute.

![ubiquitous Language](/assets/images/ubiquitousLanguage.jpg){:class="img-responsive"}

## Understand business concepts before translating them into source code

The ubiquitous language is the language of the business. Technical names are not allowed to describe the business domain. It is a set of concepts and vocabulary shared between everyone on the team.

Some developers can specify the following class design when your bounded context is translated into source code.

```kotlin
public class Product {
  private int id;
  private String imageId;
  private String imageURL;
  
  //code omitted for brevity
}
```

The *imageId* attribute is a good name, but other business domains may already use it. We, as developers, sometimes disconnect from business and look for variable names that usually follow conventions, standards, programming languages, framework recommendations, or technical terms.

If we've been involved in requirements analysis for weeks, why not introduce the same business terminology into our variable names? [Variable names reveal intent](https://codersite.dev/clean-code/){:target="_blank"}. 

Ubiquitous language tries to introduce the influence of business communication structures on software. Whenever you can, try to introduce business terminology into your variable names.

```kotlin
public class Product {
  private int id;
  private String mediaAssetID;
  private String mediaAssetURL;
  
  //code omitted for brevity
}
```

## Never assume and ask questions to clarify ambiguous and synonyms terms

You receive a task to implement a service to retrieve documents used in the shipment of goods, and you decide to call it  ***shipping notes***. But your business doesn't ship goods by the sea! 

Ask always questions to your colleagues and business experts to clarify business concepts. Then you will realize that your service should implement ***delivery notes***.

The following class design represents a fundamental concept in the domain expert’s mental model.

```kotlin
public interface DeliveryNoteService {

  //code omitted for brevity
}
```

Use the ubiquitous language as a tool for effective communication and knowledge sharing.

Learn more about analysis and software design with this practical guide.

<a href="https://amzn.to/3q7otGe" target="_blank"><img style="border:1px solid black;" alt="codersite" border="0" width="265" height="380" src="../assets/images/SoftwareDesignPortadaJPG.jpg" ></a>