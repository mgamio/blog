---
layout: post
title:  "Smallest Number with the Same Number of Digits in Java (Coding Interview Problem)"
description: "Given N, return the smallest number with the same number of digits: from a slow countdown to an O(digits) solution in Java, with negative numbers, int overflow and Integer.MIN_VALUE handled."
author: moises
categories: [ algorithms ]
image: /assets/images/smallestNumber.jpg
comments: false
---

**The problem:** write a method that, given an integer N, returns the smallest number with the same number of digits.

- Given 4751, return 1000.
- Given 100, return 100.
- Given 1, return 0.

It looks like a warm-up question, and it is one. But it tests more than it seems: whether you clarify the problem before coding, whether you notice a pattern instead of brute-forcing, and whether you think about edge cases such as negative numbers and overflow. This post solves it the way you would in an interview, and every result comes from running the code on Java 25.

## Step 1: clarify the problem

Before writing code, ask the questions the examples don't answer:

- **How many digits does 0 have?** One. So for a one-digit N, the answer is 0, the smallest one-digit number that isn't negative. That's why 1 returns 0 and not 1.
- **What about negative numbers?** For -37, the two-digit numbers go down to -99, so the answer is -99. For -1, it's -9.
- **What's the input type?** An `int`. Keep that in mind: the answer for some negative `int` values doesn't fit in an `int`.

Write the answers down as test cases. They're the specification:

| N | Smallest number with the same number of digits |
|---|---|
| 4751 | 1000 |
| 189 | 100 |
| 37 | 10 |
| 10 | 10 |
| 9 | 0 |
| 0 | 0 |
| -1 | -9 |
| -37 | -99 |
| -100 | -999 |

<div>
{%- include inArticleAds.html -%}
</div>

## Step 2: the brute force

The first idea is to count down from N until the number of digits changes, and return the last number that still had the same count:

```java
public static int smallestByCountingDown(int n) {
  if (n <= 1) return 0;
  int digits = String.valueOf(n).length();
  while (String.valueOf(n - 1).length() == digits) {
    n--;
  }
  return n;
}
```

It's correct for positive numbers, but it does one step for every number between N and the answer, and each step converts a number to a `String`. I timed it:

| N | Answer | Time |
|---|---|---|
| 9,999 | 1,000 | under 1 ms |
| 999,999 | 100,000 | 12 ms |
| 99,999,999 | 10,000,000 | 612 ms |
| 999,999,999 | 100,000,000 | 10.2 seconds |

The work grows with the *value* of N: O(N) steps. More than 10 seconds for a 9-digit number is not an acceptable answer, and an interviewer will ask you to do better.

## Step 3: find the pattern

Look at the answers again: 1000, 100, 10. Each one is a 1 followed by zeros, a power of 10:

- 4751 has 4 digits, and the answer is 10³ = 1000;
- 189 has 3 digits, and the answer is 10² = 100;
- 37 has 2 digits, and the answer is 10¹ = 10.

So for a positive N with d digits, the answer is **10<sup>d − 1</sup>**, except for one-digit numbers, where it's 0. For a negative N with d digits, the answer is the number made of d nines, with a minus sign: **−(10<sup>d</sup> − 1)**, so −99 for two digits.

There's no need to look at any number other than N. You only need its number of digits.

## Step 4: the O(digits) solution

```java
public class NumberUtils {

  public static long smallestWithSameDigitCount(int n) {
    int digits = countDigits(n);
    if (n >= 0) {
      return digits == 1 ? 0 : powerOf10(digits - 1);
    }
    return -(powerOf10(digits) - 1);
  }

  static int countDigits(int n) {
    long value = Math.abs((long) n); // long: Math.abs(Integer.MIN_VALUE) overflows in int
    int digits = 1;
    while (value >= 10) {
      value /= 10;
      digits++;
    }
    return digits;
  }

  static long powerOf10(int exponent) {
    long result = 1;
    for (int i = 0; i < exponent; i++) {
      result *= 10;
    }
    return result;
  }
}
```

