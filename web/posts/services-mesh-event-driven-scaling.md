---
title: "Project: Services Mesh & Event-Driven Scaling"
date: 2026-03-21
description: Kubernetes, Istio, Knative scale-to-zero, and KEDA event-driven autoscaling in a production-like cluster.
---

![Services Mesh and Event-Driven Scaling](/images/MicroServices-1.png)

This project simulates a production-grade environment by combining Kubernetes infrastructure, Istio service mesh, Knative scale-to-zero behavior, and KEDA event-driven autoscaling. It focuses on reliability, security, and resource-efficient scaling under dynamic workloads.

## Key contributions

- **Infrastructure Architecture** — Built a multi-node Kubernetes cluster to model production-like deployment behavior.
- **Service Mesh Integration** — Implemented Istio for advanced traffic routing, mTLS security, and deep observability.
- **Scale-to-Zero Optimization** — Applied Knative Serving to reduce idle CPU/RAM consumption during low-traffic periods.

## Autoscaling & monitoring

- KEDA-driven autoscaling triggered by Redis queue depth
- Real-time scaling and health dashboards with Prometheus and Grafana
- Event-driven workload handling for bursty traffic scenarios

## Core stack

- Kubernetes, Istio, Knative, KEDA, Redis
- Prometheus, Grafana, event-driven scaling workflows
- Production-grade reliability and security simulation in a self-managed cluster
