---
layout: post
title:  "Java Data Structures: Which One to Use and Why (with a Big-O Cheat Sheet)"
description: "Arrays, ArrayList, LinkedList, HashMap, TreeMap, stacks and queues in Java: what each one is good at, a Big-O cheat sheet, and the mistakes that cost performance."
author: moises
categories: [ data structures ]
image: /assets/images/dataStructure.jpg
comments: false
---

Choosing the wrong data structure is one of the most common reasons code is slow, and one of the most common interview questions. A list where you needed a map turns a millisecond lookup into a full scan. Here's what each core Java structure is good at, and how to choose.

A data structure is a way of organizing data in memory so that certain operations are fast: finding an element, adding one, removing one, or keeping them in order. No structure is fast at everything. Choosing one means choosing which operations matter for your problem.

## Arrays and ArrayList

We usually declare a variable to store a single value:

```java
int num = 15;
```

Arrays store multiple values of the same type in a single variable, in contiguous memory:

```java
int[] myNums = {15, 22, 7, 42};
String[] tickets = {"Bicycle", "Trophy", "Umbrella", "Guitar", "Hat"};
```

Reading an element by its position is instant, whatever the size of the array: `myNums[3]` is `42`. The price is that an array has a fixed size.

In everyday Java code you'll mostly use `ArrayList`, an array that grows automatically:

```java
List<String> objects = new ArrayList<>(List.of("Bicycle", "Trophy"));
objects.add("Umbrella");     // [Bicycle, Trophy, Umbrella]
objects.get(1);              // "Trophy"
```

**Use it when:** you need a list. `ArrayList` is the default choice: fast access by index and fast adds at the end. Inserting or removing in the middle is slow, because every following element has to shift.

## LinkedList

A linked list stores each element in a node that points to the next one, so adding or removing at either end never shifts anything:

```java
import java.util.LinkedList;

public class LinkedListUseCase {
  public static void main(String[] args) {
    LinkedList<String> objects = new LinkedList<String>();
    objects.add("Guitar");
    objects.add("Bicycle");
    objects.add("Radio");

    // Use addFirst() to add the item to the beginning
    objects.addFirst("Book");
    System.out.println(objects);
  }
}
```

```text
[Book, Guitar, Bicycle, Radio]
```

A common belief is that `LinkedList` is faster than `ArrayList` for inserting in the middle, for example in a music playlist. In Java it rarely is: the linked list first has to walk node by node to reach the middle, which is also O(n), and `ArrayList` uses memory far more efficiently.

**Use it when:** you add and remove at both ends, or you remove elements while iterating with an `Iterator`. Even then, `ArrayDeque` (below) is usually faster.

<div>
{%- include inArticleAds.html -%}
</div>

## Queues and Stacks

When you visit some bank branches in Berlin, you don't get a number: you get a ticket with a picture. The display shows the pictures of everyone waiting:

![Bank waiting display: each waiting customer has a picture ticket, such as a bicycle, trophy or umbrella](/assets/images/arrayBank.jpg "Bank waiting display: each waiting customer has a picture ticket, such as a bicycle, trophy or umbrella"){:class="img-responsive"}

Whoever arrived first is called first. That's a **queue**: first in, first out (FIFO). New tickets join at the back, and the next customer is taken from the front:

![A queue: elements are added at the back (enqueue) and removed from the front (dequeue)](/assets/images/queueDef.jpg "A queue: elements are added at the back (enqueue) and removed from the front (dequeue)"){:class="img-responsive"}

```java
Deque<String> waiting = new ArrayDeque<>();
waiting.offer("Bicycle");
waiting.offer("Trophy");
waiting.offer("Umbrella");

String next = waiting.poll();   // "Bicycle": first in, first out
                                // still waiting: [Trophy, Umbrella]
```

When your turn arrives, the system takes your ticket from the front of the queue and sends you to a desk:

![The display calls the next ticket, a coffee cup, to desk 15](/assets/images/arrayElementBank.jpg "The display calls the next ticket, a coffee cup, to desk 15"){:class="img-responsive"}

A **stack** is the opposite: last in, first out (LIFO), like the "back" button of a browser:

```java
Deque<String> history = new ArrayDeque<>();
history.push("home");
history.push("orders");
history.push("order 4711");

String back = history.pop();    // "order 4711": last in, first out
```

**Use it when:** you process items in arrival order (queue) or undo the most recent step first (stack). In both cases, use `ArrayDeque`. The old `Stack` class still works, but Java's documentation recommends `Deque` instead.

For the theory behind these structures, with proofs and pseudocode, this is the classic reference:

<div>
{%- include introductionToAlgorithms.html -%}
</div>

## Hash Tables

A hash table stores key-value pairs and finds a value by its key in constant time on average, no matter how many entries it holds. In Java, that's `HashMap`:

