---
layout: post
title:  "ACME Inventory - number of items in closed compartments"
description: "How many items exists in closed inventory compartments."
author: moises
categories: [ algorithms ]
image: assets/images/inventoryItems.jpg
comments: false
---

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

**Constraints**:

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

A brute force algorithm solves a problem through exhaustion: it goes through all possible choices until a solution is found. The time complexity of a brute force algorithm is often proportional to the input size.

In a real interview, developers often try the simplest, most obvious solution (brute force approach), even if it's not the best. Let's look at that first.

To return the number of items in closed compartments, we need to build the substrings from the two arrays *startIndices* and *endIndices*.

We evaluate every character from the substring. We define a *numOfAsterisk* variable to count items inside a compartment.

We define a *wasFirstPipeFound* variable to initialize our numOfAsterisk variable the first time a ‘\|’ character is found, and we accumulate all items for subsequent ‘\|’ characters.

```kotlin
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

> The main idea in Analysis of Algorithms is always to improve the algorithm performance, by reducing the number of steps and comparisons.. -- <cite>codersite.dev</cite>

To solve this problem efficiently in Java, especially given the constraints (up to 100,000 characters and queries), we need a solution that preprocesses the string to answer each query in constant time (O(1)) after an O(n) preprocessing phase.

We can define a sum[] array that stores at index i the number of items '*' within closed compartments up to index i.

![closedCompartments](/assets/images/closedCompartments.jpg "closed Compartments algorithm"){:class="img-responsive"}

The complete solution in [Cracking the Coding Interview](https://amzn.to/3HrGXrF){:target="_blank"}.

> The book is based on real questions that companies ask in their interviews. It is not a collection of generic questions that you can find in many books. It is based on real questions that companies ask in their interviews.

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Please support me as a writer. Every contribution helps, and your donation can help add more articles to this website, no matter how small. Thank you!

{% include buymeacoffee.html %}
<br/>
