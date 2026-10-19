---
layout: post
title:  "Hot-Warm-Cold Architecture in Elasticsearch: Data Tiers, ILM and Centralized Logs"
description: "Build a hot-warm-cold Elasticsearch cluster for log analytics: data tier node roles, an ILM policy that moves logs between tiers, and Filebeat and Logstash to ship them."
author: moises
categories: [ distributed-systems ]
image: /assets/images/elastic.jpg
comments: false
---

Recent logs are written and searched all the time. Logs from last month are searched now and then, and logs from three months ago almost never. Keeping all of them on the same fast, expensive disks wastes money, and deleting them too early loses the history you need when something goes wrong.

A **hot-warm-cold architecture** solves this in Elasticsearch: new data lands on fast *hot* nodes, then moves automatically to cheaper *warm* and *cold* nodes as it ages, and is finally deleted.

This article builds that architecture step by step for the logs of Java application servers, with Elasticsearch, Logstash, Filebeat and Kibana 9. Every configuration and request in it was tested on a three-node Elasticsearch 9.5 cluster.

## The Problem: Logs Spread Across Many Servers

To find bottlenecks, errors, slow queries or connection pool problems, we read the logs of our application servers. With a cluster of servers, every server has its own log files, so one problem means searching several machines.

Log rotation makes it worse. Application servers keep only a few log files of a fixed size and overwrite the oldest one, so on a busy day the history you need is gone within hours:

![Log rotation settings: maximum file size 1 MB and 5 historical log files](/assets/images/logFileRotation.JPG "Log file rotation"){:class="img-responsive"}

The solution is to ship every log line to one central place, keep it as long as the business needs it, and make it searchable. That place is an Elasticsearch cluster.

## Elasticsearch Basics in Two Minutes

Elasticsearch is a distributed search and analytics engine. It stores **documents**, JSON objects such as one parsed log line, in **indices**. Storing a document is called *indexing* it.

**Inverted index.** Relational databases speed up queries with B-tree indexes on selected columns. Elasticsearch builds an *inverted index* for text fields instead: a list of every word, and for each word, the documents that contain it.

For example, the billing and ordering servers both log this line:

```text
[11.01.21 06:12:20:099 MESZ] J2CA0045E: Connection not available while invoking method queueRequest for resource jdbc/xxxxxx
```

and the image service logs this one:

```text
[28.01.21 17:47:48:647 MESZ] java.lang.Exception: I/O Exception: https://server/imageService
```

After indexing the three documents, the inverted index looks like this:

![Inverted index: each word points to the documents that contain it](/assets/images/invertedIndex.jpg "Inverted index"){:class="img-responsive"}

A search for "Connection" doesn't read any log line: it looks up one word and gets documents 1 and 2 directly. That's why Elasticsearch searches millions of log lines in milliseconds.

The other terms you need for this article:

