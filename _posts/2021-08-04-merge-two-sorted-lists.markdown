---
layout: post
title:  "Merge Two Sorted Lists in Java: Array List and Linked List Solutions"
description: "Merge two sorted lists in Java in O(n + m): the two-pointer solution for ArrayList, a generic version, and the LeetCode 21 linked-list solution with tests."
author: moises
categories: [ algorithms ]
image: /assets/images/merge.jpg
comments: false
---

Merging two sorted lists is one of the classic coding interview problems, and one of the most useful: it is the heart of merge sort, of merging k sorted lists, and of sorting files too big to fit in memory.

This article solves it three ways in Java, each with tests: for array-based lists, for any `List`, and for linked lists (the version LeetCode 21 asks for).

## The Problem

Given two lists sorted in ascending order, return one list that contains all their elements, also sorted.

![Two sorted lists, 1 1 2 5 8 and 3 4 6, merged into 1 1 2 3 4 5 6 8](/assets/images/mergeSortedLists.jpg "Merge two sorted lists"){:class="img-responsive"}

The simple solution is to put all elements into one list and sort it. That works, but it costs O((n + m) log(n + m)) and ignores the fact that both lists are *already sorted*. We can do better.

## The Idea: Two Pointers

Keep one pointer at the start of each list. At every step, compare the two elements the pointers point to, copy the smaller one to the result, and move that pointer forward. When one list runs out, copy the rest of the other one: it is already sorted.

Here are the steps for the lists in the picture (`[i]` and `[j]` mark the elements being compared):

```text
list1: [1] 1  2  5  8    list2: [3] 4  6    1 <= 3, take 1  →  1
list1:  1 [1] 2  5  8    list2: [3] 4  6    1 <= 3, take 1  →  1 1
list1:  1  1 [2] 5  8    list2: [3] 4  6    2 <= 3, take 2  →  1 1 2
list1:  1  1  2 [5] 8    list2: [3] 4  6    5 >  3, take 3  →  1 1 2 3
list1:  1  1  2 [5] 8    list2:  3 [4] 6    5 >  4, take 4  →  1 1 2 3 4
list1:  1  1  2 [5] 8    list2:  3  4 [6]   5 <= 6, take 5  →  1 1 2 3 4 5
list1:  1  1  2  5 [8]   list2:  3  4 [6]   8 >  6, take 6  →  1 1 2 3 4 5 6
list2 is used up: copy the rest of list1                     →  1 1 2 3 4 5 6 8
```

