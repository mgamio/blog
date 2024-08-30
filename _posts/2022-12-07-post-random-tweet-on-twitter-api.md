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

We will use Spring Boot to build a Client App that posts tweets periodically.

*@Scheduled* is a Spring annotation that marks a method to be scheduled.

To execute *@Scheduled* annotations, we add an *@EnableScheduling* annotation on the main class.

A *cron job* is a Linux job scheduler that sets up tasks periodically that run at a fixed date or interval.

A *cron* attribute - as in Unix-based systems - enables the *@Scheduled* method to be executed at a specified date/time.

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

If we can publish only eight articles daily, then our data structure should allow us to store only eight elements. Once we have filled our data structure, there will be no space for the following article. Then, we must be able to remove the oldest article (in this case, the first one) and insert the newest article (in the last position). The Queue data structure supports our requirement.

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

The new random number represents an article that is included in our *articlesMap* variable.

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

## When finding a random number is exponential

When you have written more than 100 articles, finding a new random number that is not still included in the *queue* variable could be difficult.

![queueRandomNumber](/assets/images/queueRandomNumber.jpg "inheritance"){:class="img-responsive"}

When the *queue* has space for only three more elements, the following validation could be exponential when trying to find a new random number between 100 possible articles.

```kotlin
  boolean newNumberFound = false;
  do {
    int newNumber = getRandomNumber(1, articlesMap.size());
    if (!queue.contains(newNumber)) {
      //code omitted for brevity
    }
  } while (newNumberFound == false);
```

To avoid this exponential issue we redesign our algorithm.

We define and initialize an array of Integers in the constructor of the class.

```kotlin
public class Scheduler {

  private static final Logger logger = LoggerFactory.getLogger(Scheduler.class);

  @Autowired
  private final DataService dataService;
  
  @Autowired
  private TwitterService twitterService;
  
  private Map<Integer, Article> articlesMap;

  private List<Integer> listOfArticlePositions = new ArrayList<>();

  public Scheduler(TwitterService twitterService,
    DataService dataService) throws Exception {
  
    this.twitterService = twitterService;
    this.articlesMap = dataService.getAllArticlesMetadata();
  
    for (int i = 0; i < articlesMap.size(); i++) {
      listOfArticlePositions.add(i);
    }
  }

}
```	

Inside the getRandomArticle() method we introduce our new getNewRandomNumber() method.

```kotlin
  private Article getRandomArticle() {
    Article article = null;
    boolean newNumberFound = false;
    do {
      this.newNumber = getNewRandomNumber();
      if (!queue.contains(this.newNumber)) {
        newNumberFound = true;
        article = articlesMap.get(this.newNumber);
      }
    } while (newNumberFound == false);

    return article;
  }
```

Once we have the new randomNumber, immediately it is removed from the list of integers. So, this new randomNumber will not be considered as our next Article next time.

```kotlin
  private int getNewRandomNumber() {
    int newRandomNumber = 0;
    int index = (int) (Math.random() * listOfArticlePositions.size());
    newRandomNumber = listOfArticlePositions.get(index);
    listOfArticlePositions.remove(index);

    if (listOfArticlePositions.size() <= 0) {
      logger.info("Refilling listOfArticlePositions ...");
      for (int i = 0; i < articlesMyBooksAffiliates.size(); i++) {
        listOfArticlePositions.add(i);
      }
    }

    return newRandomNumber;
  }
```

Please donate to maintain and improve this website if you find this content valuable.

<form action="https://www.paypal.com/donate" method="post" target="_top">
 <input type="hidden" name="hosted_button_id" value="UF4T364RTPPMJ" />
 <input type="image" src="https://www.paypalobjects.com/en_US/DK/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
 <img alt="" border="0" src="https://www.paypal.com/en_DE/i/scr/pixel.gif" width="1" height="1" />
</form>
<br/>

Similar problems you can find in my [book](https://amzn.to/3FxeKSb){:target="_blank"} about algorithms and the inner workings of Data Structures. Learn how to apply common algorithms to practical problems.

