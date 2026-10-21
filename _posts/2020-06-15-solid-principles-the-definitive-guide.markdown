---
layout: post
title: "SOLID Principles in Java: The Definitive Guide with Examples"
description: "All five SOLID principles explained with one running Java example: single responsibility, open-closed, Liskov substitution, interface segregation and dependency inversion, with before-and-after code."
author: moises
categories: [ design ]
image: /assets/images/solid.jpg
comments: false
---

SOLID is a set of five principles that tell you how to arrange your code into classes and how those classes should depend on each other. Code that follows them is easier to change, test and understand, because a change in one place doesn't ripple through the rest of the system.

The five principles are:

- **S**ingle Responsibility Principle
- **O**pen-Closed Principle
- **L**iskov Substitution Principle
- **I**nterface Segregation Principle
- **D**ependency Inversion Principle

Robert C. Martin described them in the early 2000s, building on earlier work by Bertrand Meyer and Barbara Liskov, and Michael Feathers arranged them into the acronym SOLID.

This guide explains all five with **one running example**, an online store that issues payment cards to its customers. Each principle starts with code that breaks it, shows the problem, and then fixes it. All the code is Java, and I compiled and ran every example on Java 25.

## S: Single Responsibility Principle

> A module should be responsible to one, and only one, actor.
> -- Robert C. Martin, *Clean Architecture*

The principle is often summarized as *"a class should have only one reason to change"*. The *reason to change* is a group of people, an **actor**, who ask for changes. If two teams can ask for changes to the same class, that class has two responsibilities, and sooner or later one team's change will break the other team's code.

### The problem: two teams, one class

The store applies interest to customers whose payment is late, and it locks their cards. At first, the Payments team and the Cards team agree on the same rule: both actions happen when a payment is 14 or more days late. So one class does both:

```java
public class Payment {
  public static final int MAX_DAYS = 14;

  public void batch(List<Customer> customers) {
    for (Customer customer : customers) {
      if (latePaymentDays(customer) >= MAX_DAYS) {
        applyLatePaymentInterest(customer);
        lockCard(customer);
      }
    }
  }

  // latePaymentDays, applyLatePaymentInterest and lockCard omitted
}
```

![UML class diagram: the Payments team and the Cards team both depend on one Payment class](/assets/images/payment1.jpg "One class, two actors"){:class="img-responsive"}

Then the Cards team wants to lock cards after 10 days, to reduce fraud. The Payments team doesn't want to charge interest earlier, because its rules come from the customer contracts. Both requirements live in the same `MAX_DAYS` constant and the same `if`. Whatever value you choose, one team gets the wrong behavior. The teams are stuck, and every change to `Payment` needs both of them to agree.

<div>
{%- include inArticleAds.html -%}
</div>

### The solution: one class per actor

Give each team its own class. The calculation that both teams need, how many days a payment is late, is a fact about the customer and not either team's policy, so it moves to a third class that both use:

```java
public class PaymentHistory {

  private final LocalDate today;

  public PaymentHistory(LocalDate today) {
    this.today = today;
  }

  public int latePaymentDays(Customer customer) {
    if (customer.paid()) return 0;
    return (int) Math.max(0, ChronoUnit.DAYS.between(customer.dueDate(), today));
  }
}
```

The Payments team owns the interest rule:

```java
public class LateInterestBatch {

  public static final int MAX_DAYS = 14;

  private final PaymentHistory history;

  public LateInterestBatch(PaymentHistory history) {
    this.history = history;
  }

  public void run(List<Customer> customers) {
    for (Customer customer : customers) {
      if (history.latePaymentDays(customer) >= MAX_DAYS) {
        applyLatePaymentInterest(customer);
      }
    }
  }
}
```

And the Cards team owns the lock rule, with its own threshold:

```java
public class CardLockBatch {

  public static final int MAX_DAYS = 10;

  private final PaymentHistory history;

  public CardLockBatch(PaymentHistory history) {
    this.history = history;
  }

  public void run(List<Customer> customers) {
    for (Customer customer : customers) {
      if (history.latePaymentDays(customer) >= MAX_DAYS) {
        lockCard(customer);
      }
    }
  }
}
```

