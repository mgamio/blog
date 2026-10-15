---
layout: post
title:  "Fix 'Received fatal alert: handshake_failure' in Java: SSL/TLS Troubleshooting"
description: "Why a Java client fails with handshake_failure, how to find the cause with javax.net.debug and openssl, and how to fix protocol and cipher mismatches in Java and Spring WebClient."
author: moises
categories: [ Web APIs ]
image: /assets/images/sslHandshake.jpg
comments: false
---

Your Java client calls an HTTPS API and fails before sending a single request:

```text
javax.net.ssl.SSLHandshakeException: Received fatal alert: handshake_failure
```

The message says that the **server** ended the connection during the TLS handshake, but not why. This post shows how a TLS handshake works, how to find out what went wrong with `javax.net.debug` and `openssl`, and how to fix the most common cause, a protocol or cipher mismatch, in plain Java and in Spring's WebClient.

## How the TLS Handshake Works

TLS (Transport Layer Security) encrypts the connection between a client and a server. It replaced SSL (Secure Sockets Layer), which is why many error messages and class names still say *SSL*. Before any data is sent, client and server run a **handshake**:

1. The client says which protocol versions (TLS 1.2, TLS 1.3...) and cipher suites it supports.
2. The server picks a version and a cipher suite that both sides support. If there is none, the handshake fails here.
3. The server sends its certificate, and the client checks that it's valid and trusted. With *mutual TLS*, the client also sends a certificate.
4. Both sides agree on a shared secret key, usually with ECDHE (Elliptic Curve Diffie-Hellman), and use it to encrypt everything that follows.

### What's in a Cipher Suite?

A cipher suite names the algorithms for one connection. For example, `TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256` means:

- **ECDHE:** how the shared key is agreed;
- **RSA:** how the server proves its identity (an RSA certificate);
- **AES_128_GCM:** how the data is encrypted;
- **SHA256:** the hash function used in the handshake.

In TLS 1.3, suite names are shorter, such as `TLS_AES_128_GCM_SHA256`, because the key agreement is negotiated separately. Old suites with RC4, DES or MD5 are insecure, and modern servers and JDKs reject them.

<div>
{%- include inArticleAds.html -%}
</div>

## The Failure: a Client Stuck on TLS 1.0

We built a Spring WebClient to read data from a partner's API. The application ran on WebSphere Application Server with IBM Java 8:

```java
WebClient webClient = WebClient.builder()
    .baseUrl("https://api.partner.example")
    .filter(ExchangeFilterFunctions.basicAuthentication(username, password))
    .build();

String body = webClient.get()
    .uri("/articles")
    .accept(MediaType.TEXT_PLAIN)
    .retrieve()
    .bodyToMono(String.class)
    .block();
```

Every call failed:

```text
ERROR WebClientRequestException: Received fatal alert: handshake_failure;
nested exception is javax.net.ssl.SSLException: Received fatal alert: handshake_failure
```

## Step 1: What Does the Client Offer?

At startup, Netty (the HTTP library under WebClient) logs the protocols and cipher suites that the JDK offers:

```text
DEBUG io.netty.handler.ssl.JdkSslContext - Default protocols (JDK): [TLSv1]
DEBUG io.netty.handler.ssl.JdkSslContext - Default cipher suites (JDK): [TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384, TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256, ...]
```

The client offered **only TLS 1.0**. For any Java client, not only Netty, you can see the full handshake with a JVM option:

```text
java -Djavax.net.debug=ssl:handshake -jar app.jar
```

It prints the *ClientHello* (what the client offers), the server's answer, and the alert that ended the handshake.

## Step 2: What Does the Server Accept?

The `openssl` command line tool (included in Git Bash on Windows) connects like a TLS client and shows what the server negotiated:

```text
$ openssl s_client -connect api.partner.example:443
...
New, TLSv1.2, Cipher is ECDHE-RSA-AES128-GCM-SHA256
Server public key is 4096 bit
SSL-Session:
    Protocol  : TLSv1.2
    Cipher    : ECDHE-RSA-AES128-GCM-SHA256
```

