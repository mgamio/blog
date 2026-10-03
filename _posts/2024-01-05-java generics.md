---
layout: post
title:  "Java Generics Explained: Wildcards, PECS and Type Erasure with Examples"
description: "Learn Java generics with runnable examples: generic classes and methods, why a list of Integer is not a list of Number, extends and super wildcards (PECS), bounded types and type erasure."
author: moises
categories: [ programming ]
image: /assets/images/javaGenerics.jpg
comments: false
---

Before Java 5, every collection held `Object`, and every value you took out needed a cast, which could fail at runtime. Generics moved that check to the compiler. Here's how they work, from a simple `Box<T>` to the wildcard rules that confuse even experienced developers.

## Boxing and Unboxing

Every data type in Java is either a reference type or a primitive type. Generics only work with reference types, so each primitive type has a corresponding wrapper class:

| Primitive | Reference |
|---|---|
| `byte` | `Byte` |
| `short` | `Short` |
| `int` | `Integer` |
| `long` | `Long` |
| `float` | `Float` |
| `double` | `Double` |
| `boolean` | `Boolean` |
| `char` | `Character` |

<br/>

**Boxing** happens when a primitive type is converted to the corresponding reference type. Converting the reference type back to the primitive type is called **unboxing**. Since Java 5, the compiler does both automatically.

## The Problem Generics Solve

Before generics, a `List` could hold anything. You had to cast every element you took out, and box every number you put in:

```java
List ints = new ArrayList();
ints.add(new Integer(1));
ints.add(new Integer(2));
ints.add(new Integer(3));

int s = 0;
for (Iterator it = ints.iterator(); it.hasNext(); ) {
  s += ((Integer) it.next()).intValue();
}
```

Worse, nothing stopped a wrong type from getting in. The mistake only showed up later, at runtime:

```java
List ints = new ArrayList();
ints.add("42");                      // compiles
Integer n = (Integer) ints.get(0);   // ClassCastException at runtime
```

With generics, the list knows its element type. Boxing, unboxing and the casts are inserted for you, and the compiler rejects the wrong type:

```java
List<Integer> ints = Arrays.asList(1, 2, 3);   // boxing is automatic

int s = 0;
for (int n : ints) {                           // unboxing is automatic
  s += n;
}
```

```java
List<Integer> ints = new ArrayList<>();
ints.add("42");   // does not compile: String cannot be converted to Integer
```

The *cast-iron guarantee*: if your code compiles without unchecked warnings, the casts the compiler inserts for generics never fail.

## The Generic Class

Let's start with a basic example of a generic class. Consider a simple **Box** class that can hold any type of object:

```java
public class Box<T> {
  private T value;

  public Box(T value) {
    this.value = value;
  }

  public T getValue() {
    return value;
  }
}
```

<div>
{%- include inArticleAds.html -%}
</div>

In this example, the class **Box** is parameterized with a type variable **T**. The type variable is a placeholder for the actual type, which you specify when you create an instance. You can create a `Box<Integer>`, a `Box<String>`, or a box for any other class or interface:

```java
Box<Integer> integerBox = new Box<>(42);
Box<Article> articleBox = new Box<>(article);
Box<String> stringBox = new Box<>("Hello, Generics!");
```

## The Generic Method

Generics are not limited to classes; you can also use them in methods. Here is a generic method that compares two values:

```java
public class GenericMethodExample {
  public <T> boolean isEqual(T value1, T value2) {
    return value1.equals(value2);
  }
}
```

A method that declares its own type variable, here `<T>` before the return type, is called a generic method. The compiler infers **T** from the arguments:

```java
GenericMethodExample example = new GenericMethodExample();
System.out.println(example.isEqual(42, 42));            // true
System.out.println(example.isEqual("hello", "world"));  // false
```

Generics are a design tool: they let one class or method serve many types safely. For more design decisions like this, explained with real-world examples:

<div>
{%- include softwareDesign.html -%}
</div>

## Bounded Type Parameters

Sometimes a method needs more than "any type". To find the largest element, the elements must be comparable. A **bounded type parameter** says exactly that:

```java
public static <T extends Comparable<T>> T max(List<T> list) {
  T best = list.get(0);
  for (T item : list) {
    if (item.compareTo(best) > 0) {
      best = item;
    }
  }
  return best;
}
```

```java
max(Arrays.asList(3, 9, 4));                  // 9
max(Arrays.asList("pear", "apple", "plum"));  // "plum"
```

`<T extends Comparable<T>>` means "any type T that can be compared with itself". Calling `max` with a list of plain `Object`s doesn't compile, because `Object` doesn't implement `Comparable`.

## Subtyping and the Substitution Principle

In Java, one type is a *subtype* of another if they are related by an `extends` or `implements` clause. Subtyping is transitive.

| Type | is a subtype of | Type |
|---|---|---|
| `Integer` | is a subtype of | `Number` |
| `Double` | is a subtype of | `Number` |
| `ArrayList<E>` | is a subtype of | `List<E>` |

