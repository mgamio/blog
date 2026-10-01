---
layout: post
title:  "Shopping Options: Count the Ways to Buy Within a Budget (Code Interview Problem)"
description: "Solve the Shopping Options coding interview problem in Java: count every way to buy one item from four categories within a budget, from a 10¹² brute force to a fast meet-in-the-middle solution."
author: moises
categories: [ algorithms ]
image: /assets/images/shoppingOptions.jpg
comments: false
id: index
---

Four nested loops solve this problem in five minutes, and that's exactly the trap. With up to 1,000 prices per category, brute force has to check 10¹² combinations. Here's how to get from the obvious answer to one that finishes in well under a second.

## The Problem

A shopper wants to buy **one item from each category**: pants, sneakers, a skirt, and a t-shirt. Each category has multiple price options, and the shopper must stay within a fixed budget. Your task is to determine the number of unique ways the shopper can make a purchase without exceeding the budget.

Example

priceOfPants = [2,3]

priceOfSneakers = [4]

priceOfSkirts = [2,3]

priceOfTShirts = [1,2]

budget = 10

The shopper must buy sneakers for $4 since there is only one option. This leaves $6 for the other three items. The valid price combinations for (pants, skirts, t-shirts) that do not exceed $6 are:

- (2, 2, 2) → $6
- (2, 2, 1) → $5
- (3, 2, 1) → $6
- (2, 3, 1) → $6

Thus, there are 4 valid ways to purchase all four items.

## Programming Task

Write a function that returns an integer representing the number of valid ways to buy the four items.

**Function Signature**

```java
public static int countShoppingOptions(int[] priceOfPants, int[] priceOfSneakers, int[] priceOfSkirts, int[] priceOfTShirts, int budget);
```

**Parameters**

- priceOfPants: A list of integers representing the prices of available pants.

- priceOfSneakers: A list of integers representing the prices of available sneakers.

- priceOfSkirts: A list of integers representing the prices of available skirts.

- priceOfTShirts: A list of integers representing the prices of available t-shirts.

- budget: An integer representing the shopper's total available budget.

**Constraints**

1 ≤ length(priceOfPants), length(priceOfSneakers), length(priceOfSkirts), length(priceOfTShirts) ≤ 1000

1 ≤ budget, prices of items ≤ 1000000000

Brute force, pruning and divide-and-conquer are classic algorithm-design techniques. Sedgewick's book covers them with the clearest diagrams I know:

<div>
{%- include algorithmsRobertSedgewick.html -%}
</div>

## First Solution: Brute force algorithm

To find how many ways the customer can purchase all four items, we can iterate over the four arrays, combine all their prices, and check that the shopper doesn't spend more than the budget.

This technique is straightforward and guarantees finding a solution if one exists, but it can be computationally expensive, especially for large input sizes.

Here is our assumption, expressed as a test case.

```java
@Test
  public void test_shoppingOptions() {
    int[] priceOfPants = {2, 3};
    int[] priceOfSneakers = {4};
    int[] priceOfSkirts = {2, 3};
    int[] priceOfTShirts = {1, 2};
    assertEquals(4, ShoppingOptions.countShoppingOptions(priceOfPants, priceOfSneakers,
            priceOfSkirts, priceOfTShirts, 10));
  }
```

