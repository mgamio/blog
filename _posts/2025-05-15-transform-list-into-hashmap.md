---
layout: post
title:  "From O(n²) to O(n): Replace Nested Loops with a HashMap in Java"
description: "A real REST API was slowed down by nested loops. Here's how grouping a List into a HashMap by key turned 2,000,000 comparisons into about 3,000, with a classic loop and a one-line Java 8 version."
author: moises
categories: [ data structures ]
image: /assets/images/listIntoHashmap.jpg
comments: false
---

One endpoint in a B2B order system I worked on returned 1,000 orders, and it was slow. The database wasn't the problem. Two innocent-looking nested loops were. Here's how one data structure, the HashMap, turned 2,000,000 comparisons into about 3,000.

A **List** data structure is an ordered collection of items, where each item has a specific position or index within the list.

A **HashMap** is a data structure that stores key-value pairs, enabling efficient retrieval of values based on their keys. It uses a hash function to determine the storage location (or "bucket") of each key-value pair within an underlying array, allowing for fast lookups, insertions, and deletions.

## Use Case

We have a [RESTful API](https://codersite.dev/rest-api-overview/){:target="_blank"} endpoint to retrieve a list of orders placed by a given buyer.

![Swagger UI showing the GET orders-by-buyer endpoint](/assets/images/getOrdersByBuyer.JPG "Swagger UI showing the GET orders-by-buyer endpoint"){:class="img-responsive"}

The response includes different kinds of addresses per order, as you can see in the following schema:

```json
[
  {
    "orderId": 123456,
    "buyerId": 1234,
    "customerNumberId": 12,
    "supplierId": 1,
    "orderDate": "2025-05-15",
    "orderDeliveryAddress": {
      "company": "string",
      "contact": "string",
      "countryCode": "string"
    },
    "orderInvoiceAddress": {
      "company": "string",
      "contact": "string",
      "countryCode": "string"
    },
    "desiredDeliveryDate": "2025-05-16",
    "orderPositions": [
      {
        "orderPositionNumber": 1,
        "orderPositionArticle": {
          "articleId": 4531
        },
        "orderPositionQuantity": 10
      }
    ]
  }
]
```

As you know, REST Controllers normally delegate the data retrieval to backend services.

To build the body of the list of orders, the backend service calls different database functions to retrieve data. One of these calls is to recover all historical addresses per orderId.

```java
public List<Order> listOrders(Integer buyerId) {

  List<Order> listOfOrders = getOrdersByBuyerId(buyerId);
  
  //code omitted for brevity
  
  //retrieve headers and enrich listOfOrders
  //retrieve addresses and enrich listOfOrders
  //retrieve positions and enrich listOfOrders
  
  return listOfOrders;
}
``` 

If the user requests the first 1000 orders, the backend makes only one database function call to retrieve 2000 records (2 different addresses per orderId).

```java
{
  //retrieve addresses
  Address[] listOfAddresses = getAddresses(order1, order2, ... order1000);
}
```

Here is the Object model to represent an Address:

```java
public class Address   {
  private Integer orderId;
  private Integer addressId;
  private Integer type;
  private String company;
  private String contact;
  private String countryCode;
}
```

The problem comes when we need to include two loops nested in the code to assign the addresses to every order. 

```java
//retrieve addresses and enrich listOfOrders
for (Order order : listOfOrders) {
  for (Address address : listOfAddresses) {
    if (order.getOrderId().equals(address.getOrderId())) {
      switch(TYPEOFADDRESS.valueOf(address.getType())) {
        case DELIVERY:
        {
          //assign address to order
          break;
        }
        case INVOICE:
        {
          //assign address to order
          break;
        }
        default:
        {
          //assign null to order
          break;
        }
      } 
    }
  }
}
```

That means that the performance according to [Big O Notation](https://codersite.dev/big-o-notation-analysis-of-algorithms/){:target="_blank"} is **N x N** = **O(N<sup>2</sup>)**.

This is exactly the kind of design decision that separates code that works from code that scales. Real-world cases like this one, with diagrams and explanations, fill [**Software Design Principles: A Practical Guide**](https://amzn.to/4dTTUhs){:target="_blank"}:

<div>
{%- include softwareDesignAd1.html -%}
</div>

<div>
{%- include inArticleAds.html -%}
</div>

## HashMap to the rescue

We need a fast lookup to iterate exactly the two addresses per order in sequential mode. 

A HashMap allows us to associate values (the two addresses) with a unique key (orderId). So here is our new data structure:

```java
HashMap<Integer, List<Address>> hashMapOfAddressesByOrderId = new HashMap<>();
```

We implement an algorithm to transform a List into a HashMap.

```java
private HashMap<Integer, List<Address>> transformListToHashMap(Address[] listOfAddresses) {

  HashMap<Integer, List<Address>> hashMapOfAddressesByOrderId = new HashMap<>();
		
  for (Address address : listOfAddresses) {
    List<Address> listOfAddressesInHashMap = hashMapOfAddressesByOrderId.get(address.getOrderId());
    if (listOfAddressesInHashMap == null) {
        listOfAddressesInHashMap = new ArrayList<>();
        listOfAddressesInHashMap.add(address);
    } else {
        listOfAddressesInHashMap.add(address);
    }
    hashMapOfAddressesByOrderId.put(address.getOrderId(), listOfAddressesInHashMap);
  }

  return hashMapOfAddressesByOrderId;
}
```

Here is our new iteration through the new [data structures](https://codersite.dev/data-structures-foundation-efficient-programming/){:target="_blank"}.

```java
//retrieve addresses and enrich listOfOrders

HashMap<Integer, List<Address>> hashMapOfAddressesByOrderId = transformListToHashMap(listOfAddresses);

for (Order order : listOfOrders) {

  List<Address> listOfAddressesInHashMap =
      hashMapOfAddressesByOrderId.getOrDefault(order.getOrderId(), List.of());
  
  for (Address address : listOfAddressesInHashMap) {

    switch(TYPEOFADDRESS.valueOf(address.getType())) {
      case DELIVERY:
      {
        //assign address to order
        break;
      }
      case INVOICE:
      {
        //assign address to order
        break;
      }
      default:
      {
        //assign null to order
        break;
      }
    } 
  }
}
```

`getOrDefault` returns an empty list for an order without addresses, so the loop simply doesn't run instead of throwing a `NullPointerException`.

## The Java 8 One-Liner

```java
Map<Integer, List<Address>> addressesByOrderId =
    Arrays.stream(listOfAddresses)
          .collect(Collectors.groupingBy(Address::getOrderId));
```

Same result, same O(N) cost. The loop above shows what's happening under the hood, and `groupingBy` is what you'd write in production.

## Performance Comparison

| Approach | Operations for 1,000 orders and 2,000 addresses | Big O |
|---|---|---|
| Nested loops | 1,000 × 2,000 = 2,000,000 comparisons | O(N × M) |
| HashMap | 2,000 inserts + 1,000 lookups ≈ 3,000 steps | O(N + M) |

<br/>

The new performance according to Big O Notation is linear: **O(N)**.

> The main idea in Analysis of Algorithms is always to improve the algorithm performance, by reducing the number of steps and comparisons. -- <cite>codersite.dev</cite>

## When to use each

**Use a List when**:

- You care about the order of elements.

- You need to store duplicates.

- You iterate over elements in a sequential manner.

**Use a HashMap when**:

- You need to associate values with unique keys.

- You need fast lookup, insertion, or deletion by key.

- The data is best represented in a key-value format.

Replacing a nested loop with a HashMap is one of the most common optimizations interviewers look for. If you have interviews coming up, practice it on real questions:

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Please support me as a writer. Every contribution helps, and your donation can help add more articles to this website, no matter how small. Thank you!

{% include buymeacoffee.html %}
<br/>
