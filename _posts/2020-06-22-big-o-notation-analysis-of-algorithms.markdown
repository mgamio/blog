---
layout: post
title:  "Big O Notation and Analysis of Algorithms - coding interview"
description: "Big O Notation helps us to determine how complex an algorithm is. It matters when we build an application for millions of users"
author: moises
categories: [ algorithms ]
image: assets/images/algorithm.jpg
featured: true
hidden: false
comments: false
---

Big O Notation is a mathematical notation that helps us analyze how complex an algorithm is in terms of time and space. When we build an application for one user or millions of users, it matters.

We implement different algorithms to solve one problem and measure how efficient is one respect to the other ones.

Algorithm analysis is an essential part of computational complexity theory, which aims to quantify the resources required to solve computational problems.

The first study about Analysis of Algorithms was published by Knuth in 1968. [The Art of Computer Programming](https://en.wikipedia.org/wiki/The_Art_of_Computer_Programming){:target="_blank"}.

Asymptotic Notation is used to describe the running time of an algorithm. There are three different notations: Big Omega, Big Theta, and Big O Notation.

## Time complexity analysis and space complexity analysis

Time complexity analysis is related to how many steps takes an algorithm.

Space complexity analysis is related to how efficient an algorithm is using the memory and disk.

Both terms depend on the input size, the number of items in the input. Both terms depend on the input size and the number of items in the input. Moreover, we can analyze the complexity based on three cases or asymptotic notations.:

- Best case or Big Omega Ω(n): Usually the algorithm executes in one step independently of the input size.

- Average case or Big Theta Θ(n): If the the input size is ramdom 

- Worst-case analysis or Big O Notation O(n): Gives us an upper bound on the runtime for any input. It gives us a kind of guarantee that the algorithm will never take any longer with a new input size.

<div>
{%- include inArticleAds.html -%}
</div>

## Order of growth

The order of growth is related to how the runtime of an algorithm increases when the size of the input increases without limit and tells us how efficient the algorithm is. Therefore, we can compare the relative performance of alternative algorithms.

Big O Notation: **Common order-of-growth classifications**:

![order-of-growth](/assets/images/order-of-growth.jpg "order-of-growth classifications"){:class="img-responsive"}

## Big O Notation: examples

**O(1) – Constant**

It does not matter if the input contains 1000 or 1 million items, the code always executes in one step.

```kotlin
public void constant(List<string> list, String item) {
  list.add(item);
}
```

<div>
{%- include adsCosmoCoding.html -%}
</div>

In a best-case scenario, an *add* method takes O(1) time. The worst-case scenario takes O(n).

**O(N) – linear**

An algorithm runs in O(N) time if the number of steps depends on the number of items included in the input.

```kotlin
public int sum(int[] numbers) {
  int sum =0;
  for (int i =0; i<numbers.length; i++) {
    sum+=numbers[i];
  }
  return sum;
}
```

The main idea in Analysis of Algorithms is always to improve the algorithm performance, by reducing the number of steps and comparisons. You can visit [find the smallest number with the same number of digits](https://codersite.dev/given-positive-number-n-find-smallest-number-same-number-digits/){:target="_blank"}, for instance. Moreover, the simpler and more intuitive an algorithm is, the more useful and efficient it will be.

**O(N<sup>2</sup>) – quadratic**

If an algorithm includes two loops nested in its code, we could say that it’s running in quadratic time O(N<sup>2</sup>). For instance, when a 2D matrix is initialized in a tic-tac-toe game.

```kotlin
private String [][] board;

public void initializeBoard(int size) {
  this.board = new String[size][size];
  for (int x = 0; x < size; x++) {
    for (int y = 0; y < size; y++) {
      board[x][y] = " ";
    }
  }
}
```

<div>
{%- include inArticleAds.html -%}
</div>

**O(N<sup>3</sup>) – Cubic**

When the code includes at the most three nested loops, then the algorithm runs in Cubic time. For example: given N integers, how many triples sum to exactly zero?. One approach (not the best) is to use three nested loops.

```kotlin
public int countThreeSum(int[] numbers) {
  int N =numbers.length;
  int count =0;
  for (int i = 0; i<N; i++)
    for (int j = i+1; j<N; j++)
      for (int k = j+1; k<N; k++)
        if (numbers[i] + numbers[j] + numbers[k] == 0)
          count++;

  return count;
}
```

**O(LogN) – logarithmic**

This kind of algorithm produces a growth curve that peaks at the beginning and slowly flattens out as the size of the input increase.

Log28 = 3

Log216 = 4

Log232 = 5

**Analysis of searching algorithms**

The binary search uses at most LogN key compares to search in a sorted array of size N. With 8 elements take 3 comparisons, with 16 elements takes 4 comparisons, with 32 elements takes 5 comparisons, and so on.

```kotlin
public static <T extends Comparable<T>> boolean search(T target, T[] array) {
  int min = 0;
  int max = array.length - 1;
  while (min <= max) {
    int mid = (min + max) / 2;
    if (target.compareTo(array[mid]) < 0) {
      max = mid - 1;
    } else if (target.compareTo(array[mid]) > 0) {
      min = mid + 1;
    } else {
      return true;
    }
  }
  return false;
}
```

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

## The complexity of an algorithm

To find the Big O complexity of an algorithm follows the following rules:

- Ignore the lower order terms
- Drop the leading constants

Example: If the time complexity of an algorithm is 2n<sup>3</sup> + 4n + 3. Its Big O complexity simplifies to O(n<sup>3</sup>).

**How to find the time complexity of an algorithm**

Given the following algorithm:

```kotlin
public Integer sumEvenNumbers(Integer N) {
  int sum = 0;
  for (int number = 1; number <= N; number++)
    if ((number % 2) == 0)
      sum = sum + number;

  return sum;
}
```

First, we split the code into individual operations and then compute how many times it is being executed as is shown in the following table.

| Description | Number of executions |
| :----:      |    :----:   |
| int sum = 0; | 1 |
| int number = 1; | 1 |
| number <= N; | N |
| number++ | N |
| if ((number % 2) == 0) | N |
| sum = sum + number; | N |
| return sum; | 1 |
|    |     |


Now, we need to sum up how many times each operation is executing.

Time complexity = 1 + 1 + N + N + N + N + 1 =>   4N + 3

<div>
{%- include inArticleAds.html -%}
</div>

## Why Big O Notation ignores constants?

Big O Notation describes how many steps are required relative to the number of data elements. And it serves as a way to classify the long-term growth rate of algorithms.

For instance, for all amounts of data, O(N) will be faster than O(N<sup>2</sup>) as shown in the following figure:

![bigONotation-1](/assets/images/bigONotation-1.jpg "Big O Notation"){:class="img-responsive"}

Now, if we compare O(100N) with O(N<sup>2</sup>), we can see that O(N<sup>2</sup>) is faster than O(100N) for some amounts of data as shown in the following figure:

![bigONotation-2](/assets/images/bigONotation-2.jpg "Big O Notation ignores constants"){:class="img-responsive"}

But after an intersection point, O(100N) becomes faster and remains faster (in terms of the "number of steps") for all increasing amounts of data from that point onward. And that is the reason why Big O Notation ignores constants. Because of this, the value of 100 is irrelevant and O(100N) is written as O(N). The fewer steps, the faster the algorithm.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Introduction to Algorithms, fourth edition <a href="https://t.co/d6ThijT6Za">https://t.co/d6ThijT6Za</a> via <a href="https://twitter.com/amazon?ref_src=twsrc%5Etfw">@amazon</a></p>&mdash; Moises Gamio (@MoisesGamio) <a href="https://twitter.com/MoisesGamio/status/1839040190213431745?ref_src=twsrc%5Etfw">September 25, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

This article was just an introduction to algorithm analysis to face an actual code interview as a software developer. They are asked to build approximated models using Big O notation in Java. The same concepts apply to Python algorithm analysis.

If you want to create a mathematical model for the execution time of a discrete operation, for example, you should take a course in [discrete mathematics](https://en.wikipedia.org/wiki/Discrete_mathematics){:target="_blank"}.

Please donate to maintain and improve this website if you find this content valuable.

<form action="https://www.paypal.com/donate" method="post" target="_top">
 <input type="hidden" name="hosted_button_id" value="UF4T364RTPPMJ" />
 <input type="image" src="https://www.paypalobjects.com/en_US/DK/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
 <img alt="" border="0" src="https://www.paypal.com/en_DE/i/scr/pixel.gif" width="1" height="1" />
</form>
<br/>

Preparing to discuss algorithms analysis in your following programming interview requires practicing and studying different algorithms, and you can find it in this [link](https://amzn.to/3HrGXrF){:target="_blank"} with many explanation details.
