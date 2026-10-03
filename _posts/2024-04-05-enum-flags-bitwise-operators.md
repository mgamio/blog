---
layout: post
title:  "Java Bit Flags with Enums: Combine, Check and Decode Errors with Bitwise Operators and EnumSet"
description: "Report several errors in one int: how to combine, test, remove and decode bit flags with Java enums and bitwise operators, and when to use EnumSet instead."
author: moises
categories: [ programming ]
image: /assets/images/enumBitWiseOperators.jpg
comments: false
---

An order API has to report several problems at once: a wrong quantity, a price difference and an article that no longer exists. Sending a list of strings works, but many APIs pack them into a single number instead. Here's how to build, read and decode those bit flags in Java.

## Understanding Java Enum Types

Java enums are a special type of class used to represent a fixed set of constants. They allow you to define a clear and concise set of values that a variable can take. Enums provide type safety, meaning that the compiler can catch errors such as assigning an incorrect value to an enum variable at compile time rather than runtime.

Here's a simple example of how to define an enum in Java:

```java
public enum Day {
  SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY
}
```

Enums can also have fields, constructors, and methods, which is exactly what we'll use below.

## Bit Flags: Several States in One Number

Bit flags represent multiple yes/no states with a single integer. Each bit in the integer stands for a different state, so one `int` can carry up to 32 flags.

For example, consider the issues an API server can detect while it processes the positions of an order:

```java
public class OrderPositionFlags {
  public static final int QUANTITY_ERROR = 1;             // 00001
  public static final int PRICE_DIFFERS_WARNING = 2;      // 00010
  public static final int ARTICLE_INVALID_ERROR = 4;      // 00100
  public static final int ARTICLE_REMOVED_ERROR = 8;      // 01000
  public static final int ARTICLE_NOTALLOWED_ERROR = 16;  // 10000
}
```

Each flag is a power of two, so each one occupies a different bit. A position with a wrong quantity *and* a price difference is simply `1 + 2 = 3`, or `00011` in binary.

<div>
{%- include inArticleAds.html -%}
</div>

## Bitwise Operations

Bitwise operators work on the individual bits of a number. Here is what each one does, with examples on five-bit flag values:

| Operator | Meaning | Example | Used for |
|---|---|---|---|
| `&` AND | 1 only where both bits are 1 | `00011 & 00010` = `00010` | checking a flag |
| <code>&#124;</code> OR | 1 where at least one bit is 1 | <code>00011 &#124; 01000</code> = `01011` | adding a flag |
| `^` XOR | 1 where exactly one bit is 1 | `00011 ^ 00001` = `00010` | toggling a flag |
| `~` NOT | flips every bit | `~00001` = `…11110` | removing a flag (with `&`) |
| `<<` shift left | moves the bits left | `1 << 3` = `01000` (8) | building flag values |
| `>>` shift right | moves the bits right | `01000 >> 3` = `00001` | reading a bit position |

<br/>

Java has no special flags syntax, but an enum can carry the bit value of each flag:

```java
enum OrderPositionIssue {
  QUANTITY_ERROR(1),            // bit 1: 00001
  PRICE_DIFFERS_WARNING(2),     // bit 2: 00010
  ARTICLE_INVALID_ERROR(4),     // bit 3: 00100
  ARTICLE_REMOVED_ERROR(8),     // bit 4: 01000
  ARTICLE_NOTALLOWED_ERROR(16); // bit 5: 10000

  private final int value;

  OrderPositionIssue(int value) {
    this.value = value;
  }

  public int getValue() {
    return value;
  }
}
```

**OrderPositionIssue** represents the possible issues that can happen when an API server processes the positions of an order. Java type names use UpperCamelCase, which is why the enum isn't called `ISSUES_ORDERPOSITION`.

## Combining and Checking Flags

