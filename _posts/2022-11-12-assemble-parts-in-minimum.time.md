---
layout: post
title:  "Assemble Parts in Minimum Time: Greedy Min-Heap Solution in Java (Code Interview Problem)"
description: "Merge parts at minimum total cost: why sorting once fails, the greedy min-heap solution with PriorityQueue in O(n log n), a proof sketch, and JUnit 5 tests. Also known as connect ropes with minimum cost."
author: moises
categories: [ algorithms ]
image: /assets/images/assembleParts.jpg
comments: false
---

This problem looks easy, and most candidates find the right idea within minutes. Then many of them implement it in a way that passes the examples and fails on half of all other inputs. Here's the problem, the trap, and a solution you can defend in an interview. You may also know it as **"connect ropes with minimum cost"**.

## The Problem

A factory builds a product from *N* parts. Assembling two parts of sizes *a* and *b* takes *a + b* units of time and produces one new part of size *a + b*. Parts are assembled two at a time until only the final product is left.

Write a method that calculates the **minimum total time** to build the final product. The input consists of two arguments: `numOfParts`, the number of parts, and `parts`, a list of integers with the size of each part.

```java
public class AssembleParts {

  public static long minimumTime(int numOfParts, List<Integer> parts) {
    // implement your code here
  }
}
```

**Example:** `numOfParts = 4`, `parts = [8, 4, 6, 12]`. **Output:** `58`.

1. Assemble the parts of sizes 4 and 6: time 10. Remaining parts: [8, 10, 12].
2. Assemble the parts of sizes 8 and 10: time 18. Remaining parts: [18, 12].
3. Assemble the parts of sizes 18 and 12: time 30.

The total time is 10 + 18 + 30 = **58**. No other order is faster.

<div>
{%- include inArticleAds.html -%}
</div>

## Ask Before You Code

In an interview, clarify the input before you write a line. Interviewers expect it, and it shows how you'll work in a team: you don't build on assumptions.

- **Why `numOfParts`?** The list already knows its size. Ask whether the two can differ, and validate them if they can.
- **Can the list be empty, or contain a single part?** Then no assembly is needed, and the time is 0.
- **How large can the values be?** Sums grow quickly. With large parts, the total doesn't fit into an `int`, so return a `long`.
- **Can sizes be negative or zero?** A negative size makes no sense for a physical part, so reject it.

## The Trap: Sorting Only Once

The example suggests a pattern: always assemble the two smallest parts. A tempting implementation sorts the list once and then walks through it, adding each new part to the next one:

```java
Collections.sort(list);
long total = 0;
for (int i = 0; i < list.size() - 1; i++) {
  int merged = list.get(i) + list.get(i + 1);
  total += merged;
  list.set(i + 1, merged);
}
```

It returns 58 for the example. But try `[1, 1, 1, 1]`:

- **Sorting once:** 1 + 1 = 2, then 2 + 1 = 3, then 3 + 1 = 4. Total: **9**.
- **Always the two smallest:** 1 + 1 = 2, then the other 1 + 1 = 2, then 2 + 2 = 4. Total: **8**.

The mistake: after a merge, the new part is not necessarily one of the two smallest anymore. The sorted order is out of date after the first step. In a test with 10,000 random lists, the sort-once version gave a wrong answer for 6,034 of them. The two examples in the problem just happen to work.

## The Greedy Idea and Why It Works

Look at what the total time really counts. Every time a part takes part in an assembly, its size is added to the total, and it stays inside the new part for every later assembly. So:

> total time = the sum of (size of each original part × the number of assemblies it goes through)

To keep the total small, the largest parts should go through the fewest assemblies, and the smallest parts can go through the most. That's exactly what happens when you always assemble the two smallest parts **currently available**. If a larger part went through more assemblies than a smaller one, swapping their places would reduce the total, so the greedy choice can't be beaten. This is the same argument that proves Huffman coding optimal.

## The Solution: A Min-Heap

We need a structure that always gives us the smallest element, and accepts new elements that may belong anywhere in the order. That's a **min-heap**, and in Java it's a `PriorityQueue`:

```java
public class AssembleParts {

  public static long minimumTime(int numOfParts, List<Integer> parts) {
    if (parts == null || numOfParts != parts.size()) {
      throw new IllegalArgumentException("numOfParts must equal the number of parts");
    }

    PriorityQueue<Long> heap = new PriorityQueue<>();   // min-heap: smallest part on top
    for (int part : parts) {
      if (part < 0) {
        throw new IllegalArgumentException("Part sizes can't be negative: " + part);
      }
      heap.add((long) part);
    }

    long totalTime = 0;
    while (heap.size() > 1) {
      long merged = heap.poll() + heap.poll();   // the two smallest parts
      totalTime += merged;
      heap.add(merged);                          // the new part competes again
    }
    return totalTime;
  }
}
```

