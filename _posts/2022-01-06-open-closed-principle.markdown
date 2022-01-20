---
layout: post
title:  "SOLID principles: The Open-Closed Principle (Part II)"
description: "SOLID principles tell us how to arrange our functions into classes. When it is well applied, our software infrastructure will be easier to understand"
featured-image: payment2.jpg
date:   2022-01-06 00:18:45 +0100
categories: solid
---
SOLID principles tell you how to arrange your functions into classes and how those classes should be interrelated.

When SOLID principles are applied correctly, your software infrastructure will be able to tolerate changes, it will be easier to understand, and it will be focuser on reusable components.

After looking at the [Single Responsibility Principle](https://codersite.dev/solid-principles-the-definitive-guide/){:target="_blank"}, let’s continue with the second principle..

![openClosedPrinciple](/assets/images/openClosedPrinciple.jpg){:class="img-responsive"}

### SOLID principles: The Open-Closed Principle (OCP)

> … “a module, class or function should be open for extension but closed for modification“

[Bertrand Meyer](https://amzn.to/3eSkKXx){:target="_blank"} coined the principle, suggesting that we should build software so that we can change what the code does without touching our current code implementation.

For instance, imagine you are designing and implementing a rate limit algorithm to control the number of request allowed for every endpoint in a [REST API](https://codersite.dev/documenting-rest-api-openapi3/){:target="_blank"}.

Our RateLimit class implements an interceptor - *HandlerInterceptor* - that allows an application to intercept HTTP requests before they reach the service, so we can either let the request go through or block it and send back the status code 429.

From the beginning, the team agrees to retrieve the parameters about the number of requests per plan from a text file. The following *getAPIPlans* method retrieves those parameters.

{% highlight ruby %}
public class RateLimit implements HandlerInterceptor {
  //private variables
  
  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
			Object handler) throws Exception {
    //getClientId
    getAPIPlans();
    //build Buckets
    //evaluate request per clientId
    //accept(200) or refuse(429) request
  }
  
  private Map<String, Long> getAPIPlans() throws Exception {
    Map<String, Long> clientIdPlans = new ConcurrentHashMap<>();
    Resource resource = new ClassPathResource("apiPlans.txt");
    try {
      List<String> allLines = Files.readAllLines(Paths.get(resource.getURI()));
      for (String line: allLines) {
	    String[] attributes = line.split(":");
  	    String clientId = attributes[0];
	    long capacity = Long.valueOf(attributes[1]).longValue();
	    clientIdPlans.put(plan, capacity);
      }
    } catch (IOException e) {
        throw new RuntimeException(e.getMessage());
    }
    return clientIdPlans;
  }
}
{% endhighlight %}

### Suddenly an unexpected scenario arises.

The developer leaves the company, and a new one arrives—for example, You.

As developers, we usually receive tasks to do maintenance in projects that do not belong to us; specifically, we never created that code.

Then weeks later, your team decides that must be retrieved parameters from a database. Therefore you proceed to replace the *getAPIPlans* method; then, *you break the open-closed principle*.

That is the meaning of the principle; you can not touch the code that is already implemented and working for a long time. Suppose the code is too complex to understand, not well documented, and includes a lot of dependencies. In that case, we have a lot of probabilities to introduce a bug or break some functionalities that we cannot visualize. Unless it is a bug that we have to fix, we should never modify the existing code.

Even if the code is not well designed or does not follow well object-oriented principles, it could not be easy to extend a class to introduce new functionalities.

For this scenario, the team decides to implement the open-closed principle to support future changes.  To refactor the code, we adopt composition and polymorphism..

The following diagram shows the goal of our design.

![rateLimit](/assets/images/rateLimit.jpg){:class="img-responsive"}

Firstly, you think abstractions, create an interface, and define a contract that includes all functionalities.

{% highlight ruby %}
public interface DataService {

  public Map<String, Long> getAPIPlans() throws Exception;

}
{% endhighlight %}

Secondly, we move our *getAPIPlans* method to a new implementation class.

{% highlight ruby %}
public class TextData implements DataService {

  private Map<String, Long> getAPIPlans() throws Exception {
    Map<String, Long> clientIdPlans = new ConcurrentHashMap<>();
	//code omitted
	
    return clientIdPlans;
  }
}
{% endhighlight %}

Thanks to abstractions, we can create a new class to implement *getAPIPlans* with different behavior, in this case, to retrieve parameters from a database.

{% highlight ruby %}
public class DBData implements DataService {

  private DataSource datasource;
  
  public DBData(DataSource datasource) {
    this.datasource = datasource;
  }
  
  private Map<String, Long> getAPIPlans() throws Exception {
    Map<String, Long> clientIdPlans = new ConcurrentHashMap<>();
    for (Plan plan : datasource.getAPIPlans()) {
      //code omitted
	 
    }
    return clientIdPlans;
  }
}
{% endhighlight %}

Introducing a new abstraction layer with different implementations avoids tight coupling between classes.

Finally, we refactor our RateLimit class.

{% highlight ruby %}
public class RateLimit implements HandlerInterceptor {
  
  private DataService dataService;
  
  public RateLimit(DataService dataService) {
    this.dataService = dataService;
  }
  
  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
			Object handler) throws Exception {
    //getClientId
    dataService.getAPIPlans();
    //build Buckets
    //evaluate request per clientId
    //accept(200) or refuse(429) request
  }
  
}
{% endhighlight %}

If later we decided to retrieve the parameters from a NoSQL database, we would no longer have to touch the code, create a new class that implements *getAPIPlans*, and instantiate this new class in RateLimit.

Calling to *getAPIPlans* is now fixed (closed for modification). If we want it to behave differently, we implement it in a new class (open for extension) that will follow the contracts defined in our interface.

How our new DBData dependency is instantiated in our RateLimit class is thanks to the magic of the Dependency Injection principle, which I will explain in a near-future article, so follow me!.
