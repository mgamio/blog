---
layout: post
title:  "How to establish an effective ubiquitous language in domain-driven design"
description: "Domain Driven Design aims to build strategic software based on domain models. Domain modeling in microservices architecture"
author: moises
categories: [ Domain-Driven Design ]
image: assets/images/theUbiquitousLanguage.jpg
comments: false
---

A *Domain* is an area of knowledge associated with a problem we are trying to solve.

A *Domain Model* represents those aspects of a domain that are relevant to a particular problem.

[Domain Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design){:target="_blank"} aims to build strategic software based on domain models and defines two fundamental concepts to achieve it.

- *Bounded Context* is a subsystem that defines a specific responsibility with an explicit boundary. For example, in a shopping application, we build specific components to support the *Sales Context* and others to support the *Buyer Context*.

- The *Ubiquitous Language* reflects a language spoken among team members working in the Bounded Context.

Using bounded contexts reduces coupling between subsystems, and we can exchange data between them via explicit [API](https://codersite.dev/documenting-rest-api-openapi3/){:target="_blank"}, avoiding dependencies.

As developers, we must choose appropriate names for our variables that reflect the business terms used in all communication channels during the Domain modeling design stage.

![ubiquitous Language](/assets/images/ubiquitousLanguage.jpg "bounded context"){:class="img-responsive"}

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

We want to introduce business terminology into our variable names

## Understand business concepts before translating them into source code

The ubiquitous language is the language of the business. Technical names are not allowed to describe the business domain. Ubiquitous language in software development is a set of concepts and vocabulary shared between everyone on the team.

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

One of the benefits of using ubiquitous language is introducing the influence of business communication structures on software. Whenever you can, try to introduce business terminology into your variable names.

By introducing a better name for our variables, we can establish an effective ubiquitous language in domain-driven design

```kotlin
public class Product {
  private int id;
  private String mediaAssetID;
  private String mediaAssetURL;
  
  //code omitted for brevity
}
```

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Domain-Driven Design: Tackling Complexity in the Heart of Software <a href="https://t.co/UJcmA5FpLo">https://t.co/UJcmA5FpLo</a> via <a href="https://twitter.com/amazon?ref_src=twsrc%5Etfw">@amazon</a></p>&mdash; Moises Gamio (@MoisesGamio) <a href="https://twitter.com/MoisesGamio/status/1839044643658330294?ref_src=twsrc%5Etfw">September 25, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## Never assume and ask questions to clarify ambiguous and synonyms terms

You receive a task to implement a service to retrieve documents used in the shipment of goods, and you decide to call it  ***shipping notes***. But your business doesn't ship goods by the sea! 

Ask always questions to your colleagues and domains experts to clarify business concepts. Then you will realize that your service should implement ***delivery notes***.

The following class design represents a fundamental concept in the domain expert’s mental model.

```kotlin
public interface DeliveryNoteService {

  //code omitted for brevity
}
```

Use the ubiquitous language as a tool for effective cross-team collaboration and knowledge sharing. 

Using the Ubiquitous language in agile software development and in domain modeling of microservices architecture is a common practice.

> Any software design is generally a matter of opinion. There is no definitive Guide. -- <cite>codersite.dev</cite>

<div>
{%- include softwareDesign.html -%}
</div>