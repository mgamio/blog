---
layout: post
title:  "Knapsack Problem in Java: Fill a Shopping Basket on a Budget (Greedy vs Dynamic Programming)"
description: "Solve the 0/1 knapsack problem in Java with test-driven development: why a greedy basket fails, a brute-force solution, and dynamic programming that finds the most grams for your budget."
author: moises
categories: [ algorithms, test-driven development ]
image: /assets/images/knapsackAlgorithm.jpg
comments: false
---

You have a fixed budget and a list of products, each with a price and something you want as much of as possible. Which products should you buy? This is the **knapsack problem**, one of the classic problems of computer science: choose the items that give the most total value without going over a limit.

This post solves it in Java for a shopping basket, step by step with test-driven development (TDD). You'll see:

- a greedy algorithm that looks right and passes the first test;
- a second test where the greedy algorithm buys the wrong snacks;
- a brute-force solution that is always right but explodes with more products;
- the dynamic programming solution, which is right and fast.

All the code is Java, and every result in this post comes from running it on Java 25.

## The problem

You have a budget, and you want the most grams of snacks for it. Each snack can be bought at most once. These are the products:

| Id | Name | Price | Grams | Grams per dollar |
|---|---|---|---|---|
| 1 | Snack Funny Pencil | $0.48 | 36 | 75 |
| 2 | Snackin Chicken Protein | $0.89 | 10 | 11 |
| 3 | Snacks Waffle Pretzels | $0.98 | 226 | 231 |
| 4 | Snacks Tahoe Pretzels | $0.98 | 226 | 231 |
| 5 | Tako Chips Snack | $1.29 | 60 | 47 |
| 6 | Shrimp Snacks | $1.29 | 71 | 55 |
| 7 | Rasa Jagung Bakar | $1.35 | 50 | 37 |
| 8 | Snack Balls | $1.65 | 12 | 7 |
| 9 | Sabor Cheese Snacks | $1.69 | 20 | 12 |
| 10 | Osem Bissli Falafel | $4.86 | 70 | 14 |

In knapsack terms, the price is the item's *weight*, the budget is the knapsack's *capacity*, and the grams are the *value* you maximize. "Grams" is our choice of value; a business could use profit, calories or a rating instead, and the algorithm stays the same.

Because each product is either in the basket or not, this is the **0/1 knapsack problem**.

## Store prices in cents, not doubles

The first decision isn't about the algorithm. Prices like 0.98 can't be stored exactly in a `double`, and the small errors add up:

```java
System.out.println(0.1 + 0.2);         // 0.30000000000000004
System.out.println(0.1 + 0.2 <= 0.3);  // false
```

A basket that costs exactly the budget could be rejected. Store money as whole cents in an `int` (or use `BigDecimal`), and every comparison is exact:

```java
public record Product(int id, String name, int priceCents, int grams) {}

public record Basket(List<Product> products) {

  public int totalCents() {
    return products.stream().mapToInt(Product::priceCents).sum();
  }

  public int totalGrams() {
    return products.stream().mapToInt(Product::grams).sum();
  }
}
```

All three solutions in this post implement one interface, so the same tests can check each of them:

```java
public interface BasketOptimizer {
  Basket fill(List<Product> products, int budgetCents);
}
```

<div>
{%- include inArticleAds.html -%}
</div>

## Step 1: a greedy basket

