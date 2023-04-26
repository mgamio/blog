---
layout: post
title:  "Assemble Parts in Minimum Time"
description: "Assemble Parts in Minimum Time"
author: moises
categories: [ algorithms ]
image: assets/images/assembleParts.jpg
comments: false
---

Write a method to calculate the minimum possible time to put the N parts together and build the final product. The input consists of two arguments: numOfParts, an integer representing the number of the parts, and parts, a list of integers representing the size of the parts.

**Example:**

numOfParts=4

parts=[8,4,6,12]

Output: 58

**Explanation:**

*Step 1:* Assemble the parts of sizes 4 and 6 (time required is 10). Then, the size of the remaining parts after merging: [8,10,12].

*Step 2:* Assemble the parts of sizes 8 and 10 (time required is 18). Then, the size of the remaining parts after merging: [18,12].

*Step 3:* Assemble the parts of sizes 18 and 12 (time required is 30).

The total time required to assemble the parts is 10+18+30=58.

```kotlin
public class AssembleParts {
  public static int minimumTime(int numOfParts, List<Integer> list) {

  //implement here your code
  
  }
}
```

<div>
{%- include inArticleAds.html -%}
</div>

## Solution

You can notice that we always take the first two parts of minimum size. Once we have its required time, the length of the list decreases by one element. Based on this behavior, we propose the following pseudocode to optimize the assembly process of parts to reduce the time it takes to complete the task.

- Sorting a list in descending order.
- Iterate the list
- Takes the first two parts and calculates the required time
- This required time creates a new element in the new list (decreased by one). Then overwrite the second index value with the "required time" calculated. This unique element will be the first part of the next iteration.
- Accumulate the required time in every iteration.

Before implementing your [algorithm](https://codersite.dev/big-o-notation-analysis-of-algorithms/){:target="_blank"}, create your assumptions based on test cases.

```kotlin
  @Test
  public void test_right_values() {
    assertTrue(AssembleParts.minimumTime(4,
            new ArrayList<Integer>(Arrays.asList(8, 4, 6, 12))) == 58);
    assertTrue(AssembleParts.minimumTime(5,
            new ArrayList<Integer>(Arrays.asList(3, 7, 2, 10, 5))) == 59);
  }

  @Test
  public void test_wrong_values() {
    assertFalse(AssembleParts.minimumTime(3,
            new ArrayList<Integer>(Arrays.asList(2, 4, 6))) == 12);
  }
```

**But what about the number of parts?**

You get the number of parts if you ask the size() method of the list. So in that case you never use the *numOfParts* argument.

Validate your input data and check if the *numOfParts* value equals the list size.

If you are facing a face-to-face interview, always ask the interviewer about the variables in case of doubt. [Never assume and ask questions](https://codersite.dev/the-ubiquitous-language/){:target="_blank"}, this way you show that you will be a good team player in future projects.

Our final algorithm for the Assembly optimization.

```kotlin
public class AssembleParts {
  public static int minimumTime(int numOfParts, List<Integer> list) {

    if (numOfParts != list.size())
      throw new RuntimeException("wrong number of parts");

    Collections.sort(list);
    int accumulatedTime = 0;
    for (int idx = 0; idx < list.size() - 1; idx++) {
      int requiredTime = list.get(idx) + list.get(idx + 1);
      accumulatedTime += requiredTime;
      list.set(idx + 1, requiredTime);
    }
    return accumulatedTime;
  }
}
```

Similar questions you can find in my [book](https://amzn.to/3FxeKSb){:target="_blank"} about algorithms and data structures. Learn how to apply common algorithms to the practical problems.

<iframe sandbox="allow-popups allow-scripts allow-modals allow-forms allow-same-origin" style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//ws-eu.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=DE&source=ss&ref=as_ss_li_til&ad_type=product_link&tracking_id=mkgv89-21&language=en_GB&marketplace=amazon&region=DE&placement=B086JCK6C4&asins=B086JCK6C4&linkId=78e646bc8bd99599b961d3e15b102848&show_border=true&link_opens_in_new_window=true"></iframe>
