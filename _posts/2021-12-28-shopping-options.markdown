---
layout: post
title:  "Shopping options"
description: "Shopping options under a budgeted amount"
author: moises
categories: [ algorithms ]
image: assets/images/shoppingOptions.jpg
comments: false
id: index
---

An Amazon customer wants to buy a pair of jeans, a pair of shoes, a skirt, and a top but has a limited budget in dollars. Given different pricing options for each product, determine how many options our customer has to buy 1 of each product. You cannot spend more money than the budgeted amount.

Example

priceOfJeans = [2,3]

priceOfShoes = [4]

priceOfSkirts = [2,3]

priceOfTops = [1,2]

budgeted = 10

The customer must buy shoes for 4 dollars since there is only one option. This leaves 6 dollars to spend on the other 3 items. Combinations of prices paid for jeans, skirts, and tops respectively that add up to 6 dollars or less are [2,2,2], [2,2,1], [3,2,1], [2,3,1]. There are 4 ways the customer can purchase all 4 items.

## Function description ##

Create a function that returns an integer representing the number of options present to buy the four items.

The function must have 5 parameters:

int[] priceOfJeans: An integer array containing the prices of the pairs of jeans available.

int[] priceOfShoes: An integer array containing the prices of the pairs of shoes available.

int[] priceOfSkirts: An integer array containing the prices of the skirts available.

int[] priceOfTops: An integer array containing the prices of the tops available.

int dollars: the total number of dollars available to shop with.

Constraints

1 ≤ length(priceOfJeans, priceOfShoes, priceOfSkirts, priceOfTops) ≤ 1000

1 ≤ dollars, prices ≤ 1000000000

## Solution

To find how many ways the customer can purchase all four items, we can iterate the four arrays, combine all its products, and validate that he/she cannot spend more money than the budgeted amount.

Here is our assumption based on a Test case.

```kotlin
@Test
public void test_shoppingOptions() {
  int[] priceOfJeans = {2, 3};
  int[] priceOfShoes = {4};
  int[] priceOfSkirts = {2, 3};
  int[] priceOfTops = {1, 2};
  assertEquals(4, ShoppingOptions.getNumberOfOptions(priceOfJeans, priceOfShoes,
          priceOfSkirts, priceOfTops, 10));
}
```

