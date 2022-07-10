---
layout: post
title:  "Clean Code"
description: "Clean code can be read and enhanced by a developer other than its original author. Clean code has Intention-Revealing names"
author: moises
categories: [ Coding Practices ]
image: assets/images/cleanCode.jpg
comments: false
---

Clean code can be read and enhanced by a developer other than its original author. 

This kind of practice [Robert C Martin](https://amzn.to/3rAejgU){:target="_blank"} introduced it.

If you want to be a better programmer, you must follow these recommendations..

## Clean Code has Intention-Revealing names

Names reveal intent. Someone who reads your code must understand the purpose of your variable, function, or class.

Real situation:

```kotlin
int sId; //supplier Id
int artDelPrice;
```

It must be refactored to this:

```kotlin
int supplierId;
int articleDeliveredPrice;
```

Even with external dependencies:

```kotlin
private Z_E2F_RS_Result e2fResult: //ingredients recordset
```

It must be refactored to this:

```kotlin
private Z_E2F_RS_Result ingredients:
```

<div>
{%- include inArticleAds.html -%}
</div>

Imagine that we dont have the //ingredients comment in e2fResult variable. Then, further in any part of our code, when we try to process this variable, we have the following sentence:

```kotlin
e2f = e2fResult[i]
```

And we don’t know what does e2f means!. Well, someone suggests asking the person responsible for this code. But that guy is not at the office. Well, send it an email, and he is on holiday!.

But if instead we adopt names which reveal intent from beginning, we could avoid these catastrophic scenarios.

```kotlin
ingredient = ingredients[i]
```

## Clean Code tells a story

When we try to fix bugs, when analyzing the secuence of actions (functions, methods), we realize the code does not communicate well the logical flow of these actions. It’s a nightmare to decode the meaning of these actions.

This will always happen because our initial design based on the initial requirements change over time. As developers, we are responsible for refactoring our code to made it a simple story that everybody can understand. For example, look at the following code:

```kotlin
ACMEWebServiceClient.login();
if (process.equals("core") {
    ACMEWebServiceClient.transfer_buyersCoreData_to_ACME();
}
if (process.equals("status")) {
    ACMEWebServiceClient.transfer_buyersStatusChanges_to_ACME();
}
if (process.equals("events")) {
    ACMEWebServiceClient.transfer_events_to_ACME();
}
ACMEServiceClient.logout();
```

<div>
{%- include inArticleAds.html -%}
</div>

## Functions should do one thing

Imagine we want to retrieve image objects from an external web service. 

Firstly, we receive image metadata that informs different values to decide if an image is valid o not, and one of these values is an image identifier to retrieve the final image object.

```kotlin
private String retrieveImageId(String[] values) {
  
  if (!values[2].equals("Y") || !values[3].equals("Y"))
    return null;
	
    String imageId = null;
    //get the first not null value as the imageId
    if (values[4] != null) {
      imageId = values[4]; //imageAIXId
    } else if (values[5] != null) {
      imageId = values[5]; //imageLIXId
    } else if (values[6] != null) {
      imageId = values[6]; //imageOIXId
    }

    return imageId;
}
```

The previous code is doing more than one thing: validate and retrieve.

Each thing should implement only one level of abstraction. Therefore we proceed to refactor it.

```kotlin
private boolean validateImage(String[] values) {
  
  if (!values[2].equals("Y") || !values[3].equals("Y"))
    return false;
	
  return true;
}
```

<div>
{%- include inArticleAds.html -%}
</div>

```kotlin
private String retrieveImageId(String[] values) {
  
  String imageId = null;
  //get the first not null value as the immageId
  if (values[4] != null) {
    imageId = values[4]; //imageAIXId
  } else if (values[5] != null) {
    imageId = values[5]; //imageLIXId
  } else if (values[6] != null) {
    imageId = values[6]; //imageOIXId
  }

  return imageId;
}
```

Here is an example of how to use these new smaller functions.

```kotlin
public void syncronizeImages () {
  
  Response response = api.getImages();
  Row[] rows = response.getRows();
  for (Row row : rows) {
    String[] values = row.getValues();
    if (validateImage(values)) {
      String imageId = retrieveImageId(values);
      //call ULR to retrieve image object
      //code omitted for brevity
    }
  }
}
```

Other recommendations of clean code are:

* Clean Code separates levels of detail
* Clean Code needs a few comments
* Clean Code has small methods
* Clean Code has Command/Query separation

You can see a lot of typical algorithms implemented with Clean Code principles in the following [link](https://amzn.to/3PiUs0w){:target="_blank"}

<p><iframe style="width:100%;" height="550" src="https://www.youtube.com/embed/qf4vJrhNQn0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></p>