**Complexity:** each `poll` and `add` costs O(log *n*), and there are *n* − 1 assemblies, so the time is **O(*n* log *n*)**. The heap needs **O(*n*)** extra space. The method doesn't modify the caller's list, and it uses `long` so large inputs can't overflow. See [Big O notation](https://codersite.dev/big-o-notation-analysis-of-algorithms/){:target="_blank"} for how to analyze algorithms like this one, and [choosing the right data structure](https://codersite.dev/data-structures-foundation-efficient-programming/){:target="_blank"} for when a heap is the right tool.

## Tests That Would Have Caught the Bug

Write the tests first, and include more than the examples from the problem statement:

```java
class AssemblePartsTest {

  @Test
  void examplesFromTheProblem() {
    assertEquals(58, AssembleParts.minimumTime(4, List.of(8, 4, 6, 12)));
    assertEquals(59, AssembleParts.minimumTime(5, List.of(3, 7, 2, 10, 5)));
  }

  @Test
  void inputsWhereSortingOnceFails() {
    assertEquals(8, AssembleParts.minimumTime(4, List.of(1, 1, 1, 1)));
    assertEquals(80, AssembleParts.minimumTime(6, List.of(5, 5, 5, 5, 5, 5)));
  }

  @Test
  void edgeCases() {
    assertEquals(0, AssembleParts.minimumTime(0, List.of()));
    assertEquals(0, AssembleParts.minimumTime(1, List.of(42)));
    assertEquals(7, AssembleParts.minimumTime(2, List.of(3, 4)));
  }

  @Test
  void largeValuesDoNotOverflow() {
    int max = Integer.MAX_VALUE;
    assertEquals(5L * max, AssembleParts.minimumTime(3, List.of(max, max, max)));
  }

  @Test
  void invalidInput() {
    assertThrows(IllegalArgumentException.class, () -> AssembleParts.minimumTime(3, List.of(1, 2)));
    assertThrows(IllegalArgumentException.class, () -> AssembleParts.minimumTime(2, List.of(1, -2)));
  }
}
```

`assertEquals` shows the expected and the actual value when a test fails, which `assertTrue(result == 58)` can't do.

The strongest test compares the solution with a **brute force** that tries every possible order. It's far too slow for real inputs, but for lists of up to seven parts it finishes instantly and is obviously correct:

```java
@Test
void matchesBruteForceOnRandomInputs() {
  Random random = new Random(42);
  for (int run = 0; run < 1000; run++) {
    List<Integer> parts = new ArrayList<>();
    int n = 1 + random.nextInt(7);
    for (int i = 0; i < n; i++) {
      parts.add(1 + random.nextInt(20));
    }
    assertEquals(bruteForce(parts), AssembleParts.minimumTime(n, parts), parts.toString());
  }
}

// Tries every possible pair at every step: exponential, only for small test inputs
private static long bruteForce(List<Integer> parts) {
  if (parts.size() <= 1) {
    return 0;
  }
  long best = Long.MAX_VALUE;
  for (int i = 0; i < parts.size(); i++) {
    for (int j = i + 1; j < parts.size(); j++) {
      List<Integer> rest = new ArrayList<>(parts);
      int merged = parts.get(i) + parts.get(j);
      rest.remove(j);
      rest.remove(i);
      rest.add(merged);
      best = Math.min(best, merged + bruteForce(rest));
    }
  }
  return best;
}
```

All six tests pass with the min-heap solution. The sort-once version fails the counterexamples and the random test.

## Related Problems

The same greedy idea solves several well-known problems:

- **Connect ropes with minimum cost:** the same problem with ropes instead of parts.
- **Optimal merge pattern:** merge sorted files with the fewest total record moves.
- **Huffman coding:** build the code tree by repeatedly combining the two least frequent symbols, which gives the shortest compressed text.

When you recognize the pattern "repeatedly combine the two smallest", reach for a min-heap.

Problems like this one, where the obvious solution has a hidden flaw, are what coding interviews are made of. My book walks through more of them, with the same approach: understand the problem, find the trap, then write the efficient solution:

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Please support me as a writer. Every contribution helps, and your donation can help add more articles to this website, no matter how small. Thank you!

{% include buymeacoffee.html %}
<br/>