Every element is copied exactly once, so the merge takes **O(n + m)** time, where n and m are the lengths of the two lists. That is linear time, the best possible, because every element has to end up in the result. (See [Big O Notation](https://codersite.dev/big-o-notation-analysis-of-algorithms/){:target="_blank"} for how to analyze algorithms like this one.)

## Write the Tests First

The tests describe what "correct" means, including the cases that are easy to forget: lists of different lengths and empty lists. They use JUnit 5 or later:

```java
class SortedListsTest {

  @Test
  void mergesListsOfDifferentLengths() {
    assertEquals(List.of(1, 1, 2, 3, 4, 5, 6, 8),
        SortedLists.merge(List.of(1, 1, 2, 5, 8), List.of(3, 4, 6)));
  }

  @Test
  void mergesInterleavedLists() {
    assertEquals(List.of(1, 2, 3, 4, 5, 6),
        SortedLists.merge(List.of(2, 4, 5), List.of(1, 3, 6)));
  }

  @Test
  void handlesEmptyLists() {
    assertEquals(List.of(1, 2), SortedLists.merge(List.of(), List.of(1, 2)));
    assertEquals(List.of(1, 2), SortedLists.merge(List.of(1, 2), List.of()));
    assertEquals(List.of(), SortedLists.merge(List.of(), List.of()));
  }
}
```

Compare lists with `assertEquals`, not their `toString()` output: when a test fails, JUnit then shows exactly which element differs.

<div>
{%- include inArticleAds.html -%}
</div>

## Solution 1: Merge Two ArrayLists

```java
public class SortedLists {

  public static List<Integer> merge(List<Integer> list1, List<Integer> list2) {
    List<Integer> merged = new ArrayList<>(list1.size() + list2.size());
    int i = 0;
    int j = 0;

    while (i < list1.size() && j < list2.size()) {
      if (list1.get(i) <= list2.get(j)) {
        merged.add(list1.get(i));
        i++;
      } else {
        merged.add(list2.get(j));
        j++;
      }
    }

    // One list is used up; the rest of the other is already sorted.
    while (i < list1.size()) {
      merged.add(list1.get(i));
      i++;
    }
    while (j < list2.size()) {
      merged.add(list2.get(j));
      j++;
    }
    return merged;
  }
}
```

Three details make this solution correct and fast:

- **The two loops at the end.** Without them, the merge stops as soon as the shorter list runs out, and the first test fails: the `8` is missing. This is the most common mistake in interviews.
- **`<=`, not `<`.** When two elements are equal, the one from `list1` goes first. Equal elements keep their original order, which makes the merge *stable*. Merge sort relies on this to be a stable sort.
- **The initial capacity.** `new ArrayList<>(list1.size() + list2.size())` creates the result at its final size, so the list never has to grow and copy itself while you add elements.

## Solution 2: A Generic Merge for Any List

The first solution has a hidden trap: `get(i)` is fast on an `ArrayList` but slow on a `LinkedList`, which has to walk from the start of the list to reach position `i`. On two `LinkedList`s of 20,000 elements, the version above took **650 ms** on my machine. The version below took **4 ms**, because iterators move through any list one step at a time:

```java
public static <T extends Comparable<? super T>> List<T> mergeAny(List<T> list1, List<T> list2) {
  List<T> merged = new ArrayList<>(list1.size() + list2.size());
  Iterator<T> it1 = list1.iterator();
  Iterator<T> it2 = list2.iterator();
  T a = it1.hasNext() ? it1.next() : null;
  T b = it2.hasNext() ? it2.next() : null;

  while (a != null && b != null) {
    if (a.compareTo(b) <= 0) {
      merged.add(a);
      a = it1.hasNext() ? it1.next() : null;
    } else {
      merged.add(b);
      b = it2.hasNext() ? it2.next() : null;
    }
  }

  if (a != null) {
    merged.add(a);
    it1.forEachRemaining(merged::add);
  }
  if (b != null) {
    merged.add(b);
    it2.forEachRemaining(merged::add);
  }
  return merged;
}
```

The type parameter `T extends Comparable<? super T>` lets the method merge any comparable type: `Integer`, `String`, `LocalDate`, or your own records. It's the same signature that `Collections.sort` uses; [Java Generics](https://codersite.dev/java-generics/){:target="_blank"} explains how it works. The method assumes the lists contain no `null` elements.

## Solution 3: Merge Two Sorted Linked Lists (LeetCode 21)

In interviews, and on LeetCode, the problem usually comes with a hand-made linked list:

```java
public class ListNode {
  int val;
  ListNode next;

  ListNode(int val) {
    this.val = val;
  }

  ListNode(int val, ListNode next) {
    this.val = val;
    this.next = next;
  }
}
```

Instead of copying values into a new list, you **relink the existing nodes**, so the merge needs no extra memory:

```java
public static ListNode mergeTwoLists(ListNode list1, ListNode list2) {
  ListNode dummy = new ListNode(0);
  ListNode tail = dummy;

  while (list1 != null && list2 != null) {
    if (list1.val <= list2.val) {
      tail.next = list1;
      list1 = list1.next;
    } else {
      tail.next = list2;
      list2 = list2.next;
    }
    tail = tail.next;
  }

  tail.next = (list1 != null) ? list1 : list2;
  return dummy.next;
}
```

The **dummy node** is the trick worth remembering. It is a placeholder in front of the result, so the first node doesn't need special code: `tail` always has a node to attach to, and `dummy.next` is the head of the merged list. The last line attaches the rest of the remaining list in one step. There is no copy loop here, because the remaining nodes are already linked to each other.

<div>
{%- include inArticleAds.html -%}
</div>

### The Recursive Version

The same merge fits in a few lines with recursion:

```java
public static ListNode mergeRecursive(ListNode list1, ListNode list2) {
  if (list1 == null) return list2;
  if (list2 == null) return list1;

  if (list1.val <= list2.val) {
    list1.next = mergeRecursive(list1.next, list2);
    return list1;
  }
  list2.next = mergeRecursive(list1, list2.next);
  return list2;
}
```

It is elegant, but every node adds a call to the stack. With the default stack size, merging two lists of 20,000 nodes each threw a `StackOverflowError` on my machine. Show it in an interview if you like, then mention this limit and prefer the iterative version in production code. Interviewers like to hear that trade-off.

## Complexity

| Solution | Time | Extra space |
|---|---|---|
| Concatenate and sort | O((n+m) log(n+m)) | O(n+m) |
| ArrayList, two indexes | O(n+m) | O(n+m) for the result |
| Any List, iterators | O(n+m) | O(n+m) for the result |
| Linked list, iterative | O(n+m) | O(1) |
| Linked list, recursive | O(n+m) | O(n+m) call stack |

<br/>

## Where Merging Is Used

- **Merge sort** splits a list in halves, sorts each half, and merges them with exactly this algorithm. Java's `Arrays.sort` for objects and `Collections.sort` use TimSort, a refined merge sort.
- **Merge k sorted lists**, a common follow-up question, merges many lists at once with a priority queue, in O(N log k).
- **External sorting** sorts files too large for memory: sort chunks that fit, write them to disk, then merge the sorted chunks.
- **Databases** use a *merge join* to combine two tables that are sorted on the join column.

## Frequently Asked Questions

**What is the time complexity of merging two sorted lists?**
O(n + m), where n and m are the lengths of the lists. Each element is compared and copied once.

**Why not just add both lists together and call `sort`?**
It works, but it costs O((n + m) log(n + m)) because it ignores that the inputs are already sorted. For large lists, the merge is much faster.

**What if the lists are sorted in descending order?**
Flip the comparison (`>=` instead of `<=`), or pass a `Comparator` and use `comparator.compare(a, b) <= 0`.

**How do I remove duplicates while merging?**
Before adding an element, skip it if it equals the last element added to the result.

<br/>

This problem is a favorite in coding interviews because it tests the details: the leftover elements, empty lists, stability and the dummy node. My book *The Code Interview* solves real Java interview questions the same way, step by step, with the follow-up questions interviewers ask:

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

If you found this article useful, you can support this website:

<div>
{% include buymeacoffee.html %}
</div>
