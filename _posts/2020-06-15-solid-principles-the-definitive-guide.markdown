---
layout: post
title: "SOLID principles: The Definitive Guide (Part I)"
author: moises
categories: [ design ]
image: assets/images/solid.jpg
featured: true
hidden: true
comments: false
---

SOLID principles tell you how to arrange your functions into classes and how those classes should be interrelated.

Robert C. Martin introduced it. [Clean Architecture](https://amzn.to/3g9xXyS){:target="_blank"}.

When SOLID principles are applied correctly, your software infrastructure will be able to tolerate changes, it will be easier to understand, and it will be focuser on reusable components.

Let’s start with the first principle.

## SOLID principles: Single Responsibility Principle (SRP)

> … “a class should only have one reason to change“

This principle states that **a class should only have one responsibility**.

For instance, imagine an online store that issues its cards for its customers, and from the beginning, the Payment and Card teams are in mutual agreement to apply for interest and to lock cards from customers who are in late payments for 14 days or more.

In the following code, we have the first design of the Payment Class, which supports both requirements.

```kotlin
public class Payment {
  public static final int MAX_DAYS = 14;
  
  public void batch(List<Customer> customers) {
    for (Customer customer : customers) {
      int nDays = latePaymentDays(customer);
      if (nDays >= MAX_DAYS) {
        applyLatePaymentInterest(customer);
        lockCard(customer);
      }
    }
  }
}
```

<div>
{%- include inArticleAds.html -%}
</div>

## The Problem: A Class has more than one responsibility

But suddenly, the Cards team wants to change the validation to 10 days. However, the Payments team manages other policies related to when interests by late payment are applied. As a result, the Payments team disagrees with the Cards team. Moreover, both teams are stuck on how to proceed. 

This scenario is a clear example of how this Class design violates the Single Responsibility Principle. The Payment class has more than one reason to change and breaks the Payments team's business logic if they accept the Cards team's requirement.

The following figure shows the Class with different responsibilities:

![Class with different responsibilities](/assets/images/payment1.jpg){:class="img-responsive"}

## The solution: Create a Class with only one responsibility

What do we need to do?. In this scenario, we can apply the **S**ingle Responsibility Principle

Firstly, we move the *lockCard()* responsibility to a new Card Class. This technique is most known as refactoring

```kotlin
public class Card {
  public static final int MAX_DAYS = 10;
  
  public void batch(List customers) {
    for (Customer customer : customers) {
      int nDays = Payment.latePaymentDays(customer);
      if (nDays >= MAX_DAYS) {
        lockCard(customer);
      }
    }
  }
}
```

<div>
{%- include inArticleAds.html -%}
</div>

After that change and following [Clean code](https://codersite.dev/clean-code/){:target="_blank"} principles, we can see how it looks the new Payment Class (refactored as well):

```kotlin
public class Payment {
  public static final int MAX_DAYS = 14;
  
  public void batch(List<Customer> customers) {
    for (Customer customer : customers) {
      int nDays = latePaymentDays(customer);
      if (nDays >= MAX_DAYS) {
        applyLatePaymentInterest(customer);
      }
    }
  }
}
```

Finally, new changes to the MAX_DAYS variable will only depend on the requirements of every team separately. The following figure shows the Classes for different actors, without conflicts.

![Class for different actors](/assets/images/payment2b.jpeg){:class="img-responsive"}

Therefore, the Payment Class is only responsible for supporting to the Payments team, and the Card Class is solely responsible for supporting the Cards team.

Also, when new features arrive, then we need to distinct in which Class to include it. Moreover, this is related to the Cohesion concept, which help us to group similar functions inside a Class, and that have the same purpose served by that Class.

<div>
{%- include inArticleAds.html -%}
</div>

In conclusion, once you identify classes that have too many responsibilities, use this refactoring technique to create smaller classes with single responsibilities and focused only on one business actor.

Use this principle as a tool when translating [business software requirements into technical specifications](https://codersite.dev/uml-diagrams-for-java-developers/){:target="_blank"}. Programmers must understand these design decisions before programming.

Now that you've learned the Single Responsibility principle, it's time to learn the [Open-closed principle](https://codersite.dev/open-closed-principle/){:target="_blank"} to avoid future software maintenance costs.

<div>
{%- include softwareDesign.html -%}
</div>
