---
layout: post
title:  "OCP Oracle Certified Professional Java, Test - Building Blocks"
description: "OCP Oracle Certified Professional Java SE 17 Developer Study Guide"
author: moises
categories: [ programming ]
image: assets/images/javaCertifiedBuildingBlocks.jpg
comments: false
---

This article provides practical test prep material for the OCP Java SE Developer Certification, which will help you develop skills that remain in high demand in the IT industry.

The answers to the questions can be found at the end.

1- Which of the following are legal entry point methods that can be run from the command line? (Choose all that apply.)

```kotlin
A. private static void main(String[] args)
B. public static final main(String[] args)
C. public void main(String[] args)
D. public static final void main(String[] args)
E. public static void main(String[] args)
F. public static main(String[] args)
```

2- Which of the following are true? (Choose all that apply.)

```kotlin
public class Dog {
  public static void main(String[] x) {
     Dog dog = new Dog();
  } 
}

A. Dog is a class.
B. dog is a class.
C. main is a class.
D. Dog is a reference to an object.
E. dog is a reference to an object.
F. main is a reference to an object.
G. The main() method doesn't run because the parameter name is incorrect.
```

3- Which statements about the following program are correct? (Choose all that apply.)

```kotlin
public class Bear {
  private Bear pandaBear;
  private void roar(Bear b) {
    System.out.println("Roar!");
    pandaBear = b;
  }
  public static void main(String[] args) {
    Bear brownBear = new Bear();
    Bear polarBear = new Bear();
    brownBear.roar(polarBear);
    polarBear = null;
    brownBear = null;
    System.gc(); 
  }
}

A. The object created on line 8 is eligible for garbage collection after line 12.
B. The object created on line 8 is eligible for garbage collection after line 13.
C. The object created on line 9 is eligible for garbage collection after line 11.
D. The object created on line 9 is eligible for garbage collection after line 12.
E. Garbage collection is guaranteed to run.
F. Garbage collection might or might not run.
G. The code does not compile
```

4- Assuming the following class compiles, how many variables defined in the class or method are in scope on the line marked on line 14?

```kotlin
public class Camel {
  { int hairs = 3_000_0; }
  long water, air=2;
  boolean twoHumps = true;
  public void spit(float distance) {
    var path = "";
    { double teeth = 32 + distance++; }
    while(water> 0) {
      int age = twoHumps ? 1 : 2;
      short i=-1;
      for(i=0; i<10; i++) {
        var Private = 2;
      }
      // SCOPE
    }
  }
}

A. 2
B. 3
C. 4
D. 5
E. 6
F. 7
G. None of the above
```

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">OCP Oracle Certified Professional Java SE 17 Developer Study Guide: Exam 1Z0-829 (Sybex Study Guide) <a href="https://t.co/ceY24NWehn">https://t.co/ceY24NWehn</a> via <a href="https://twitter.com/amazon?ref_src=twsrc%5Etfw">@amazon</a></p>&mdash; Moises Gamio (@MoisesGamio) <a href="https://twitter.com/MoisesGamio/status/1841830210989171119?ref_src=twsrc%5Etfw">October 3, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

5- Which are true about this code? (Choose all that apply.)

```kotlin
public class KitchenSink {
  private int numForks;

  public static void main(String[] args) {
    int numKnives;
    System.out.print("""
      "# forks = " + numForks +
      " # knives = " + numKnives +
      # cups = 0""");
  }
}

A. The output includes: # forks = 0.
B. The output includes: # knives = 0.
C. The output includes: # cups = 0.
D. The output includes a blank line.
E. The output includes one or more lines that begin with whitespace.
F. The code does not compile.
```

6- Which of the following are correct? (Choose all that apply.)

```kotlin
A. An instance variable of type float defaults to 0.
B. An instance variable of type char defaults to null.
C. A local variable of type double defaults to 0.0.
D. A local variable of type int defaults to null.
E. A class variable of type String defaults to null.
F. A class variable of type String defaults to the empty string "".
G. None of the above.
```

7- Given the following two class files, what is the maximum number of imports that can be removed and have the code still compile?

```kotlin
// Water.java
package aquarium;
public class Water { }
 
// Tank.java
package aquarium;
import java.lang.*;
import java.lang.System;
import aquarium.Water;
import aquarium.*;
public class Tank {
  public void print(Water water) {
    System.out.println(water);
  }
}

A. 0
B. 1
C. 2
D. 3
E. 4
F. Does not compile
```

8- Which statements about the following class are correct? (Choose all that apply.)

```kotlin
public class ClownFish {
  int gills = 0, double weight=2;
  { int fins = gills; }
  void print(int length = 3) {
    System.out.println(gills);
    System.out.println(weight);
    System.out.println(fins);
    System.out.println(length);
  }
}

A. Line 2 generates a compiler error.
B. Line 3 generates a compiler error.
C. Line 4 generates a compiler error.
D. Line 7 generates a compiler error.
E. The code prints 0.
F. The code prints 2.0.
G. The code prints 2.
H. The code prints 3.
```

