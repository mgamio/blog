---
layout: post
title:  "Understanding the Basics of Generics in Java"
description: "Generics in Java provide a powerful and flexible way to create classes, interfaces, and methods that can work with different data types while ensuring type safety"
author: moises
categories: [ programming ]
image: assets/images/javaGenerics.jpg
comments: false
---

Generics in Java provide a powerful and *flexible* way to create classes, interfaces, and methods *that can work with different data types* while ensuring type safety. Introduced in Java 5, generics allow you to write code that is more *reusable* and less error-prone. In this article, we will explore the basics of generics in Java and understand how they contribute to writing robust and maintainable code.

## Boxing and Unboxing

Every data type in Java is either a reference type or a primitive type. The following table shows the eight primitive data types and their corresponding reference type.

---

| Primitive   || Reference |
| ----------- || --------- |
| byte        || Byte      |
| short       || Short     |
| int         || Integer   |
| long        || Long      |
| float       || Float     |
| double      || Double    |
| boolean     || Boolean   |
| char        || Character |

---

**Boxing** happens when a primitive type is converted to the corresponding reference type.
Conversion of the reference type to the corresponding primitive type is called **Unboxing**.
## What are Generics?

Generics in Java enable you to create classes, interfaces, and methods that can operate on any data type without sacrificing type safety. 

The type safety feature of Java simply means the language only allows you to perform the operations allowed by a data type.

Prior to the introduction of generics, classes and methods would often use Object as a generic data type, leading to potential runtime errors and decreased code readability.

Generics introduce the concept of **parameterized types**, allowing you to specify the type of data (reference type) a class or method can work with. This provides compile-time type checking, reducing the likelihood of runtime errors and making your code more robust.

Here is how to do it in Java with generics.

```kotlin
//Boxing to a Wrapper class is automatically inserted - cast
List<Integer> ints = Arrays.asList(1,2,3);

int s = 0;
//Unboxing to a primitive type is automatically inserted
for (int n : ints) { 
  s += n; 
}
```

Here is how to do the same using *cast* in Java before generics:

```kotlin
int int1 = 1;
int int2 = 2;
int int3 = 3;

List ints = Arrays.asList(new Integer[]{(Integer)int1, (Integer)int2, (Integer)int3});

```

*Cast-iron guarantee*: the implicit *casts* added by the compilation of generics **never fail**.

<div>
{%- include inArticleAds.html -%}
</div>

## The Generic Class

Let's start with a basic example of a generic class. Consider a simple **Box** class that can hold any type of object:

```kotlin
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

In this example, the class **Box** is parameterized with a type variable **T**. The type variable is a placeholder for the actual data type that will be specified when an instance of the class is created. You can create a **Box** for different types, such as Box<<Integer>>, Box<<String>>, or any other class or interface.

```kotlin
Box<Integer> integerBox = new Box<>(42);
Box<String> stringBox = new Box<>("Hello, Generics!");
```

## The Generic Method

Generics are not limited to classes; you can also use them in methods. Let's look at an example of a generic method that compares two values:

```kotlin
public class GenericMethodExample {
  public <T> boolean isEqual(T value1, T value2) {
    return value1.equals(value2);
  }
}
```

A method that declares a new type variable **T** at the beginning of the method signature is called a generic method.

In this example, the method **isEqual** is parameterized with a type variable **T**. This allows the method to accept any data type for comparison. You can call the method with different types, and the compiler will perform type checking:

```kotlin
GenericMethodExample example = new GenericMethodExample();
System.out.println(example.isEqual(42, 42)); // true
System.out.println(example.isEqual("hello", "world")); // false
```

<div>
{%- include effectiveJava.html -%}
</div>

## Subtyping and the Substitution Principle

In Java, one type is a *subtype* of another if they are related by an extends clause. Subtyping is transitive.

---

| Type           |   |                  |   | Type      |
| -------------- |   | ---------------- |   | --------- |
| Integer        | - | is a subtype of  | - | Number    |
| Double         | - | is a subtype of  | - | Number    |
| ArrayList<<E>> | - | is a subtype of  | - | List<<E>> |

---

**Substitution Principle**: *wherever a value of type T is expected, you can provide instead a value of a subtype of T.*

Consider the following **add** method, which takes a parameterized type of **E**.

```kotlin
interface Collection<E> {
  public boolean add(E el);
  ...
}
```

According to the Substitution Principle, we may add an integer or a double to a collection of numbers, because *Integer* and *Double* are subtypes of *Number*.

```kotlin
List<Number> nums = new ArrayList<>();
nums.add(7);
nums.add(0.35);
```

The Liskov substitution principle is one of the five [SOLID principles](https://codersite.dev/solid-principles-the-definitive-guide/){:target="_blank"}.

## Wildcards in Generics

Wildcards in generics provide additional flexibility when working with generic types. There are two main wildcard types: **`? extends T`** and **`? super T`**.

The **`? extends T`** wildcard denotes an unknown subtype of type T. It is used when you want to work with a collection of objects of a specific type or any of its subtypes.

```kotlin
public void processList(List<? extends Number> numbers) {
  //Process the list of Numbers or its subtypes
}
```

If a structure contains elements with a type of the form **`? extends T`**, we can get elements out of the structure, but we cannot put elements into the structure. To put elements into the structure, we need a wildcard with `super`.

The **`? super T`** wildcard denotes an unknown supertype of type T. It is used when you want to work with a collection of objects of a specific type or any of its supertypes.

```kotlin
public void addNumbers(List<? super Integer> numbers) {
  //Add integers to the list or its supertypes
}
```

<div>
{%- include algorithmsBook.html -%}
</div>


## The Get and Put Principle

*The Get and Put Principle: use an extends wildcard when you only get elements out of a structure, use a super wildcard when you only put elements into a structure.*

Here is a method, that copies the elements from a source list into a destination list.

```kotlin
public static <T> void copy(List<? super T> dst, List<? extends T> src) {
  for (int i = 0; i < src.size(); i++) {
    dst.set(i, src.get(i));
  }
}
```

The destination list may have elements of any type that is a *supertype* of **T**,  and the source list may have elements of any type that is a *subtype* of **T**.

## Type Erasure

Under the hood, Java uses a process called type erasure to implement generics. This means that generic type information is mostly removed at compile time, and the JVM works with raw types. Type erasure allows for backward compatibility with code written before the introduction of generics.

While type erasure simplifies the integration of generics into the existing Java codebase, it also has some implications. For example, you cannot directly check the type of a generic object at runtime using **instanceof** due to type erasure.

The following code:

```kotlin
List<String> list = new ArrayList<String>();
list.add("Hallo");
String x = list.get(0);
```

It's compiled into:

```kotlin
List list = new ArrayList();
list.add("Hallo");
String x = (String) list.get(0);
```

## In Conclusion

Generics in Java provide a powerful mechanism for writing flexible and type-safe code. By parameterizing classes and methods with type variables, you can create reusable components that work with different data types without sacrificing type safety. Wildcards further enhance the flexibility of generics, allowing you to work with unknown subtypes or supertypes.

Understanding generics is crucial for Java developers, as they are widely used in collections, frameworks, and various libraries. By incorporating generics into your code, you can improve its readability, maintainability, and safety.

