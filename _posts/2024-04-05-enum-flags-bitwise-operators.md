---
layout: post
title:  "Enum, Flags and bitwise operators"
description: "Enum, Flags and bitwise operators"
author: moises
categories: [ programming ]
image: assets/images/enumBitWiseOperators.jpg
comments: false
---

Java enums, bit flags, and bitwise operations are powerful features that can greatly enhance the functionality and efficiency of your code. Understanding how to leverage these features effectively can lead to cleaner, more concise code and improved performance. In this article, we'll explore what Java enums are, how to use them, and how to combine them with bit flags and bitwise operations for advanced functionality.



## Understanding Java Enum Types

Java enums are a special type of class used to represent a fixed set of constants. They allow you to define a clear and concise set of values that a variable can take. Enums provide type safety, meaning that the compiler can catch errors such as assigning an incorrect value to an enum variable at compile time rather than runtime.

Here's a simple example of how to define an enum in Java:

```kotlin
public enum Day {
  SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY
}
```

However, their capabilities extend beyond simple constant definitions. Enums can also have fields, constructors, and methods, making them versatile and powerful constructs in Java programming.

## Bit Flags: Efficient Representation of Multiple States

Bit flags are a technique used to represent multiple boolean states using a single integer value. Each bit in the integer represents a different state, allowing for efficient storage and manipulation of multiple flags in a compact form.

For example, consider a set of boolean flags representing all possible issues during the process of creating an order:

```kotlin
public class ISSUES_ORDERPOSITION {
  public static final int QUANTITY_ERROR = 1;             // 00000001
  public static final int PRICE_DIFFERS_WARNING = 2;      // 00000010
  public static final int ARTICLE_INVALID_ERROR = 4;      // 00000100
  public static final int ARTICLE_REMOVED_ERROR = 8;      // 00001000
  public static final int ARTICLE_NOTALLOWED_ERROR = 16;  // 00010000
}
```

In this example, each flag is represented by a different bit position in the integer value. By combining these flags using bitwise operations, we can represent and manipulate different combinations of issues efficiently.

<div>
{%- include inArticleAds.html -%}
</div>

## Bitwise Operations

Bitwise operations are fundamental operations that manipulate individual bits in binary representations of data. Java provides several bitwise operators for performing these operations:

- AND (&): Sets each bit to 1 if both bits are 1.
- OR (|): Sets each bit to 1 if at least one of the corresponding bits is 1.
- XOR (^): Sets each bit to 1 if only one of the corresponding bits is 1.
- NOT (~): Flips the bits.
- Shift Left (<<): Shifts the bits to the left by a specified number of positions.
- Shift Right (>>): Shifts the bits to the right by a specified number of positions.

*enums* can be decorated with Flags. This allows them to be treated as bit masks, storing multiple values between them. Here is how it looks in our enumeration.

```kotlin
enum ISSUES_ORDERPOSITION
{
  QUANTITY_ERROR(1),            //Status Bit: 1
  PRICE_DIFFERS_WARNING(2),     //Status Bit: 2
  ARTICLE_INVALID_ERROR(4),     //Status Bit: 3
  ARTICLE_REMOVED_ERROR(8),     //Status Bit: 4
  ARTICLE_NOTALLOWED_ERROR(16); //Status Bit: 5

  private final int value;

  ISSUES_ORDERPOSITION(int value) {
    this.value = value;
  }

  public int getValue() {
    return value;
  }
}
```

In this example, **ISSUES_ORDERPOSITION** is an enum type representing the possible issues that could happen when an API Server processes the positions of an order.

## Combining and Manipulating Bits

By combining enums with bit flags and bitwise operations, you can create powerful constructs for representing complex states and behaviors in your Java applications. 

For example, A client application sends data to an external API Server that involves different internal sub-processes, which could generate errors and warnings.

The Client application should be able to handle all of these potential errors and warnings simultaneously after submitting a single request.

Here's an example demonstrating how to use enums with bit flags and bitwise operations:

```kotlin
public class EnumBitMask {
  public static void main(String[] args) {
    // Combine flags using OR operator
    int issues = ISSUES_ORDERPOSITION.PRICE_DIFFERS_WARNING.getValue()
        | ISSUES_ORDERPOSITION.QUANTITY_ERROR.getValue();
    // Check if PRICE_DIFFERS_WARNING issue is set
    if ((issues & ISSUES_ORDERPOSITION.PRICE_DIFFERS_WARNING.getValue()) != 0) {
      System.out.println("The article transmitted contains a differing price compared with the data on server side");
    }
    // Check if QUANTITY_ERROR issue is set
    if ((issues & ISSUES_ORDERPOSITION.QUANTITY_ERROR.getValue()) != 0) {
      System.out.println("The transmitted quantity is invalid");
    }
  }
}
```

In this example, we combine the ISSUES_ORDERPOSITION and PRICE_DIFFERS_WARNING issues using the bitwise OR operator. We then use the bitwise AND operator (&) to check if each issue is set individually.


## Conclusion

Java enums, bit flags, and bitwise operations are powerful features that can be combined to create expressive, efficient, and type-safe code. By leveraging enums to define a set of constants, bit flags to represent multiple states efficiently, and bitwise operations to manipulate these states, you can build robust and flexible Java applications. Mastering these concepts will enable you to write cleaner, more concise code and unlock new possibilities in your Java development projects.

<div>
{%- include jediJavaInterviewAds.html -%}
</div>