A [client application](https://codersite.dev/building-rest-api-client/){:target="_blank"} sends an order to an external API server. The server runs several internal checks, and each one can produce an error or a warning. The client must be able to handle all of them after a single request.

```java
public class EnumBitMask {
  public static void main(String[] args) {
    // Combine flags using the OR operator
    int issues = OrderPositionIssue.PRICE_DIFFERS_WARNING.getValue()
        | OrderPositionIssue.QUANTITY_ERROR.getValue();      // 00011 = 3
    // Check if PRICE_DIFFERS_WARNING is set
    if ((issues & OrderPositionIssue.PRICE_DIFFERS_WARNING.getValue()) != 0) {
      System.out.println("The article transmitted contains a differing price compared with the data on server side");
    }
    // Check if QUANTITY_ERROR is set
    if ((issues & OrderPositionIssue.QUANTITY_ERROR.getValue()) != 0) {
      System.out.println("The transmitted quantity is invalid");
    }
  }
}
```

In this example, we combine QUANTITY_ERROR and PRICE_DIFFERS_WARNING using the bitwise OR operator (`|`), which gives `00011`. We then use the bitwise AND operator (`&`) to check whether each issue is set: the result is non-zero only if that flag's bit is 1.

## Remove and Toggle a Flag

To **remove** a flag, AND the mask with the flag's inverted bits. To **toggle** a flag (turn it on if it's off, off if it's on), use XOR:

```java
int issues = 3;                                                 // 00011

issues &= ~OrderPositionIssue.QUANTITY_ERROR.getValue();        // 00011 & 11110 = 00010 (2)

issues ^= OrderPositionIssue.ARTICLE_REMOVED_ERROR.getValue();  // 00010 ^ 01000 = 01010 (10)
issues ^= OrderPositionIssue.ARTICLE_REMOVED_ERROR.getValue();  // 01010 ^ 01000 = 00010 (2)
```

## Decode a Mask from the Server

On the client side, the typical situation is the reverse: the server returns a single number, and you need to know which issues it contains. Loop over the enum values and test each bit:

```java
static EnumSet<OrderPositionIssue> decode(int mask) {
  EnumSet<OrderPositionIssue> issues = EnumSet.noneOf(OrderPositionIssue.class);
  for (OrderPositionIssue issue : OrderPositionIssue.values()) {
    if ((mask & issue.getValue()) != 0) issues.add(issue);
  }
  return issues;
}
```

```text
decode(5)  = [QUANTITY_ERROR, ARTICLE_INVALID_ERROR]
decode(26) = [PRICE_DIFFERS_WARNING, ARTICLE_REMOVED_ERROR, ARTICLE_NOTALLOWED_ERROR]
```

`5` is `00101`, so bits 1 and 3 are set. `26` is `11010`, so bits 2, 4 and 5 are set.

## Prefer EnumSet Inside Your Code

`EnumSet` is the standard Java collection for sets of enum values. Internally it is also a bit mask, so it's just as compact and fast, but it's type-safe and it reads like plain English:

```java
EnumSet<OrderPositionIssue> issues = EnumSet.of(
    OrderPositionIssue.PRICE_DIFFERS_WARNING,
    OrderPositionIssue.ARTICLE_REMOVED_ERROR);

issues.remove(OrderPositionIssue.PRICE_DIFFERS_WARNING);
if (issues.contains(OrderPositionIssue.ARTICLE_REMOVED_ERROR)) {
  System.out.println("The article was removed from the assortment");
}
```

Convert to an `int` only at the boundary, when you send or receive data:

```java
static int encode(Set<OrderPositionIssue> issues) {
  int mask = 0;
  for (OrderPositionIssue issue : issues) mask |= issue.getValue();
  return mask;
}
```

`encode(EnumSet.of(PRICE_DIFFERS_WARNING, ARTICLE_REMOVED_ERROR))` returns `10` (`01010`), and `encode(decode(mask))` always gives back the original mask.

## When to Use What

- **An `int` bit mask:** compact wire formats, legacy APIs, database columns, and code where every byte counts.
- **`EnumSet`:** everywhere else in your Java code. You get the same performance with readable, type-safe operations like `add`, `remove` and `contains`.
- **Between the two:** one `decode` and one `encode` method, at the edge of your application.

Bit manipulation is a classic interview topic: check if a number is a power of two, count the set bits, swap two values without a temporary variable. Practice it on real questions:

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Please support me as a writer. Your donation will help add more articles to this website. Thank you!

{% include buymeacoffee.html %}
<br/>