To test one version at a time, add `-tls1`, `-tls1_1`, `-tls1_2` or `-tls1_3`. Here, `-tls1_2` connected and `-tls1` failed. **The server requires TLS 1.2, and the client offered only TLS 1.0**: there was no common protocol, so the server ended the handshake. TLS 1.0 and 1.1 have been officially deprecated since 2021 ([RFC 8996](https://www.rfc-editor.org/rfc/rfc8996){:target="_blank"}), so the server was right to refuse.

### Reproducing It

I reproduced both mismatches with a Java client and a Java server, running the handshake in memory. With a **cipher mismatch** (server: only AES-256-GCM, client: only AES-128-GCM), the client gets exactly our error, and the server log says why:

```text
client: javax.net.ssl.SSLHandshakeException: (handshake_failure) Received fatal alert: handshake_failure
server: javax.net.ssl.SSLHandshakeException: (handshake_failure) no cipher suites in common
```

With a **protocol mismatch** (client: TLS 1.0, server: TLS 1.2), a current JDK server answers with a more specific alert. Older servers often send `handshake_failure` here too:

```text
client: javax.net.ssl.SSLHandshakeException: (protocol_version) Received fatal alert: protocol_version
server: javax.net.ssl.SSLHandshakeException: (protocol_version) The client supported protocol versions [TLSv1] are not accepted by server preferences [TLSv1.2]
```

After allowing TLS 1.2 in the client, the handshake succeeds:

```text
connected with TLSv1.2 TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
```

The lesson: when you can, **ask the server team for their log**. The client only sees "handshake_failure"; the server knows the reason.

## Step 3: Fix It

**Best fix: upgrade the JDK.** Oracle Java and OpenJDK 8 already use TLS 1.2 by default, later Java 8 updates added TLS 1.3, and Java 11 and newer use TLS 1.3 by default. On WebSphere, upgrading often means waiting for the next fix pack, so the following options help in the meantime.

**IBM Java (WebSphere):** IBM's JDK 8 uses TLS 1.0 for `SSLContext.getInstance("TLS")` unless you set:

```text
-Dcom.ibm.jsse2.overrideDefaultTLS=true
```

This option exists **only in IBM Java**; Oracle and OpenJDK ignore it. Add it as a JVM argument in the server's configuration (*Java Virtual Machine > Generic JVM arguments* in WebSphere), not with `System.setProperty()` in your code: the SSL classes read it once, and if anything has already used SSL, setting it later has no effect. After the change, our client offered:

```text
DEBUG io.netty.handler.ssl.JdkSslContext - Default protocols (JDK): [TLSv1.2, TLSv1.1, TLSv1]
```

and the handshake with the server succeeded.

**Oracle JDK and OpenJDK 8:** set the protocols that clients offer with:

```text
-Djdk.tls.client.protocols=TLSv1.2,TLSv1.3
```

**Spring WebClient, independent of the JDK defaults:** set the protocols on Netty's `SslContext`. This works with Spring Boot 3 and 4, and I tested it against a public HTTPS server:

```java
SslContext sslContext = SslContextBuilder.forClient()
    .protocols("TLSv1.3", "TLSv1.2")
    .build();

HttpClient httpClient = HttpClient.create()
    .secure(spec -> spec.sslContext(sslContext));

WebClient webClient = WebClient.builder()
    .clientConnector(new ReactorClientHttpConnector(httpClient))
    .baseUrl("https://api.partner.example")
    .build();
```

`HttpClient` here is `reactor.netty.http.client.HttpClient`, not the JDK's `java.net.http.HttpClient`.

## SSL Handshake Troubleshooting Checklist

Different TLS errors have different causes. Find your message:

- **`Received fatal alert: handshake_failure`:** the server found no common protocol or cipher suite, or it requires a client certificate (mutual TLS) that you didn't send. Compare the client's offer (`javax.net.debug`) with what the server accepts (`openssl s_client`).
- **`Received fatal alert: protocol_version`:** no common TLS version. Enable TLS 1.2 or 1.3 in the client.
- **`No appropriate protocol (protocol is disabled or cipher suites are inappropriate)`:** the error comes from **your own JDK**, before anything is sent. Current JDKs disable TLS 1.0 and 1.1 in `java.security`. Don't re-enable them; ask for the server to be upgraded.
- **`PKIX path building failed: unable to find valid certification path`:** the protocol was fine, but the client doesn't trust the server's certificate. Add the server's CA certificate to the client's truststore. Antivirus products that scan HTTPS can cause this too: while testing this post, Norton replaced every server certificate with its own, which Java doesn't trust by default. On Windows, `-Djavax.net.ssl.trustStoreType=Windows-ROOT` makes Java use the Windows certificate store, which includes such certificates.
- **`No subject alternative DNS name matching ...` (or `... names matching IP address ...`):** the certificate is valid but issued for a different host name. Call the API with the host name that's in the certificate, not with its IP address.

When the handshake works but the API still fails, the next problems are HTTP errors and overload: see [how a REST client should handle a 503 error](https://codersite.dev/how-rest-client-handles-503-error/){:target="_blank"} and [building a REST API client](https://codersite.dev/building-rest-api-client/){:target="_blank"}. And when you need to search the logs of several servers at once, read [hot-warm architecture in Elasticsearch](https://codersite.dev/hot-warm-architecture-elasticsearch/){:target="_blank"}.

"What happens during a TLS handshake?" is a classic question in backend interviews, together with HTTP, REST and Java networking. Practice with real interview questions:

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

<div>
{% include buymeacoffee.html %}
</div>

<br/>