```java
import java.util.HashMap;
import java.util.Map;

public class HashMapUseCase {

  public static void main(String[] args) {

    Map<Integer, String> articles = new HashMap<>();

    // Adding elements to the HashMap
    articles.put(1, "link_article1");
    articles.put(2, "link_article2");
    articles.put(3, "link_article3");

    // Getting values from the HashMap
    String articleLink = articles.get(1);
    System.out.println("Link to article: " + articleLink);

    // Removing elements from the HashMap
    articles.remove(2);

    // Iterating the elements of the HashMap
    for (Map.Entry<Integer, String> entry : articles.entrySet()) {
      Integer key = entry.getKey();
      System.out.println("Key: " + key + ", Value: " + entry.getValue());
    }
  }
}
```

```text
Link to article: link_article1
Key: 1, Value: link_article1
Key: 3, Value: link_article3
```

You can also iterate with a lambda (see [Functional Programming](https://codersite.dev/java-functional-programming/){:target="_blank"}), which prints the same two lines:

```java
articles.forEach((key, value) -> {
  System.out.println("Key: " + key + ", Value: " + value);
});
```

**Watch out: a `HashMap` has no guaranteed order.** Insert four customers and see what comes back:

```text
inserted:       [Initech, ACME, Umbrella Corp, Globex]
HashMap:        [Initech, ACME, Globex, Umbrella Corp]
LinkedHashMap:  [Initech, ACME, Umbrella Corp, Globex]   keeps insertion order
TreeMap:        [ACME, Globex, Initech, Umbrella Corp]   sorted by key
```

Never rely on the order of a `HashMap`. Use `LinkedHashMap` when you need insertion order, and `TreeMap` when you need sorted keys. To see how a `HashMap` turns slow nested loops into fast lookups in a real project, read [From O(n²) to O(n) with a HashMap](https://codersite.dev/transform-list-into-hashmap/){:target="_blank"}.

For single-threaded code, use `HashMap`. If several threads update the same map, use `ConcurrentHashMap`.

When your data outgrows one machine, the same ideas (hashing, ordered indexes, queues) reappear as databases and message brokers. This book explains how:

<div>
{%- include designingDataIntensiveApplications.html -%}
</div>

## Trees and Graphs

- [**Trees**](https://codersite.dev/tree-data-structure-binary-search-tree/){:target="_blank"} organize data hierarchically. A binary search tree keeps elements sorted, which is what `TreeMap` and `TreeSet` use internally.
- [**Graphs**](https://codersite.dev/graphs-depth-first-search/){:target="_blank"} are nodes (vertices) connected by edges, for networks, routes and dependencies.

## Big-O Cheat Sheet

How fast each operation is, as the collection grows (see [Big O Notation](https://codersite.dev/big-o-notation-analysis-of-algorithms/){:target="_blank"}):

| Java class | Fast | Slow, O(n) | Order |
|---|---|---|---|
| array, `ArrayList` | get by index O(1), add at end O(1)* | search, insert or remove at the front or middle | insertion order |
| `LinkedList` | add or remove at either end O(1) | get by index, search | insertion order |
| `ArrayDeque` | add or remove at either end O(1)* | search | insertion order |
| `HashMap`, `HashSet` | get, put, remove by key O(1) average | none for key operations | no guaranteed order |
| `LinkedHashMap` | same as `HashMap` | none for key operations | insertion order |
| `TreeMap`, `TreeSet` | get, put, remove O(log n) | none for key operations | sorted |
| `PriorityQueue` | peek O(1), add and poll O(log n) | search, remove an arbitrary element | smallest first |

<br/>

\* Amortized: usually O(1), with an occasional O(n) step when the internal array grows.

## How to Choose

- Need a list you mostly read or append to? **`ArrayList`**.
- Need to look things up by a key? **`HashMap`**.
- Need the keys sorted, or the first/last key? **`TreeMap`**.
- Need first in, first out, or last in, first out? **`ArrayDeque`**.
- Need to always take the smallest (or highest-priority) item? **`PriorityQueue`**.
- Need unique values? **`HashSet`**, or **`TreeSet`** if they must be sorted.

## Abstract Data Types

An **abstract data type** (ADT) is defined by its operations, not by how it's built. A queue is an ADT: *add at the back, remove from the front*. `ArrayDeque` is one implementation of it; two stacks are another:

```java
public class QueueViaStacks<T> {
  Deque<T> inbox;    // new elements are pushed here
  Deque<T> outbox;   // elements are popped from here, in reversed (FIFO) order

  //code omitted for brevity
}
```

Building one ADT out of others is a classic interview question. You can find the complete implementation, solved step by step, in my book [**The Code Interview**](https://link.amazon/B08nEgB1o){:target="_blank"}.

Questions like "implement a queue with two stacks" or "why is this lookup slow?" come up in almost every coding interview. Practice them with real questions:

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Choosing data structures is a design decision, and good design is about understanding the trade-offs:

<div>
{%- include softwareDesignAd1.html -%}
</div>

Every example in this post compiles and runs as shown with Java 17.

Please support me as a writer. Your donation will help add more articles to this website. Thank you!

{% include buymeacoffee.html %}
<br/>