<br/>

**Substitution Principle**: *wherever a value of type T is expected, you can provide instead a value of a subtype of T.*

Consider the **add** method of a collection, which takes an element of type **E**:

```java
interface Collection<E> {
  public boolean add(E el);
  ...
}
```

According to the Substitution Principle, we may add an integer or a double to a collection of numbers, because *Integer* and *Double* are subtypes of *Number*.

```java
List<Number> nums = new ArrayList<>();
nums.add(7);
nums.add(0.35);   // nums is [7, 0.35]
```

The Liskov substitution principle is one of the five [SOLID principles](https://codersite.dev/solid-principles-the-definitive-guide/){:target="_blank"}.

## Why `List<Integer>` Is Not a `List<Number>`

`Integer` is a subtype of `Number`, so it's natural to expect a `List<Integer>` to be a `List<Number>`. It isn't:

```java
List<Integer> ints = new ArrayList<>();
List<Number> nums = ints;   // does not compile
nums.add(3.14);             // ...because otherwise this would put a Double into ints
```

If the second line were allowed, `nums` and `ints` would be the same list, and you could add a `Double` to a list that promises to contain only integers. So generic types are *invariant*: `List<Integer>` and `List<Number>` are unrelated types. Wildcards are how you get the flexibility back safely.

## Wildcards in Generics

There are two main wildcard types: `? extends T` and `? super T`.

The `? extends T` wildcard denotes an unknown subtype of type T. Use it when a method only **reads** elements:

```java
List<Integer> ints = Arrays.asList(1, 2, 3);
List<? extends Number> nums = ints;   // compiles
Number first = nums.get(0);           // reading is fine: every element is a Number
nums.add(3.14);                       // does not compile: the list could be a List<Integer>
```

The `? super T` wildcard denotes an unknown supertype of type T. Use it when a method only **writes** elements:

```java
List<Number> numbers = new ArrayList<>();
List<? super Integer> sink = numbers;   // compiles
sink.add(7);                            // writing an Integer is fine
Integer x = sink.get(0);                // does not compile: you only know it's an Object
```

## The Get and Put Principle (PECS)

*The Get and Put Principle: use an extends wildcard when you only get elements out of a structure, use a super wildcard when you only put elements into a structure.*

Joshua Bloch gives the same rule a memorable name in *Effective Java*: **PECS**, "Producer Extends, Consumer Super". A list that produces values for you is `? extends T`; a list that consumes values from you is `? super T`.

Here is a method that copies the elements from a source list into a destination list:

```java
public static <T> void copy(List<? super T> dst, List<? extends T> src) {
  for (int i = 0; i < src.size(); i++) {
    dst.set(i, src.get(i));
  }
}
```

The source *produces* elements, so it uses `extends`. The destination *consumes* them, so it uses `super`. That makes the method work across types:

```java
List<Object> objs = Arrays.asList(2, 3.14, "four");
List<Integer> ints = Arrays.asList(5, 6);
copy(objs, ints);   // objs is now [5, 6, four]
```

In *Effective Java*, Joshua Bloch explains PECS and many more rules for getting the most out of generics:

<div>
{%- include effectiveJava.html -%}
</div>

## Type Erasure

Under the hood, Java implements generics with *type erasure*: the compiler checks the types, then removes them. At runtime, the JVM works with raw types. This kept generic code compatible with code written before Java 5.

The following code:

```java
List<String> list = new ArrayList<String>();
list.add("Hallo");
String x = list.get(0);
```

is compiled into:

```java
List list = new ArrayList();
list.add("Hallo");
String x = (String) list.get(0);
```

Erasure has visible consequences:

```java
List<String> strings = new ArrayList<>();
List<Integer> numbers = new ArrayList<>();
System.out.println(strings.getClass() == numbers.getClass());   // true: both are just ArrayList

Object obj = new ArrayList<String>();
boolean b = obj instanceof List<String>;   // does not compile: the type argument isn't known at runtime
```

The terms *cast-iron guarantee* and *Get and Put Principle*, and the `copy` example, come from Maurice Naftalin and Philip Wadler's book *Java Generics and Collections* (O'Reilly), still one of the best deep dives on the topic.

## Key Takeaways

- Generics move type errors from runtime (`ClassCastException`) to compile time.
- `List<Integer>` is **not** a `List<Number>`: generic types are invariant.
- Use `? extends T` to read and `? super T` to write: Producer Extends, Consumer Super.
- Use bounded type parameters like `<T extends Comparable<T>>` when a method needs specific capabilities.
- Type information is erased at runtime, so you can't test `instanceof List<String>`.

Every example in this post compiles (or fails to compile) exactly as shown with Java 17.

Generics questions are interview favorites: why is `List<Integer>` not a `List<Number>`? What does type erasure remove? Practice with real interview questions:

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Please support me as a writer. Your donation will help add more articles to this website. Thank you!

{% include buymeacoffee.html %}
<br/>
