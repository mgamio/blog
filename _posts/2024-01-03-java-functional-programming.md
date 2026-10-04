---
layout: post
title:  "Functional Programming in Java: Lambdas, Streams, Records and Immutability"
description: "A practical introduction to functional programming in Java: pure functions, lambdas, method references, streams on real business data, and why final is not the same as immutable."
author: moises
categories: [ programming ]
image: /assets/images/functionalProgramming.jpg
comments: false
---

You already use functional programming in Java every time you write a lambda or a stream. Used well, it turns a 20-line loop over orders into five readable lines. Used carelessly, it hides bugs. Here are the core ideas, with examples from real business code.

Functional programming treats computation as the evaluation of functions and avoids changing state and mutable data. Java is an object-oriented language, but since Java 8 it has added lambdas, streams and, more recently, records, which make a functional style practical.

## Key Concepts of Functional Programming

### 1. Immutability

In functional programming, data doesn't change after it's created. That removes a whole class of bugs: no other part of the program can modify your data behind your back.

A common misunderstanding is that the `final` keyword makes data immutable. It doesn't: `final` only stops a variable from being **reassigned**.

```java
final int immutableValue = 42;
immutableValue = 24;               // does not compile: cannot assign a value to final variable

final List<String> names = new ArrayList<>();
names.add("Ana");                  // compiles and runs: the list itself can still change
```

For data that really can't change, use unmodifiable collections and records:

```java
List<String> fixed = List.of("Ana", "Ben");
fixed.add("Carl");                 // throws UnsupportedOperationException

record Order(String customer, String status, double amount) { }   // Java 16+
```

A **record** is an immutable data class: its fields are final, and Java generates the constructor, accessors (`order.customer()`), `equals`, `hashCode` and `toString` for you.

### 2. Pure Functions

A pure function's output depends only on its input, and it has no side effects: it doesn't change anything outside itself. For the same input it always returns the same output, which makes it easy to understand and to test.

```java
// Pure function
int add(int a, int b) {
    return a + b;
}
```

### 3. First-Class and Higher-Order Functions

In functional programming, functions are first-class citizens: you can store them in variables, pass them as arguments and return them from methods. Java does this with the functional interfaces in *java.util.function*, such as **Function**, **Predicate** and **Consumer**.

A **higher-order function** takes a function as an argument or returns one. Here, `twice` takes a function and returns a new function that applies it two times:

```java
Function<Integer, Integer> square = x -> x * x;   // a function stored in a variable

static <T> Function<T, T> twice(Function<T, T> f) {
    return f.andThen(f);                            // returns a new function
}

int result = twice(square).apply(2);                // square(square(2)) = 16
```

<div>
{%- include inArticleAds.html -%}
</div>

### 4. Lambda Expressions and Method References

Lambda expressions are a concise way to implement a functional interface (an interface with a single abstract method), using the syntax **(parameters) -> expression**. When a lambda only calls an existing method, a method reference is even shorter:

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// Using a lambda expression
numbers.forEach(number -> System.out.println(number));

// Using a method reference
numbers.forEach(System.out::println);
```

### 5. Streams

The [Stream API](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/Stream.html){:target="_blank"} performs functional-style operations on sequences of elements, such as filtering, mapping and reducing:

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// Using the Stream API to filter and sum
int sum = numbers.stream()
                 .filter(n -> n % 2 == 0)
                 .mapToInt(Integer::intValue)
                 .sum();                     // 2 + 4 = 6
```

## A Real Example: Summing Orders

Numbers make the syntax clear, but streams pay off on business data. Given a list of orders, we want the total amount of shipped orders per customer:

```java
List<Order> orders = List.of(
    new Order("ACME", "SHIPPED", 120.0),
    new Order("Globex", "OPEN", 80.0),
    new Order("ACME", "SHIPPED", 30.5),
    new Order("Initech", "SHIPPED", 200.0),
    new Order("Globex", "SHIPPED", 45.0));

Map<String, Double> shippedByCustomer = orders.stream()
    .filter(o -> o.status().equals("SHIPPED"))
    .collect(Collectors.groupingBy(Order::customer, TreeMap::new,
             Collectors.summingDouble(Order::amount)));
```

```text
{ACME=150.5, Globex=45.0, Initech=200.0}
```

The stream reads like the requirement: *keep the shipped orders, group them by customer, sum the amounts*. Here is the same logic as a loop, which gives the same result:

```java
Map<String, Double> totals = new TreeMap<>();
for (Order o : orders) {
  if (o.status().equals("SHIPPED")) {
    totals.merge(o.customer(), o.amount(), Double::sum);
  }
}
```

Both versions are correct. The stream version states *what* you want; the loop spells out *how* to do it, step by step.

Want to know when to use streams, and when a plain loop is better? *Effective Java* has a whole chapter on lambdas and streams:

<div>
{%- include effectiveJava.html -%}
</div>

## Benefits of Functional Programming

### 1. Readability and Conciseness

A declarative style describes the result you want instead of the steps to get there, as the orders example shows. The code is shorter and closer to the business requirement.

### 2. Parallelism and Concurrency

Immutable data and the absence of shared state make code easier to reason about when several threads run it, and the Stream API can run some operations in parallel.

### 3. Fewer Bugs from Side Effects

Pure functions and immutable data can't be changed by other parts of the program, so their behavior is predictable.

### 4. Testability

A pure function needs no setup and no mocks: call it with an input and check the output.

## Common Pitfalls

- **Side effects inside lambdas.** Adding to an outside list in `forEach` or `map` works in a simple sequential stream but breaks with `parallel()`. Collect the result instead: `numbers.stream().filter(n -> n % 2 == 0).toList()` returns `[2, 4]`.
- **`parallel()` is not free.** Splitting the work and merging the results has a cost. For small collections or cheap operations, a parallel stream is often slower. Measure before you use it.
- **A stream can be used only once.** Calling a second terminal operation on the same stream throws `IllegalStateException: stream has already been operated upon or closed`.

Not all problems are well suited for a functional approach. Often a mix of functional and [object-oriented programming](https://codersite.dev/understanding-oop-concepts/){:target="_blank"} is the most pragmatic solution.

## Key Takeaways

- `final` prevents reassignment; `List.of` and records give you real immutability.
- Pure functions depend only on their input and change nothing else.
- Lambdas and method references let you pass behavior as a value.
- Streams turn "filter, group, sum" requirements into code that reads like the requirement.
- Avoid side effects in lambdas, measure before using `parallel()`, and never reuse a stream.

Every example in this post compiles and runs as shown with Java 17.

Streams and lambdas come up in almost every Java interview: rewrite this loop as a stream, explain what a pure function is. Practice with real questions:

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Please support me as a writer. Your donation will help add more articles to this website. Thank you!

{% include buymeacoffee.html %}
<br/>
