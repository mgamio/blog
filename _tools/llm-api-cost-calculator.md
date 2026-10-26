---
title: "LLM API Cost Calculator: Claude, GPT and Gemini Pricing"
short_title: "LLM API Cost Calculator"
description: "Free calculator for LLM API costs. Compare the price per request, per day and per month of Claude, GPT and Gemini models, with prompt caching, the Batch API and long-prompt pricing."
lead: "Enter your tokens per request and requests per day, and compare what Claude, GPT and Gemini models cost, with prompt caching, the Batch API and long-prompt prices included."
tool: llm-api-cost-calculator
image: /assets/images/llmApiCostCalculatorTool.jpg
order: 4
---

## How to Use the Calculator

1. **Start from an example** that looks like your application, such as a chatbot reply, a RAG answer or a coding agent step. Every example fills in typical token counts.
2. **Enter your own numbers:** input tokens (everything you send: system prompt, conversation history, documents), output tokens (the model's answer), and requests per day.
3. **Set how much input comes from the cache.** If every request starts with the same system prompt or documents, that part can be cached and costs up to 97.5% less.
4. **Turn on the Batch API** if you don't need the answers right away. Every provider here charges half price for requests that may take up to 24 hours.
5. **Compare the table.** The cheapest model is highlighted. Click **Model** or **Per request** to sort, and untick a provider to hide its models.

Don't know your token counts? Paste a typical prompt in **Estimate tokens from text**, then click **Use as input tokens**. The calculator remembers your settings in your browser.

## What Is a Token?

LLMs don't read characters or words; they read **tokens**, pieces of text that are often a whole short word or part of a longer one. Providers count and charge for every token you send (input) and every token the model writes (output).

For English text, a token is about 4 characters, or about three quarters of a word: 1,000 tokens is roughly 750 words. Code, JSON, numbers and languages other than English usually need more tokens for the same length. The estimate in this calculator uses 4 characters per token, so treat it as a starting point.

Each provider uses its own tokenizer, so the same text is a different number of tokens on Claude, GPT and Gemini. Anthropic notes that its tokenizer since Claude Opus 4.7 produces up to 1.35 times as many tokens as older Claude models for the same text. For exact numbers:

- **Before you send a request:** use the provider's token-counting endpoint, such as the [Claude token counting API](https://platform.claude.com/docs/en/build-with-claude/token-counting){:target="_blank"}.
- **After a request:** every API response contains a `usage` object with the exact input, output and cached token counts. Log it for a day of real traffic and you have the best possible input for this calculator.

<div>
{%- include inArticleAds.html -%}
</div>

## How LLM API Pricing Works

All three providers charge **per million tokens**, with separate prices for each kind of token:

- **Input tokens** are what you send. In a chat, that's the whole conversation every time, not only the last message, so input usually dominates the bill.
- **Output tokens** are what the model writes, including any reasoning it does before answering. They cost 5 to about 8 times more than input tokens.
- **Cached input** is input the provider has seen recently and stored, such as a long system prompt. Reading it from the cache costs 2.5% to 10% of the normal input price, depending on the model.
- **Batch API:** requests you submit as a batch and collect later cost 50% less. They're processed within 24 hours.
- **Long prompts:** some models charge more when one prompt is very long: Claude Haiku 5.5 above 100,000 input tokens, Gemini Pro models above 200,000, and GPT flagship models above 272,000. The calculator applies these prices automatically.

Two details the table doesn't include:

- **Writing to the cache** costs extra on Claude: 1.25 times the input price for a 5-minute cache, or 2 times for a 1-hour cache. You pay it once, then every cache hit is cheap. OpenAI and Gemini cache common prefixes automatically, without a write price, and Gemini charges an hourly storage fee for caches you create explicitly.
- **Taxes, regional endpoints and cloud platforms.** Prices here are each provider's own API at the standard tier. US-only processing on Claude costs 1.1 times as much, and Claude on Amazon Bedrock and Google Vertex AI has its own price list.

### Current prices per million tokens

These are the prices the calculator uses, checked on {{ site.data.llm_prices.checked | date: "%B %-d, %Y" }}:

| Model | Input | Cached input | Output |
|---|---|---|---|
{% for m in site.data.llm_prices.models %}| {{ m.name }} | {% include tools/usd.html v=m.input %} | {% include tools/usd.html v=m.cached %} | {% include tools/usd.html v=m.output %} |
{% endfor %}

<br/>

Prices change often, and some changes are already announced: Gemini 4 Argon's prices double on December 1, 2026, and Gemini 3.8 Flash's on January 1, 2027. The table in the calculator shows these notes next to the models. Always confirm on the provider's pricing page before you commit to a budget: [Anthropic](https://platform.claude.com/docs/en/about-claude/pricing){:target="_blank"}, [OpenAI](https://developers.openai.com/api/docs/pricing){:target="_blank"}, [Google](https://ai.google.dev/gemini-api/docs/pricing){:target="_blank"}.

<div>
{%- include msitReferral.html -%}
</div>

## Three Worked Examples

All three use the prices above. Open the matching example in the calculator to see every model.

**A support chatbot.** 10,000 replies a day, each with 1,500 input tokens and 300 output tokens, no caching. The cheapest models, Claude Haiku 5.5 and GPT-6 Luna, cost **$90 a month**. Mid-range models such as Claude Sonnet 5.5, GPT-6.1 Sol and Gemini 4 Argon cost **$1,800**, and the flagships Claude Fable 5.1 and GPT-6 Astra cost **$9,000**. The same traffic can cost 100 times more depending on the model you choose.

**A RAG application.** 2,000 answers a day, each with 8,000 input tokens of retrieved documents and instructions, half of them cached, and 500 output tokens. The monthly cost goes from **$41.40** on the cheapest models to **$804** on Claude Sonnet 5.5 or GPT-6.1 Sol. Without caching, the same Sonnet workload would cost $1,260.

**A nightly classification job.** 100,000 short texts tagged every night, each with 300 input tokens and a 5-token label, using the Batch API. The cheapest models cost **$48.75 a month**. Because nobody waits for the answers, there's no reason not to use the Batch API here: it halves the bill.

Writing an application that uses these models well, choosing a model, evaluating its answers and keeping costs under control, is the subject of *AI Engineering* by Chip Huyen. If you're building on top of LLM APIs, it's the most complete guide to the engineering side.

<div>
{%- include aiEngineering.html -%}
</div>

## Six Ways to Lower Your LLM API Bill

1. **Cache everything that repeats.** System prompts, tool definitions and reference documents sent with every request are the biggest easy saving. Put the stable content first and the changing content last, because caches match the beginning of the prompt.
2. **Use the Batch API for anything that can wait,** such as nightly reports, data extraction and evaluations. 50% off with no change to the prompts.
3. **Use the smallest model that does the job well.** Test a smaller model on a sample of real requests before assuming you need the flagship. Many classification and extraction tasks work on the cheapest tier.
4. **Keep outputs short.** Output tokens are the most expensive kind. Ask for the format you need, such as a label, JSON or three bullet points, and set a sensible maximum output length.
5. **Trim the conversation history.** In a long chat, every turn resends everything before it. Summarize or drop old turns, and send only the documents a question needs.
6. **Measure cost per finished task, not per request.** A cheaper model that needs three attempts, or more back-and-forth with the user, can cost more than a better model that gets it right the first time.

Shorter, clearer prompts are cheaper and usually work better too. *Prompt Engineering for LLMs* by John Berryman and Albert Ziegler, two of the engineers behind GitHub Copilot, explains how to build prompts and context that get good answers without wasting tokens.

<div>
{%- include promptEngineeringForLLMs.html -%}
</div>

## Frequently Asked Questions

### How accurate is the calculator?

The prices are copied from each provider's official pricing page, and the calculation follows their rules for caching, Batch and long prompts. The weak point is the token count: the text estimate is approximate, and every provider's tokenizer counts differently. Use token counts from real API responses for the best result.

### Why are output tokens more expensive than input tokens?

The model reads all the input at once, but it generates the output one token at a time, and each new token needs a full pass through the model. That makes output slower and more expensive to produce.

### Do reasoning or thinking tokens count?

Yes. Models that reason before answering bill those reasoning tokens as output tokens, even when you don't see the reasoning. For reasoning-heavy tasks, use real `usage` numbers rather than the length of the visible answer.

### Is the Claude API cheaper on AWS, Google Cloud or Azure?

Claude on Microsoft Foundry uses Anthropic's API prices. Claude on Amazon Bedrock and Google Vertex AI is priced by those platforms, so check their pricing pages. Choosing US-only processing on Anthropic's API costs 10% more.

### How often are the prices updated?

The date at the bottom of the calculator shows when the prices were last checked against the official pages. Providers change prices and release new models often, so confirm before making a big decision.

### Is my data sent anywhere?

No. The calculator and the token estimate run entirely in your browser. Nothing you type or paste is sent to a server.

## Related

- [CLAUDE.md and AGENTS.md Generator](/tools/claude-md-generator/): a short, clear instructions file is also a way to save tokens, because your coding agent reads it in every session.
- [Ready-made CLAUDE.md templates](/tools/claude-md-templates/) for Spring Boot, Next.js, Python and Go projects.
