---
layout: post
title:  "How to Break Down a Software Project into Tasks: From Epics to User Stories, with a Real Example"
description: "A practical way to turn a large software project into estimated, ordered tasks: goals and scope, epics, user stories with acceptance criteria, tasks, estimates and dependencies, shown on a real API project."
author: moises
categories: [ Project ]
image: /assets/images/webdevProject.jpg
comments: false
---

"Build the new customer portal" is not a task. Nobody can estimate it, start it, or tell when it's done. Projects fail less from bad code than from work nobody broke down properly. Here's a method that turns a vague goal into tasks a team can estimate and deliver, step by step, with a real example.

## Step 1: Define the Goal and the Scope

- **Write down the goal** in one or two sentences: what problem does the project solve, and for whom?
- **Define the scope:** list what is in scope, and just as important, what is *out* of scope. Most project arguments start with a feature that one person thought was included.
- **Name the constraints:** deadline, budget, team size, technologies you must use.
- **Check your current system early.** If your backend can't support the new features, that becomes work in itself, or a reason to change the requirements. It's much cheaper to find out now than in the middle of development.

## Step 2: Split the Project into Epics

An **epic** is a large feature that delivers value on its own, too big to build in one go. A web shop project might have the epics *product catalog*, *checkout*, *order history* and *customer accounts*.

Prioritize the epics by business value and by dependencies: you can't build *order history* before *checkout* exists.

## Step 3: Write User Stories with Acceptance Criteria

A **user story** describes one thing a user can do, from the user's point of view:

> As a *[type of user]*, I want *[an action]*, so that *[a benefit]*.

Every story needs **acceptance criteria**: concrete conditions that tell everyone, including the tester, when the story is done. The *Given / When / Then* format keeps them precise:

> **Given** a principal of 1,000, an annual interest rate of 5% and a time of 2 years,
> **When** I request the simple interest,
> **Then** the response contains a simple interest of 100.

A good rule of thumb for size: one story should fit into a few days of work. If it doesn't, split it, for example by user type, by business rule, or into a simple version first and the special cases later.

## Step 4: Break Each Story into Tasks

Now switch to the developer's point of view. A **task** is a concrete technical step, small enough to finish in a day or less: design the endpoint, write the service, write the tests, update the documentation.

Don't forget the work that's easy to overlook: tests, code reviews, documentation, [UML diagrams](https://codersite.dev/uml-diagrams-for-java-developers/){:target="_blank"} and other design documents, and deployment. They're often half the effort.

Tasks like "design the API" and "draw the UML diagram" are where a project's quality is decided. This book covers both:

<div>
{%- include softwareDesign.html -%}
</div>

## Step 5: Estimate and Find the Dependencies

- **Estimate each task.** For uncertain tasks, a **three-point estimate** is more honest than a single number: ask for an optimistic (O), most likely (M) and pessimistic (P) duration, then use *(O + 4 × M + P) / 6*. A task estimated at 2, 4 and 9 hours gives *(2 + 16 + 9) / 6 = 4.5 hours*.
- **Consider who will do the work.** Estimates depend on people: if you have fewer developers than planned, or nobody with the right skills, the plan changes.
- **Map the dependencies:** which tasks must finish before others can start?
- **Find the critical path:** the longest chain of dependent tasks. It decides the earliest possible finish date, so delays on it delay everything, while other tasks have some slack.

## Step 6: Plan in Small Iterations

Don't plan the whole project as one long sequence of design, then development, then testing, then deployment. Deliver in **small releases** instead: each one includes its own design, development and testing, and adds working features. You get feedback early, and mistakes stay small.

- **Track the work in a tool** such as [Jira](https://www.atlassian.com/software/jira){:target="_blank"}, Trello or Asana, so the whole team sees what's in progress and what's blocked.
- **Define "done"** for the whole team. For example: code reviewed, tests passing, documentation updated, deployed to the test environment.
- **Review regularly** and adjust the breakdown as you learn. The plan is a tool, not a contract.

<div>
{%- include inArticleAds.html -%}
</div>

## A Real Example: Breaking Down a Finance API

Let's apply the method to the Finance API built in this blog's API series.

**Goal:** offer an API that calculates financial metrics for other applications. **Out of scope** for the first release: user accounts and billing.

**Epic:** *Time value of money*, broken into user stories:

1. As an API consumer, I want to calculate **simple interest**, so that I can show loan costs to my customers.
2. As an API consumer, I want to calculate **compound interest**, so that I can compare savings products.
3. As an API consumer, I want to calculate **present and future values**, so that I can evaluate investments.
4. As a developer integrating the API, I want **interactive documentation**, so that I can try the endpoints before I write any code.

**Acceptance criteria for story 1:**

- **Given** a principal of 1,000, an annual rate of 5% and a time of 2 years, **when** I request the simple interest, **then** the response contains 100.
- **Given** a negative principal, **when** I request the simple interest, **then** the API answers *400 Bad Request* with an error message.

**Tasks for story 1** (the estimates are an illustration):

| # | Task | Depends on | Estimate |
|---|---|---|---|
| 1 | [Design the endpoint and its parameters in OpenAPI](https://codersite.dev/designing-apis-with-swagger-and-openapi/){:target="_blank"} | none | 3 h |
| 2 | Review the specification with the API consumers | 1 | 1 h |
| 3 | [Generate the Spring Boot server stub](https://codersite.dev/swagger-codegen-server-stubs-openapi/){:target="_blank"} | 2 | 1 h |
| 4 | [Implement the calculation in a service class](https://codersite.dev/gradle-building-restful-web-service/){:target="_blank"} | 3 | 4 h |
| 5 | Unit tests for the formula and edge cases | 4 | 3 h |
| 6 | Integration test for the endpoint | 4 | 2 h |
| 7 | Update the API documentation and examples | 4 | 1 h |
| 8 | Code review and deployment to the test environment | 5, 6, 7 | 2 h |

<br/>

The story adds up to **17 hours** of work. The critical path is **1 → 2 → 3 → 4 → 5 → 8**, or 14 hours: tasks 6 and 7 can run in parallel with task 5, so they don't delay the story. And every task is small enough that "done" is obvious.

## Checklist Before You Start

- Is the goal written down, and is it clear what's out of scope?
- Does every user story have acceptance criteria?
- Can every task be finished in a day or two?
- Are tests, reviews, documentation and deployment in the plan?
- Do you know the critical path?
- Is "done" defined for the whole team?

Breaking a vague requirement into clear steps is exactly what interviewers test in system design questions. Practice with real interview questions:

<div>
{%- include jediJavaInterviewAds.html -%}
</div>

Please support me as a writer. Every contribution helps, and your donation can help add more articles to this website, no matter how small. Thank you!

{% include buymeacoffee.html %}
<br/>