We proceed to implement the algorithm that includes all possible input validations. The for-each construct helps our code be elegant and readable and there is no use of the index. See [clean code](https://medium.com/@mkgv89/clean-code-fe3a1deee528?sk=dd8329f6fddf7e4738e4d13c4c05aad2){:target="_blank"} practices.

```kotlin
public class ShoppingOptions {
  public static int getNumberOfOptions(int[] priceOfJeans,
    int[] priceOfShoes, int[] priceOfSkirts, int[] priceOfTops, int dollars) {
    if (dollars < 1 || dollars > 1000000000)
      throw new RuntimeException("wrong value for budget");
    if (priceOfJeans.length < 1 || priceOfJeans.length > 1000)
      throw new RuntimeException("wrong size in array: priceOfJeans");
    if (priceOfShoes.length < 1 || priceOfShoes.length > 1000)
      throw new RuntimeException("wrong size in array: priceOfShoes");
    if (priceOfSkirts.length < 1 || priceOfSkirts.length > 1000)
      throw new RuntimeException("wrong size in array: priceOfSkirts");
    if (priceOfTops.length < 1 || priceOfTops.length > 1000)
      throw new RuntimeException("wrong size in array: priceOfJeans");
    for (int priceOfJean : priceOfJeans) {
      if (priceOfJean < 1 || priceOfJean > 1000000000)
        throw new RuntimeException("wrong value in array: priceOfJeans");
    }
    for (int priceOfShoe : priceOfShoes) {
      if (priceOfShoe < 1 || priceOfShoe > 1000000000)
        throw new RuntimeException("wrong value in array: priceOfShoes");
    }
    for (int priceOfSkirt : priceOfSkirts) {
      if (priceOfSkirt < 1 || priceOfSkirt > 1000000000)
        throw new RuntimeException("wrong value in array: priceOfSkirts");
    }
    for (int priceOfTop : priceOfTops) {
      if (priceOfTop < 1 || priceOfTop > 1000000000)
        throw new RuntimeException("wrong value in array: priceOfTops");
    }
    int numberOfOptions = 0;
    for (int priceOfJean : priceOfJeans) {
      for (int priceOfShoe : priceOfShoes) {
        for (int priceOfSkirt : priceOfSkirts) {
          for (int priceOfTop : priceOfTops) {
            if (priceOfJean + priceOfShoe + priceOfSkirt + priceOfTop <= dollars)
              numberOfOptions +=1;
          }
        }
      }
    }
    return numberOfOptions;
  }
}
```

A function or method should be small, making it easier to read and understand. Therefore, we refactor our code, moving all validations to a private method. The following code shows a new implementation of our algorithm.

```kotlin
public class ShoppingOptions {
  public static int getNumberOfOptions(int[] priceOfJeans,
    int[] priceOfShoes, int[] priceOfSkirts, int[] priceOfTops, int dollars) {
    if (dollars < 1 || dollars > 1000000000)
      throw new RuntimeException("wrong value for budget");

    validate(priceOfJeans, "jeans");
    validate(priceOfShoes, "shoes");
    validate(priceOfSkirts, "skirts");
    validate(priceOfTops, "tops");
    int numberOfOptions = 0;
    for (int priceOfJean : priceOfJeans) {
      for (int priceOfShoe : priceOfShoes) {
        for (int priceOfSkirt : priceOfSkirts) {
          for (int priceOfTop : priceOfTops) {
            if (priceOfJean + priceOfShoe + priceOfSkirt + priceOfTop <= dollars)
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

This algorithm works fine when array size and values are small. But based on the constraints, imagine you are processing a priceOfShoe value of 100000 at the location priceOfShoes[101], and at that moment, the sum of priceOfJean + priceOfShoe is greater than 10 dollars. Therefore, it does not sense to continue processing the following possible 1000000000 items of pricesOfSkits[] and other 1000000000 items of priceOfTops[].

We need to skip this particular iteration and use “continue” to order process the next priceOfShoe at the location priceOfShoes[102], for example.

We create a new test case with big prices. You can add more items to the arrays.

```kotlin
@Test
  public void test_shoppingOptionsBigPrices() {
    int[] priceOfJeans = {2,10000,3,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,
            10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000,10000};
    int[] priceOfShoes = {2000002,4,2000002,200000,400000,200000,400000,200000,400000,200000,400000,200000,400000,200000,400000,200000,400000,200000,400000,200000,400000,
            200000,400000,200000,400000,200000,400000,200000,400000,200000,400000,200000,400000,200000,400000,200000,400000,200000,400000};
    int[] priceOfSkirts = {2,3000000,3,3000000,6000000,3000000,6000000,6000000,3000000,6000000,6000000,3000000,6000000,6000000,3000000,6000000,6000000,3000000,6000000,6000000,3000000,6000000,
            3000000,6000000,3000000,6000000,6000000,3000000,6000000,6000000,3000000,6000000,6000000,3000000,6000000,6000000,3000000,6000000,6000000,3000000,6000000};
    int[] priceOfTops = {1,2,3000000,3000000,7000000,3000000,7000000,3000000,7000000,3000000,7000000,3000000,7000000,3000000,7000000,3000000,7000000,3000000,7000000,
            3000000,3000000,7000000,3000000,7000000,3000000,7000000,3000000,7000000,3000000,7000000,3000000,7000000,3000000,7000000,3000000,7000000};
    assertEquals(4, ShoppingOptions.getNumberOfOptions(priceOfJeans, priceOfShoes,
            priceOfSkirts, priceOfTops, 10));
  }
```

We run the test against the previous implementation, and the second test takes 32 ms on average. The execution time could increase if we complete the max size of our arrays.

![shopping-Options-Test1](/assets/images/shoppingOptionsTest1.JPG){:class="img-responsive"}

The following listing shows an optimized solution.

```kotlin
public class ShoppingOptions {
  public static int getNumberOfOptions(int[] priceOfJeans,
    int[] priceOfShoes, int[] priceOfSkirts, int[] priceOfTops, int dollars) {
    if (dollars < 1 || dollars > 1000000000)
      throw new RuntimeException("wrong value for budget");

    validate(priceOfJeans, "jeans");
    validate(priceOfShoes, "shoes");
    validate(priceOfSkirts, "skirts");
    validate(priceOfTops, "tops");
    int numberOfOptions = 0;
    for (int priceOfJean : priceOfJeans) {
      if (priceOfJean >= dollars)
        continue;
      for (int priceOfShoe : priceOfShoes) {
        if (priceOfJean + priceOfShoe >= dollars)
          continue;
        for (int priceOfSkirt : priceOfSkirts) {
          if (priceOfJean + priceOfShoe + priceOfSkirt >= dollars)
            continue;
          for (int priceOfTop : priceOfTops) {
            if (priceOfJean + priceOfShoe + priceOfSkirt + priceOfTop <= dollars)
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

We can see the new execution time.

![shopping-Options-Test2](/assets/images/shoppingOptionsTest2.JPG){:class="img-responsive"}

Well, what happens when our possible right prices are located at the end of the arrays?. One possible solution could be to sort the arrays before iterating and find the right combinations of prices.

Understanding the inner workings of common [data structures](https://codersite.dev/book/){:target="_blank"} and [algorithms](https://codersite.gumroad.com/l/jqgde/uyn1iyx){:target="_blank"} is a must for Java developers. [Learn more](https://payhip.com/b/B9u6L){:target="_blank"}
