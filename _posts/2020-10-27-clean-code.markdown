---
layout: post
title:  "Clean Code"
description: "Clean code can be read and enhanced by a developer other than its original author. Clean code has Intention-Revealing names"
date:   2020-10-27 14:18:45 +0100
tags: cleancode java solid
categories: cleancode
---
Clean code can be read and enhanced by a developer other than its original author. This kind of practice [Robert C Martin](https://amzn.to/3rAejgU){:target="_blank"} introduced it.

If you want to be a better programmer, you must follow these recommendations..

## Clean Code has Intention-Revealing names

Names reveal intent. Someone who reads your code must understand the purpose of your variable, function, or class.

Real situation:

{% highlight ruby %}
int sId; //supplier Id
int artDelPrice;
{% endhighlight %}

It must be refactored to this:

{% highlight ruby %}
int supplierId;
int articleDeliveredPrice;
{% endhighlight %}

Even with external dependencies:

{% highlight ruby %}
private Z_E2F_RS_Result e2fResult: //ingredients recordset
{% endhighlight %}

It must be refactored to this:

{% highlight ruby %}
private Z_E2F_RS_Result ingredients:
{% endhighlight %}

Imagine that we dont have the //ingredients comment in e2fResult variable. Then, further in any part of our code, when we try to process this variable, we have the following sentence:

{% highlight ruby %}
e2f = e2fResult[idx]
{% endhighlight %}

And we don’t know what does e2f means!. Well, someone suggests asking the person responsible for this code. But that guy is not at the office. Well, send it an email, and he is on holiday!.

But if instead we adopt names which reveal intent from beginning, we could avoid these catastrophic scenarios.

{% highlight ruby %}
ingredient = ingredients[idx]
{% endhighlight %}

## Clean Code tells a story

When we try to fix bugs, when analyzing the secuence of actions (functions, methods), we realize the code does not communicate well the logical flow of these actions. It’s a nightmare to decode the meaning of these actions.

This will always happen because our initial design based on the initial requirements change over time. As developers, we are responsible for refactoring our code to made it a simple story that everybody can understand. For example, look at the following code:

{% highlight ruby %}
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
{% endhighlight %}

Other recommendations of clean code are:

* Clean Code separates levels of detail
* Clean Code needs a few comments
* Clean Code has small methods
* Clean Code has Command/Query separation

You can see a lot of typical algorithms implemented with Clean Code principles in the following [link](https://amzn.to/2LqceUy){:target="_blank"}:

<iframe type="text/html" width="336" height="550" frameborder="0" allowfullscreen style="max-width:100%" src="https://lesen.amazon.de/kp/card?asin=B086JCK6C4&preview=inline&linkCode=kpe&ref_=cm_sw_r_kb_dp_f2H6Fb7NENATK&tag=codersite20-20" ></iframe>

<iframe width="336" height="550" src="https://www.youtube.com/embed/qf4vJrhNQn0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

