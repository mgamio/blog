---
layout: post
title:  "The Ubiquitous Language"
description: "Domain Driven Design aims to build strategic software based on domain models."
author: moises
categories: [ Domain-Driven Design ]
image: assets/images/theUbiquitousLanguage.jpg
comments: false
---

[Domain Driven Design](https://codercuy.com/domain-driven-design/){:target="_blank"} aims to build strategic software based on domain models and defines two fundamental concepts to achieve it.

- *Bounded Context* means that within the boundary, each component of the software model has a specific meaning and does particular things. For example, in a shopping application, we build components to support the *Sales Context* and others to support the *Buyer Context*.

- The *Ubiquitous Language* reflects a language spoken among team members working in the Bounded Context.

As developers, we need to choose appropriate names for our variables that reflect the business terms used in all communication channels during the design stage of our software model.

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

Some developers can specify the following class design when your bounded context is translated into source code.

```kotlin
public class Product {
  private int id;
  private String imageId;
  private String imageURL;
  
  //code omitted for brevity
}
```

We, as developers, define variables that usually follow what is specified in programming languages, frameworks, conventions, etc. But if we were involved for weeks in analyzing requirements, why not introduce business variable names in our code?

Ubiquitous language tries to introduce the influence of business communication structures on software. The following code aligns more with the relationship between IT and business stakeholders.

```kotlin
public class Product {
  private int id;
  private String mediaAssetID;
  private String mediaAssetURL;
  
  //code omitted for brevity
}
```

<div>
{%- include softwareDesign.html -%}
</div>
