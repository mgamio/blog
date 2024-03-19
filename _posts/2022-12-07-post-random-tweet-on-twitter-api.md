---
layout: post
title:  "How to Post a Random Tweet using Twitter API"
description: "How to Post a Random Tweet using Twitter API"
author: moises
categories: [ algorithms ]
image: assets/images/postInTwitterAPI.jpg
comments: false
---

The [Twitter API](https://developer.twitter.com/en/docs/twitter-api){:target="_blank"} enables developers programmatically posting tweets.

*@Scheduled* is a Spring annotation that marks a method to be scheduled.

To execute *@Scheduled* annotations, we add an *@EnableScheduling* annotation on the main class.

A *cron job* is a Linux job scheduler that sets up tasks periodically that run at a fixed date or interval.

A *cron* attribute - as in Unix-based systems - enables the method to be executed at a specified date/time.

```kotlin
@Scheduled(cron = "0 0 0/3 1/1 * ?")
```

## The requirement

We want to delegate our manual tweets to an automated process, even when we are sleeping, to support our social media automation.

We have created a Tweet scheduling client to publish tweets under a Scheduler’s control.

We have a text file listing all the articles we have written.

```kotlin
SOLID principles;article_URL;#solid #objectoriented
Binary Search Tree;article_URL;#algorithm #datastructure
Clean code;article_URL;#programming #codingpractices
.
.
.
```

We have the following metadata for every article.

```kotlin
public class Article {
  String title;
  String link;
  String hashTags;
}
```

Load all the articles sequentially into a hashmap. We define the hashmap key as an integer to uniquely identify every article.

```kotlin
private Map<Integer, Article> articlesMap;
.
.
.
int n = 1;
for (String line: allLines) {
  Article article = new Article();
  //code omitted for brevity
  articlesMap.put(n++, article);
}	  
```

We choose a random number with the following method.

```kotlin
private int getRandomNumber(int min, int max) {
  return ThreadLocalRandom.current().nextInt(min, max + 1);
}
```

<div>
{%- include inArticleAds.html -%}
</div>

The following code snippet shows a method executed every three hours to retrieve a random article and send it to the Twitter API as a scheduled tweet.

```kotlin
@Scheduled(cron = "0 0 0/3 1/1 * ?")
public void postInTwitter() throws Exception {

  int n = getRandomNumber(1, articlesMap.size());
  Article article = articlesMap.get(n);
  twitterService.sendPost(article);
  
  logger.info("postInTwitter random article: " + article.getTitle());
}
```

But once an article is retrieved, the following article will probably be the same if we use the previous *getRandomNumber* method.

## Don't post duplicate articles in a time frame.

What we want is to post no duplicate articles in a time frame.

For example, if we post every three hours, eight posts are in one day. Well, we want to show eight no-duplicate tweets for our users throughout the day.

As developers, we need to understand the inner workings of data structures to support the behavior - method - we want to implement. Could an array, linked list, queue, or stack satisfy our requirement?

A [Queue](https://amzn.to/3FxeKSb){:target="_blank"} is an abstract data type, which includes a collection of objects that follow the first-in, first-out (FIFO) principle, i.e., the element inserted at first is the first element to come out of the list.

A MAX_ARTICLES variable defines your frame time. You can increase or decrease it according to the number of your articles.

We define a queue of integers that is implemented by a linked list.

```kotlin
private int MAX_ARTICLES = 8;
private Queue<Integer> queue = new LinkedList<>();
```

Every three hours, we check if the new random number is not included in the queue. If the validation is successful, we retrieve a new article and publish it.

The *remove* method deletes the oldest element from the queue (remember *the element inserted at first is the first element to come out of the list*).

<div>
{%- include inArticleAds.html -%}
</div>

The new method executes (**do**) the following instructions **while** a new random number is not found.

```kotlin
private Article getRandomArticle() {
  Article article = null;
  boolean newNumberFound = false;
  do {
    int newNumber = getRandomNumber(1, articlesMap.size());
    if (!queue.contains(newNumber)) {
      newNumberFound = true;
      article = articlesMap.get(newNumber);
      if (queue.size() < MAX_ARTICLES) {
        queue.add(newNumber);
      } else {
        queue.remove();
        queue.add(newNumber);
      }
    }
  } while (newNumberFound == false);
  return article;
}
```

The [Big O notation](https://codersite.dev/big-o-notation-analysis-of-algorithms/){:target="_blank"} to *add* and *remove* elements is O(1).

This is how it looks at the new *postInTwitter* method. To evaluate the random behavior, we iterate the queue - only for test purposes.

```kotlin
@Scheduled(cron = "0 0 0/3 1/1 * ?")
public void postInTwitter() throws Exception {
  Article article = getRandomArticle();
  twitterService.sendPost(article);
  logger.info("postInTwitter random article: " + article.getTitle());
  for (Integer item: queue) {
    System.out.print(item + " ");
  }
  System.out.println();
}
```

Once you deploy the Tweet scheduling to any cloud provider, its log files show the queue's random numbers, for example.

```kotlin
42 
42 70 
42 70 44 
42 70 44 1 
42 70 44 1 61 
42 70 44 1 61 26 
42 70 44 1 61 26 65 
42 70 44 1 61 26 65 28 
70 44 1 61 26 65 28 52 
44 1 61 26 65 28 52 31 
1 61 26 65 28 52 31 33 
61 26 65 28 52 31 33 6 
26 65 28 52 31 33 6 44 
65 28 52 31 33 6 44 24 
```

With the help of this Twitter bot, you can now focus on writing more articles. Look at it in action on my [Twitter](https://twitter.com/MoisesGamio){:target="_blank"} account!.

Similar questions you can find in my [book](https://amzn.to/3FxeKSb){:target="_blank"} about algorithms and the inner workings of Data Structures. Learn how to apply common algorithms to practical problems.

