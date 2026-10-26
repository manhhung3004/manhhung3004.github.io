---
title: "Observability Done Right: Making Your System Tell You How It Is Doing"
date: 2026-10-26
tags: [Observability, Kubernetes]
description: A practical model for observability that reflects real system health — SLOs on top, RED and USE underneath, correlated metrics, traces and logs, burn-rate alerts, and a rollout plan you can start this week.
---

Most teams that say "we have observability" really have a pile of dashboards. When something breaks at 3 a.m., the pile doesn't answer the only questions that matter. The Google SRE book puts them as **"what's broken, and why?"** ([source](https://sre.google/sre-book/monitoring-distributed-systems/)). Good observability answers both quickly, and it starts with a third question: *are users actually hurting?*

This post is the model I use to make a system describe its own health. Every rule below links to the source it comes from.

## Start from the user: SLIs and SLOs

"System health" is not CPU usage. It is whether users get what they came for. The SRE book defines the two terms:

- An **SLI** is "a carefully defined quantitative measure of some aspect of the level of service that is provided."
- An **SLO** is "a target value or range of values for a service level that is measured by an SLI."

Two pieces of advice from the [same chapter](https://sre.google/sre-book/service-level-objectives/) shape everything else. First, "start by thinking about (or finding out!) what your users care about, not what you can measure." Second, don't turn every metric into an SLI. Pick a few per **user journey** (sign in, search, checkout), for example:

- **Availability:** the share of requests that succeed (non-5xx).
- **Latency:** the share of requests faster than a threshold, or p95/p99.
- **Freshness:** for pipelines, how old the newest processed data is.

An SLO such as "99.9% of checkout requests succeed over 30 days" gives you an **error budget** of 0.1%. That budget is what alerts and release decisions are measured against.

## Four layers of health

SLOs tell you *that* users hurt. The layers below tell you *where* and *why*.

| Layer | Question | Model | What to measure |
| --- | --- | --- | --- |
| 1. User experience | Are users OK? | SLI / SLO | Success ratio, p95/p99 latency, freshness per journey |
| 2. Services | Which service is failing or slow? | RED | Rate, Errors, Duration for each service and route |
| 3. Resources | What is saturated? | USE | Utilization, Saturation, Errors for CPU, memory, disk, network, pools, queues |
| 4. Platform & dependencies | Is the ground under us shaking? | — | Pod restarts and OOMKills, Pending pods, NotReady nodes, queue lag, certificate expiry, DB replication lag |

The models behind the middle rows:

- **RED**, created by Tom Wilkie, means **R**ate ("the number of requests per second"), **E**rrors ("the number of those requests that are failing"), and **D**uration ("the amount of time those requests take"). He built it because "the USE Method doesn't really apply to services" ([source](https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/)).
- **USE**, by Brendan Gregg: "For every resource, check utilization, saturation, and errors." Saturation is "the degree to which the resource has extra work which it can't service, often queued" ([source](https://www.brendangregg.com/usemethod.html)).
- The SRE book's **four golden signals** (latency, traffic, errors, saturation) are, in Wilkie's words, "basically the same as the RED Method, but includes saturation."

Wilkie recommends using RED and USE together, as "two different views on the same system." That is the point of the table: each layer explains the one above it.

## Signals, and why correlation matters more than volume

- **Metrics** tell you *that* something is wrong and *where*. They are cheap, kept for a long time, and the right input for alerts.
- **Traces** tell you *which hop* in a request was slow or failed.
- **Logs** tell you *what exactly* happened. Make them structured (JSON).

Three signals in three tools don't help much on their own. What helps is being able to jump between them. Three habits make that work:

1. **Use the same resource attributes everywhere.** OpenTelemetry's semantic conventions define [`service.name`](https://opentelemetry.io/docs/specs/semconv/resource/) and `service.version`, [`deployment.environment.name`](https://opentelemetry.io/docs/specs/semconv/resource/deployment-environment/), and [`k8s.namespace.name`, `k8s.pod.name`, `k8s.deployment.name`](https://opentelemetry.io/docs/specs/semconv/resource/k8s/). All of these attributes are stable. If every signal carries them, every query can filter by the same service and environment.
2. **Put trace context in logs.** The OpenTelemetry logs spec correlates logs with traces "by including TraceId and SpanId in the LogRecords" ([source](https://opentelemetry.io/docs/specs/otel/logs/)).
3. **Use exemplars.** An exemplar is a trace sampled from a metric measurement. In Grafana they show up as stars on a Prometheus graph, and one click opens the trace ([source](https://grafana.com/docs/grafana/latest/fundamentals/exemplars/)).

With all three in place, you can go from a latency spike to one slow trace, and from there to the log lines of the failing span.

## A reference stack

```text
Apps ── OpenTelemetry SDK / Operator auto-instrumentation
  │ OTLP
  ▼
OTel Collector  (agent per node → gateway: filter, sample, add k8s metadata)
  ├─► Prometheus / Mimir     metrics + exemplars
  ├─► Loki                   logs (JSON, with trace_id)
  └─► Tempo / Jaeger         traces
              ▼
     Grafana dashboards  +  Alertmanager → on-call

Platform: kube-state-metrics, node-exporter, kubelet / cAdvisor
```

- **Instrument with OpenTelemetry**, so you can change backends later without touching code. On Kubernetes, the [OpenTelemetry Operator](https://opentelemetry.io/docs/platforms/kubernetes/operator/automatic/) injects auto-instrumentation when you add a pod annotation such as `instrumentation.opentelemetry.io/inject-java: "true"`. It supports .NET, Java, Node.js and Python, and Go through eBPF (disabled by default).
- **Run the Collector as agent plus gateway.** The [deployment docs](https://opentelemetry.io/docs/collector/deploy/) describe both patterns: agents next to the workloads, and a gateway as the single OTLP endpoint in front of the backends.
- **Prometheus can receive OTLP directly** with `--web.enable-otlp-receiver`. By default it turns dots into underscores and adds unit suffixes, so OTel's stable [`http.server.request.duration`](https://opentelemetry.io/docs/specs/semconv/http/http-metrics/) histogram is queried as `http_server_request_duration_seconds`. Resource attributes are not promoted to labels by default. The [guide](https://prometheus.io/docs/guides/opentelemetry/) recommends promoting a set, including `service.name`, `deployment.environment.name` and the `k8s.*` attributes.

## Alerts people trust

This is where most setups fail. Three rules:

**1. Page on symptoms, not causes.** The SRE book calls the split between symptom and cause "one of the most important distinctions in writing good monitoring," and adds: "Every page should be actionable. … If a page merely merits a robotic response, it shouldn't be a page" ([source](https://sre.google/sre-book/monitoring-distributed-systems/)). "CPU at 90%" belongs on a dashboard. "Checkout is burning its error budget fast" belongs on the pager.

**2. Alert on SLO burn rate, over two windows.** Burn rate is "how fast, relative to the SLO, the service consumes the error budget." The SRE Workbook recommends these settings for a 99.9% SLO ([source](https://sre.google/workbook/alerting-on-slos/)):

| Severity | Long window | Short window | Burn rate | Budget consumed |
| --- | --- | --- | --- | --- |
| Page | 1 hour | 5 minutes | 14.4 | 2% |
| Page | 6 hours | 30 minutes | 6 | 5% |
| Ticket | 3 days | 6 hours | 1 | 10% |

The short window is 1/12 of the long one. It lets the alert stop firing a few minutes after errors stop, instead of an hour later. With the OTel HTTP metric, the recording rule and the page alert look like this:

```yaml
# Error ratio for the service (repeat for 5m, 30m, 6h)
- record: job:slo_errors_per_request:ratio_rate1h
  expr: |
    sum by (job) (rate(http_server_request_duration_seconds_count{http_response_status_code=~"5.."}[1h]))
    /
    sum by (job) (rate(http_server_request_duration_seconds_count[1h]))

# Page: the expression from the SRE Workbook, for a 99.9% SLO
- alert: ErrorBudgetBurn
  expr: |
    (job:slo_errors_per_request:ratio_rate1h > (14.4*0.001)
       and job:slo_errors_per_request:ratio_rate5m > (14.4*0.001))
    or
    (job:slo_errors_per_request:ratio_rate6h > (6*0.001)
       and job:slo_errors_per_request:ratio_rate30m > (6*0.001))
  labels:
    severity: page
  annotations:
    runbook_url: https://example.com/runbooks/error-budget-burn
```

You don't need to write these rules by hand. [Sloth](https://sloth.dev/introduction/) and [Pyrra](https://github.com/pyrra-dev/pyrra) generate the recording rules and multi-burn-rate alerts from a short SLO spec.

**3. Every alert has an owner and a runbook.** Delete any alert that nobody acts on.

## Dashboards that follow the debug path

Build dashboards in the order you debug, not in the order you collect data.

**The debug path**

```debug-path
Alert → Overview → Service (RED) → Resources (USE) → Trace + logs, with a loop back from postmortems to alerts
```

1. **Overview:** SLO status and remaining error budget for each user journey, with recent deploys marked. Within 30 seconds it should answer *is it bad, and since when?*
2. **Service (RED):** one template shared by every service. Plot latency as percentiles from the histogram, for example `histogram_quantile(0.99, sum by (le, http_route) (rate(http_server_request_duration_seconds_bucket[5m])))`. Histograms can be summed across instances before you take the quantile; summaries cannot ([source](https://prometheus.io/docs/practices/histograms/)).
3. **Resources (USE):** nodes, pods, databases, queues.
4. From there, jump to traces and logs through exemplars and `trace_id`.

## Common mistakes

- **Plotting average latency.** "A simple average can obscure these tail latencies, as well as changes in them" ([source](https://sre.google/sre-book/service-level-objectives/)). Use histograms and percentiles.
- **High-cardinality labels.** Every unique label set is a new time series. Prometheus says "do not use labels to store dimensions with high cardinality … such as user IDs, email addresses, or other unbounded sets of values" ([source](https://prometheus.io/docs/practices/naming/)). Put those in traces and logs instead.
- **A hundred dashboards and no overview.** If nobody knows which one to open first, they don't help.
- **Free-text logs without `trace_id`.** You can grep them, but you can't correlate them.
- **No SLO**, so nobody can say what "healthy" means, and every alert threshold is a guess.
- **Paging on causes.** CPU, memory and pod-restart pages teach on-call engineers to ignore the pager.

## A rollout plan you can start this week

- [ ] Pick the 3–5 user journeys that matter most and write one availability SLI and one latency SLI for each
- [ ] Install the OTel Collector (agent + gateway) and turn on Operator auto-instrumentation for one service
- [ ] Standardize `service.name`, `service.version`, `deployment.environment.name` and the `k8s.*` attributes
- [ ] Build the overview dashboard and one RED dashboard template
- [ ] Generate burn-rate alerts with Sloth or Pyrra, write a runbook for each, and remove cause-based pages
- [ ] Switch logs to JSON with `trace_id`, and turn on exemplars
- [ ] Review alerts every month: which ones were noise, which incidents had no alert? Every postmortem should produce an SLI or alert fix

Observability is never finished. The loop at the end of the debug path, where each incident improves the signals, matters more than any single tool.

## Sources

Checked on October 26, 2026.

- [Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/) and [Service Level Objectives](https://sre.google/sre-book/service-level-objectives/) — Google SRE book
- [Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/) — Google SRE Workbook
- [The RED Method](https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/) — Grafana Labs blog
- [The USE Method](https://www.brendangregg.com/usemethod.html) — Brendan Gregg
- OpenTelemetry semantic conventions: [resource](https://opentelemetry.io/docs/specs/semconv/resource/), [deployment environment](https://opentelemetry.io/docs/specs/semconv/resource/deployment-environment/), [Kubernetes](https://opentelemetry.io/docs/specs/semconv/resource/k8s/), [HTTP metrics](https://opentelemetry.io/docs/specs/semconv/http/http-metrics/)
- OpenTelemetry docs: [logs specification](https://opentelemetry.io/docs/specs/otel/logs/), [Collector deployment](https://opentelemetry.io/docs/collector/deploy/), [Operator auto-instrumentation](https://opentelemetry.io/docs/platforms/kubernetes/operator/automatic/)
- Prometheus docs: [OpenTelemetry guide](https://prometheus.io/docs/guides/opentelemetry/), [metric and label naming](https://prometheus.io/docs/practices/naming/), [histograms and summaries](https://prometheus.io/docs/practices/histograms/)
- [Exemplars](https://grafana.com/docs/grafana/latest/fundamentals/exemplars/) — Grafana docs
- [Sloth](https://sloth.dev/introduction/) and [Pyrra](https://github.com/pyrra-dev/pyrra)