Both loops run once per digit, and an `int` has at most 10 digits, so the method takes at most about 20 steps whatever N is. For 999,999,999 it returns 100,000,000 in about 14 nanoseconds, compared with 10.2 seconds for the countdown. For how to reason about this kind of improvement, see [Big O notation in Java](https://codersite.dev/big-o-notation-analysis-of-algorithms/){:target="_blank"}.

<div>
{%- include inArticleAds.html -%}
</div>

## Step 5: the edge cases that break simpler versions

The method returns a `long` and counts digits on a `long`. Both choices fix real bugs in a simpler version that used `int`, `Math.abs` and `(int) Math.pow(...)`:

**The answer doesn't always fit in an int.** -1,000,000,000 has 10 digits, so the answer is -9,999,999,999. The smallest `int` is -2,147,483,648, so an `int` version silently returns garbage: I ran one, and it returned -2,147,483,646. Returning a `long` makes every answer fit.

**`Math.abs(Integer.MIN_VALUE)` is negative.** There's no positive `int` with the value 2,147,483,648, so `Math.abs(-2147483648)` returns -2147483648, and `String.valueOf` of it has 11 characters, the minus sign included. Converting to `long` first, `Math.abs((long) n)`, gives the correct 10 digits.

**`Math.log10` looks shorter, but it's risky.** `(int) Math.log10(n) + 1` counts digits in one line, but `Math.log10(0)` is minus infinity, negative numbers need extra handling, and the result depends on floating-point rounding near powers of 10. The loop of divisions is exact and easy to explain.

## Step 6: test every case in one table

JUnit 5's `@ParameterizedTest` runs the same test for each row of a table, so the specification from step 1 becomes the test:

```java
class NumberUtilsTest {

  @ParameterizedTest
  @CsvSource({
      "4751, 1000",
      "189, 100",
      "37, 10",
      "10, 10",
      "9, 0",
      "1, 0",
      "0, 0",
      "-1, -9",
      "-37, -99",
      "-100, -999",
      "2147483647, 1000000000",
      "-1000000000, -9999999999",
      "-2147483648, -9999999999"
  })
  void returnsTheSmallestNumberWithTheSameDigitCount(int n, long expected) {
    assertEquals(expected, NumberUtils.smallestWithSameDigitCount(n));
  }
}
```

All 13 cases pass. Use `assertEquals(expected, actual)` rather than `assertTrue(actual == expected)`: when a test fails, `assertEquals` tells you both values, and `assertTrue` only tells you it was `false`.

Beyond the table, I compared the method with a slow but obviously correct version, which builds the answer as a string of digits, for a million random `int` values and for every number from -100,000 to 100,000. They always agreed.

## What the interviewer is looking for

1. **Clarifying questions first:** 0, negative numbers, the input and output types.
2. **A working solution, then a better one.** Saying *"the countdown works but it's O(N); the answer only depends on the number of digits"* shows that you analyze your own code.
3. **Edge cases without being asked:** `Integer.MIN_VALUE` and overflow are what separate a good answer from a complete one.
4. **Tests that read like the specification.**

You can find more problems like this one, real interview questions solved step by step from the first idea to clean Java code, in my book **THE CODE INTERVIEW: Real Java Coding Interview Questions, Solved Step by Step**.

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

## FAQ

### Why does N = 1 return 0 and not 1?

Because 0 is also a one-digit number, and it's smaller than 1. If your interviewer wants positive numbers only, the one-digit answer becomes 1; that's exactly the kind of question to ask at the start.

### Why return a long when the input is an int?

Because for negative inputs with 10 digits, the answer is -9,999,999,999, which is smaller than the smallest `int`. With an `int` return type, the method would overflow silently.

### Can I count digits with String.valueOf(n).length()?

For non-negative numbers, yes, and it's easy to read. It's slower than dividing by 10, it counts the minus sign for negative numbers, and it creates a new `String` on every call. In an interview, mention both and explain why you chose one.

### What's the time complexity of the final solution?

O(d), where d is the number of digits of N, which is O(log N). For an `int`, d is at most 10, so in practice it's constant time.

<div>
{%- include inArticleAds.html -%}
</div>

<div>
{% include buymeacoffee.html %}
</div>
