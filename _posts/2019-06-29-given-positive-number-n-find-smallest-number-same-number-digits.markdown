---
layout: post
title:  "Given N, find the smallest number with the same number of digits"
description: "Write an algorithm that, given an original number N, returns the smallest number with the same number of digits. For instance, given 123, return 100"
author: moises
categories: [ algorithms ]
image: assets/images/smallestNumber.jpg
comments: false
---

Write a method that, given an original number N, returns the smallest number with the same number of digits.

For instance, given N=4751, the method returns 1000. Given N=100, the method should return 100. Given N=1, the method should return 0.

Maybe the first idea comes to our minds could be to iterate from the given original number and decrease one by one, and in every iteration to check if every new number contains one digit less than the original number, if the answer is true, then the previous one is the smallest number.

## Define a test case to validate what your code will do

Our assumption based on a test case:

```kotlin
public class SmallestNumberTest {

  @Test
  public void test_right_smallest_values() {
    assertTrue(NumberUtils.smallest(4751) == 1000);
    assertTrue(NumberUtils.smallest(189) == 100);
    assertTrue(NumberUtils.smallest(37) == 10);
    assertTrue(NumberUtils.smallest(1) == 0);
  }

  @Test
  public void test_wrong_smallest_values() {
    assertFalse(NumberUtils.smallest(8) == 1);
    assertFalse(NumberUtils.smallest(2891) == 2000);
  }
}
```

Here, is the implementation code that works for positive numbers:

```kotlin
public class NumberUtils {
  public static int smallest(int N) {
    int smallestNumber = 0;
    if (N <= 1)
      return smallestNumber;
    
    int numberOfDigitsOriginalN = String.valueOf(N).length();
    while (N > 0) {
      N--;
      if (String.valueOf(N).length() ==
          (numberOfDigitsOriginalN -1)) {
        return ++N;
      }
    }
    return smallestNumber;
  }
}
```

<div>
{%- include inArticleAds.html -%}
</div>

If we realize, the solution follows a common pattern:

N = 3891 -> smallest number = 1000

N = 189 -> smallest number = 100

N = 37 -> smallest number = 10

The smallest number is a power of 10, where the exponent is:

(number of digits of the given N – 1)

If we want to include negative numbers, we must consider the smallest number with the same number of digits and the same sign. We add our test case for negative numbers as well:

```kotlin
@Test
  public void test_right_smallest_values() {
  assertTrue(NumberUtils.smallest4(-1) == -9);
  assertTrue(NumberUtils.smallest4(-37) == -99);
}
```

Here, is the algorithm for positive and negative numbers:

```kotlin
public class NumberUtils {
  public static int smallest(int N) {
    int numberOfDigits = (int) String.valueOf(Math.abs(N)).length();
    if (N >= 0) {
      if (numberOfDigits == 1) {
        return 0;
      } else {
        return (int) Math.pow(10, numberOfDigits - 1);
      }
    } else
      return 1 - (int) Math.pow(10, numberOfDigits);
  }
}
```

The main idea in [Analysis of Algorithms](https://codersite.dev/big-o-notation-analysis-of-algorithms/){:target="_blank"} is always to improve the algorithm performance by reducing the number of steps and comparisons. The simpler and more intuitive an algorithm is, the more useful and efficient it will be.

Similar questions you can find in my [book](https://amzn.to/3FxeKSb){:target="_blank"} about algorithms and data structures. Learn how to apply common algorithms to the practical problems.

<iframe sandbox="allow-popups allow-scripts allow-modals allow-forms allow-same-origin" style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//ws-eu.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=DE&source=ss&ref=as_ss_li_til&ad_type=product_link&tracking_id=mkgv89-21&language=en_GB&marketplace=amazon&region=DE&placement=B086JCK6C4&asins=B086JCK6C4&linkId=78e646bc8bd99599b961d3e15b102848&show_border=true&link_opens_in_new_window=true"></iframe>