<div>
{%- include inArticleAds.html -%}
</div>

9- Which of the following statements about garbage collection are correct? (Choose all that apply.)

```kotlin
A. Calling System.gc() is guaranteed to free up memory by destroying objects eligible for garbage collection.
B. Garbage collection runs on a set schedule.
C. Garbage collection allows the JVM to reclaim memory for other objects.
D. Garbage collection runs when your program has used up half the available memory.
E. An object may be eligible for garbage collection but never removed from the heap.
F. An object is eligible for garbage collection once no references to it are accessible in the program.
G. Marking a variable final means its associated object will never be garbage collected.
```

10- Which statements about the following class are true? (Choose all that apply.)

```kotlin
public class River {
  int Depth = 1;
  float temp = 50.0;

  public void flow() {
    for (int i = 0; i < 1; i++) {
      int depth = 2;
      depth++;
      temp--;
    }
    System.out.println(depth);
    System.out.println(temp); 
  }

  public static void main(String… s) {
    new River().flow();
  } 
}

A. Line 3 generates a compiler error.
B. Line 6 generates a compiler error.
C. Line 7 generates a compiler error.
D. Line 10 generates a compiler error.
E. The program prints 3 on line 10.
F. The program prints 4 on line 10.
G. The program prints 50.0 on line 11.
H. The program prints 49.0 on line 11.
```

## Answers to the Questions

1- D, E. Option E is the canonical main() method signature. You need to memorize it. Option D is an alternate form with the redundant final. Option A is incorrect because the main() method must be public. Options B and F are incorrect because the main() method must have a void return type. Option C is incorrect because the main() method must be static.

2- A, E.  Dog is a class, which can be seen from the declaration: public class Dog. The variable dog is a reference to an object. The method main() is the standard entry point to a program. Option G is incorrect because the parameter type matters, not the parameter name.

3- A, D, F.  Garbage collection is never guaranteed to run, making option F correct and option E incorrect. Next, the class compiles and runs without issue, so option G is incorrect. The Bear object created on line 8 is accessible until line 12 via the brownBear reference variable, which is option A. The Bear object created on line 9 is accessible via both the polarBear reference and the brownBear.pandaBear reference. After line 11, the object is still accessible via brownBear.pandaBear. After line 12, though, it is no longer accessible since brownBear is no longer accessible, which makes option D the final answer.

4- F.  To solve this problem, you need to trace the braces {} and see when variables go in and out of scope. The variables on lines 2 and 7 are only in scope for a single line block. The variable on line 12 is only in scope for the for loop. None of these are in scope on line 14. By contrast, the three instance variables on lines 3 and 4 are available in all instance methods. Additionally, the variables on lines 6, 9, and 10 are available since the method and while loop are still in scope. This is a total of 7 variables, which is option F.

<div>
{%- include softwareDesign.html -%}
</div>

5- C, E.  The first thing to recognize is that this is a text block and the code inside the """ is just text. Options A and B are incorrect because the numForks and numKnives variables are not used. This is convenient since numKnives is not initialized and would not compile if it were referenced. Option C is correct as it is matching text. Option D is incorrect because the text block does not have a trailing blank line. Finally, option E is also an answer since " # knives is indented.

6- E.  Options C and D are incorrect because local variables don't have default values. Option A is incorrect because float should have a decimal point. Option B is incorrect because primitives do not default to null. Option E is correct and option F incorrect because reference types in class variables default to null.

7- E.  The first two imports can be removed because java.lang is automatically imported. The following two imports can be removed because Tank and Water are in the same package, making the correct option E. If Tank and Water were in different packages, exactly one of these two imports could be removed. In that case, the answer would be option D.

8- A, C, D.  Line 2 does not compile as only one type should be specified, making option A correct. Line 3 compiles without issue as it declares a local variable inside an instance initializer that is never used. Line 4 does not compile because Java does not support setting default method parameter values, making option C correct. Finally, line 7 does not compile because fins is in scope and accessible only inside the instance initializer on line 3, making option D correct.

9- C, E, F.  In Java, there are no guarantees about when garbage collection will run. The JVM is free to ignore calls to System.gc(). For this reason, options A, B, and D are incorrect. Option C is correct as the purpose of garbage collection is to reclaim used memory. Option E is also correct that an object may never be garbage collected, such as if the program ends before garbage collection runs. Option F is correct and is the primary means by which garbage collection algorithms determine whether an object is eligible for garbage collection. Finally, option G is incorrect as marking a variable final means it is constant within its own scope. For example, a local variable marked final will be eligible for garbage collection after the method ends, assuming there are no other references to the object that exist outside the method.

10- A, D.  The first compiler error is on line 3. The variable temp is declared as a float, but the assigned value is 50.0, which is a double without the F/f postfix. Since a double doesn't fit inside a float, line 3 does not compile. Next, depth is declared inside the for loop and only has scope inside this loop. Therefore, reading the value on line 10 triggers a compiler error. For these reasons, options A and D are the correct answers.

<div>
{%- include jediJavaInterviewAds.html -%}
</div>
