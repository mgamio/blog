---
layout: post
title:  "Ubiquitous Language in Domain-Driven Design: How to Build One, with Java Examples"
description: "What a ubiquitous language is, why it belongs to one bounded context, and six practices to build one, with Java examples and an anti-corruption layer for external APIs."
author: moises
categories: [ Domain-Driven Design ]
image: /assets/images/theUbiquitousLanguage.jpg
comments: false
---

The business people say *delivery note*, the ticket says *shipping document*, and the code says `DocService.getDoc()`. Every conversation needs a translation, and every translation is a chance for a bug. **Domain-Driven Design** (DDD) solves this with a *ubiquitous language*: one set of words that business experts and developers share and use everywhere, from meetings to source code. This post explains what a ubiquitous language is, why it belongs to one *bounded context*, and six practices to build one, with Java examples.

## Domain, Model and Bounded Context

- A **domain** is the area of knowledge your software works in: online retail, insurance, logistics.
- A **domain model** captures the parts of that domain that matter for the problem you're solving.
- A **bounded context** is a part of the system with an explicit boundary, its own model and usually its own team. An online shop could have *Catalog*, *Ordering* and *Shipping* contexts.
- The **ubiquitous language** is the vocabulary that the team uses *inside one bounded context*, in conversations, documents, tickets, tests and code.

The key point is that **a word can mean different things in different contexts**. In the Catalog, a *product* has a description, a price and images. In the Warehouse, a *product* has a stock level and a shelf location. Both are correct, in their own context. Trying to build one `Product` class for the whole company produces a class that nobody understands. Contexts stay loosely coupled and exchange data through explicit interfaces, such as a [REST API](https://codersite.dev/rest-api-overview/){:target="_blank"}.

![A bounded context containing a model with a Product class, and the ubiquitous language that applies inside that boundary](/assets/images/ubiquitousLanguage.jpg "A bounded context and its ubiquitous language"){:class="img-responsive"}

## Case Study: Product Images from a Vendor

A company runs an online shop that sells T-shirts from several vendors. One vendor doesn't want to upload product images twice, so it offers access to its own API. Business experts and developers from both companies work closely to clarify the requirements:

- The vendor's API identifies an image by a *mediaAssetId*.
- Several emails later, everyone agrees how to build the URL that returns the image file from a *mediaAssetId*.

A first version of the class could look like this:

```java
public class Product {
  private int id;
  private String imageId;
  private String imageURL;
  // ...
}
```

`imageId` is a technical name. It doesn't say where the ID comes from, and in a large system other parts of the code may already use *imageId* for something else. Developers often pick names from conventions and frameworks instead of from the business. After weeks of requirements meetings, the business words are right there: use them. [Clean code](https://codersite.dev/clean-code/){:target="_blank"} calls this *names that reveal intent*.

But which business words? It's tempting to copy the vendor's words and write `mediaAssetId` everywhere. That's a trap: **the vendor's API is a different bounded context**, with *its* language. If its terms spread through our code, every change on the vendor's side changes our model too, and the next vendor, who calls it *pictureRef*, makes it worse.

<div>
{%- include inArticleAds.html -%}
</div>

### Translate at the Boundary: an Anti-Corruption Layer

DDD's answer is an **anti-corruption layer**: one place that knows both languages and translates between them. In our catalog, the domain experts talk about *product images*, so that's what the model says:

```java
// Our Catalog context: our language
public record ProductImageId(String value) {}

public record ProductImage(ProductImageId id, URI url) {}

public class Product {
  private final String sku;
  private final List<ProductImage> images;
  // ...
}
```

The vendor's language stays in the integration package:

```java
// The vendor's context: their language, used only in the integration package
public record MediaAsset(String mediaAssetId, String mimeType) {}

// Anti-corruption layer: the only class that knows both languages
public class VendorImageTranslator {

  private final URI vendorBaseUrl;

  public VendorImageTranslator(URI vendorBaseUrl) {
    this.vendorBaseUrl = vendorBaseUrl;
  }

  public ProductImage toProductImage(MediaAsset asset) {
    URI url = vendorBaseUrl.resolve("media-assets/" + asset.mediaAssetId() + "/content");
    return new ProductImage(new ProductImageId(asset.mediaAssetId()), url);
  }
}
```

For a `MediaAsset` with ID `MA-48213`, the translator returns:

```text
ProductImage[id=ProductImageId[value=MA-48213], url=https://api.vendor.example/v2/media-assets/MA-48213/content]
```

When developers talk to the vendor, they say *media asset*. When they talk to their own business experts, they say *product image*. Both conversations match the code, and if the vendor changes its API, only the translator changes.

Eric Evans introduced the ubiquitous language, bounded contexts and the anti-corruption layer in the book that started DDD. It's still the best source:

<div>
{%- include domainDrivenDesignAd.html -%}
</div>

## Never Assume: Ask About Ambiguous Words

You get a task to build a service that returns the documents that go with a delivery of goods, and you call it `ShippingNoteService`. In the next meeting, a domain expert looks confused: a *shipping note* is a specific document for freight transport, and the company doesn't use it. The paper that goes with every delivery to a customer is the **delivery note** (in German, *Lieferschein*).

```java
public interface DeliveryNoteService {
  DeliveryNote createFor(Order order);
}
```

A five-minute question saved a wrong name that would have confused every developer and business expert after you. When a word is unclear, or two words seem to mean the same thing, ask. Synonyms in the language usually mean that the model isn't clear yet.

## How to Establish a Ubiquitous Language: 6 Practices

1. **Keep a glossary in the repository.** A simple `GLOSSARY.md` with each term, its meaning, and the words *not* to use (for example: "delivery note, not shipping note or dispatch document"). It's reviewed like code.
2. **Model together with domain experts.** Workshops such as *event storming*, where experts and developers put business events on a wall, bring out the words the business really uses.
3. **Use the words everywhere.** The same term in conversations, tickets, API endpoints, database tables and class names. If the ticket says *delivery note*, the code shouldn't say `Document`.
4. **Write tests in the domain language.** A test called `deliveryNoteListsEveryItemOfTheOrder()` documents the business rule, and a domain expert can read it.
5. **Rename when the language changes.** When the team learns a better word, refactor the code. Modern IDEs make renames safe; an outdated name costs more every day.
6. **Translate at the boundaries.** Each bounded context keeps its own language, and external systems are translated by an anti-corruption layer, as in the case study.

Business concepts get business names, while technical parts such as `Repository`, `Controller` or `Mapper` keep their technical names. The goal is not to remove technical words, but to make sure the business part of the code reads like the business.

The ubiquitous language tells you *what* to call things. Turning a domain model into classes that stay easy to change is the next step, and that's what my book covers, with Java examples:

<div>
{%- include softwareDesign.html -%}
</div>

<div>
{% include buymeacoffee.html %}
</div>

<br/>