- **Mapping:** the type of each field (date, number, keyword, text), like a table schema.
- **Index template:** the settings and mappings that Elasticsearch applies automatically to every new index whose name matches a pattern.
- **Shard:** a piece of an index. Each shard is a [Lucene](https://lucene.apache.org/){:target="_blank"} index that lives on one node.
- **Node and cluster:** a node is one running Elasticsearch instance; a cluster is a group of nodes with the same `cluster.name`.
- **Data stream:** a name, such as `billing-logs`, that you write time-series data to. Behind it, Elasticsearch creates a new *backing index* regularly, which is what lets old data move to other nodes.

## Hot, Warm, Cold and Frozen Data Tiers

Each node in the cluster belongs to a **data tier**, set with its `node.roles`. Elasticsearch has five:

| Tier | Node role | Holds | Typical hardware |
|---|---|---|---|
| Hot | `data_hot` | New data: written and searched all the time | Fast SSDs, most CPU and memory |
| Warm | `data_warm` | Read-only data, searched less often | Larger, slower disks |
| Cold | `data_cold` | Old data, rarely searched | The cheapest storage |
| Frozen | `data_frozen` | Data that is almost never searched | Object storage through searchable snapshots (paid license) |
| Content | `data_content` | Data that isn't time-based, such as Kibana's own indices | Like hot |

<br/>

You don't decide where each index goes. An **index lifecycle management (ILM) policy** does: it says how long data stays in each phase, and ILM moves the indices from tier to tier on its own.

The architecture in this article has one node per tier, plus Logstash and Kibana:

![Hot-warm-cold architecture: Filebeat on each application server sends logs to Logstash, which writes them to the hot node; ILM moves them to the warm and cold nodes](/assets/images/hotWarmColdElasticsearch.png "Hot-warm-cold architecture in Elasticsearch"){:class="img-responsive"}

Why tiers and replicas work the way they do, and what they cost, is a question about how data systems store and move data. *Designing Data-Intensive Applications* by Martin Kleppmann explains replication, partitioning and storage engines better than any other book, and it will help you size a cluster like this one:

<div>
{%- include designingDataIntensiveApplications.html -%}
</div>

## The Servers

We use four Windows servers:

```text
110.1.0.101   es-hot-1    Elasticsearch, hot tier
110.1.0.102   es-warm-1   Elasticsearch, warm tier
110.1.0.103   es-cold-1   Elasticsearch, cold tier
110.1.0.104   logs-1      Logstash and Kibana
```

All three Elasticsearch nodes are **master-eligible**. A cluster needs a majority of its master-eligible nodes to elect a master, so with three of them it keeps working when any one server is down. With a single master node, as many older tutorials show, losing that one server stops the whole cluster.

Open these ports in Windows Defender Firewall. On the three Elasticsearch servers, in a PowerShell window run as administrator:

```powershell
New-NetFirewallRule -DisplayName "Elasticsearch" -Direction Inbound -Protocol TCP -LocalPort 9200,9300 -Action Allow
```

Port 9200 is the REST API that Logstash and Kibana use; port 9300 is the transport port the nodes use to talk to each other. On `logs-1`, open 5044 for Filebeat and 5601 for Kibana.

## Step 1: Configure the Elasticsearch Nodes

Download the Elasticsearch Windows zip from [elastic.co](https://www.elastic.co/downloads/elasticsearch){:target="_blank"} and extract it on each of the three servers, for example to `C:\elasticsearch`. Then add these lines to `config\elasticsearch.yml`.

**Hot node** (`110.1.0.101`):

```yaml
cluster.name: logs-prod
node.name: es-hot-1
node.roles: [ master, data_hot, data_content, ingest ]
network.host: 110.1.0.101
path.data: E:\elasticsearch\data
path.logs: E:\elasticsearch\logs
```

**Warm node** (`110.1.0.102`):

```yaml
cluster.name: logs-prod
node.name: es-warm-1
node.roles: [ master, data_warm ]
network.host: 110.1.0.102
path.data: E:\elasticsearch\data
path.logs: E:\elasticsearch\logs
```

**Cold node** (`110.1.0.103`):

```yaml
cluster.name: logs-prod
node.name: es-cold-1
node.roles: [ master, data_cold ]
network.host: 110.1.0.103
path.data: E:\elasticsearch\data
path.logs: E:\elasticsearch\logs
```

The hot node also has `data_content`, because Kibana and Elasticsearch keep their own indices on content nodes, and `ingest` for ingest pipelines. `network.host` takes only an address, never a port: the HTTP port defaults to 9200 and the transport port to 9300.

If you have used Elasticsearch 7 or earlier, notice what is *not* here: `node.master`, `node.data` and `node.ingest` were replaced by `node.roles` and removed in Elasticsearch 8, and so were `transport.tcp.port` and `node.max_local_storage_nodes`. A custom attribute like `node.attr.box_type: hot` isn't needed either: the data tier roles replace it.

### Start the First Node with Security On

Since Elasticsearch 8, security is enabled by default, and you should keep it that way: without it, anyone who can reach port 9200 can read and delete your logs.

Start the hot node first:

```powershell
cd C:\elasticsearch
.\bin\elasticsearch.bat
```

On its first start, Elasticsearch configures security by itself. It creates TLS certificates for the HTTP and transport layers in `config\certs`, adds the security settings to `elasticsearch.yml`, and prints:

- the password of the `elastic` superuser;
- an enrollment token for Kibana, valid for 30 minutes.

Save the password. If you lose it, reset it with `.\bin\elasticsearch-reset-password.bat -u elastic`.

### Add the Warm and Cold Nodes

New nodes join a secured cluster with an **enrollment token**. Create one on the hot node:

```powershell
.\bin\elasticsearch-create-enrollment-token.bat -s node
```

Then start the warm node, and after it the cold node, with that token:

```powershell
.\bin\elasticsearch.bat --enrollment-token "paste-the-token-here"
```

The token tells the new node where the cluster is and gives it the certificates it needs, so you don't copy any certificate by hand. It is valid for 30 minutes; create a new one if it expires.

When all three nodes have joined, remove the `cluster.initial_master_nodes` line from the hot node's `elasticsearch.yml`. Elasticsearch added it to form the first cluster, and it must not be used again.

Check the cluster with `curl`, using the CA certificate Elasticsearch created:

```powershell
curl.exe --cacert config\certs\http_ca.crt -u elastic "https://110.1.0.101:9200/_cat/nodes?v&h=ip,node.role,master,name"
```

```text
ip          node.role master name
110.1.0.101 hims      *      es-hot-1
110.1.0.102 mw        -      es-warm-1
110.1.0.103 cm        -      es-cold-1
```

Each letter is a role: **h** data_hot, **i** ingest, **m** master, **s** data_content, **w** data_warm, **c** data_cold. The `*` marks the elected master, which can be any of the three nodes.

Once each node starts correctly, you can install it as a Windows service with `.\bin\elasticsearch-service.bat install`, so it starts with the server.

<div>
{%- include inArticleAds.html -%}
</div>

## Step 2: Install Kibana

Kibana is the web interface for searching logs and managing the cluster. Extract the Kibana Windows zip on `logs-1`, and in `config\kibana.yml` set the address it listens on:

```yaml
server.host: "110.1.0.104"
```

Start it with `.\bin\kibana.bat` and open `http://110.1.0.104:5601`. Kibana asks for the enrollment token that the hot node printed on its first start (or create a new one on the hot node with `.\bin\elasticsearch-create-enrollment-token.bat -s kibana`), then for a verification code that it prints in its console. After that, log in as `elastic`.

The following requests are run in Kibana's **Dev Tools** console (menu **Management → Dev Tools**).

## Step 3: Create the ILM Policy

The lifecycle policy is the heart of the architecture. It describes what happens to the billing logs as they age:

```text
PUT _ilm/policy/billing-logs-policy
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_age": "1d",
            "max_primary_shard_size": "50gb"
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "forcemerge": {
            "max_num_segments": 1
          }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {}
      },
      "delete": {
        "min_age": "60d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

- **Hot:** logs are written to the current backing index. **Rollover** starts a new one every day, or sooner if a shard reaches 50 GB. Only whole backing indices can move between tiers, so rollover is what makes the architecture work.
- **Warm:** 7 days after rollover, the index moves to the warm node. Nothing writes to it anymore, so **force merge** compacts it into one segment per shard, which saves disk space and speeds up searches.
- **Cold:** after 30 days, the index moves to the cold node.
- **Delete:** after 60 days, the index is deleted.

Where are the instructions to move the data? You don't need any. In every phase, ILM runs a **migrate** action automatically: it changes the index's tier preference, for example to `data_warm,data_hot`, and Elasticsearch moves its shards to a node with that role. Phase ages count from the rollover, not from the creation of the index.

## Step 4: Create the Index Template

The index template turns `billing-logs` into a data stream, connects it to the policy and defines the fields of a parsed log line:

```text
PUT _index_template/billing-logs
{
  "index_patterns": ["billing-logs*"],
  "data_stream": {},
  "priority": 200,
  "template": {
    "settings": {
      "index.lifecycle.name": "billing-logs-policy",
      "index.number_of_replicas": 0
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "client_ip":  { "type": "ip" },
        "client":     { "type": "keyword" },
        "method":     { "type": "keyword" },
        "endpoint":   { "type": "keyword" },
        "bytes":      { "type": "long" },
        "duration":   { "type": "float" }
      }
    }
  }
}
```

**Why no replicas?** A replica must live on a different node than its primary shard, in the same tier. With one node per tier, replicas could never be placed, and the cluster would stay yellow. In production, run at least two nodes in each tier and set `number_of_replicas` to 1, so you don't lose data when a disk fails.

`priority: 200` makes this template win over Elasticsearch's built-in templates, which have priority 100.

## Step 5: Create an API Key for Logstash

Logstash should not log in as `elastic`. Create an API key that can only write to the billing logs:

```text
POST _security/api_key
{
  "name": "logstash-billing",
  "role_descriptors": {
    "billing_logs_writer": {
      "cluster": ["monitor"],
      "indices": [
        {
          "names": ["billing-logs*"],
          "privileges": ["create_doc", "auto_configure"]
        }
      ]
    }
  }
}
```

`create_doc` lets Logstash add documents, and `auto_configure` lets it create the `billing-logs` data stream on the first write. The response contains an `id` and an `api_key`. Logstash needs them joined with a colon, `id:api_key`.

Clean architecture is about managing dependencies: Filebeat knows only Logstash, Logstash knows only the data stream, and the ILM policy can change without touching either of them. My book *Software Design Principles* explains how to design systems whose parts can change independently:

<div>
{%- include softwareDesign.html -%}
</div>

## Step 6: Parse the Logs with Logstash

Logstash receives the log lines, parses them into fields, and writes them to Elasticsearch. A Logstash **pipeline** has three parts: inputs, filters and outputs.

![Logstash pipeline: inputs, filters and outputs between the data source and Elasticsearch](/assets/images/logstashPipeline.jpg "Logstash pipeline"){:class="img-responsive"}

Our application servers write one line per API request:

```text
55.3.244.1 [19.10.26 06:17:42 +0000] codersite.dev GET /v1/api/billings 15824 0.043
```

That is the client's IP address, the time, the client name, the HTTP method, the endpoint, the response size in bytes and the duration in seconds.

Extract Logstash on `logs-1`, copy `config\certs\http_ca.crt` from the hot node to `C:\logstash\config\certs\`, and create `config\billing-pipeline.conf`:

```ruby
input {
  beats {
    port => 5044
  }
}

filter {
  grok {
    match => {
      "message" => "%{IP:client_ip} \[%{DATA:timestamp}\] %{HOSTNAME:client} %{WORD:method} %{URIPATHPARAM:endpoint} %{NUMBER:bytes:int} %{NUMBER:duration:float}"
    }
  }
  date {
    match => [ "timestamp", "dd.MM.yy HH:mm:ss Z" ]
    remove_field => [ "timestamp" ]
  }
}

output {
  elasticsearch {
    hosts => [ "https://110.1.0.101:9200", "https://110.1.0.102:9200", "https://110.1.0.103:9200" ]
    index => "billing-logs"
    action => "create"
    manage_template => false
    api_key => "${ES_API_KEY}"
    ssl_certificate_authorities => [ "C:/logstash/config/certs/http_ca.crt" ]
  }
}
```

**The grok filter** matches the line with named patterns. Each `%{PATTERN:field}` matches a piece of text and stores it in a field:

- `%{IP:client_ip}` matches `55.3.244.1`.
- `\[%{DATA:timestamp}\]` matches the text between the brackets. The brackets are escaped because `[` has a special meaning in a regular expression.
- `%{HOSTNAME:client}` matches `codersite.dev`. `WORD` would not, because a word can't contain a dot.
- `%{NUMBER:bytes:int}` converts the value to a number, so you can calculate with it.

**The date filter** parses the timestamp from the log line and stores it in `@timestamp`. Without it, every event gets the time Logstash *received* it, and your charts show when the logs were shipped instead of when the requests happened.

**The output** writes to the `billing-logs` data stream. `action => "create"` is required, because data streams only accept new documents. `manage_template => false` stops Logstash from installing its own index template, since we created ours in step 4.

Store the API key in the Logstash keystore, so it isn't written in a file, and start the pipeline:

```powershell
cd C:\logstash
.\bin\logstash-keystore.bat create
.\bin\logstash-keystore.bat add ES_API_KEY
.\bin\logstash.bat -f config\billing-pipeline.conf
```

<div>
{%- include inArticleAds.html -%}
</div>

## Step 7: Ship the Logs with Filebeat

Filebeat is a small agent that runs on each application server. It reads new lines from the log files and sends them to Logstash, and it remembers how far it has read, so no line is lost or sent twice when it restarts.

Extract the Filebeat Windows zip to `C:\Program Files\Filebeat` on each application server and replace `filebeat.yml` with:

```yaml
filebeat.inputs:
  - type: filestream
    id: billing-access-logs
    paths:
      - 'D:\AppServer\logs\billingServer\access.log'

output.logstash:
  hosts: ["110.1.0.104:5044"]
```

Use the `filestream` input. The older `log` input was deprecated in version 7.16 and is disabled in Filebeat 9. Every `filestream` input needs a unique `id`. Write Windows paths in single quotes, so YAML keeps the backslashes as they are.

Test the configuration and the connection to Logstash, then install and start Filebeat as a Windows service. Run PowerShell as administrator:

```powershell
cd 'C:\Program Files\Filebeat'
.\filebeat.exe test config
.\filebeat.exe test output
PowerShell.exe -ExecutionPolicy UnRestricted -File .\install-service-filebeat.ps1
Start-Service filebeat
```

**Shipping JVM logs with stack traces.** In `SystemOut.log` and `SystemErr.log`, one error is many lines: the message and every line of the stack trace. Without extra settings, each line becomes a separate document. A `multiline` parser joins every line that doesn't start with `[` to the line before it:

```yaml
  - type: filestream
    id: billing-jvm-logs
    paths:
      - 'D:\AppServer\logs\billingServer\SystemErr.log'
    parsers:
      - multiline:
          type: pattern
          pattern: '^\['
          negate: true
          match: after
```

## Step 8: Check That Everything Works

After a few requests, each parsed log line is a document in the data stream:

```json
{
  "@timestamp": "2026-10-19T06:21:30.000Z",
  "client_ip": "55.3.244.1",
  "client": "codersite.dev",
  "method": "GET",
  "endpoint": "/v1/api/billings",
  "bytes": 1777,
  "duration": 0.024,
  "message": "55.3.244.1 [19.10.26 06:21:30 +0000] codersite.dev GET /v1/api/billings 1777 0.024"
}
```

(Logstash and Filebeat also add fields such as `host`, `agent` and `log.file.path`, left out here.) A line that doesn't match the grok pattern gets the tag `_grokparsefailure`, so search for that tag to find log formats you haven't parsed yet.

To see which phase each backing index is in, ask ILM:

```text
GET billing-logs/_ilm/explain
```

```json
{
  "indices": {
    ".ds-billing-logs-2026.10.19-000001": {
      "index": ".ds-billing-logs-2026.10.19-000001",
      "policy": "billing-logs-policy",
      "phase": "hot",
      "action": "rollover",
      "step": "check-rollover-ready"
    }
  }
}
```

The response above is shortened. To test the whole lifecycle without waiting 60 days, I created a copy of the policy with ages in minutes. The first backing index moved from the hot node to the warm node, then to the cold node, and was deleted, all without any routing setting.

## Use the Logs: Requests per Minute for Rate Limiting

Centralized logs answer questions that no single server can. For example: how many requests per minute does each client send? You need that number to choose a fair rate limit.

A `date_histogram` counts the requests per minute, and the `avg_bucket` and `max_bucket` aggregations calculate the average and the busiest minute for each client:

```text
GET billing-logs/_search
{
  "size": 0,
  "query": {
    "range": {
      "@timestamp": { "gte": "2026-10-19T06:00:00Z", "lt": "2026-10-19T07:00:00Z" }
    }
  },
  "aggs": {
    "by_client": {
      "terms": { "field": "client" },
      "aggs": {
        "per_minute": {
          "date_histogram": { "field": "@timestamp", "fixed_interval": "1m" }
        },
        "avg_per_minute": {
          "avg_bucket": { "buckets_path": "per_minute>_count" }
        },
        "peak_per_minute": {
          "max_bucket": { "buckets_path": "per_minute>_count" }
        }
      }
    }
  }
}
```

Adding `?filter_path=aggregations.by_client.buckets.key,aggregations.by_client.buckets.*_per_minute.value` to the URL keeps only the numbers we need:

```json
{
  "aggregations" : {
    "by_client" : {
      "buckets" : [
        {
          "key" : "codersite.dev",
          "avg_per_minute" : { "value" : 893.2 },
          "peak_per_minute" : { "value" : 939.0 }
        },
        {
          "key" : "shop.example.com",
          "avg_per_minute" : { "value" : 122.0 },
          "peak_per_minute" : { "value" : 135.0 }
        },
        {
          "key" : "partner.example.org",
          "avg_per_minute" : { "value" : 47.6 },
          "peak_per_minute" : { "value" : 61.0 }
        }
      ]
    }
  }
}
```

The client `codersite.dev` sends 893 requests per minute on average, with peaks of 939. A limit of about 1,000 requests per minute protects your servers from overload and attacks without rejecting this client's normal traffic. Learn how to enforce such a limit in [How to Implement Rate Limiting](https://codersite.dev/rate-limit/){:target="_blank"}.

The same logs tell you much more: Kibana's **Discover** view shows the errors of all application servers in one place, filtered by server, time or message, instead of searching log files on each machine.

To go deeper into how Elasticsearch works, *Elasticsearch in Action, Second Edition* by Madhusudhan Konda covers Elasticsearch 8 from the ground up: text analysis, mappings, search and aggregations, and the cluster administration behind an architecture like this one:

<div>
{%- include elasticsearchInAction.html -%}
</div>

## Frequently Asked Questions

**What is the difference between hot-warm and hot-warm-cold?**
A hot-warm architecture has two tiers: one for new data and one for everything older. Adding a cold tier gives old, rarely searched data its own cheaper hardware. Start with the tiers your retention needs: if you delete logs after two weeks, hot and warm are enough.

**Do I need a frozen tier?**
Only for data you must keep for months or years but almost never search, such as audit logs. The frozen tier keeps data in object storage (such as S3 or Azure Blob Storage) through searchable snapshots, which needs a paid Elastic license.

**How many master-eligible nodes do I need?**
Three. A cluster needs a majority of its master-eligible nodes to elect a master, so three nodes survive the loss of one. Two nodes don't survive the loss of either, because one node out of two isn't a majority.

**Filebeat or Elastic Agent?**
Elastic Agent is one agent for logs, metrics and security data, managed centrally from Kibana with Fleet. Filebeat is simpler to set up for shipping log files, as in this article. Both work with Logstash.

**Why are my old logs still on the hot node?**
Check `GET billing-logs/_ilm/explain`. The usual causes are a backing index that hasn't rolled over yet (phase ages count from rollover), a policy not attached to the template, or no node with the target tier's role, in which case the index stays where it is.

<br/>

<div>
{% include buymeacoffee.html %}
</div>
