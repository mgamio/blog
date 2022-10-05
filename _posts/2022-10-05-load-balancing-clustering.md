---
layout: post
title:  "File Access Denied in a Cluster with Load Balancing"
description: "Load balancing is a process that routes network traffic to a group of backend servers, also known as a server pool"
author: moises
categories: [ Web Performance ]
image: assets/images/loadBalancing.jpg
comments: false
---

Load balancing is a process that routes network traffic to a group of backend servers, also known as a server pool. A load balancer is responsible for distributing incoming requests to a collection of application servers.

Load balancers help solve problems of performance, economy, and availability.

## Application Server

Application server refers to the process that provides the functions required to support and host user applications. For example, in Websphere, an application server runs Java language-based applications.

## Clustering

A cluster is a group of servers that are managed together. For example, in the WebSphere Application Server, all application servers processes are running the same set of enterprise applications, and the workload capacity is distributed between these servers.

<div>
{%- include inArticleAds.html -%}
</div>

The benefits of building a cluster are:

- *Scalability* enables enterprise applications to handle an increase in load volumes properly and achieve better throughput by using more infrastructure resources. 

- *High availability* means enterprise applications can continue to process work and avoid impacts in the occurrence of failure of one or several components.

## When a Cluster shares a File Server

We want to deploy a Java Client to retrieve image objects from an external API and store it in an internal file server.

The java client is deployed in a cluster with two application servers.

![loadBalancing and FileServer.](/assets/images/loadBalancingFileServer.jpg){:class="img-responsive"}

The first time a user requests the execution of the java client, the load balancer delegates the task to the first application server, for example.

The java client store some image files in a directory, for example:

```kotlin
U:\imagesFromApi\image1.jpg (owner AppServer1)
U:\imagesFromApi\image2.jpg (owner AppServer1)
```
One week after, the java client is requested again, but it needs to execute the following code to delete an image file on the internal file server if the same image was deleted on the external API.

```kotlin
public void deleteFile(String fileName) throws Exception {
  try {
    File file = new File(OUTPUT_FILE_LOCATION + fileName);
    file.delete(); 
  } catch (Exception e) {
    logger.error("Exception in deleteFile " + e.getMessage());
  }
}
```

But this second time, the load balancer delegates the execution of the task to the second application server - AppServer2. Then, the java client throws an error.

```kotlin
Access is denied
```

The Java client cannot delete files that another user created.

## Possible Solutions

- Configure only one user account on application servers - hardware configuration.
- Deploy the java client in only one server.




