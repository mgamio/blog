---
layout: post
title:  "OOP Concepts in Java: The 4 Pillars and Composition, with Examples"
description: "Abstraction, encapsulation, inheritance and polymorphism explained with short Java examples, plus composition, and why you should favor composition over inheritance."
author: moises
categories: [ Object-Oriented ]
image: /assets/images/oop.jpg
featured: true
hidden: false
comments: false
---

Get object-oriented programming (OOP) wrong and you'll pay for it for years: tangled classes, features that break other features, a codebase nobody wants to touch. Get it right, and new requirements fit in cleanly. This post explains the core OOP concepts, the **four pillars** (abstraction, encapsulation, inheritance and polymorphism) plus composition, each with a short Java example, and shows with a real requirement why you should usually **favor composition over inheritance**.

## Class and Object

A **class** is a blueprint: it defines the data (fields) and the behavior (methods) that its objects will have. An **object** is an instance of a class, with its own values. You write the class once and create as many objects from it as you need, in Java with the `new` keyword.

![UML diagram showing the relationship between a Class and its Object instance](/assets/images/carClass.jpg "UML diagram showing the relationship between a Class and its Object instance"){:class="img-responsive"}

When you design classes, the [SOLID principles](https://codersite.dev/solid-principles-the-definitive-guide/){:target="_blank"} help you keep them small and focused.

## Abstraction

Abstraction means that an object tells its users **what** it does, not **how** it does it. Your TV remote shows the buttons you need; what happens inside when you press one isn't your concern. In Java, you create abstractions with interfaces and abstract classes:

```java
public interface Shape {
  double area();
}
```

Code that works with a `Shape` only knows that it can ask for an area. It doesn't know, and doesn't need to know, how each shape calculates it.

## Encapsulation

Encapsulation bundles data with the methods that work on it and hides the data from the outside (*data hiding*). Other objects can't change the fields directly; they must go through methods that protect the object's rules:

```java
public class BankAccount {

  private BigDecimal balance = BigDecimal.ZERO;

  public void deposit(BigDecimal amount) {
    if (amount.signum() <= 0) {
      throw new IllegalArgumentException("Deposit must be positive");
    }
    balance = balance.add(amount);
  }

  public void withdraw(BigDecimal amount) {
    if (amount.compareTo(balance) > 0) {
      throw new IllegalStateException("Insufficient funds");
    }
    balance = balance.subtract(amount);
  }

  public BigDecimal balance() {
    return balance;
  }
}
```

Because `balance` is `private`, no code anywhere can set it to a negative value. After depositing 100.00 and withdrawing 30.00, the balance is 70.00, and trying to withdraw 500.00 throws `Insufficient funds`. Note that encapsulation is not the same as adding a getter and a setter for every field: a public `setBalance()` would make the `private` keyword almost useless.

<div>
{%- include inArticleAds.html -%}
</div>

## Inheritance

Inheritance lets a class take over the fields and methods of another class and add its own. It describes an **is-a** relationship: a savings account *is a* bank account. In Java, you use the `extends` keyword:

```java
public class SavingsAccount extends BankAccount {

  private final BigDecimal interestRate;

  public SavingsAccount(BigDecimal interestRate) {
    this.interestRate = interestRate;
  }

  public void addInterest() {
    BigDecimal interest = balance().multiply(interestRate).setScale(2, RoundingMode.HALF_EVEN);
    if (interest.signum() > 0) {
      deposit(interest);
    }
  }
}
```

A `SavingsAccount` with 1,000.00 and a 2% rate has 1,020.00 after `addInterest()`. It reuses `deposit()` and the balance rules from `BankAccount` without copying them. A subclass must be usable wherever its superclass is expected; that rule is the *L* in SOLID, the Liskov substitution principle.

## Polymorphism

Polymorphism means "many forms": the same call does different things depending on the object that receives it. In Java this usually happens through an interface or a superclass:

```java
public record Circle(double radius) implements Shape {
  public double area() { return Math.PI * radius * radius; }
}

public record Square(double side) implements Shape {
  public double area() { return side * side; }
}

List<Shape> shapes = List.of(new Circle(1), new Square(2));
for (Shape shape : shapes) {
  System.out.printf("%s area = %.2f%n", shape.getClass().getSimpleName(), shape.area());
}
```

```text
Circle area = 3.14
Square area = 4.00
```

The loop never checks which shape it has. Adding a `Triangle` later needs no change to the loop.

**Overriding vs overloading**, a classic interview question: *overriding* (as in `area()` above) is runtime polymorphism, because the JVM picks the method by the object's actual class. *Overloading*, several methods with the same name but different parameters, such as `print(int)` and `print(String)`, is resolved by the compiler and is sometimes called compile-time polymorphism.

Polymorphism is the engine behind almost every classic Gang of Four design pattern: Strategy, Observer, Template Method. If you want the canonical reference that every senior engineer eventually reads, this is it:

<div>
{%- include designPatternsAd.html -%}
</div>

## Composition

Composition builds a class from other objects: the class holds references to them in its fields. It describes a **has-a** relationship. In a shop, an order *has* items and *has* a shipping address:

```java
public record Order(int clientId, List<Item> items, Address shippingAddress) {}

public record Item(Article article, int quantity) {}

public record Article(int id, String name, String category, BigDecimal deliveryPrice) {}

public record Address(String street, String city, String countryCode) {}
```

Each class has one job, and each can be reused: the search can return a list of `Article` objects, and a customer can have an `Address` too. Note `BigDecimal` for prices: `double` can't represent amounts like 0.10 exactly, and those rounding errors end up on invoices.

Deciding where a class like `Article` can be shared, and where a part of the system needs its own model, is what Domain-Driven Design is about (see [the ubiquitous language](https://codersite.dev/the-ubiquitous-language/){:target="_blank"}). This is the book that started it:

<div>
{%- include domainDrivenDesignAd.html -%}
</div>

## Composition over Inheritance: a Real Requirement

The shop expands into Singapore, where e-cigarettes can't be sold. The search must stop showing them there, while every other country keeps seeing them.

**Option 1: a flag on every article.** Adding `boolean tradable` to `Article` doesn't work: the same article is tradable in Germany and not in Singapore, and one flag can't hold both answers.

**Option 2: inheritance.** A `TradableArticle extends Article` looks object-oriented, but it has the same problem, because being restricted is not something an article *is*; it depends on the country. It also breaks the rest of the code: a `List<TradableArticle>` can't hold normal articles, and the next country with different rules needs yet another subclass.

**Option 3: composition.** The restriction is a separate concept, so it gets its own interface, with one implementation per kind of rule. The search *has* a restriction for each country:

![UML class diagram: ArticleSearch holds a list of Article objects and one SalesRestriction per country; NoRestriction and BlockedCategories implement the SalesRestriction interface](/assets/images/salesRestrictionUml.png "Composition over inheritance: ArticleSearch uses a SalesRestriction per country"){:class="img-responsive"}

```java
public interface SalesRestriction {
  boolean allows(Article article);
}

public class NoRestriction implements SalesRestriction {
  public boolean allows(Article article) {
    return true;
  }
}

public class BlockedCategories implements SalesRestriction {

  private final Set<String> blockedCategories;

  public BlockedCategories(Set<String> blockedCategories) {
    this.blockedCategories = Set.copyOf(blockedCategories);
  }

  public boolean allows(Article article) {
    return !blockedCategories.contains(article.category());
  }
}
```

The search combines the catalog with the restriction for the customer's country:

```java
public class ArticleSearch {

  private final List<Article> catalog;
  private final Map<String, SalesRestriction> restrictionsByCountry;

  public ArticleSearch(List<Article> catalog, Map<String, SalesRestriction> restrictionsByCountry) {
    this.catalog = List.copyOf(catalog);
    this.restrictionsByCountry = Map.copyOf(restrictionsByCountry);
  }

  public SearchResponse search(String text, String countryCode) {
    SalesRestriction restriction = restrictionsByCountry.getOrDefault(countryCode, new NoRestriction());
    List<Article> found = catalog.stream()
        .filter(article -> article.name().toLowerCase().contains(text.toLowerCase()))
        .filter(restriction::allows)
        .toList();
    return new SearchResponse(found);
  }
}
```

With a "Vape Starter Kit" (category *e-cigarettes*) and a "Phone Starter Kit" in the catalog, and `Map.of("SG", new BlockedCategories(Set.of("e-cigarettes")))`:

```text
DE: [Vape Starter Kit, Phone Starter Kit]
SG: [Phone Starter Kit]
```

`Article` didn't change at all. A new country with different rules is one more map entry, and a new *kind* of rule, such as a minimum age, is one more class that implements `SalesRestriction`. This design uses three of the four pillars at once: an abstraction (`SalesRestriction`), polymorphism (each rule decides in its own way) and composition (the search *has* rules instead of *being* one).

## Advantages of OOP, and When It Goes Wrong

Used well, OOP gives you:

- **Modularity:** each class has one job, so a large system becomes many small, understandable parts.
- **Protected rules:** encapsulation keeps objects in a valid state, like the account that can't go negative.
- **Extensibility:** with abstractions and polymorphism, you add features by adding classes instead of changing working code.
- **Testability:** small objects with clear interfaces are easy to test in isolation.
- **Code that matches the business:** classes named after business concepts make the code easier to read; see [best practices for writing clean code](https://codersite.dev/clean-code/){:target="_blank"}.

OOP goes wrong when inheritance hierarchies get deep (a change in a base class breaks subclasses three levels down), when classes become bags of getters and setters with all the logic somewhere else, or when every small idea gets an interface it doesn't need. Modern Java also mixes OOP with functional ideas such as records, lambdas and streams, as the examples above do. Use objects where they make the design clearer, not everywhere.

Everything in this article, from classes and encapsulation to polymorphism and composition, is covered chapter by chapter in my book **[Software Design Principles](https://www.amazon.com/dp/B0HMWNF1Y4){:target="_blank"}**, with worked examples and case studies that go much further than one post can:

<div>
{%- include softwareDesignAd1.html -%}
</div>

What's the difference between overriding and overloading? Why favor composition over inheritance? Every OOP concept above comes up in interviews sooner or later. Walk in ready:

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Please support me as a writer. Every contribution helps, and your donation can help add more articles to this website, no matter how small. Thank you!

{% include buymeacoffee.html %}
<br/>
