---
title: "Cloud Native in Late 2026: Where It Stands and Where Kubernetes Is Heading"
date: 2026-10-25
tags: [Kubernetes, AI, Observability, Security]
description: What cloud native means today, the numbers behind it, ten trends worth your attention, and what the last four Kubernetes releases say about where the platform is going.
---

Cloud native has quietly changed its center of gravity. Five years ago the conversation was about containers and microservices. In 2026 it is about running AI inference on Kubernetes, replacing aging building blocks such as ingress-nginx, and making clusters secure by default. This post is a map of where things stand as of late October 2026, with a source for every number.

## What "cloud native" means today

The CNCF's [official definition](https://github.com/cncf/toc/blob/main/DEFINITION.md) describes cloud native as building and running workloads "at scale, programmatically and repeatably" across public, private, and hybrid clouds, using "loosely coupled systems that interoperate in a manner that is secure, resilient, manageable", sustainable, and observable. The typical building blocks it names are containers, service meshes, multi-tenancy, microservices, immutable infrastructure, serverless, and declarative APIs.

The ecosystem behind that definition keeps growing. The CNCF currently lists [154 sandbox projects](https://www.cncf.io/sandbox-projects/), and several important projects moved up a level in 2026:

| Project | What it does | Milestone |
| --- | --- | --- |
| [Karmada](https://www.cncf.io/announcements/2026/09/07/cloud-native-computing-foundation-announces-karmada-graduation/) | Multi-cluster orchestration | Graduated, September 2026 |
| [Kubeflow](https://www.cncf.io/announcements/2026/08/17/cncf-announces-kubeflows-graduation-solidifying-the-standard-for-cloud-native-ai-operations/) | ML lifecycle on Kubernetes | Graduated, August 2026 |
| [Kyverno](https://www.cncf.io/announcements/2026/03/24/cloud-native-computing-foundation-announces-kyvernos-graduation/) | Kubernetes-native policy engine | Graduated, March 2026 |
| [llm-d](https://www.cncf.io/blog/2026/03/24/welcome-llm-d-to-the-cncf-evolving-kubernetes-into-sota-ai-infrastructure/) | Distributed LLM inference | Joined the Sandbox, March 2026 |
| [Tekton](https://www.cncf.io/projects/tekton/) | Kubernetes-native CI/CD | Accepted as incubating, March 2026 |

## The numbers

**Kubernetes is the default.** The [CNCF 2025 Annual Cloud Native Survey](https://www.cncf.io/announcements/2026/01/20/kubernetes-established-as-the-de-facto-operating-system-for-ai-as-production-use-hits-82-in-2025-cncf-annual-cloud-native-survey/), published in January 2026, found:

- **82%** of container users run Kubernetes in production, up from 66% in 2023.
- **98%** of organizations use cloud native techniques, and **59%** say much or nearly all of their development and deployment is cloud native.
- **66%** of organizations that host generative AI models use Kubernetes for some or all of their inference. Yet **44%** don't run AI/ML on Kubernetes at all yet, and only **7%** deploy models daily.
- The biggest obstacle is **culture (47%)**, ahead of lack of training (36%), security (36%), and complexity (34%).

**There are more cloud native developers than ever.** CNCF and SlashData's [Q1 2026 report](https://www.cncf.io/announcements/2026/03/24/cncf-and-slashdata-report-finds-cloud-native-community-reaches-nearly-20-million-developers/) counts **19.9 million** cloud native developers, about 39% of all developers and 28% more than in Q3 2025. **88%** of backend developers now use some form of infrastructure standardization, up from 80%.

The pattern is clear: Kubernetes has won the platform layer, and the open questions have moved up the stack, to AI workloads, developer platforms, and the people who run them.

## Ten trends worth your attention

### 1. Kubernetes is becoming the operating system for AI

- **Hardware-aware scheduling is now core.** [Dynamic Resource Allocation](https://kubernetes.io/blog/2025/08/27/kubernetes-v1-34-release/) (DRA), the API for requesting GPUs and other devices, reached GA in v1.34. In [v1.37](https://kubernetes.io/blog/2026/08/26/kubernetes-v1-37-release/), more DRA features went stable: extended-resource requests without a device plugin, device taints, device status, and a `numaNode` attribute.
- **A conformance standard for AI platforms.** The CNCF launched [Certified Kubernetes AI Conformance](https://www.cncf.io/announcements/2025/11/11/cncf-launches-certified-kubernetes-ai-conformance-program-to-standardize-ai-workloads-on-kubernetes/) in November 2025. By March 2026, certified platforms had grown [from 18 to 31](https://www.cncf.io/announcements/2026/03/24/cncf-nearly-doubles-certified-kubernetes-ai-platforms/). The latest requirements also cover in-place pod resize, workload-aware scheduling, sandboxed agent workloads, inference ingress, and disaggregated inference.
- **An inference stack is taking shape.** The [Gateway API Inference Extension](https://kubernetes.io/blog/2025/06/05/introducing-gateway-api-inference-extension/) adds model-aware routing to Gateway API and has reached v1.0. [llm-d](https://www.cncf.io/blog/2026/03/24/welcome-llm-d-to-the-cncf-evolving-kubernetes-into-sota-ai-infrastructure/) is its primary implementation, with prefill/decode disaggregation and KV-cache-aware routing. [KServe](https://www.cncf.io/blog/2025/11/11/kserve-becomes-a-cncf-incubating-project/) is a CNCF incubating project, and vLLM, the most common inference engine underneath, is hosted by the [PyTorch Foundation](https://pytorch.org/blog/pytorch-foundation-welcomes-vllm/).

**What to do:** if you run GPUs, move from device plugins toward DRA, and check whether your platform is AI-conformant before you commit to it.

### 2. Gateway API replaces Ingress

The community **ingress-nginx controller was retired on March 24, 2026**: no more releases, fixes, or security patches ([announcement](https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/)). The Ingress API itself stays GA but is [frozen](https://kubernetes.io/docs/concepts/services-networking/ingress/), and Gateway API is the recommended path. Gateway API keeps maturing: [v1.5](https://kubernetes.io/blog/2026/04/21/gateway-api-v1-5/) moved ListenerSet, TLSRoute, CORS, and frontend mTLS into the Standard channel, and the current [v1.6 line](https://github.com/kubernetes-sigs/gateway-api/releases) makes TCPRoute and UDPRoute GA.

**What to do:** if you still run ingress-nginx, you're running unpatched edge software. Plan the migration with ingress2gateway and run both side by side before you cut over.

### 3. Sidecarless meshes and eBPF networking

Istio's sidecarless [ambient mode](https://istio.io/latest/blog/2024/ambient-reaches-ga/) has been GA since v1.24, though ambient [multi-network multicluster](https://istio.io/latest/blog/2026/ambient-multinetwork-multicluster-beta/) is still beta and not ready for production. On the eBPF side, [Cilium 1.20](https://www.cncf.io/blog/2026/09/14/cilium-1-20-gateway-api-externalauth-tcproute-udproute-eni-ipam-for-ipv6-and-more/) (September 2026) moved to Gateway API v1.6, added ClusterNetworkPolicy support, and shrank its CNI binary from 76 MB to 16 MB.

### 4. Platform engineering goes mainstream

According to CNCF and SlashData's [platform engineering radar](https://www.cncf.io/announcements/2026/03/24/cncf-and-slashdata-report-finds-platform-engineering-tools-maturing-as-organizations-prepare-for-ai-driven-infrastructure/), **28%** of organizations have a dedicated platform team and **41%** build their internal developer platform as a multi-team effort. Tools in the "adopt" ring include Helm, Backstage, and kro for application delivery; Argo CD and GitHub Actions for workflow automation; and cert-manager, Keycloak, and OPA for security. Backstage is the [fifth most active](https://www.cncf.io/announcements/2026/01/20/kubernetes-established-as-the-de-facto-operating-system-for-ai-as-production-use-hits-82-in-2025-cncf-annual-cloud-native-survey/) CNCF project by development velocity.

### 5. GitOps is how mature teams deploy

The CNCF survey found that **58%** of "innovator" organizations use GitOps extensively, against **23%** of "adopters". The tools keep moving: Argo CD is on the [3.x line](https://github.com/argoproj/argo-cd/releases) with fine-grained RBAC and lower memory use, and Flux [2.8](https://fluxcd.io/blog/2026/02/flux-v2.8.0/) added Helm v4 support, followed by a CLI plugin system in 2.9.

### 6. OpenTelemetry everywhere, now with profiles

OpenTelemetry is the **second most active** CNCF project, with more than 24,000 contributors. Traces, metrics, and logs are stable, and [profiles entered public alpha](https://opentelemetry.io/blog/2026/profiles-alpha/) in 2026, with an eBPF profiler that runs as a Collector receiver. [OpenTelemetry eBPF Instrumentation](https://opentelemetry.io/blog/2026/obi-goals/) (OBI) gives zero-code traces and metrics and aims for a stable 1.0 in 2026.

### 7. Secure by default

Kubernetes [v1.36](https://kubernetes.io/blog/2026/04/22/kubernetes-v1-36-release/) made **user namespaces**, **Mutating Admission Policies** (written in CEL, with no webhook to run), and fine-grained kubelet API authorization GA. It also removed the `gitRepo` volume and deprecated `Service.spec.externalIPs` (CVE-2020-8554), with removal planned for v1.43. Around the cluster, Kyverno graduated, [SLSA v1.2](https://slsa.dev/blog/2025/11/announce-slsa-v1.2) added a Source Track, and [Cosign v3](https://blog.sigstore.dev/cosign-3-0-available/) made the new bundle format the default.

### 8. AI agents in operations, and how to secure them

Agents are arriving in operations: [kagent](https://www.cncf.io/projects/kagent/) and the AI SRE agent [HolmesGPT](https://www.cncf.io/projects/holmesgpt/) are both CNCF Sandbox projects. The CNCF's [cloud native agentic standards](https://www.cncf.io/blog/2026/03/23/cloud-native-agentic-standards/) recommend giving each agent its own workload identity (SPIFFE or a service account), short-lived credentials, mTLS, least privilege, and a tool allow-list. A recent CNCF post on [evaluating AI SREs](https://www.cncf.io/blog/2026/10/21/before-you-evaluate-an-ai-sre-give-your-existing-agent-context/) adds: start them with a read-only identity, without `exec` or Secret access.

### 9. Multi-cluster and edge are graduating

[Karmada](https://www.cncf.io/announcements/2026/09/07/cloud-native-computing-foundation-announces-karmada-graduation/) graduated in September 2026 with more than 1,200 contributors from 292 organizations, joining [KubeEdge](https://www.cncf.io/projects/kubeedge/), which graduated in 2024. Running many clusters as one fleet is no longer an exotic setup.

### 10. Cost and carbon become signals

[OpenCost](https://www.cncf.io/projects/opencost/) is an incubating project for Kubernetes cost allocation. [Kepler](https://www.cncf.io/blog/2026/06/30/kepler-re-architected-improved-power-accuracy-and-a-community-call-to-action/), which estimates power use, was re-architected in 2026 for better accuracy, and there is a [proposal](https://www.cncf.io/blog/2026/10/15/carbon-as-a-first-class-signal-bringing-software-carbon-intensity-to-opentelemetry/) to make software carbon intensity a first-class OpenTelemetry signal.

**Also worth watching:** WebAssembly on Kubernetes, through [wasmCloud](https://www.cncf.io/projects/wasmcloud/) (incubating) and [SpinKube](https://www.cncf.io/projects/spinkube/) (sandbox).

## Where Kubernetes is heading

Kubernetes ships about three minor releases a year, each supported for about a year. The [supported releases](https://kubernetes.io/releases/) today are 1.37, 1.36, and 1.35. **v1.34 reaches end of life on October 27, 2026.**

| Release | Date | Enhancements | Highlights |
| --- | --- | --- | --- |
| [v1.34 "Of Wind & Will"](https://kubernetes.io/blog/2025/08/27/kubernetes-v1-34-release/) | Aug 27, 2025 | 58 | DRA core GA; swap (`LimitedSwap`) GA; KYAML alpha |
| [v1.35 "Timbernetes"](https://kubernetes.io/blog/2025/12/17/kubernetes-v1-35-release/) | Dec 17, 2025 | 60 | In-place pod resize GA; kubelet fails on cgroup v1 by default; IPVS mode deprecated; last release supporting containerd 1.x |
| [v1.36 "Haru"](https://kubernetes.io/blog/2026/04/22/kubernetes-v1-36-release/) | Apr 22, 2026 | 70 | User namespaces, Mutating Admission Policies, OCI image volumes GA; gang scheduling alpha; `gitRepo` removed |
| [v1.37 "Garhwal"](https://kubernetes.io/blog/2026/08/26/kubernetes-v1-37-release/) | Aug 26, 2026 | 67 | KYAML, Pod Certificates, StorageVersionMigration GA; HPA scale-to-zero and gang scheduling beta; kube-dns deprecated |

Read across those four releases and four directions stand out:

1. **AI-native scheduling.** DRA went GA and keeps gaining features, gang and workload-aware scheduling moved from alpha to beta, and HPA can now scale to zero. Kubernetes is learning to schedule groups of pods and expensive hardware, not just individual containers.
2. **Secure by default.** User namespaces, admission policies without webhooks, finer kubelet authorization, and built-in pod certificates all landed as stable features.
3. **Less YAML pain.** In-place pod resize and KYAML, a stricter YAML subset that avoids classic YAML pitfalls, both went GA.
4. **Removing the past.** cgroup v1, containerd 1.x, IPVS mode, kube-dns, `externalIPs`, and the `gitRepo` volume are all on their way out. IPVS is planned to be off by default in v1.40 and removed in v1.43.

**Next up:** [v1.38](https://github.com/kubernetes/sig-release/tree/master/releases/release-1.38) is planned for **December 16, 2026**, with code freeze on November 16. Its feature list isn't published yet, but the alpha work already shipped in v1.37 points the way: richer workload-aware scheduling APIs, scheduler preemption that understands in-place resize, and node-level DRA allocation.

## What to do this quarter

- [ ] Upgrade off v1.34 (end of life October 27, 2026) to a supported release
- [ ] Make sure every node runs cgroup v2 and containerd 2.x
- [ ] Replace ingress-nginx with a Gateway API implementation
- [ ] Plan the move from kube-proxy IPVS mode to nftables, and from kube-dns to CoreDNS
- [ ] Remove any use of `Service.spec.externalIPs` and `gitRepo` volumes
- [ ] For GPU workloads, evaluate DRA and check that your platform is AI-conformant
- [ ] Standardize telemetry on OpenTelemetry before adding more vendor agents
- [ ] Give every AI agent its own identity, short-lived credentials, and read-only access to start

## Coming up

[KubeCon + CloudNativeCon North America 2026](https://www.cncf.io/announcements/2026/08/10/cncf-reveals-kubecon-cloudnativecon-north-america-2026-schedule-adds-new-ai-inference-agentic-track/) runs **November 9–12 in Salt Lake City**, with a new AI Inference + Agentic track. Expect the next round of AI conformance and inference announcements there.

## Sources

Checked on October 24–25, 2026. Project counts come from CNCF project pages; the survey's sample size is not stated in its announcement.

- [CNCF cloud native definition](https://github.com/cncf/toc/blob/main/DEFINITION.md) — CNCF TOC
- [CNCF 2025 Annual Cloud Native Survey](https://www.cncf.io/announcements/2026/01/20/kubernetes-established-as-the-de-facto-operating-system-for-ai-as-production-use-hits-82-in-2025-cncf-annual-cloud-native-survey/) — CNCF, January 20, 2026
- [State of Cloud Native Development Q1 2026](https://www.cncf.io/announcements/2026/03/24/cncf-and-slashdata-report-finds-cloud-native-community-reaches-nearly-20-million-developers/) and [platform engineering radar](https://www.cncf.io/announcements/2026/03/24/cncf-and-slashdata-report-finds-platform-engineering-tools-maturing-as-organizations-prepare-for-ai-driven-infrastructure/) — CNCF and SlashData, March 24, 2026
- [Certified Kubernetes AI Conformance launch](https://www.cncf.io/announcements/2025/11/11/cncf-launches-certified-kubernetes-ai-conformance-program-to-standardize-ai-workloads-on-kubernetes/) and [March 2026 update](https://www.cncf.io/announcements/2026/03/24/cncf-nearly-doubles-certified-kubernetes-ai-platforms/) — CNCF
- Kubernetes release posts: [v1.34](https://kubernetes.io/blog/2025/08/27/kubernetes-v1-34-release/), [v1.35](https://kubernetes.io/blog/2025/12/17/kubernetes-v1-35-release/), [v1.36](https://kubernetes.io/blog/2026/04/22/kubernetes-v1-36-release/), [v1.37](https://kubernetes.io/blog/2026/08/26/kubernetes-v1-37-release/); [release schedule](https://kubernetes.io/releases/); [v1.38 plan](https://github.com/kubernetes/sig-release/tree/master/releases/release-1.38)
- [Ingress NGINX retirement](https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/) and [Gateway API v1.5](https://kubernetes.io/blog/2026/04/21/gateway-api-v1-5/) — Kubernetes blog
- [Welcome llm-d to the CNCF](https://www.cncf.io/blog/2026/03/24/welcome-llm-d-to-the-cncf-evolving-kubernetes-into-sota-ai-infrastructure/) and [KServe becomes incubating](https://www.cncf.io/blog/2025/11/11/kserve-becomes-a-cncf-incubating-project/) — CNCF blog
- [Istio ambient GA](https://istio.io/latest/blog/2024/ambient-reaches-ga/) and [Cilium 1.20](https://www.cncf.io/blog/2026/09/14/cilium-1-20-gateway-api-externalauth-tcproute-udproute-eni-ipam-for-ipv6-and-more/)
- [OpenTelemetry profiles alpha](https://opentelemetry.io/blog/2026/profiles-alpha/) and [OBI 2026 goals](https://opentelemetry.io/blog/2026/obi-goals/)
- [Cloud native agentic standards](https://www.cncf.io/blog/2026/03/23/cloud-native-agentic-standards/) — CNCF AI TCG
- [Karmada](https://www.cncf.io/announcements/2026/09/07/cloud-native-computing-foundation-announces-karmada-graduation/), [Kubeflow](https://www.cncf.io/announcements/2026/08/17/cncf-announces-kubeflows-graduation-solidifying-the-standard-for-cloud-native-ai-operations/), and [Kyverno](https://www.cncf.io/announcements/2026/03/24/cloud-native-computing-foundation-announces-kyvernos-graduation/) graduation announcements — CNCF