![UML class diagram: the Payments team uses LateInterestBatch, the Cards team uses CardLockBatch, and both batches use PaymentHistory](/assets/images/srp-classes-after.png "One class per actor"){:class="img-responsive"}

With three customers whose payments are 12, 20 and 30 days late, where the last one has since paid, the first version charged interest and locked a card only for the customer 20 days late. Now `LateInterestBatch` still charges only that customer, while `CardLockBatch` locks the cards of the customers 12 and 20 days late. Each team changes its own class, and neither change can break the other team.

A common mistake when splitting a class is to leave the shared logic where it was. If `CardLockBatch` called `payment.latePaymentDays()`, the Cards team would still depend on the Payments team's class, and the split would only look clean. Moving the shared calculation into `PaymentHistory` removes that dependency.

**Warning sign:** a class changes for requests from different teams, or its name needs "and" to describe it. SRP is about cohesion: the code in a class should change for the same reasons. The [clean code](https://codersite.dev/clean-code/){:target="_blank"} rule *functions should do one thing* is the same idea at the level of methods.

<div>
{%- include inArticleAds.html -%}
</div>

## O: Open-Closed Principle

> Software entities should be open for extension, but closed for modification.
> -- Bertrand Meyer

When the Cards team locks a card, the customer must be told. The first version sends an email or an SMS depending on a setting:

```java
if (channel.equals("EMAIL")) {
  sendEmail(customer.email(), message);
} else if (channel.equals("SMS")) {
  sendSms(customer.phone(), message);
}
```

Every new channel, such as push notifications, means editing this `if`, retesting `CardLockBatch`, and risking a bug in the channels that already work.

Instead, make each channel a class behind one interface:

```java
public interface Notifier {
  void send(Customer customer, String message);
}

public class EmailNotifier implements Notifier { ... }
public class SmsNotifier implements Notifier { ... }
```

`CardLockBatch` receives a list of notifiers and sends the message through each one:

```java
for (Notifier notifier : notifiers) {
  notifier.send(customer, "Your card is locked because of a late payment.");
}
```

Adding push notifications is now a new `PushNotifier` class, passed in with the others. `CardLockBatch` is *closed for modification*: its code doesn't change. The system is *open for extension*: it gains a new behavior. In my test, adding `PushNotifier` sent the push messages to both locked customers without a single change to `CardLockBatch`.

**Warning sign:** a growing `if-else` or `switch` on a type or a setting that you edit every time a new case appears.

For a longer, real example, see [the open-closed principle with a Spring Boot rate limiter](https://codersite.dev/open-closed-principle/){:target="_blank"}, Part II of this series.

<div>
{%- include inArticleAds.html -%}
</div>

## L: Liskov Substitution Principle

> If S is a subtype of T, then objects of type T may be replaced with objects of type S without breaking the program.
> -- Barbara Liskov, 1987 (paraphrased)

In other words: any code that works with a type must keep working with every subtype of it. A subtype that throws where the parent type works, or that silently does less, breaks the principle.

The store models cards with one interface:

```java
public interface Card {
  void lock();
  void applyInterest(BigDecimal rate);
}
```

A credit card implements both methods. Then the store adds prepaid cards. A prepaid card can be locked, but it has no credit, so there's nothing to charge interest on:

```java
public class PrepaidCard implements Card {

  @Override
  public void lock() {
    locked = true;
  }

  @Override
  public void applyInterest(BigDecimal rate) {
    throw new UnsupportedOperationException("A prepaid card has no credit to charge interest on");
  }
}
```

The code compiles, but the interest batch now fails as soon as a prepaid card appears in its list:

```java
for (Card card : lateCards) {
  card.applyInterest(rate); // throws UnsupportedOperationException for a PrepaidCard
}
```

`PrepaidCard` claims to be a `Card`, but it can't be used wherever a `Card` is expected. The caller would need `if (card instanceof PrepaidCard)` checks, which means it has to know every subtype, the opposite of what an interface is for.

The fix isn't a better `PrepaidCard`. The `Card` interface promises something that not every card can do. That's the next principle.

**Warning sign:** an overridden method that throws `UnsupportedOperationException`, does nothing, or needs an `instanceof` check in the caller. The same rule explains a classic puzzle with generics; see [why a List of Integer isn't a List of Number](https://codersite.dev/java-generics/){:target="_blank"}.

## I: Interface Segregation Principle

> Clients should not be forced to depend on methods they do not use.
> -- Robert C. Martin

The `Card` interface forced `PrepaidCard` to implement `applyInterest`, a method it can't support. It also forces the lock batch, which only locks cards, to depend on an interest method it never calls. Split the interface by what clients need:

```java
public interface Lockable {
  void lock();
}

public interface InterestBearing {
  void applyInterest(BigDecimal rate);
}
```

Each card implements only what it can do:

```java
public class CreditCard implements Lockable, InterestBearing { ... }

public class PrepaidCard implements Lockable { ... }
```

Now the compiler enforces what used to fail at runtime. The interest batch takes a `List<InterestBearing>`, so a prepaid card can't even be put into it. The lock batch takes a `List<Lockable>` and handles both kinds of card. In my test, a credit card with a balance of 1,000.00 was charged 2% interest, to 1,020.00, and then both cards were locked, with no exception.

Interface Segregation fixed the Liskov problem from the previous section. The two principles often appear together: a fat interface makes it impossible for some implementations to honor the whole contract.

**Warning sign:** implementations with empty methods or methods that throw, or interfaces where most clients use only a few of the methods.

<div>
{%- include inArticleAds.html -%}
</div>

## D: Dependency Inversion Principle

> High-level modules should not depend on low-level modules. Both should depend on abstractions.
> -- Robert C. Martin

`CardLockBatch` is business logic: it decides whose cards to lock. In the first version, it also created its own database access:

```java
public class CardLockBatch {

  private final JdbcCustomerRepository customers = new JdbcCustomerRepository(dataSource);

  public void run() {
    for (Customer customer : customers.findUnpaid()) { ... }
  }
}
```

The business rule now depends on JDBC, on a running database, and on a `dataSource`. You can't test the 10-day rule without a database, and moving the customers to a REST service would mean editing the batch.

Invert the dependency. The batch declares the interface it needs, and the database code implements it:

```java
public interface CustomerRepository {
  List<Customer> findUnpaid();
}
```

```java
public class CardLockBatch {

  public static final int MAX_DAYS = 10;

  private final CustomerRepository customers;
  private final PaymentHistory history;
  private final List<Notifier> notifiers;

  public CardLockBatch(CustomerRepository customers, PaymentHistory history, List<Notifier> notifiers) {
    this.customers = customers;
    this.history = history;
    this.notifiers = notifiers;
  }

  public void run() {
    for (Customer customer : customers.findUnpaid()) {
      if (history.latePaymentDays(customer) >= MAX_DAYS) {
        lockCard(customer);
        for (Notifier notifier : notifiers) {
          notifier.send(customer, "Your card is locked because of a late payment.");
        }
      }
    }
  }
}
```

In production, `JdbcCustomerRepository implements CustomerRepository`. In a unit test, a few lines replace the database:

```java
public class InMemoryCustomerRepository implements CustomerRepository {

  private final List<Customer> customers;

  public InMemoryCustomerRepository(List<Customer> customers) {
    this.customers = customers;
  }

  @Override
  public List<Customer> findUnpaid() {
    return customers.stream().filter(customer -> !customer.paid()).toList();
  }
}
```

```java
CardLockBatch batch = new CardLockBatch(
    new InMemoryCustomerRepository(List.of(ana, ben, eva)),
    new PaymentHistory(LocalDate.of(2026, 10, 21)),
    List.of(new EmailNotifier()));
batch.run();
```

The *inversion* is in who owns the interface. `CustomerRepository` belongs to the business side and describes what the business needs. The database code depends on it, not the other way round. This final `CardLockBatch` is also the one that applies all five principles together: one actor, notifiers open for extension, and its dependencies passed in as interfaces.

Spring's dependency injection exists to make this easy: when a class asks for a `CustomerRepository` in its constructor, Spring passes in the implementation. You can see it in the [Spring Boot OpenAPI tutorial](https://codersite.dev/documenting-rest-api-openapi3/){:target="_blank"}, where the controller receives its `BookRepository` through the constructor.

**Warning sign:** `new` of an infrastructure class (a database, HTTP client or file system) inside business logic, or business code you can't unit test without starting a database or a server.

## SOLID at a glance

| Principle | In one sentence | Warning sign |
|---|---|---|
| **S**ingle Responsibility | One class serves one actor | Two teams ask for changes to the same class |
| **O**pen-Closed | Add behavior with new code, not by editing old code | An `if-else` on a type that grows with every new case |
| **L**iskov Substitution | Every subtype works wherever its parent type works | Overrides that throw `UnsupportedOperationException` |
| **I**nterface Segregation | Small interfaces shaped by what clients use | Empty or throwing methods in implementations |
| **D**ependency Inversion | Business logic depends on interfaces it owns | `new JdbcSomething()` inside business logic |

Writing code like this is a skill you build by seeing the same principles applied in different situations. My book *Software Design Principles* covers all five SOLID principles, each with its own Java example and a *Key Takeaways* recap, together with DRY, KISS, YAGNI and UML class diagrams, and case studies where you design a REST API and a B2B integration from start to finish.

<div>
{%- include softwareDesign.html -%}
</div>

## When not to apply SOLID

SOLID principles are tools for code that changes. Applied everywhere, they produce the opposite of what they promise: dozens of one-method interfaces, factories for classes that have only one implementation, and simple features spread across ten files.

- **Wait for the second reason to change.** Split `Payment` when the Cards team actually asks for a different rule, not on the first day just in case. This is the YAGNI principle (*You Aren't Gonna Need It*).
- **One implementation is often fine.** An interface with a single implementation that no test replaces adds a file and a jump in your IDE, and nothing else.
- **Prefer simple code to a pattern.** Two `if` branches that never change don't need the Open-Closed Principle.

Use SOLID to fix the pain you can see: classes that break when another team changes them, `if-else` chains that keep growing, and code you can't test. For the other principles that balance SOLID, such as KISS, DRY and YAGNI, see [software design principles explained with Java examples](https://codersite.dev/software-design-principles/){:target="_blank"}.

All five principles come from Robert C. Martin's work, and his *Clean Code* is the best place to see them at the level where you apply them every day: names, functions and classes. If this guide was useful, it's the natural next book.

<div>
{%- include cleanCodeAd.html -%}
</div>

## FAQ

### What does SOLID stand for?

Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation and Dependency Inversion. Robert C. Martin described them, and Michael Feathers coined the acronym.

### What is the difference between Dependency Inversion and Dependency Injection?

Dependency Inversion is a design principle: business code depends on interfaces it owns, not on concrete infrastructure. Dependency Injection is a technique for following it: you pass the dependencies in, usually through the constructor, instead of creating them inside the class. Spring is a dependency injection framework.

### Is the Single Responsibility Principle about classes doing one thing?

Not exactly. "Do one thing" is a good rule for functions. For classes, Robert C. Martin defines a responsibility as an actor, a group of people who request changes. A class can have several methods and still have one responsibility, as long as they all change for the same people.

### Do SOLID principles apply to microservices?

Yes. The same ideas work at a larger scale: a service should be owned by one team (single responsibility), services should talk through stable contracts such as an OpenAPI specification (dependency inversion), and you add capabilities with new services or endpoints instead of breaking existing ones (open-closed).

### Which SOLID principle is the most important?

If you apply only one, apply the Single Responsibility Principle. Most of the problems the other four solve, such as fat interfaces and hard-to-test classes, start with a class that does too much. To find the right responsibilities before writing code, start from the requirements; see [UML diagrams for Java developers](https://codersite.dev/uml-diagrams-for-java-developers/){:target="_blank"}.

<div>
{% include buymeacoffee.html %}
</div>
