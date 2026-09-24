---
layout: post
title:  "Items in Containers: Count Items in Closed Compartments (Code Interview Problem)"
description: "Solve the Items in Containers coding interview problem in Java: count the items inside closed compartments for each query, from an O(n·q) brute force to an O(n + q) prefix-sum solution."
author: moises
categories: [ algorithms ]
image: /assets/images/inventoryItems.jpg
comments: false
---

This one shows up in online coding assessments under the name **Items in Containers**, and it's a trap: the obvious solution passes the examples and then times out on the hidden tests. Here's the problem, the brute force most people write first, and the idea that makes it fast.

## The Problem

ACME Corporation would like to know how much inventory exists in their closed inventory compartments. Given a string *s* consisting of items as '\*' and closed compartments as an open and close '\|', an array of starting indices *startIndices* and an array of ending indices *endIndices*, determine the number of items in **closed compartments** within the substring between the two indices, inclusive.

- An item is represented as an asterisk (‘*’ = ascii decimal 42)

- A compartment is represented as a pair of pipes that may or may not have items between them (‘\|’ = ascii decimal 124).

Example:

s = ‘\|*\*\|\*\|\*’

startIndices = [1,1]

endIndices = [5,6]

The string has a total of 2 closed compartments, one with 2 items and one with 1 item. 

For the first pair of indices, (1,5), the substring is ‘\|\*\*\|\*’. There are 2 items in a compartment.

For the second pair of indices, (1,6), the substring is ‘\|\*\*\|\*\|’ and there are 2 + 1 = 3 items in compartments.

Both of the answers are returned in an array. [2, 3].

## Function Description

Write a function that returns an integer array that contains the results for each of the *startIndices[i]* and *endIndices[i]* pairs.

The function must have three parameters:

- *s*: A string to evaluate
- *startIndices*: An integer array, the starting indices.
- *endIndices*: An integer array, the ending indices.

**Constraints** (*n* is the length of *s*, and *m* is the number of queries):

- 1 ≤ m, n ≤ 10<sup>5</sup>
- 1 ≤ *startIndices[i]* ≤ *endIndices[i]* ≤ n
- Each character of *s* is either ‘\*’ or ‘\|’

<div>
{%- include inArticleAds.html -%}
</div>

### Problem Summary

Given:

- A string *s* of '\*' (items) and '\|' (compartment walls),

- Two arrays *startIndices* and *endIndices* representing query ranges (1-based indices).

Goal:

- For each (start, end) pair, return the number of '\*' characters that are inside closed compartments — i.e., between matched '\|' characters.


### Key Observation

- Items outside of compartment boundaries (not between '\|'s) do not count.


## Brute Force Algorithm

A brute-force algorithm solves a problem by trying every possibility directly. It's usually the easiest to write and the slowest to run.

In a real interview, developers often try the simplest, most obvious solution (brute force approach), even if it's not the best. Let's look at that first.

To return the number of items in closed compartments, we need to build the substrings from the two arrays *startIndices* and *endIndices*.

We evaluate every character from the substring. We define a *numOfAsterisk* variable to count items inside a compartment.

We define a *wasFirstPipeFound* variable to initialize our numOfAsterisk variable the first time a ‘\|’ character is found, and we accumulate all items for subsequent ‘\|’ characters.

```java
public class ACMEInventory {
  public static List<Integer> numberOfItemsInClosedCompartments(String s,
    List<Integer> startIndices, List<Integer> endIndices) {

    if (startIndices.size()<1 || startIndices.size()>100000)
      throw new RuntimeException("wrong size in startIndices");

    if (endIndices.size()<1 || endIndices.size()>100000)
      throw new RuntimeException("wrong size in endIndices");

    List<Integer> result = new ArrayList<>();
    for (int idx=0; idx<startIndices.size(); idx++) {
      int start = startIndices.get(idx);
      int end = endIndices.get(idx);

      if (start<1 || start>100000)
        throw new RuntimeException("wrong value at startIndices");

      if (end<1 || end>100000)
        throw new RuntimeException("wrong value at endIndices");

      int numOfAsterisk = 0;
      boolean wasFirstPipeFound  = false;
      int numOfAsteriskAccumulated = 0;
      for (char c : s.substring(start-1, end).toCharArray()) {
        if (c == '|') {
          if (wasFirstPipeFound == true) {
            numOfAsteriskAccumulated +=numOfAsterisk;
            numOfAsterisk = 0;
          } else {
            wasFirstPipeFound = true;
            numOfAsterisk = 0;
          }
        } else if (c == '*') {
          numOfAsterisk +=1;
        } else {
          throw new RuntimeException("wrong character");
        }
      }
      result.add(numOfAsteriskAccumulated);
    }
  return result;
  }
}
```

Each query looks only inside the specified substring, but doing this for every query from scratch could be too slow (O(n × q)), or even quadratic O(n<sup>2</sup>). See [Big O Notation](https://codersite.dev/big-o-notation-analysis-of-algorithms/){:target="_blank"}.

> The main idea in Analysis of Algorithms is always to improve the algorithm performance, by reducing the number of steps and comparisons. -- <cite>codersite.dev</cite>

| Approach | Preprocessing | Per query | Total |
|---|---|---|---|
| Brute force | none | O(n) | O(n·m) |
| Prefix sums | O(n) | O(1) | O(n + m) |

<br/>

## The Efficient Solution: Prefix Sums

To solve this problem efficiently in Java, especially given the constraints (up to 100,000 characters and queries), we need a solution that preprocesses the string once in O(n) and then answers each query in constant time, O(1).

Precompute `sum[i]`: the number of items inside compartments that are already closed at index *i*. Look at the diagram: the `*` at index 4 doesn't count until the `|` at index 5 closes its compartment, and that's when the count jumps from 2 to 3.

![Prefix sum array counting the items in closed compartments at each index of the example string](/assets/images/closedCompartments.jpg "Prefix sum array counting the items in closed compartments at each index of the example string"){:class="img-responsive"}

For a query, find the first `|` at or after *start* and the last `|` at or before *end*. The answer is the difference between `sum` at those two walls. For (1, 6), the walls are at indices 0 and 5, so the answer is sum[5] − sum[0] = 3. Finding those walls in O(1) needs two more precomputed arrays, and that's where most people's first attempt goes wrong.

The complete Java implementation, including the two helper arrays, the edge cases that trip up hidden tests, and the test cases, is in my book **[Cracking the Coding Interview – Top Java Challenges](https://amzn.to/3HrGXrF){:target="_blank"}**. It's built from real interview questions like this one, each solved step by step, from brute force to optimal.

> If this problem made you stop and think, the rest of the book will too:

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Please support me as a writer. Every contribution helps, and your donation can help add more articles to this website, no matter how small. Thank you!

{% include buymeacoffee.html %}
<br/>
