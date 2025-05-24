---
layout: post
title:  "Problem-Solving Efficiency: Hashmap provides efficient solutions for searching"
description: "Data structures provide efficient solutions to various computational problems, such as sorting, searching, and graph algorithms"
author: moises
categories: [ data structures ]
image: assets/images/listIntoHashmap.jpg
comments: false
---

In this article, I am going to demonstrate the importance of knowing in detail every data structure to support business requirements in an efficient manner.

A **List** data structure is an ordered collection of items, where each item has a specific position or index within the list.

A **HashMap** is a data structure that stores key-value pairs, enabling efficient retrieval of values based on their keys. It uses a hash function to determine the storage location (or "bucket") of each key-value pair within an underlying array, allowing for fast lookups, insertions, and deletions.

## Use Case

We have an [RESTful API](https://codersite.dev/rest-api-overview/){:target="_blank"} endpoint to retrieve a list of orders placed by a given buyer.

![getOrdersByBuyer](/assets/images/getOrdersByBuyer.jpg "get Orders By Buyer"){:class="img-responsive"}

The response includes different kind of addresses per order as you see in the following schema:

```kotlin
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
      "countryCode": "string",
    },
    "orderInvoiceAddress": {
      "company": "string",
      "contact": "string",
      "countryCode": "string",
    },
    "desiredDeliveryDate": "2025-05-16",
    "orderPositions": [
      {
        "orderPositionNumber": 1,
        "orderPositionArticle": {
          "articleId": 4531,
        },
        "orderPositionQuantity": 10,
      }
    ]
  }
]
```

<div>
{%- include softwareDesignAd1.html -%}
</div>

As you know, REST Controllers normally delegate the data retrieval to backend services.

To build the body of the list of orders, the backend service calls different database functions to retrieve data. One of these calls is to recover all historical addresses per orderId.

```kotlin
public List<Order> listOrders(Integer buyerId) {

  List<Order> listOfOrders = getOrdersByBuyerId(buyerId);
  
  //code ommited for brevety
  
  //retrieve headers and enrich listOfOrders
  //retrieve addresses and enrich listOfOrders
  //retrieve positions and enrich listOfOrders
  
  return listOfOrders;
}
``` 

If the user requests the first 1000 orders, the backend makes only one database function call to retrieve 2000 records (2 different addresses per orderId).

```kotlin
{
  //retrieve addresses
  Address[] listOfAddresses = getAddresses(order1, order2, ... order1000);
}
```

Here is the Object model to represent an Address:

```kotlin
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

```kotlin
//retrieve addresses and enrich listOfOrders
for (Order order : listOfOrders) {
  for (Address address : listOfAddresses) {
    if (order.getOrderId().equals(address.getOrderId()) {
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

<div>
{%- include inArticleAds.html -%}
</div>

## HashMap to the rescue

We need a fast lookup to iterate exactly the two addresses per order in sequential mode. 

A HashMap allows us to associate values (the two addresses) with unique key (orderId). So here is our new data structure:

```kotlin
HashMap<Integer, List<Address>> hashMapOfAddressesByOrderId = new HashMap<>();
```

We implement an algorithm to transform a List into a HashMap.

```kotlin
private HashMap<BigDecimal, List<Address>> transformListToHashMap(Address[] listOfAddresses) {

  HashMap<BigDecimal, List<Address>> hashMapOfAddressesByOrderId = new HashMap<>();
		
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

```kotlin
//retrieve addresses and enrich listOfOrders

HashMap<Integer, List<Address>> hashMapOfAddressesByOrderId = transformListToHashMap(listOfAddresses);

for (Order order : listOfOrders) {

  List<Address> listOfAddressesInHashMap = hashMapOfAddressesByOrderId.get(order.getOrderId());
  
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

Analysis of the algorithm performance:

first iteration: 1000N -> N

second iteration: 2 * 1000N = 2000N -> N

Total = N + N = 2N

That means that the new performance according to Big O Notation is lineal -> **O(N)**.

> The main idea in Analysis of Algorithms is always to improve the algorithm performance, by reducing the number of steps and comparisons.. -- <cite>codersite.dev</cite>



<div>
{%- include jediJavaInterviewAds.html -%}
</div>

## When to use each:

**Use a List when**:

- You care about the order of elements.

- You need to store duplicates.

- You iterate over elements in a sequential manner.

**Use a HashMap when**:

- You need to associate values with unique keys.

- You need fast lookup, insertion, or deletion by key.

- The data is best represented in a key-value format.

Please support me as a writer. Every contribution helps, and your donation can help add more articles to this website, no matter how small. Thank you!

<form action="https://www.paypal.com/donate" method="post" target="_top">
 <input type="hidden" name="hosted_button_id" value="UF4T364RTPPMJ" />
 <input type="image" src="https://www.paypalobjects.com/en_US/DK/i/btn/btn_donateCC_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
 <img alt="" border="0" src="https://www.paypal.com/en_DE/i/scr/pixel.gif" width="1" height="1" />
</form>
<br/>




