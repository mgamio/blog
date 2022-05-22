---
layout: post
title:  "Understanding Object-Oriented Programming concepts"
description: "Object-oriented concepts give you a solid foundation for making critical design decisions."
author: moises
categories: [ Object-Oriented ]
image: assets/images/oop.jpg
comments: false
---

Object-oriented concepts give you a solid foundation for making critical design decisions.

## Class

A class is a template or prototype that describes what an object will be. It defines its attributes(data) and behavior(methods). We must design a class before creating an object.

## Object

An object is an instance of a class. When we create an object, we create real-world entities such as auto, bicycles, or dogs with their own attributes and own behaviors.

![class and object](/assets/images/carClass.jpg){:class="img-responsive"}

In Java we instantiate an object via the *new* keyword. When you design a class follow the [Single Resposibility Principle (SRP)](https://codersite.dev/solid-principles-the-definitive-guide/){:target="_blank"}.

<div>
{%- include inArticleAds.html -%}
</div>

## Abstraction

Abstraction allows an object telling to its users what an application does instead of how it does it. You can see the essential buttons in your TV remote control, but you don't care what happens behind when you press one of these buttons. In Java, we create abstractions via Interfaces and Abstract classes.

## Encapsulation and Data Hiding

Restricting access to specific attributes and methods is called *data hiding*. Objects should not manipulate the data of other objects. 

Encapsulation is the action to combine the data and methods in the same entity. In this way, we control access to the data in the object.

## Inheritance

Inheritance is a process in which a class inherits the attributes and methods of another class.

Inheritance provides the ability to create new classes with new functionalities maintaining the functionalities inherited. In this way, it promotes code reusability.

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

For example, in a shopping context, we need an *address* where to deliver the order.

```kotlin
public class Order {

  private int clientId;
  private List<Item> orderItems;
  private Address shippingAddress;
  
  //code omitted for brevity
}
```

In a bank context, we need an *address* where to contact a customer.

```kotlin
public class Customer {

  private int customerId;
  private String lastName;
  private Address address;
  
  //code omitted for brevity
}
```

We use the term *has-a* to describe composition relationships. An order *has-a(n)* address. A customer *has-a(n)* address.

## Advantanges of object-oriented programming

- Your program focus on data, not on functions. You create a program using objects, not functions.
- You define methods to control the access to its data.
- Objects communicate through methods - messages
- Application adapts to new changes.
- Objects has unique responsibilities.
- You don't define global data. Every object contains its data.

Learn how to use these concepts in [SOLID design principles](https://codersite.dev/open-closed-principle/){:target="_blank"}.