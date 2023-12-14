---
layout: post
title:  "Understanding OOP concepts"
description: "Object-oriented concepts give you a solid foundation for making critical design decisions."
author: moises
categories: [ Object-Oriented ]
image: assets/images/oop.jpg
featured: true
hidden: false
comments: false
---

Understanding OOP concepts give you a solid foundation for making critical decisions about object-oriented software design.

## Class

A class is a template or prototype that describes what an object will be. It defines its attributes(data) and behavior(methods). We must design a class before creating an object.

## Object

An object is an instance of a class. When we create an object, we create real-world entities such as cars, bicycles, or dogs with their own attributes and own behaviors.

![class and object](/assets/images/carClass.jpg){:class="img-responsive"}

We instantiate an object via the *new* keyword in the Java programming language. When you design a class follow the [Single Responsibility Principle (SRP)](https://codersite.dev/solid-principles-the-definitive-guide/){:target="_blank"}.

<div>
{%- include inArticleAds.html -%}
</div>

## Abstraction in OOP

Abstraction allows an object telling to its users what an application does instead of how it does it. You can see the essential buttons on your TV remote control, but you don't care what happens behind when you press one of these buttons. In Java, we create abstractions via Interfaces and Abstract classes.

## Encapsulation in OOP and Data Hiding

Restricting access to specific attributes and methods is called *data hiding*. Objects should not manipulate the data of other objects. 

Encapsulation is the action of combining the data and methods in the same entity. In this way, we control access to the data in the object.

## Inheritance in OOP

Inheritance is a process in which a class inherits the attributes and methods of another class.

Class inheritance in OOP provides the ability to create new classes with new functionalities while maintaining the functionalities inherited. In this way, it promotes code reusability.

This relationship is an *is-a* relationship because when a subclass inherits from a superclass, it can do anything that the superclass can do. 

In Java, we create inheritance between classes via the *extends* keyword.

<div>
{%- include inArticleAds.html -%}
</div>

## Polymorphism in OOP

Polymorphism in OOP means many shapes and is coupled to inheritance. For example, a Shape class defines a *draw* method, but Square and Circle's subclasses will implement it differently.

## Composition in OOP

The composition in OOP provides a mechanism for building classes from other classes. In Java, we usually create a class with instance variables that references one or more objects of other classes.

The benefit of separating one class from another one is the *Reuse*.

For example, in a shopping context, we need a list of requested *items* and an *address* where to deliver the *order*.

```kotlin
public class Order {

  private int clientId;
  private List<Item> orderItems;
  private Address shippingAddress;
  
  //code omitted for brevity
}
```

We build an *Item* class including an *Article* class.

```kotlin
public class Item {

  private Article article;
  private double quantity;
  
  //code omitted for brevity
}
```

And the *Article* class includes enough attributes to support the shopping business.

```kotlin
public class Article {

  private int id;
  private String name;
  private double deliveryPrice;
  
  //code omitted for brevity
}
```

Even we can reuse the *Article* class to support a *Search* request.

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

Here, we can use the other technique to build new classes: **inheritance**.

![class and object](/assets/images/tradableArticle.png){:class="img-responsive"}

Now, we can support the new requirement for the new country.

```kotlin
public class SearchResponse {

  private List<TradableArticle> articles;
  
  //code omitted for brevity
}
```

We can reuse our classes even out of context. For example, in a Bank context, we need an *address* to contact a *customer*.

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

Object-oriented programming (OOP) is a programming paradigm that uses objects and classes to structure code. It offers several advantages, which have contributed to its popularity and widespread use in software development:

- Focuses on data: You create a program using objects focused on data. You don't define global data. Every object contains its data.

<div>
{%- include inArticleAds.html -%}
</div>

- Modularity: OOP promotes modularity by encapsulating objects and their behaviors within classes. This allows developers to break down a complex system into smaller, manageable parts, making it easier to understand, maintain, and debug.

- Reusability: OOP encourages code reusability through inheritance and polymorphism. Developers can create new classes by inheriting properties and behaviors from existing classes, reducing redundancy and promoting a "write once, use many times" approach.

- Flexibility and Extensibility: OOP allows for easy modification and extension of existing code. You can add new classes and methods without altering the existing codebase, reducing the risk of introducing bugs in previously working code.

- Abstraction: Abstraction is a key concept in OOP, where you model real-world entities as objects and focus on essential properties and behaviors while hiding unnecessary details. This simplifies problem-solving and enhances code clarity.

- Encapsulation: OOP supports encapsulation by bundling data (attributes) and functions (methods) into objects. Access to an object's internal state is controlled through well-defined interfaces, promoting data integrity and security.

- Organization: OOP provides a natural way to organize code, making it more intuitive for developers to work collaboratively on large projects. Classes and objects mirror the structure of the problem domain, making it easier to map real-world concepts to code.

- Maintainability: OOP code tends to be more maintainable because of its modular and organized nature. Changes and updates can be made to specific classes or objects without affecting the entire system, reducing the risk of introducing unintended side effects.

- Testability: OOP code is often easier to test since objects can be isolated and tested independently, leading to more comprehensive and efficient testing strategies.

<div>
{%- include javaInterviewAds1.html -%}
</div>

- [Code Understandability](https://codersite.dev/clean-code/){:target="_blank"}: OOP promotes a closer alignment between code and real-world concepts, making the codebase more understandable to developers, even those who didn't write the original code.

- Support for Large-Scale Development: OOP is well-suited for large-scale software development projects. Its inherent structure and organization facilitate teamwork, reduce development time, and enhance project manageability.

- Community and Ecosystem: OOP has a vast and mature ecosystem of libraries, frameworks, and tools, making it easier to find resources and solutions for common programming tasks.

- Cross-Disciplinary Applications: OOP is applicable to various domains and industries, making it a versatile paradigm suitable for a wide range of software development projects.

Understanding OOP concepts in Java or Python OOP concepts makes your system design resilient to future changes.

While OOP offers numerous advantages, it's important to note that it may not always be the best choice for every project or problem. The choice of programming paradigm should align with the specific requirements, constraints, and goals of the software being developed.

Learn how to use these concepts in [SOLID design principles](https://codersite.dev/open-closed-principle/){:target="_blank"}.

> Any software design is generally a matter of opinion. There is no definitive Guide. -- <cite>codersite.dev</cite>

<div>
{%- include softwareDesign.html -%}
</div>
