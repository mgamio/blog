---
layout: post
title:  "Software Design Principles Explained with Java Examples: SOLID, DRY, KISS, YAGNI and More"
description: "The software design principles every developer should know, each with a short Java example: SOLID, DRY, KISS, YAGNI, separation of concerns, composition over inheritance and the Law of Demeter."
author: moises
categories: [ design ]
image: /assets/images/softwareDesignPrinciples.jpg
comments: false
---

Why are some codebases still easy to change after five years, while others need a rewrite after one? It's rarely the framework or the language. It's whether the people who wrote the code followed a few design principles. This post explains the principles every developer should know, each with a short Java example of the problem, the fix, and the point where the principle is taken too far.

## SOLID

SOLID is a set of five principles for object-oriented classes:

- **Single Responsibility:** a class should have one reason to change.
- **Open-Closed:** you should be able to add behavior without modifying existing, tested code.
- **Liskov Substitution:** a subclass must work everywhere its parent class works.
- **Interface Segregation:** many small interfaces are better than one large interface that forces classes to implement methods they don't need.
- **Dependency Inversion:** depend on abstractions, not on concrete classes.

Each one deserves its own example, so they have their own post: [SOLID Principles: The Definitive Guide](https://codersite.dev/solid-principles-the-definitive-guide/){:target="_blank"}.

## DRY: Don't Repeat Yourself

Every piece of business knowledge should live in exactly one place. Here the discount rule is copied into two services:

```java
// CartService
if (subtotal.compareTo(new BigDecimal("100")) > 0) {
  total = subtotal.multiply(new BigDecimal("0.90"));
}

// InvoiceService: the same rule, copied
if (subtotal.compareTo(new BigDecimal("100")) > 0) {
  total = subtotal.multiply(new BigDecimal("0.90"));
}
```

When marketing changes the discount to 15%, someone updates the cart and forgets the invoice, and customers see one price in the cart and another on the invoice. Move the rule into one place:

```java
public final class Discounts {

  private static final BigDecimal THRESHOLD = new BigDecimal("100");
  private static final BigDecimal RATE = new BigDecimal("0.90");

  private Discounts() {}

  public static BigDecimal apply(BigDecimal subtotal) {
    BigDecimal total = subtotal.compareTo(THRESHOLD) > 0 ? subtotal.multiply(RATE) : subtotal;
    return total.setScale(2, RoundingMode.HALF_UP);
  }
}
```

**Taken too far:** DRY is about knowledge, not about code that happens to look the same. Two methods that look alike today but change for different reasons should stay separate. Merging them creates the wrong abstraction, and soon it fills up with `if` statements for each caller.

## KISS: Keep It Simple

Choose the simplest solution that works. This checks whether a list contains duplicates:

```java
boolean hasDuplicates = names.stream()
    .collect(Collectors.groupingBy(n -> n, Collectors.counting()))
    .values().stream()
    .anyMatch(count -> count > 1);
```

It works, but the reader has to decode it. A set can't hold duplicates, so this does the same in one readable line:

```java
boolean hasDuplicates = new HashSet<>(names).size() < names.size();
```

Simple code is easier to read, to test and to debug, and a reviewer can see at a glance that it's correct.

## YAGNI: You Aren't Gonna Need It

Don't build features or flexibility until a real requirement asks for them. A team that accepts card payments today builds this "for later":

```java
// Built for payment providers that don't exist yet
public interface PaymentProvider { PaymentResult charge(Order order); }
public class PaymentProviderRegistry { /* looks up providers by name */ }
public class PaymentProviderConfigLoader { /* reads providers from a config file */ }
```

The second provider never comes. Three classes now have to be read, tested and maintained for nothing, and when a different change does arrive, the design built in advance usually doesn't fit it. Build what the requirement asks for:

```java
public class CardPayments {
  public PaymentResult charge(Order order) {
    // call the card payment API and return the result
  }
}
```

If a second provider comes, extracting an interface then takes minutes, and you'll design it around two real providers instead of an imagined one.

## Separation of Concerns

Each part of the code should handle one concern: HTTP, business rules, or data storage. This controller mixes all three:

```java
@RestController
public class OrderController {

  private final JdbcTemplate jdbc;

  public OrderController(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @PostMapping("/orders/{id}/cancel")
  public void cancel(@PathVariable long id) {
    String status = jdbc.queryForObject("SELECT status FROM orders WHERE id = ?", String.class, id);
    if ("SHIPPED".equals(status)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "A shipped order can't be cancelled");
    }
    jdbc.update("UPDATE orders SET status = 'CANCELLED' WHERE id = ?", id);
  }
}
```

The business rule, "a shipped order can't be cancelled", is buried between SQL statements. You can't test it without a database, and you can't reuse it from a batch job. Separate the concerns:

```java
@RestController
public class OrderController {

  private final OrderService orderService;

  public OrderController(OrderService orderService) {
    this.orderService = orderService;
  }

  @PostMapping("/orders/{id}/cancel")
  public void cancel(@PathVariable long id) {
    orderService.cancel(id);
  }
}

public class OrderService {

  private final OrderRepository orders;

  public OrderService(OrderRepository orders) {
    this.orders = orders;
  }

  public void cancel(long id) {
    Order order = orders.findById(id);
    order.cancel();     // the business rule lives in Order
    orders.save(order);
  }
}
```

Now the controller only translates HTTP, the repository only stores data, and the rule lives in `Order.cancel()`, where a plain unit test can check it. The [REST API tutorial](https://codersite.dev/rest-api-overview/){:target="_blank"} applies the same split to a complete Spring Boot controller.

<div>
{%- include inArticleAds.html -%}
</div>

## Composition over Inheritance

Inheritance means "is a", and it exposes everything the parent class can do. This stack extends `ArrayList`:

```java
public class Stack<E> extends ArrayList<E> {
  public void push(E item) { add(item); }
  public E pop() { return remove(size() - 1); }
}
```

But a stack is not a list. Every caller can now use `stack.add(0, item)` or `stack.remove(0)` and break the last-in, first-out order. Even the JDK made this mistake: `java.util.Stack` extends `Vector`, and its documentation recommends `Deque` instead. With composition, the stack *has* a list and exposes only stack operations:

```java
public class Stack<E> {

  private final List<E> items = new ArrayList<>();

  public void push(E item) { items.add(item); }

  public E pop() {
    if (items.isEmpty()) throw new NoSuchElementException("stack is empty");
    return items.remove(items.size() - 1);
  }

  public boolean isEmpty() { return items.isEmpty(); }
}
```

The benefit isn't less code; inheritance avoids duplication just as well. The benefit is control: the class decides what it exposes, you can swap the `ArrayList` for another implementation without affecting callers, and you aren't tied to changes in a parent class you don't own.

Use inheritance when the subclass really *is* a kind of the parent everywhere, as Liskov Substitution requires. More on this in [Understanding OOP Concepts](https://codersite.dev/understanding-oop-concepts/){:target="_blank"}.

## Law of Demeter: Talk Only to Your Friends

A method should talk to its direct collaborators, not reach through them into objects further away:

```java
String city = order.getCustomer().getAddress().getCity();
```

This line knows that an order has a customer, that a customer has an address, and that an address has a city. If any of these relationships changes, for example customers get several addresses, every such line breaks. Ask the object you have:

```java
public class Order {
  private final Customer customer;

  public String shippingCity() {
    return customer.shippingCity();
  }
}

public class Customer {
  private final Address address;

  public String shippingCity() {
    return address.city();
  }
}
```

```java
String city = order.shippingCity();
```

**Taken too far:** the law is about objects with behavior. Chains on data structures, such as records and DTOs, and fluent APIs like streams and builders are fine: `list.stream().filter(...).map(...)` doesn't violate anything.

## Design Patterns

Design patterns are proven, named solutions to problems that come up again and again, and most of them are these principles applied:

- **Strategy** combines composition and the open-closed principle: a new payment method is a new class, not a new `if` in old code.
- **Decorator** adds behavior through composition instead of a growing tree of subclasses.
- **Factory** and dependency injection apply dependency inversion: callers depend on an interface, not on the class that implements it.
- **Observer** keeps the sender and its receivers loosely coupled.

The names give a team a shared vocabulary: "use a strategy here" says in three words what would otherwise take a whiteboard. They come from the classic catalog by the "Gang of Four":

<div>
{%- include designPatternsAd.html -%}
</div>

## When Principles Conflict

Principles are tools for making decisions, not laws, and sometimes they pull in opposite directions:

- **DRY vs. loose coupling.** Two microservices share a "common" library to avoid duplicating a class. Now every change to that class forces both services to release together. Across service boundaries, a little duplication is often cheaper than the coupling.
- **YAGNI vs. open-closed.** Open-closed says to leave room for extension; YAGNI says not to build what you don't need yet. A practical rule: add the extension point the second time the same kind of change happens, when you know what actually varies.
- **KISS vs. design patterns.** A pattern applied to a 20-line problem makes it harder to read, not easier. Use a pattern when it removes complexity, not to show that you know it.

## Summary

| Principle | Warning sign in your code |
|---|---|
| **Single Responsibility**: one reason to change per class | A class called `Manager` or `Utils` with 2,000 lines |
| **Open-Closed**: extend without modifying | A `switch` on a type that grows with every feature |
| **DRY**: one place for each piece of knowledge | A bug fix you have to apply in several places |
| **KISS**: the simplest solution that works | Code reviewers asking "what does this do?" |
| **YAGNI**: build only what is needed now | Interfaces with a single implementation "for later" |
| **Separation of Concerns**: one concern per layer | SQL statements in a controller |
| **Composition over Inheritance**: prefer "has a" to "is a" | Subclasses that disable parent methods |
| **Law of Demeter**: talk only to direct collaborators | Long chains of getter calls |

<br/>

## Learn the Principles in Depth

Knowing the names of the principles is easy. Recognizing when your own code breaks them, and fixing it under deadline pressure, takes practice.

My book **Software Design Principles** takes the ideas in this post further with worked examples: DRY, KISS, YAGNI, loose coupling and high cohesion, all five SOLID principles each with code and a *Key Takeaways* recap, UML class diagrams with all six relationship types, twelve clean-code habits, and case studies where you design a RESTful API and a B2B integration from start to finish.

> Software design principles provide guidelines to handle the design process's complexity, prepare your code when changes arise, and minimize the impact of introducing bugs. -- <cite>[Software Design Principles](https://amzn.to/3Csx3sR){:target="_blank"}</cite>

<div>
{%- include softwareDesign.html -%}
</div>

Not sure yet? [Read the first chapters free](https://codersite.dev/assets/files/sdpSample.pdf){:target="_blank"}, no signup needed.

**Keep reading:**

- [SOLID Principles: The Definitive Guide](https://codersite.dev/solid-principles-the-definitive-guide/){:target="_blank"}
- [Best Practices for Writing Clean Code](https://codersite.dev/clean-code/){:target="_blank"}
- [Understanding OOP Concepts](https://codersite.dev/understanding-oop-concepts/){:target="_blank"}
- [UML Diagrams for Java Developers](https://codersite.dev/uml-diagrams-for-java-developers/){:target="_blank"}

Please support me as a writer. Every contribution helps, and your donation can help add more articles to this website, no matter how small. Thank you!

{% include buymeacoffee.html %}
<br/>
