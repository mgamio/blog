---
layout: post
title:  "Given N, find the smallest number with the same number of digits"
description: "Write an algorithm that, given an original number N, returns the smallest number with the same number of digits. For instance, given 123, return 100"
date:   2019-06-29 14:18:45 +0100
read_time: true
categories: algorithms
---
Write a method that, given an original number N, returns the smallest number with the same number of digits.

For instance, given N=4751, the method returns 1000. Given N=100, the method should return 100. Given N=1, the method should return 0.

Maybe the first idea comes to our minds could be to iterate from the given original number and decrease one by one, and in every iteration to check if every new number contains one digit less than the original number, if the answer is true, then the previous one is the smallest number.

Our assumption based on a test case:

{% highlight ruby %}
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
{% endhighlight %}

Here, the implementation code:

{% highlight ruby %}
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
{% endhighlight %}

If we realize, the solution follows a common pattern:

N = 3891 -> smallest number = 1000

N = 189 -> smallest number = 100

N = 37 -> smallest number = 10

The smallest number is a power of 10, where the exponent is:

(number of digits of the given N – 1)

Here, a most optimized solution:

{% highlight ruby %}
public class NumberUtils {
  public static int smallest(int N) {
    int smallestNumber = 0;
    if (N <= 1 || String.valueOf(N).length() == 1) {
      return smallestNumber;
    }
    int numberOfDigits = String.valueOf(N).length();
    return (int) Math.pow(10, numberOfDigits - 1);
  }
}
{% endhighlight %}

The main idea in Analysis of Algorithms is always to improve the algorithm performance by reducing the number of steps and comparisons. The simpler and more intuitive an algorithm is, the more useful and efficient it will be.

Explore similar algorithms in the following [link](https://amzn.to/2LqceUy){:target="_blank"}:

<iframe type="text/html" width="336" height="550" frameborder="0" allowfullscreen style="max-width:100%" src="https://lesen.amazon.de/kp/card?asin=B086JCK6C4&preview=inline&linkCode=kpe&ref_=cm_sw_r_kb_dp_f2H6Fb7NENATK&tag=codersite20-20" ></iframe>