TDD works in short cycles called *red, green, refactor*: write a failing test (red), write the simplest code that passes it (green), then improve the code while the tests stay green (refactor). For an introduction, see [test-driven development on Wikipedia](https://en.wikipedia.org/wiki/Test-driven_development){:target="_blank"}.

The first test: with $4.00, the best basket has 559 grams.

```java
@Test
void fillsTheBasketWithFourDollars() {
  Basket basket = optimizer.fill(SNACKS, 400);

  assertEquals(559, basket.totalGrams());
  assertTrue(basket.totalCents() <= 400);
}
```

The simplest idea is **greedy**: sort the snacks by grams per dollar, and take each one that still fits in the budget.

```java
public class GreedyBasket implements BasketOptimizer {

  @Override
  public Basket fill(List<Product> products, int budgetCents) {
    List<Product> byGramsPerCent = new ArrayList<>(products);
    byGramsPerCent.sort(Comparator.comparingDouble(
        (Product p) -> (double) p.grams() / p.priceCents()).reversed());

    List<Product> basket = new ArrayList<>();
    int left = budgetCents;
    for (Product product : byGramsPerCent) {
      if (product.priceCents() <= left) {
        basket.add(product);
        left -= product.priceCents();
      }
    }
    return new Basket(basket);
  }
}
```

It takes the two pretzels (231 g per dollar), then the Funny Pencil (75), then the Shrimp Snacks (55): products 1, 3, 4 and 6, for $3.73 and **559 grams**. Green.

A greedy algorithm makes the choice that looks best at each step and never reconsiders it. It's fast: sorting makes it O(n log n). But the test only proves that greedy works for *this* budget.

## Step 2: a test that greedy fails

Add a second test with a smaller budget, $3.50:

```java
@Test
void fillsTheBasketWithThreeFiftyDollars() {
  Basket basket = optimizer.fill(SNACKS, 350);

  assertEquals(523, basket.totalGrams());
  assertTrue(basket.totalCents() <= 350);
}
```

Red. The greedy basket has only 498 grams:

| Algorithm | Basket | Price | Grams |
|---|---|---|---|
| Greedy | 1, 2, 3, 4 | $3.33 | 498 |
| Best possible | 3, 4, 6 | $3.25 | **523** |

Greedy takes the two pretzels and the Funny Pencil, which leaves $1.06. The Shrimp Snacks cost $1.29 and no longer fit, so it fills the gap with the Chicken Protein for 10 grams. The best basket skips the Funny Pencil, a good deal on its own, to make room for the Shrimp Snacks: it gives up 36 grams to gain 71.

That's the weakness of every greedy algorithm: an early choice that looks best can block a better combination later. For the 0/1 knapsack problem, no greedy rule is always right.

<div>
{%- include inArticleAds.html -%}
</div>

## Step 3: brute force, every possible basket

The safe way to find the best basket is to try them all. With n products there are 2ⁿ baskets, because each product is in or out. You can number the baskets from 0 to 2ⁿ − 1 and let bit i of the number say whether product i is in the basket:

```text
0000000000 = no products
0000000001 = product 1
0000000101 = products 1 and 3
...
1111111111 = all 10 products
```

```java
public class BruteForceBasket implements BasketOptimizer {

  @Override
  public Basket fill(List<Product> products, int budgetCents) {
    int n = products.size();
    long bestGrams = -1;
    long bestSubset = 0;

    for (long subset = 0; subset < (1L << n); subset++) {
      int cents = 0;
      int grams = 0;
      for (int i = 0; i < n; i++) {
        if ((subset & (1L << i)) != 0) {   // is product i in this basket?
          cents += products.get(i).priceCents();
          grams += products.get(i).grams();
        }
      }
      if (cents <= budgetCents && grams > bestGrams) {
        bestGrams = grams;
        bestSubset = subset;
      }
    }

    List<Product> basket = new ArrayList<>();
    for (int i = 0; i < n; i++) {
      if ((bestSubset & (1L << i)) != 0) basket.add(products.get(i));
    }
    return new Basket(basket);
  }
}
```

Both tests are green: 559 grams with $4.00 and 523 with $3.50. The bit tricks are explained in [enum flags and bitwise operators in Java](https://codersite.dev/enum-flags-bitwise-operators/){:target="_blank"}.

The problem is speed. Checking every basket is O(n × 2ⁿ), and each extra product doubles the work. I timed it with a $20 budget:

| Products | Baskets checked | Brute force time |
|---|---|---|
| 10 | 1,024 | under 1 ms |
| 20 | 1,048,576 | 38 ms |
| 25 | 33,554,432 | 1,368 ms |

Each 5 more products multiply the time by about 32. At that rate, 40 products would take more than 12 hours. A real shop has thousands of products. For why exponential algorithms hit this wall, see [Big O notation in Java](https://codersite.dev/big-o-notation-analysis-of-algorithms/){:target="_blank"}.

## Step 4: refactor to dynamic programming

Brute force does a lot of repeated work: thousands of baskets share the same first few products. **Dynamic programming** solves each smaller problem once and reuses the answer.

The smaller problem is: *what is the most grams I can get using only the first i products with b cents?* Call that `best[i][b]`. For each product there are only two choices:

- **leave it out:** the answer is the same as without it, `best[i - 1][b]`;
- **take it, if it fits:** its grams plus the best you can do with the money that's left, `best[i - 1][b - price] + grams`.

`best[i][b]` is the larger of the two. Fill the table row by row, and the answer for the whole problem is in the last cell, `best[n][budget]`:

```java
public class DynamicProgrammingBasket implements BasketOptimizer {

  @Override
  public Basket fill(List<Product> products, int budgetCents) {
    int n = products.size();
    // best[i][b] = most grams using the first i products with b cents
    int[][] best = new int[n + 1][budgetCents + 1];

    for (int i = 1; i <= n; i++) {
      Product product = products.get(i - 1);
      for (int b = 0; b <= budgetCents; b++) {
        best[i][b] = best[i - 1][b];                       // leave it out
        if (product.priceCents() <= b) {                    // or take it
          best[i][b] = Math.max(best[i][b],
              best[i - 1][b - product.priceCents()] + product.grams());
        }
      }
    }

    // walk back through the table to find which products were taken
    List<Product> basket = new ArrayList<>();
    int b = budgetCents;
    for (int i = n; i > 0; i--) {
      if (best[i][b] != best[i - 1][b]) {   // the value changed, so product i was taken
        Product product = products.get(i - 1);
        basket.add(0, product);
        b -= product.priceCents();
      }
    }
    return new Basket(basket);
  }
}
```

Refactor done, both tests still green. With $3.50 it returns products 3, 4 and 6 for $3.25 and 523 grams.

The table has (n + 1) × (budget + 1) cells, and each takes constant time, so dynamic programming is **O(n × budget)** in time and memory, with the budget in cents. For 25 products and a $20 budget, that's 26 × 2,001 cells: it took 0.04 ms, against 1,368 ms for brute force, with the same answer. To be sure, I also compared it with brute force on 300 random product lists: the grams always matched, and it never went over budget.

The trade-off is that the running time depends on the budget's size, not just on the number of products. That's why prices in cents matter twice: they make the comparisons exact and they keep the table small. With a budget of $20,000 in cents, the table would have two million columns per product.

Dynamic programming is one of the most important techniques in algorithm design, and knapsack is its classic first example. To build the foundation it rests on, how to analyze an algorithm and choose the right data structure, *Algorithms* by Robert Sedgewick and Kevin Wayne is a good next step, with clear Java code for sorting, searching, graphs and strings.

<div>
{%- include algorithmsRobertSedgewick.html -%}
</div>

## Edge cases to test

TDD doesn't stop at the happy path. These tests pass with the dynamic programming solution:

```java
@Test
void emptyBasketWhenTheBudgetIsZero() {
  assertTrue(optimizer.fill(SNACKS, 0).products().isEmpty());
}

@Test
void emptyBasketWhenThereAreNoProducts() {
  assertTrue(optimizer.fill(List.of(), 400).products().isEmpty());
}

@Test
void emptyBasketWhenEveryProductIsTooExpensive() {
  Product falafel = new Product(10, "Osem Bissli Falafel", 486, 70);
  assertTrue(optimizer.fill(List.of(falafel), 400).products().isEmpty());
}
```

Because all three solutions implement `BasketOptimizer`, you can run the same test class against each of them. Only the greedy one fails, and only the $3.50 test. Writing code against an interface like this is the [open-closed principle](https://codersite.dev/open-closed-principle/){:target="_blank"} at work: you added two new algorithms without changing a single test.

<div>
{%- include inArticleAds.html -%}
</div>

## Comparing the three solutions

| Solution | Always the best basket? | Time | Good for |
|---|---|---|---|
| Greedy | No | O(n log n) | Quick estimates, the fractional knapsack |
| Brute force | Yes | O(n × 2ⁿ) | Up to about 20 products, or checking other solutions in tests |
| Dynamic programming | Yes | O(n × budget) | Most real cases, when the budget in cents isn't huge |

## Variants of the knapsack problem

- **Fractional knapsack:** you can buy part of a product, say half a bag. Here greedy by grams per dollar *is* optimal: fill up with the best ratio first, and take a fraction of the last product.
- **Unbounded knapsack:** you can buy the same product many times. The dynamic programming table changes slightly: when you take a product, you look up `best[i][b - price]` instead of `best[i - 1][...]`.
- **Counting combinations:** instead of the best basket, count how many baskets fit the budget. See [Shopping Options: count the ways to buy within a budget](https://codersite.dev/shopping-budget-options/){:target="_blank"}, which goes from a brute force to a meet-in-the-middle solution.

<div>
{%- include inArticleAds.html -%}
</div>

## FAQ

### What is the 0/1 knapsack problem?

Given items with a weight and a value, and a knapsack with a weight limit, choose the items with the highest total value that fit. *0/1* means each item is either taken whole or left out. In this post, the weight is the price, the limit is the budget, and the value is grams.

### Why doesn't a greedy algorithm work for the 0/1 knapsack problem?

Because the item with the best ratio can use up money that a better combination needs. With $3.50, greedy takes the Funny Pencil and ends up with 498 grams; leaving it out makes room for the Shrimp Snacks, for 523 grams.

### Is the knapsack problem NP-complete?

Yes, the decision version is NP-complete, so no known algorithm solves every case in time polynomial in the size of the input. The dynamic programming solution is *pseudo-polynomial*: polynomial in the number of items and the numeric value of the budget, which is fast when the budget is small and slow when it's huge.

### Can I reduce the memory of the dynamic programming solution?

Yes. Each row only needs the previous one, so a single array of size budget + 1 is enough if you loop over the budget from high to low. You lose the full table, though, so you can no longer walk back through it to see which products were taken.

### Why use test-driven development for an algorithm?

The second test is the answer. The greedy algorithm looked right and passed the first test; only a test with another budget showed that it was wrong. Tests written first, with known correct answers, catch the solutions that only work for the examples you happened to try.

You can see more problems like this one, solved step by step from the first idea to working Java code, in my book **THE CODE INTERVIEW: Real Java Coding Interview Questions, Solved Step by Step**.

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

<div>
{% include buymeacoffee.html %}
</div>
