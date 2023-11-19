---
layout: post
title:  "Resolving SSL handshake failure in Java applications"
description: "The Secure Socket Layer (SSL) enables a secured connection between a client and a server."
author: moises
categories: [ Web APIs ]
image: assets/images/sslHandshake.jpg
comments: false
---

The Secure Socket Layer (SSL) enables a secured connection between a client and a server. SSL Handshake is a set of steps that make it possible for this secured connection over the network.

A summary of the steps in the SSL handshake:

- Agree on the version of the cryptographic protocol to use.
- Select cryptographic algorithms - cipher suites to use.
- Exchange and validate digital certificates to authenticate each other.
- Generate a shared secret key using asymmetric encryption techniques.

For more information about cryptographic algorithms and digital certificates, refer [here](https://www.ibm.com/docs/en/ibm-mq/9.3?topic=overview-cryptographic-security-protocols-tls){:target="_blank"}.

## SSL handshake failure during API integration

We try to build a Spring WebClient component to consume data from an API Server (target_server).

Requisites:

- SDK: 1.8 java version "1.8.0_191"
- Websphere application server

```kotlin
String username="here_username_target_server";
String password = "here_password_target_server";

WebClient webClient = WebClient.builder()
  .baseUrl("baseUrl_target_server")
  .filter(basicAuthentication(username, password))
  .build();

Mono<String> monoString = webClient
  .get()
  .uri("uri_target_server").accept(MediaType.TEXT_PLAIN)
  .retrieve()
  .bodyToMono(String.class).log();

logger.info(monoString.block());
```

<div>
{%- include inArticleAds.html -%}
</div>

Once the client is running, it throws the following error - a common SSL Handshake issue.

```kotlin
ERROR WebClientRequestException: Received fatal alert: handshake_failure; nested exception is javax.net.ssl.SSLException: Received fatal alert: handshake_failure)
```

### What is TLS?

Transport Layer Security (TLS) is a protocol for implementing cryptography on the web. Encrypts data sent over the Internet to ensure hackers cannot see your sensitive information such as passwords or credit card numbers.

TLS protocol evolved from Secure Socket Layer (SSL) developed by Netscape to secure web sessions. 

### Cipher Suite

A Cipher Suite is a set of cryptographic algorithms used by an SSL or TLS connection. A suite includes three distinct [algorithms](https://codersite.dev/big-o-notation-analysis-of-algorithms/){:target="_blank"}:

- The key exchange and authentication algorithm.
- The encryption algorithm to encipher the data
- The MAC (Message Authentication Code) algorithm generates the message digest.

For example, the Cipher Suite SSL_RSA_WITH_RC4_128_MD5 includes:

- The RSA key exchange and authentication algorithm
- The RC4 encryption algorithm, using a 128-bit key
- The MD5 MAC algorithm

<div>
{%- include javaInterviewAds1.html -%}
</div>

## How to interpret SSL handshake failure logs

We usually check if both parties - client and server - comply with all the steps of the SSL Handshake mechanism.

The first two steps deal with cryptographic protocols and cipher suites.

Returning to our scenario, when the client initializes, we see the following lines on the console.

```kotlin
15:11:23.567 [main] DEBUG io.netty.handler.ssl.OpenSsl - netty-tcnative not in the classpath; OpenSslEngine will be unavailable.
15:11:24.939 [main] DEBUG io.netty.handler.ssl.JdkSslContext - Default protocols (JDK): [TLSv1]
15:11:24.939 [main] DEBUG io.netty.handler.ssl.JdkSslContext - Default cipher suites (JDK): [TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384, TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256, TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256, TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384, TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA, TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA, TLS_RSA_WITH_AES_128_GCM_SHA256, TLS_RSA_WITH_AES_128_CBC_SHA, TLS_RSA_WITH_AES_256_CBC_SHA]

```

We can realize Client is using the **TLSv1** protocol

Now let’s see on the server-side by using an OpenSSL command. (On Windows PC we can use Git Bash)

```kotlin
openssl s_client -connect <IP>:<PORT>
```

Now, we can see the response.

```kotlin
---
SSL handshake has read 5388 bytes and written 473 bytes
Verification: OK
---
New, TLSv1.2, Cipher is ECDHE-RSA-AES128-GCM-SHA256
Server public key is 4096 bit
Secure Renegotiation IS supported
Compression: NONE
Expansion: NONE
No ALPN negotiated
SSL-Session:
    Protocol  : TLSv1.2
    Cipher    : ECDHE-RSA-AES128-GCM-SHA256
```
<div>
{%- include inArticleAds.html -%}
</div>

The server uses the **TLSv1.2** protocol, which means the Client and Server are not using the same protocol version.

## Fixing SSL handshake failures

From the server response, some ciphers are not supported in the TLSv1.2 protocol.

We can upgrade the java version, but sometimes it is not easy because many applications depend on WebSphere licenses, and we need to wait until the next release.

Once we have identified the supported Protocol and Cipher Suites supported by the server, we can modify the ones supported by the Client through the TLS configuration to be able to connect to the Server.

Or we can implement the following system property to our Client code.

```kotlin
System.setProperty("com.ibm.jsse2.overrideDefaultTLS","true");
```

We rerun the Client and see the console.

```kotlin
16:32:56.858 [main] DEBUG io.netty.handler.ssl.OpenSsl - netty-tcnative not in the classpath; OpenSslEngine will be unavailable.
16:32:58.106 [main] DEBUG io.netty.handler.ssl.JdkSslContext - Default protocols (JDK): [TLSv1.2, TLSv1.1, TLSv1]
16:32:58.106 [main] DEBUG io.netty.handler.ssl.JdkSslContext - Default cipher suites (JDK): [TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384, TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256, TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256, TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384, TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA, TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA, TLS_RSA_WITH_AES_128_GCM_SHA256, TLS_RSA_WITH_AES_128_CBC_SHA, TLS_RSA_WITH_AES_256_CBC_SHA]

```

Now Client and Server are agreed on the SSL Handshake and can exchange data.
