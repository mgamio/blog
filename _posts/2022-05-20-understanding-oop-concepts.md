---
layout: post
title:  "Understanding Object-Oriented Programming concepts"
description: "Object-oriented concepts give you a solid foundation for making critical design decisions."
author: moises
categories: [ Object-Oriented ]
image: assets/images/oop.jpg
featured: true
hidden: false
comments: false
---

Object-oriented concepts give you a solid foundation for making critical design decisions.

## Class

A class is a template or prototype that describes what an object will be. It defines its attributes(data) and behavior(methods). We must design a class before creating an object.

## Object

An object is an instance of a class. When we create an object, we create real-world entities such as cars, bicycles, or dogs with their own attributes and own behaviors.

![class and object](/assets/images/carClass.jpg){:class="img-responsive"}

In Java, we instantiate an object via the *new* keyword. When you design a class follow the [Single Responsibility Principle (SRP)](https://codersite.dev/solid-principles-the-definitive-guide/){:target="_blank"}.

<div>
{%- include inArticleAds.html -%}
</div>

## Abstraction

Abstraction allows an object telling to its users what an application does instead of how it does it. You can see the essential buttons on your TV remote control, but you don't care what happens behind when you press one of these buttons. In Java, we create abstractions via Interfaces and Abstract classes.

## Encapsulation and Data Hiding

Restricting access to specific attributes and methods is called *data hiding*. Objects should not manipulate the data of other objects. 

Encapsulation is the action of combining the data and methods in the same entity. In this way, we control access to the data in the object.

## Inheritance

Inheritance is a process in which a class inherits the attributes and methods of another class.

Inheritance provides the ability to create new classes with new functionalities while maintaining the functionalities inherited. In this way, it promotes code reusability.

This relationship is an *is-a* relationship because when a subclass inherits from a superclass, it can do anything that the superclass can do. 

In Java, we create inheritance between classes via the *extends* keyword.

<div>
{%- include inArticleAds.html -%}
</div>

## Polymorphism

Polymorphism means many shapes and is coupled to inheritance. For example, a Shape class defines a *draw* method, but Square and Circle's subclasses will implement it differently.

## Composition

The composition provides a mechanism for building classes from other classes. In Java, we usually create a class with instance variables that references one or more objects of other classes.

The benefit of separating one class from another one is the Reuse.

For example, in a shopping context, we need a list of requested items and an *address* where to deliver the order.

```kotlin
public class Order {

  private int clientId;
  private List<Item> orderItems;
  private Address shippingAddress;
  
  //code omitted for brevity
}
```

We build an Item class including an Article class.

```kotlin
public class Item {

  private Article article;
  private double quantity;
  
  //code omitted for brevity
}
```

And the Article class includes enough attributes to support the shopping business.

```kotlin
public class Article {

  private int id;
  private String name;
  private double deliveryPrice;
  
  //code omitted for brevity
}
```

Even we can reuse the Article class to support a Search request.

```kotlin
public class SearchResponse {

  private List<Article> articles;
  
  //code omitted for brevity
}
```

<div>
{%- include softwareDesignAd1.html -%}
</div>

What happens if the business wants to introduce articles in a country where some articles are forbidden to trade?.

We can not add a new attribute called *tradable* to the Article class because we will never use it in normal countries.

Here, we can use the other technique to build new classes: inheritance.

![class and object](/assets/images/tradableArticle.png){:class="img-responsive"}

Now, we can support the new requirement for the new country.

```kotlin
public class SearchResponse {

  private List<TradableArticle> articles;
  
  //code omitted for brevity
}
```

We can reuse our classes even out of context. For example, in a Bank context, we need an *address* to contact a customer.

```kotlin
public class Customer {

  private int customerId;
  private String lastName;
  private Address address;
  
  //code omitted for brevity
}
```

We use the term *has-a* to describe composition relationships. An order *has-a(n)* address. A customer *has-a(n)* address.

## Advantages of object-oriented programming

- Your program focuses on data, not on functions. You create a program using objects, not functions.
- You define methods to control the access to its data.
- Objects communicate through methods - messages
- The application adapts to new changes.
- Objects have unique responsibilities.
- You don't define global data. Every object contains its data.

Learn how to use these concepts in [SOLID design principles](https://codersite.dev/open-closed-principle/){:target="_blank"}.

<div>
{%- include softwareDesign.html -%}
</div>
