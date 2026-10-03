---
layout: post
title:  "Java OCP Practice Questions: Building Blocks, with Answers Explained"
description: "10 original practice questions for the Oracle Certified Professional Java exam on default values, var, scope, text blocks, garbage collection and imports, each with a hidden answer and a step-by-step explanation."
author: moises
categories: [ programming ]
image: /assets/images/javaCertifiedBuildingBlocks.jpg
comments: false
---

The OCP Java exam doesn't test whether you can write code. It tests whether you can read code like a compiler: which line fails, what exactly gets printed, which object is gone. Try these ten questions before you open the answers.

They cover the "Java building blocks" topics of the Oracle Certified Professional exam for Java SE 17 (1Z0-829). The same rules also apply to the Java SE 21 exam (1Z0-830). Every answer below was checked by compiling and running the code with Java 17 rules.

<style>
.ocp-answer { margin: 0 0 2rem; border-left: 4px solid #194175; padding: .25rem 0 .25rem 1rem; }
.ocp-answer summary { cursor: pointer; font-weight: 700; color: #194175; }
</style>

## 1. Default Values

What does this program print?

```java
public class Defaults {
    static boolean flag;
    static char letter;
    static double ratio;
    static String name;
    static int[] scores = new int[2];

    public static void main(String[] args) {
        System.out.println(flag + " " + ratio + " " + name + " " + scores[1]);
        System.out.println((int) letter);
    }
}
```

- **A.** `false 0.0 null 0`, then `0`
- **B.** `false 0 null 0`, then an empty line
- **C.** `false 0.0  0`, then `0`
- **D.** The code does not compile, because `name` is never initialized.
- **E.** A `NullPointerException` is thrown.

<details class="ocp-answer" markdown="1">
<summary>Show answer</summary>

**Answer: A.** Fields (static or instance) get default values: `false` for `boolean`, `0.0` for `double`, `null` for any reference such as `String`, and `'\u0000'` for `char`, which prints as `0` once cast to `int`. Array elements also get defaults, so `scores[1]` is `0`. Concatenating `null` into a string is allowed and prints `null`, so there is no exception.
</details>

## 2. Definite Assignment

Does this method compile?

```java
public class Shipping {
    static int cost(boolean express, int weight) {
        int base;
        if (weight > 10) {
            base = 20;
        } else if (weight > 0) {
            base = 10;
        }
        int extra;
        if (express) extra = 5; else extra = 0;
        return base + extra;
    }
}
```

- **A.** Yes.
- **B.** No, because `base` might not be initialized.
- **C.** No, because `extra` might not be initialized.
- **D.** No, because of both `base` and `extra`.

<details class="ocp-answer" markdown="1">
<summary>Show answer</summary>

**Answer: B.** Local variables have no default value, and the compiler must be able to prove they are assigned before use. `base` is not assigned when `weight` is `0` or negative, because the `if`/`else if` chain has no final `else`, so the compiler reports *variable base might not have been initialized*. `extra` is fine: both branches of its `if`/`else` assign it.
</details>

## 3. Local Variable Type Inference with var

Which of these lines compile as local variable declarations inside a method? (Choose all that apply.)

- **A.** `var count = 10, total = 20;`
- **B.** `var price = 9.99f;`
- **C.** `var empty = null;`
- **D.** `var var = "var";`
- **E.** `var numbers = {1, 2, 3};`
- **F.** `var names = new ArrayList<>();`
- **G.** `var counter;`

<details class="ocp-answer" markdown="1">
<summary>Show answer</summary>

**Answer: B, D, F.**

- **B** infers `float`.
- **D** compiles because `var` is a *reserved type name*, not a keyword, so it can still be used as a variable name.
- **F** compiles and infers `ArrayList<Object>`, because the diamond has no type to work with.
- **A** fails: `var` is not allowed in a compound declaration.
- **C** fails: `null` has no type to infer.
- **E** fails: an array initializer needs an explicit type, such as `int[] numbers = {1, 2, 3};`.
- **G** fails: `var` needs an initializer.
</details>

## 4. Numeric Literals

Which declarations compile? (Choose all that apply.)

- **A.** `int million = 1_000_000;`
- **B.** `int hex = 0x_FF;`
- **C.** `double pi = 3._14;`
- **D.** `long big = 3_000_000_000;`
- **E.** `long big2 = 3_000_000_000L;`
- **F.** `int bits = 0b1010__1010;`
- **G.** `int trailing = 100_;`

<details class="ocp-answer" markdown="1">
<summary>Show answer</summary>

**Answer: A, E, F.** Underscores may appear only *between* digits, and several in a row are allowed (**F**). They can't come right after a prefix such as `0x` (**B**), next to a decimal point (**C**), or at the end (**G**). **D** fails for a different reason: without the `L` suffix, `3_000_000_000` is an `int` literal, and it's too large for an `int` even though the variable is a `long`. **E** adds the `L`.
</details>

## 5. Variable Scope

How many variables are in scope at the line marked `// HERE`?

```java
public class Inventory {
    static int warehouses = 3;
    String region;

    void audit(int[] stock) {
        int total = 0;
        for (int i = 0; i < stock.length; i++) {
            int item = stock[i];
            total += item;
        }
        if (total > 100) {
            boolean large = true;
        }
        String label = "audit";
        // HERE
    }
}
```

- **A.** 3
- **B.** 4
- **C.** 5
- **D.** 6
- **E.** 7
- **F.** 8

<details class="ocp-answer" markdown="1">
<summary>Show answer</summary>

**Answer: C, 5.** In scope are the static field `warehouses`, the instance field `region`, the parameter `stock`, and the locals `total` and `label`. The loop variables `i` and `item` end with the `for` block, and `large` ends with the `if` block. A local variable's scope ends at the closing brace of the block it was declared in.
</details>

Want to go deeper than practice questions? This is the study guide most OCP candidates use, with every exam objective explained: [**OCP Oracle Certified Professional Java SE 17 Developer Study Guide**](https://amzn.to/3BvCHcQ){:target="_blank"}.

## 6. Text Blocks

Which statements about the output are true? (Choose all that apply.)

```java
public class Query {
    public static void main(String[] args) {
        String sql = """
            SELECT id, name
              FROM users \
            WHERE active = true
            """;
        System.out.print(sql);
    }
}
```

- **A.** The output has two lines.
- **B.** The output has three lines.
- **C.** The second line starts with two spaces.
- **D.** Every line starts with four spaces.
- **E.** The printed text ends with a line break.
- **F.** The code does not compile.

<details class="ocp-answer" markdown="1">
<summary>Show answer</summary>

**Answer: A, C, E.** Java removes the *incidental* indentation: the smallest indentation among the content lines and the closing `"""`. That leaves `FROM` with its two extra spaces (**C**) and no line with four leading spaces (**D** is false). The backslash at the end of the second line is a line continuation, so `FROM users` and `WHERE active = true` are joined into one line, giving two lines in total (**A**):

```text
SELECT id, name
  FROM users WHERE active = true
```

Because the closing `"""` is on its own line, the string ends with a line break (**E**).
</details>

<div>
{%- include inArticleAds.html -%}
</div>

## 7. Garbage Collection

Which statement is true?

```java
public class Session {
    Session next;

    public static void main(String[] args) {
        Session s1 = new Session();   // object A
        Session s2 = new Session();   // object B
        Session s3 = new Session();   // object C
        s1.next = s2;
        s2.next = s3;
        s2 = null;                    // point 1
        s3 = s1;                      // point 2
        s1 = null;                    // point 3
        s3.next = null;               // point 4
    }
}
```

- **A.** Object B is eligible for garbage collection after point 1.
- **B.** Object C is eligible for garbage collection after point 2.
- **C.** Object A is eligible for garbage collection after point 3.
- **D.** Objects B and C are eligible for garbage collection after point 4.
- **E.** Object A is eligible for garbage collection after point 4.
- **F.** Calling `System.gc()` after point 4 guarantees that B and C are removed.

<details class="ocp-answer" markdown="1">
<summary>Show answer</summary>

**Answer: D.** An object is eligible once no live reference can reach it. Trace the references:

```text
start    s1 -> A -> B -> C      s2 -> B      s3 -> C
point 1  s1 -> A -> B -> C                   s3 -> C
point 2  s1 -> A -> B -> C      s3 -> A      (C still reachable through A -> B -> C)
point 3                         s3 -> A -> B -> C
point 4                         s3 -> A      (A.next is null: B and C are unreachable)
```

A is still referenced by `s3`, so **E** is false. **F** is false because `System.gc()` is only a request: the JVM decides if and when to collect.
</details>

## 8. Primitive Conversions

Given `byte level = 10;`, which statements compile? (Choose all that apply.)

- **A.** `level = level + 1;`
- **B.** `level += 1;`
- **C.** `float rate = 2.5;`
- **D.** `char c = 'a' + 1;`
- **E.** `short s = 40_000;`
- **F.** `long total = level * 2;`
- **G.** `int x = 7 / 2.0;`

<details class="ocp-answer" markdown="1">
<summary>Show answer</summary>

**Answer: B, D, F.**

- **A** fails: arithmetic on `byte` values produces an `int`, which doesn't fit back into a `byte` without a cast.
- **B** compiles, because compound assignment operators include an implicit cast.
- **C** fails: `2.5` is a `double` literal; use `2.5f`.
- **D** compiles: `'a' + 1` is a constant expression whose value (98) fits in a `char`.
- **E** fails: 40,000 is outside the `short` range (-32,768 to 32,767).
- **F** compiles: the `int` result widens to `long` automatically.
- **G** fails: dividing by `2.0` produces a `double`.
</details>

## 9. Autoboxing and Equality

With default JVM settings, what does this print?

```java
public class Boxes {
    public static void main(String[] args) {
        Integer a = 127, b = 127;
        Integer c = 128, d = 128;
        Long e = 127L;
        System.out.println(a == b);
        System.out.println(c == d);
        System.out.println(c.equals(d));
        System.out.println(a.equals(e));
        System.out.println(a == 127);
    }
}
```

- **A.** `true true true true true`
- **B.** `true false true false true`
- **C.** `true false true true true`
- **D.** `false false true false true`
- **E.** The code does not compile.

(Each value is printed on its own line.)

<details class="ocp-answer" markdown="1">
<summary>Show answer</summary>

**Answer: B.** Autoboxing uses `Integer.valueOf()`, which caches the values from -128 to 127. So `a` and `b` are the same object, while `c` and `d` are two different objects, and `==` compares references. `equals()` compares values, so `c.equals(d)` is `true`, but `a.equals(e)` is `false` because an `Integer` is never equal to a `Long`. In `a == 127`, `a` is unboxed and the two `int` values are compared.
</details>

Practice explaining answers like these out loud: that's what technical interviews test. [**The Complete Coding Interview Guide in Java**](https://amzn.to/3UEJBn0){:target="_blank"} covers the Java questions interviewers ask most.

## 10. Imports

This class does not compile. Which changes make it compile? (Choose all that apply.)

```java
import java.util.*;
import java.sql.*;

public class Report {
    Date created;
}
```

- **A.** Remove `import java.sql.*;`
- **B.** Add `import java.util.Date;`
- **C.** Add `import java.lang.*;`
- **D.** Change the field to `java.util.Date created;`
- **E.** Add both `import java.util.Date;` and `import java.sql.Date;`
- **F.** No change is needed: the code compiles.

<details class="ocp-answer" markdown="1">
<summary>Show answer</summary>

**Answer: A, B, D.** Both `java.util` and `java.sql` contain a class named `Date`, so with two wildcard imports the name is ambiguous.

- **A** removes one of the two candidates.
- **B** works because a single-type import takes precedence over wildcard imports.
- **D** avoids the problem with a fully qualified name.
- **C** changes nothing: `java.lang` is always imported.
- **E** fails with a new error: two single-type imports can't bring in two different types with the same simple name.
</details>

## How Did You Do?

- **9–10 correct:** you read code like a compiler. You're ready for this part of the exam.
- **6–8 correct:** solid. Review the topics you missed; they are the classic traps.
- **0–5 correct:** go through the explanations again. These rules come back in every chapter of the exam.

Certification questions and interview questions test the same skill: reading code carefully and explaining your reasoning.

> Real-world examples, diagrams, and explanations that make complex systems simple.

<div>
{%- include softwareDesign.html -%}
</div>

Interviews go one step further and ask you to write the code yourself. Practice with real interview questions, solved step by step:

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Please support me as a writer. Your donation will help add more articles to this website. Thank you!

{% include buymeacoffee.html %}
<br/>
