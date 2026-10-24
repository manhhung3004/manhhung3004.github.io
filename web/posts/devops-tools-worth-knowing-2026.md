---
title: New DevOps Tools Worth Knowing in Late 2026
date: 2026-10-24
description: AI SRE agents went GA, ingress-nginx retired, hardened images went free, and IaC got an MCP server. A field guide to what changed and what to try first.
---

Three things changed the DevOps toolbox in 2026. AI agents moved from "chat about your logs" to running investigations on their own. The most popular Kubernetes ingress controller was retired, forcing a migration many teams had postponed. And several things that used to cost money or code changes, such as hardened base images and tracing, became free or zero-code.

This post covers ten tools behind those shifts: what each one is, where it stands as of October 2026, how to try it, and what to watch out for. Every status below links to the source I checked.

## At a glance

| Tool | Area | Status (Oct 2026) | Why it matters |
| --- | --- | --- | --- |
| [AWS DevOps Agent](https://aws.amazon.com/about-aws/whats-new/2026/03/aws-devops-agent-generally-available) | AI SRE | GA since March 31, 2026 | Investigates incidents across AWS, Azure, and on-prem |
| [Azure SRE Agent](https://mc.merill.net/message/AZ558321) | AI SRE | GA since March 2026 | Configurable autonomy, from suggestions to guarded auto-fixes |
| [PagerDuty SRE Agent](https://pagerduty.com/newsroom/pagerduty-operations-cloud-spring-2026-release) | AI SRE | Early access | An agent that sits on the on-call roster |
| [GitHub Agentic Workflows](https://github.github.io/gh-aw/) | CI/CD | Preview | Agent tasks written in Markdown, run by GitHub Actions |
| [Terraform MCP Server](https://github.com/hashicorp/terraform-mcp-server) | IaC + AI | Released, open source | Gives coding agents real registry and workspace data |
| [ingress2gateway 1.0](https://kubernetes.io/blog/2026/03/20/ingress2gateway-1-0-release) | Kubernetes networking | Stable (March 2026) | The migration path off retired ingress-nginx |
| [Kubernetes v1.36](https://kubernetes.io/blog/2026/04/22/kubernetes-v1-36-release/) | Kubernetes | Released April 22, 2026 | User namespaces GA, security hardening, DRA for GPUs |
| [OpenTofu 1.12 / 1.13](https://opentofu.org/blog/) | IaC | 1.13 released September 29, 2026 | Open-source Terraform fork keeps adding features |
| [Docker Hardened Images](https://www.docker.com/press-release/docker-makes-hardened-images-free-open-and-transparent-for-everyone/) | Supply chain | Free since December 2025 | 1,000+ minimal images with SBOM and SLSA L3 provenance |
| [OpenTelemetry eBPF Instrumentation](https://opentelemetry.io/docs/zero-code/obi/) | Observability | Pre-1.0 (v0.15.x) | Traces and RED metrics with no code changes |

## 1. AI SRE agents: three you should know

The biggest category of new tools this year is the "AI SRE": an agent that receives an alert, pulls telemetry, code, and deploy history, and proposes or applies a fix. Every major cloud and incident vendor now ships one. They differ mostly in where they live and how much they are allowed to do.

| | AWS DevOps Agent | Azure SRE Agent | PagerDuty SRE Agent |
| --- | --- | --- | --- |
| Status | GA, March 31, 2026 | GA, March 2026 | Virtual responder in early access from Q2 2026; fully autonomous mode planned for H2 2026 |
| Where it works | AWS, Azure, and on-prem (on-prem via MCP) | Azure, grounded in your source code and tools | Inside your on-call schedules and escalation policies |
| Notable features | Custom agent skills, custom charts and reports, learns from past incidents to prevent repeats | Choice of OpenAI or Anthropic Claude models, Python execution for reports, memory across interactions, adjustable autonomy | Runs diagnostics before a human is paged; agent-to-agent MCP with AWS DevOps Agent and Azure SRE Agent |
| Pricing hint | AWS Support plans include monthly credits (100% of prior-month Support spend for Unified Operations, 75% for Enterprise, 30% for Business Support+) | Billed in Azure Agent Units; 30-day trial added in August 2026 | Part of the PagerDuty Operations Cloud |

**How to start:** pick the one that lives where your incidents already land. Connect it in read-only mode first, point it at a few past incidents, and compare its root-cause analysis with what your team actually found.

**Watch out for:** most accuracy and MTTR claims come from the vendors themselves. Treat autonomy as something you raise step by step: suggestions first, then automated actions only inside guardrails you define.

## 2. GitHub Agentic Workflows

[GitHub Agentic Workflows](https://github.github.io/gh-aw/) (`gh-aw`) runs a coding agent inside GitHub Actions on a schedule or an event. You write the workflow as Markdown: a short frontmatter for the trigger and the allowed outputs, then plain-language instructions. Here is the example from the official docs:

```markdown
---
on: daily
safe-outputs:
  create-issue:
---
Summarise yesterday's issues. Flag
anything that needs a reply.
```

`gh aw compile` turns that file into a pinned, validated Actions YAML workflow. Supported engines include GitHub Copilot, Claude Code, and Codex, and you can bring your own.

**Why it's interesting:** the security model is stricter than "give an LLM a token". The agent runs sandboxed and read-only, credentials stay behind an API proxy, and every write (an issue, a comment, a PR) goes through "safe outputs" applied by a separate job. In the project's words: "Agents read by default. Every write is checked before it lands." There are also cost limits such as `max-turns` and `max-daily-ai-credits`.

**Watch out for:** it is still a preview. Agents are non-deterministic, so start with tasks where a wrong answer is cheap: issue triage, daily summaries, flaky-test reports.

## 3. Terraform MCP Server

HashiCorp's [Terraform MCP Server](https://github.com/hashicorp/terraform-mcp-server) connects AI assistants to the Terraform Registry and to HCP Terraform or Terraform Enterprise. Instead of guessing provider arguments from training data, an agent can look up current provider docs and modules, and with a token it can list and manage workspaces, variables, and runs.

```bash
# Local, for an agent such as Claude Code (stdio transport)
docker run -i --rm hashicorp/terraform-mcp-server

# Shared, over Streamable HTTP (add TFE_ADDRESS and TFE_TOKEN for HCP Terraform / TFE)
docker run -p 8080:8080 --rm -e TRANSPORT_MODE=streamable-http -e TRANSPORT_HOST=0.0.0.0 hashicorp/terraform-mcp-server
```

You can limit what the agent sees with toolsets (`registry`, `registry-private`, `terraform`) or individual `--tools`.

**Watch out for:** the README warns that the server may expose Terraform data to the client and the model, so don't use it with untrusted clients or models. For a shared deployment, enable TLS and restrict allowed origins. Scalr, Spacelift, and env0 ship their own MCP servers too, [according to Scalr](https://scalr.com/learning-center/which-terraform-platform-has-the-best-mcp-server), so check what your IaC platform offers.

## 4. ingress2gateway 1.0 (because ingress-nginx is gone)

The community ingress-nginx controller was retired on March 24, 2026, as noted in the [Kubernetes v1.36 release post](https://kubernetes.io/blog/2026/04/22/kubernetes-v1-36-release/). Existing deployments keep running, but there are no more releases, bug fixes, or security patches. The Ingress API itself is not going away; only this controller is. (AKS's application routing add-on is an exception, with [critical security patches through November 2026](https://learn.microsoft.com/azure/aks/app-routing-nginx-to-gateway-api-migration).)

[ingress2gateway 1.0](https://kubernetes.io/blog/2026/03/20/ingress2gateway-1-0-release) is the official migration assistant to Gateway API. Its big change: support for ingress-nginx annotations went from 3 to over 30, including CORS, backend TLS, regex matching, and path rewrites.

```bash
brew install ingress2gateway   # or: go install github.com/kubernetes-sigs/ingress2gateway@v1.0.0

# Translate one namespace and review the output before applying it
ingress2gateway print --namespace my-api --providers=ingress-nginx > gwapi.yaml

# Optionally emit implementation-specific extensions
ingress2gateway print --providers=ingress-nginx --all-namespaces --emitter envoy-gateway > gwapi.yaml
```

**Rollout that works:** run Gateway API next to the existing Ingress, shift traffic gradually (weighted DNS or your load balancer), and only then delete the Ingress resources. Read every warning the tool prints. `configuration-snippet` can't be translated, `proxy-body-size` has no Gateway API equivalent, and regex matches come out case-insensitive.

If a full Gateway API migration is too big right now, the [CNCF's guide](https://cncf.io/blog/2026/07/09/navigating-the-ingress-nginx-retirement) describes a stopgap: keep your Ingress resources and switch to another controller such as Contour, translating the nginx annotations by hand.

## 5. Kubernetes v1.36: what matters for operators

[Kubernetes v1.36 "Haru"](https://kubernetes.io/blog/2026/04/22/kubernetes-v1-36-release/) shipped 70 enhancements (18 stable, 25 beta, 25 alpha). The ones most worth an operator's attention:

- **Security, now stable:** user namespaces in Pods, fine-grained kubelet API authorization, external signing of ServiceAccount tokens, and mutating admission policies written in CEL (no webhook server to run).
- **GPUs and AI workloads:** Dynamic Resource Allocation keeps maturing. Admin access and prioritized alternatives are stable; partitionable devices, consumable capacity, and device taints are beta.
- **Day-to-day:** volume group snapshots are stable, PSI (pressure) metrics are stable, and kubectl gets a `.kuberc` file for your own defaults (beta).
- **Plan for removals:** the `gitRepo` volume is now permanently disabled (use an init container or `git-sync`). Service `.spec.externalIPs` is deprecated, with removal planned for v1.43, because it enables man-in-the-middle attacks (CVE-2020-8554).

## 6. OpenTofu 1.12 and 1.13

The open-source Terraform fork keeps a steady release pace, per the [OpenTofu blog](https://opentofu.org/blog/):

- **1.11** (December 2025): ephemeral values and write-only attributes, so short-lived credentials never land in plans or state, plus an `enabled` meta-argument that replaces the `count = var.x ? 1 : 0` trick.
- **1.12** (May 14, 2026): `prevent_destroy` can now be dynamic, resources can be imported by identity, and provider installation causes less lock-file friction.
- **1.13** ([September 29, 2026](https://opentofu.org/blog/opentofu-1-13-0/)): official Windows on ARM64 builds, `convert` and `assume...` functions that reduce unknown values at plan time, and two experiments: built-in linting and Symbol Libraries for sharing values, functions, and types between modules.

**Should you switch?** If Terraform's Business Source License is a problem for your company, OpenTofu is a mature, drop-in option. If it isn't, the features above are still a useful view of where IaC is going.

## 7. Docker Hardened Images, now free

In [December 2025](https://www.docker.com/press-release/docker-makes-hardened-images-free-open-and-transparent-for-everyone/), Docker made its catalog of more than 1,000 hardened images free and open source under Apache 2.0, with no subscription required. They are built on Debian and Alpine with a distroless runtime, and every image ships with an SBOM, public CVE data, and SLSA Build Level 3 provenance. Docker also published hardened images for MCP servers such as GitHub, Grafana, and MongoDB.

**How to start:** swap the base image of one service, rebuild, and compare the scanner results before and after. Distroless images have no shell, so move debugging tools into a separate debug image or use ephemeral containers.

**What stays paid:** DHI Enterprise (CVE fix SLAs, FIPS and STIG images, customization) and Extended Lifecycle Support for images past upstream end of life.

## 8. OpenTelemetry eBPF Instrumentation (OBI)

[OBI](https://opentelemetry.io/docs/zero-code/obi/) uses eBPF to produce trace spans, RED metrics, and service-to-service relationships without touching application code or config. It covers Java, .NET, Go, Python, Ruby, Node.js, C, C++, and Rust, plus protocols such as HTTP/2, gRPC, Kafka, and MQTT and databases such as PostgreSQL, MySQL, and Redis. It can run on Kubernetes, in Docker, on plain Linux hosts, or as an OpenTelemetry Collector receiver.

**Why it matters:** it is the fastest way to get baseline tracing for services nobody wants to re-instrument, such as legacy apps, third-party binaries, or polyglot fleets.

**Watch out for:** it is still pre-1.0 (v0.15.x at the time of writing), and upgrades can rename spans and metric labels, which breaks dashboards. It needs Linux kernel 5.8+ (or RHEL 4.18+ with backports), BTF, and root or the right capabilities. Pin a version and read the upgrade notes.

## 9. Where to start

| If your problem is… | Try first |
| --- | --- |
| You still run ingress-nginx | ingress2gateway 1.0 in a dev cluster, this quarter |
| On-call is drowning in investigations | The AI SRE agent from your cloud or incident platform, in read-only mode |
| Your scanner reports hundreds of base-image CVEs | Docker Hardened Images for one service |
| Agents write Terraform that doesn't match current providers | Terraform MCP Server |
| Services with no tracing at all | OBI on a staging cluster |
| Repetitive repo chores (triage, summaries) | A single GitHub Agentic Workflow with safe outputs |

The common thread: give agents real data and tight permissions, and let them prove themselves on low-risk tasks before they touch production.

## Sources

Checked on October 24, 2026.

- [AWS DevOps Agent is now generally available](https://aws.amazon.com/about-aws/whats-new/2026/03/aws-devops-agent-generally-available) — AWS What's New
- [Azure SRE Agent GA message (AZ558321)](https://mc.merill.net/message/AZ558321) and [30-day trial (AZ569760)](https://mc.merill.net/message/AZ569760) — Microsoft 365 Message Center mirror
- [PagerDuty Spring 2026 Release](https://pagerduty.com/newsroom/pagerduty-operations-cloud-spring-2026-release) — PagerDuty newsroom
- [GitHub Agentic Workflows documentation](https://github.github.io/gh-aw/) — GitHub
- [hashicorp/terraform-mcp-server](https://github.com/hashicorp/terraform-mcp-server) — GitHub
- [Which Terraform platform has the best MCP server](https://scalr.com/learning-center/which-terraform-platform-has-the-best-mcp-server) — Scalr
- [Announcing Ingress2Gateway 1.0](https://kubernetes.io/blog/2026/03/20/ingress2gateway-1-0-release) — Kubernetes blog
- [Navigating the ingress-nginx retirement](https://cncf.io/blog/2026/07/09/navigating-the-ingress-nginx-retirement) — CNCF blog
- [AKS: migrate from NGINX to Gateway API](https://learn.microsoft.com/azure/aks/app-routing-nginx-to-gateway-api-migration) — Microsoft Learn
- [Kubernetes v1.36: Haru](https://kubernetes.io/blog/2026/04/22/kubernetes-v1-36-release/) — Kubernetes blog
- [OpenTofu blog](https://opentofu.org/blog/) and [OpenTofu v1.13.0](https://opentofu.org/blog/opentofu-1-13-0/) — OpenTofu
- [Docker makes hardened images free, open, and transparent](https://www.docker.com/press-release/docker-makes-hardened-images-free-open-and-transparent-for-everyone/) — Docker press release
- [OpenTelemetry eBPF Instrumentation docs](https://opentelemetry.io/docs/zero-code/obi/) — OpenTelemetry
