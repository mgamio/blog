---
layout: post
title:  "File Access Denied in a Cluster with Load Balancing"
description: "Load balancing, Traffic distribution, Scalability solutions and Server performance optimization"
author: moises
categories: [ Web Performance ]
image: assets/images/loadBalancing.jpg
comments: false
---

Load balancing is a process that routes network traffic to a group of backend servers, also known as a server pool. A load balancer is responsible for [distributing incoming requests](https://codersite.dev/hot-warm-architecture-elasticsearch/){:target="_blank"} to a collection of application servers.

Load balancers help solve problems of server performance, high availability and scalability in distributed systems.

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

We want to deploy a Java WebClient to retrieve image objects from an external API and store it in an internal file server.

The Java WebClient is deployed in a cluster with two application servers.

![loadBalancing and FileServer.](/assets/images/loadBalancingFileServer.jpg){:class="img-responsive"}

The cluster uses a load balancer to delegate a specific task to one of its servers in a randomized order. A load-balancing algorithm is a load balancer's logic to distribute network traffic between servers.

The first time a user requests the execution of the Java WebClient, the load balancer delegates the task to the first application server, for example.

The Java WebClient stores some image files in a directory, and the *AppServer1* server owns those files.

```kotlin
U:\imagesFromApi\image1.jpg (owner AppServer1)
U:\imagesFromApi\image2.jpg (owner AppServer1)
```
One week after, the Java WebClient is requested again, but it needs to execute the following code to delete an image file on the internal file server if the same image was deleted on the external API.

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

But this second time, the load balancer delegates the execution of the task to the second application server - *AppServer2*. Then, the java client throws an error.

```kotlin
Access is denied
```

The Java WebClient cannot delete files that another user created.

We cannot change the permissions of a file from within a Java program as we can on Linux systems - *chmod* command.

## Possible Solutions

- Configure only one user account on application servers and give it full access control - hardware configuration.
- Deploy the Java WebClient in only one server.

Now any application server in the cluster can create or delete any file on the file server.


