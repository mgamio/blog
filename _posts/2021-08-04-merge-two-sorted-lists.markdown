---
layout: post
title:  "Merge two Sorted Lists"
description: "Given two sorted lists, merge them in a new sorted list - coding interview"
featured-image: mergeSortedLists.jpg
date: 2021-08-03 22:18:45 +0100
categories: algorithms java
---
Given two sorted lists, merge them in a new sorted list. 

![merge-two-sorted-lists](/assets/images/mergeSortedLists.jpg){:class="img-responsive"}

We can join the two lists into a new list and apply a sort algorithm such as bubble sort, insertion, or quicksort. What we are going to do is to implement a new algorithm with a [NlogN]({% post_url 2020-06-22-big-o-notation-analysis-of-algorithms %}){:target="_blank"} performance.

- We define a new List to add all elements from the other two lists in a sorted way.
- We define two indexes that point to every element in every list
- We iterate both lists while still exist elements in both lists
- We compare elements from both lists and add the smaller one to the new list in every iteration. Before passing to the next iteration, we increment in one the index of the list, which contains the smaller element.
- If there is a list that still contains elements, we add them directly to the new list.

## A test case helps to validate your assumptions

Our assumption based on a test case:

{% highlight ruby %}
@Test
public void mergeSortedLists() {
  List<Integer> sList1 = Arrays.asList(1,1,2,5,8);
  List<Integer> sList2 = Arrays.asList(3,4,6);
  assertEquals("[1, 1, 2, 3, 4, 5, 6, 8]",    
    SortedList.merge_sorted(sList1,sList2).toString());
}

@Test
public void mergeSortedLists2() {
  List<Integer> sList1 = Arrays.asList(2,4,5);
  List<Integer> sList2 = Arrays.asList(1,3,6);
  assertEquals("[1, 2, 3, 4, 5, 6]", 
    SortedList.merge_sorted(sList1,sList2).toString());
}
{% endhighlight %}

Here, the implementation code:

{% highlight ruby %}
public class SortedList {
  public static List<Integer> merge_sorted(
    List<Integer> sList1, List<Integer> sList2) {

    List<Integer> mergedSortedList = new ArrayList<>();
    int idx1 = 0;
    int idx2 = 0;

    while (idx1 < sList1.size() && idx2 < sList2.size()) {
      if (sList1.get(idx1) <= sList2.get(idx2)) {
        mergedSortedList.add(sList1.get(idx1));
        idx1++;
      } else {
        mergedSortedList.add(sList2.get(idx2));
        idx2++;
      }
    }

    return mergedSortedList;
  }
}

{% endhighlight %}

The previous algorithm is missing how to proceed when one of the lists still contains elements not compared. Keep reading [here](https://lesen.amazon.de/kp/embed?asin=B086JCK6C4&preview=newtab&linkCode=kpe&ref_=cm_sw_r_kb_dp_SD6EZ360ZYYSM2HAZHQ2){:target="_blank"}