We proceed to implement the algorithm, including all possible input validations. The for-each construct makes our code elegant and readable, with no index variables. See [clean code](https://codersite.dev/clean-code/){:target="_blank"} practices.

```java
public class ShoppingOptions {
  public static int countShoppingOptions(int[] priceOfPants,
    int[] priceOfSneakers, int[] priceOfSkirts, int[] priceOfTShirts, int budget) {
    if (budget < 1 || budget > 1000000000)
      throw new RuntimeException("wrong value for budget");
    if (priceOfPants.length < 1 || priceOfPants.length > 1000)
      throw new RuntimeException("wrong size in array: priceOfPants");
    if (priceOfSneakers.length < 1 || priceOfSneakers.length > 1000)
      throw new RuntimeException("wrong size in array: priceOfSneakers");
    if (priceOfSkirts.length < 1 || priceOfSkirts.length > 1000)
      throw new RuntimeException("wrong size in array: priceOfSkirts");
    if (priceOfTShirts.length < 1 || priceOfTShirts.length > 1000)
      throw new RuntimeException("wrong size in array: priceOfTShirts");
    for (int priceOfPant : priceOfPants) {
      if (priceOfPant < 1 || priceOfPant > 1000000000)
        throw new RuntimeException("wrong value in array: priceOfPants");
    }
    for (int priceOfSneaker : priceOfSneakers) {
      if (priceOfSneaker < 1 || priceOfSneaker > 1000000000)
        throw new RuntimeException("wrong value in array: priceOfSneakers");
    }
    for (int priceOfSkirt : priceOfSkirts) {
      if (priceOfSkirt < 1 || priceOfSkirt > 1000000000)
        throw new RuntimeException("wrong value in array: priceOfSkirts");
    }
    for (int priceOfTShirt : priceOfTShirts) {
      if (priceOfTShirt < 1 || priceOfTShirt > 1000000000)
        throw new RuntimeException("wrong value in array: priceOfTShirts");
    }
    int numberOfOptions = 0;
    for (int priceOfPant : priceOfPants) {
      for (int priceOfSneaker : priceOfSneakers) {
        for (int priceOfSkirt : priceOfSkirts) {
          for (int priceOfTShirt : priceOfTShirts) {
            if (priceOfPant + priceOfSneaker + priceOfSkirt + priceOfTShirt <= budget)
              numberOfOptions +=1;
          }
        }
      }
    }
    return numberOfOptions;
  }
}
```

**Watch out for overflow:** three prices of 1,000,000,000 already exceed the largest `int`. Use `long` for the sums and for the count, which can reach 10¹².

<div>
{%- include inArticleAds.html -%}
</div>

### Refactoring to make code more readable

A function or method should be small, making it easier to read and understand. Therefore, we refactor our code, moving all validations to a private method. The following code shows a new implementation of our algorithm.

```java
public class ShoppingOptions {
  public static int countShoppingOptions(int[] priceOfPants, int[] priceOfSneakers,
  int[] priceOfSkirts, int[] priceOfTShirts, int budget) {
    if (budget < 1 || budget > 1000000000)
      throw new RuntimeException("wrong value for budget");

    validate(priceOfPants, "pants");
    validate(priceOfSneakers, "sneakers");
    validate(priceOfSkirts, "skirts");
    validate(priceOfTShirts, "tshirts");
    int numberOfOptions = 0;
    for (int priceOfPant : priceOfPants) {
      for (int priceOfSneaker : priceOfSneakers) {
        for (int priceOfSkirt : priceOfSkirts) {
          for (int priceOfTShirt : priceOfTShirts) {
            if (priceOfPant + priceOfSneaker + priceOfSkirt + priceOfTShirt <= budget)
              numberOfOptions +=1;
          }
        }
      }
    }
    return numberOfOptions;
  }

  private static void validate(int[] array, String arrayName) {
    if (array.length < 1 || array.length > 1000)
      throw new RuntimeException("wrong size in array " + arrayName);

    for (int price : array) {
      if (price < 1 || price > 1000000000)
        throw new RuntimeException("wrong value in array " +  arrayName);
    }
  }
}
```

For the theory behind why O(n⁴) collapses and O(n² log n) scales, this is the reference:

<div>
{%- include introductionToAlgorithms.html -%}
</div>

### Pruning with `continue`: Faster, but Not Fast Enough

This algorithm works fine when the arrays are small and the prices are low. But each array can hold up to 1,000 prices, and each price can be as high as 1,000,000,000. If pants plus sneakers already exceed the budget, there's no point trying every skirt and t-shirt. The `continue` statement skips straight to the next sneaker.

We create a new test case with big prices. You can add more items to the arrays.

```java
@Test
  public void test_shoppingOptionsBigPrices() {
    int[] priceOfPants = {2,10000,3,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,
            10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000};
    int[] priceOfSneakers = {2000002,4,2000002,200000,400000,200000,400000,200000,400000,200000,400000,200000,400000,200000,400000,200000,400000,200000,400000,200000,400000,
            200000,400000,200000,400000,200000,400000,200000,400000,200000,400000,200000,400000,200000,400000,200000,400000,200000,400000};
    int[] priceOfSkirts = {2,3000000,3,3000000,6000000,3000000,6000000,6000000,3000000,6000000,6000000,3000000,6000000,6000000,3000000,6000000,6000000,3000000,6000000,6000000,3000000,6000000,
            3000000,6000000,3000000,6000000,6000000,3000000,6000000,6000000,3000000,6000000,6000000,3000000,6000000,6000000,3000000,6000000,6000000,3000000,6000000};
    int[] priceOfTShirts = {1,2,3000000,3000000,7000000,3000000,7000000,3000000,7000000,3000000,7000000,3000000,7000000,3000000,7000000,3000000,7000000,3000000,7000000,
            3000000,3000000,7000000,3000000,7000000,3000000,7000000,3000000,7000000,3000000,7000000,3000000,7000000,3000000,7000000,3000000,7000000};
    assertEquals(4, ShoppingOptions.countShoppingOptions(priceOfPants, priceOfSneakers,
            priceOfSkirts, priceOfTShirts, 10));
  }
```

We run the test against the previous implementation, and the second test takes 32 ms on average. The execution time could increase if we fill the arrays up to their maximum size.

![JUnit result: the big-prices test takes 32 ms with the brute-force implementation](/assets/images/shoppingOptionsTest1.JPG "JUnit result: the big-prices test takes 32 ms with the brute-force implementation"){:class="img-responsive"}

<div>
{%- include inArticleAds.html -%}
</div>

Now, we include the "*continue*" statement in our algorithm.

```java
public class ShoppingOptions {
  public static int countShoppingOptions(int[] priceOfPants, int[] priceOfSneakers,
         int[] priceOfSkirts, int[] priceOfTShirts, int budget) {
    if (budget < 1 || budget > 1000000000)
      throw new RuntimeException("wrong value for budget");

    validate(priceOfPants, "pants");
    validate(priceOfSneakers, "sneakers");
    validate(priceOfSkirts, "skirts");
    validate(priceOfTShirts, "tshirts");

    int numberOfOptions = 0;
    for (int priceOfPant : priceOfPants) {
      if (priceOfPant >= budget)
        continue;
      for (int priceOfSneaker : priceOfSneakers) {
        if (priceOfPant + priceOfSneaker >= budget)
          continue;
        for (int priceOfSkirt : priceOfSkirts) {
          if (priceOfPant + priceOfSneaker + priceOfSkirt >= budget)
            continue;
          for (int priceOfTShirt : priceOfTShirts) {
            if (priceOfPant + priceOfSneaker + priceOfSkirt + priceOfTShirt <= budget)
              numberOfOptions +=1;
          }
        }
      }
    }
    return numberOfOptions;
  }

  //code omitted for brevity
}
```

We can see the new execution time.

![JUnit result: the same test runs faster after pruning with continue](/assets/images/shoppingOptionsTest2.JPG "JUnit result: the same test runs faster after pruning with continue"){:class="img-responsive"}

Pruning helps when prices are high, but in the worst case (lots of cheap items) we still check every combination: O(n⁴). With n = 1,000, that's 10¹² iterations. We need a different idea.

What happens when the prices we can afford are located at the end of the arrays? That is the algorithm you must design for: the worst-case scenario, described with [Big O Notation](https://codersite.dev/big-o-notation-analysis-of-algorithms/){:target="_blank"}.

When you implement an algorithm thinking in the worst-case scenario, the solution gives us a kind of guarantee that the algorithm will never take any longer with a new input size.

> Understanding the inner workings of common [data structures](https://codersite.dev/data-structures-foundation-efficient-programming/){:target="_blank"} and algorithms is a must for Java developers.

## Efficient Solution: Meet in the Middle

Instead of combining four lists at once, split the problem in half.

- **pairSumsA:** every price of pants plus every price of sneakers. With 1,000 items each, that's at most 1,000,000 sums.
- **pairSumsB:** every price of a skirt plus every price of a t-shirt, also at most 1,000,000 sums. Sort this list.
- For each sum `a` in pairSumsA, the money left is **remaining = budget − a**. Every value in pairSumsB that is ≤ remaining is a valid purchase. Because pairSumsB is sorted, a binary search finds how many there are in O(log n).

**Walkthrough with the example (budget = 10):**

- pairSumsA = pants [2, 3] + sneakers [4] = **[6, 7]**
- pairSumsB = skirts [2, 3] + t-shirts [1, 2] = [3, 4, 4, 5] (already sorted)
- a = 6 → remaining = 4 → values ≤ 4 in [3, 4, 4, 5]: **3**
- a = 7 → remaining = 3 → values ≤ 3: **1**
- **Total = 3 + 1 = 4**, the same answer as brute force.

**Complexity:** building and sorting the pair sums is O(n² log n), and each lookup is O(log n). With n = 1,000, that's about 2 × 10⁷ steps instead of 10¹², so it finishes in milliseconds instead of hours.

| Approach | Time | Steps for n = 1,000 |
|---|---|---|
| Brute force (4 loops) | O(n⁴) | 10¹² |
| Pruning with `continue` | O(n⁴) worst case | 10¹² worst case |
| Meet in the middle | O(n² log n) | ≈ 2 × 10⁷ |

<br/>

The complete Java implementation, with the binary search helper, the `long` arithmetic, and the edge-case tests, is in my book **[The Code Interview](https://link.amazon/B08nEgB1o){:target="_blank"}**, along with dozens of other real interview questions solved step by step:

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Please support me as a writer. Your donation will help add more articles to this website. Thank you!

{% include buymeacoffee.html %}
<br/>
