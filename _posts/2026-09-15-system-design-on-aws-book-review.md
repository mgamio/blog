---
layout: post
title: "The Trade-offs Every Engineer Should Know Before Their Next Whiteboard Interview"
description: "A field-guide summary of Chapter 1 of System Design on AWS by Jayanth Kumar and Mandeep Singh — the concepts, fallacies, trade-offs, and guidelines that separate engineers who can code from engineers who can architect."
author: moises
categories: [ system-design, distributed-systems, aws, book-review, career ]
image: /assets/images/SystemDesignOnAWS.jpg
comments: false
---

**System Design on AWS: The Trade-offs Every Engineer Should Know Before Their Next Whiteboard Interview**

There's a moment in every engineer's career when "does it work on my machine" stops being good enough. Maybe it's your first on-call rotation when a "reliable" service falls over under real traffic. Maybe it's a system design interview where the whiteboard goes blank the instant someone asks, "okay, but what happens when that server dies?" That moment is exactly what **[*System Design on AWS: Building and Scaling Enterprise Solutions*](https://link.amazon/B05Mf5giA){:target="_blank"}** by Jayanth Kumar and Mandeep Singh is built for.

I went through Chapter 1 — "System Design Trade-offs and Guidelines" — and it's one of the tightest introductions to distributed systems thinking I've read in a while. No fluff, no toy examples that fall apart at scale. Just the vocabulary, the math, and the hard-won lessons that let you reason about systems built to serve millions of users. Here's the breakdown, and why it's worth putting on your shelf next to your other engineering references.

## Why "System Design" Is Its Own Skill

Writing correct code and designing a system that *stays* correct under load, failure, and years of change are two different disciplines. The book opens with a simple but important reframe: system design isn't about being clever with algorithms — it's about understanding trade-offs *before* you write a line of code, so you're not rebuilding the foundation six months after launch. That framing alone is worth the price of admission for anyone who's inherited a system nobody dared to touch.

## Seven Concepts That Define Every Large-Scale System

The chapter builds a mental model around seven pillars that show up in literally every distributed system conversation you'll ever have:

- **Communication** — synchronous vs. asynchronous, and why your API gateway and your background job queue shouldn't be designed the same way.
- **Consistency** — from strong consistency all the way to eventual consistency, with the in-between stops (monotonic reads, monotonic writes, causal consistency) that most engineers have never heard named, let alone understood.
- **Availability** — how to actually *measure* uptime (the "nines" table makes it click instantly), and the surprisingly simple math showing why chaining components in series quietly *destroys* your availability while running them in parallel multiplies it.
- **Reliability** — MTBF and MTTR, explained as the two numbers that tell you whether a system is trustworthy or just currently lucky.
- **Scalability** — vertical vs. horizontal scaling, and a clear-eyed take on when to stop throwing bigger servers at a problem and start throwing more of them.
- **Maintainability** — broken into operability, lucidity, and modifiability, which is a genuinely useful way to audit whether *your* [codebase is actually maintainable](https://codersite.dev/clean-code/){:target="_blank"}  or just familiar.
- **Fault Tolerance** — replication and checkpointing, plus RPO and RTO, the two metrics that turn "we have backups" into an actual, defensible recovery plan.

> Every great career in tech is built on great design. Start building yours today.

<div>
{%- include softwareDesign.html -%}
</div>

## The 8 Fallacies That Quietly Wreck Distributed Systems

This is my favorite section. Back in the 90s, L. Peter Deutsch cataloged the assumptions engineers keep making about networks that are, without exception, false: the network is reliable, latency is zero, bandwidth is infinite, the network is secure, topology never changes, there's a single administrator, transport is free, and the network is homogeneous. The book doesn't just list them — it ties each one to a concrete design response (edge computing to fight latency, lightweight payloads to respect bandwidth limits, defense-in-depth to counter the "secure network" myth). If you've ever been blindsided by a network partition you swore couldn't happen, this section is basically a mirror.

## The Trade-offs Nobody Can Escape

Here's the section that turns theory into judgment calls:

- **Time vs. Space** — when precomputing and caching beats recalculating, and when it doesn't.
- **Latency vs. Throughput** — and why "average latency" is a metric that lies to you; p90 and p99 are where the real story lives.
- **Performance vs. Scalability** — a distinction most engineers conflate: a *fast* system and a *scalable* system are not the same claim.
- **Consistency vs. Availability** — the CAP theorem, demystified without the usual hand-waving, plus its more practical successor, **PACELC**, which finally answers the question CAP leaves hanging: *what do I trade off when there ISN'T a network partition?*

If you've ever sat in a design review arguing about whether to use strong or eventual consistency without a shared vocabulary for *why* — this is the chapter that gives everyone in the room the same map.

## Five Guidelines Worth Pinning Above Your Desk

The chapter closes with five hard-earned principles, each anchored to a memorable line from a giant of the field — Kernighan on complexity, Einstein on simplicity, Lampson on getting it right, and the reminder that there is, in fact, **no free lunch** in system design. Optimize for one property and you *will* pay for it somewhere else. The book is refreshingly honest about this instead of selling a silver bullet.

## Who This Book Is For

- Engineers preparing for **system design interviews** at companies operating at real scale.
- Developers ready to move from "I can build a feature" to **"I can own an architecture."**
- Anyone building or operating production systems on **AWS** who wants the *why* behind the services, not just the console clicks.
- Engineering leads who need a [shared vocabulary](https://codersite.dev/the-ubiquitous-language/){:target="_blank"} to run design reviews that don't dissolve into opinion wars.

## The Bottom Line

Chapter 1 alone gives you the CAP theorem, PACELC, the fallacies of distributed computing, and a working definition of availability, reliability, scalability, and maintainability you can actually apply — and it's just the *foundation* the rest of the book builds on toward real AWS architecture. If distributed systems have ever felt like a pile of buzzwords you nod along to in meetings, this is the book that turns them into tools you actually reach for.

**Ready to build systems that don't fall over at 2 a.m.?**

👉 **[Get *System Design on AWS* on Amazon](https://link.amazon/B05Mf5giA){:target="_blank"}**

---

Please support me as a writer. Every contribution helps, and your donation can help add more articles to this website, no matter how small. Thank you!

{% include buymeacoffee.html %}

*This post contains an Amazon Associate link. As an Amazon Associate, I earn from qualifying purchases — at no extra cost to you, and it helps keep content like this coming.*
