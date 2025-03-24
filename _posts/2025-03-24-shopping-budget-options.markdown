---
layout: post
title:  "Shopping options with a limited budget"
description: "Shopping options under a budgeted amount"
author: moises
categories: [ algorithms ]
image: assets/images/shoppingOptions.jpg
comments: false
id: index
---

A shopper wants to buy **one item from each category**: pants, sneakers, a skirt, and a t-shirt. Each category has multiple price options, and the shopper must stay within a fixed budget. Your task is to determine the number of unique ways the shopper can make a purchase without exceeding the budget.

Example

priceOfPants = [2,3]

priceOfSneakers = [4]

priceOfSkirts = [2,3]

priceOfTShirts = [1,2]

budged = 10

The shopper must buy sneakers for $4 since there is only one option. This leaves $6 for the other three items. The valid price combinations for (pants, skirts, t-shirts) that do not exceed $6 are:

- (2, 2, 2) → $6
- (2, 2, 1) → $5
- (3, 2, 1) → $6
- (2, 3, 1) → $6

Thus, there are 4 valid ways to purchase all four items.

## Programming Task

Write a function that returns an integer representing the number of valid ways to buy the four items.

**Function Signature**

```kotlin
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

<div>
{%- include algorithmsRobertSedgewick.html -%}
</div>

## First Solution: Brute force algorithm

To find how many ways the customer can purchase all four items, we can iterate the four arrays, combine all its products, and validate that the shopper cannot spend more money than the budgeted amount.

This technique is straightforward and guarantees finding a solution if one exists, but it can be computationally expensive, especially for large input sizes

Here is our assumption based on a Test case.

```kotlin
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

We proceed to implement the algorithm that includes all possible input validations. The for-each construct helps our code be elegant and readable and there is no use of the index. See [clean code](https://codersite.dev/clean-code/){:target="_blank"} practices.

```kotlin
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

<div>
{%- include inArticleAds.html -%}
</div>

### Refactoring to make code more readable

A function or method should be small, making it easier to read and understand. Therefore, we refactor our code, moving all validations to a private method. The following code shows a new implementation of our algorithm.

```kotlin
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

<div>
{%- include introductionToAlgorithms.html -%}
</div>

### Refactoring for the best-case scenario? You're wrong

This algorithm works fine when array size and values are small. But based on the constraints, imagine you are processing a priceOfSneaker value of 100000 at the location priceOfSneakers[101]. At that moment, the sum of priceOfPant + priceOfSneaker is already greater than 10 dollars. Therefore, it does not make sense to continue processing the following possible 1000000000 items of pricesOfSkits[] and other 1000000000 items of priceOfTShirts[].

To skip this particular iteration, we use the “*continue*” statement and continues with the next iteration in the loop. The next priceOfSneaker at the location priceOfSneakers[102], for example.

We create a new test case with big prices. You can add more items to the arrays.

```kotlin
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

We run the test against the previous implementation, and the second test takes 32 ms on average. The execution time could increase if we complete the max size of our arrays.

![shopping-Options-Test1](/assets/images/shoppingOptionsTest1.JPG){:class="img-responsive"}

<div>
{%- include inArticleAds.html -%}
</div>

Now, we include the "*continue*" statement in our algorithm.

```kotlin
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

![shopping-Options-Test2](/assets/images/shoppingOptionsTest2.JPG){:class="img-responsive"}

Overall complexity : **O(N<sup>3</sup>M)**

What happens when our possible choosing prices are located at the end of the arrays?. That is the algorithm you must develop: For the Worst-case scenario! or [Big O Notation](https://codersite.dev/big-o-notation-analysis-of-algorithms/){:target="_blank"}.

When you implement an algorithm thinking in the worst-case scenario, the solution gives us a kind of guarantee that the algorithm will never take any longer with a new input size.

> Understanding the inner workings of common [data structures](https://codersite.dev/data-structures-foundation-efficient-programming/){:target="_blank"} and algorithms is a must for Java developers. [Learn more](https://amzn.to/4im1fFR){:target="_blank"}

### Efficient solution

This approach optimizes the computation by:

* Precomputing valid pairs of two categories (pants + skirts).

* Using a two-pointer or **binary search** approach to efficiently count valid combinations with the remaining budget.

* Overall complexity: **O(NM + M² log(NM))**, which is manageable for constraints up to 10³.

See the complete solution in the following [link](https://amzn.to/4iGQXQq){:target="_blank"}.

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Please support me as a writer. Your donation will help add more articles to this website. Thank you!

<form action="https://www.paypal.com/donate" method="post" target="_top">
 <input type="hidden" name="hosted_button_id" value="UF4T364RTPPMJ" />
 <input type="image" src="https://www.paypalobjects.com/en_US/DK/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
 <img alt="" border="0" src="https://www.paypal.com/en_DE/i/scr/pixel.gif" width="1" height="1" />
</form>
<br/>

<div>
{%- include mailchimp.html -%}
</div>
