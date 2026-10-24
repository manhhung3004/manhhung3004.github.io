---
title: Event-Driven Scaling with KEDA
date: 2026-03-21
description: Lessons from autoscaling workloads based on queue depth in Kubernetes.
---

Traditional HPA works well with CPU and memory, but event-driven workloads need queue-aware autoscaling. KEDA provides a clean model to scale based on business events.

## Implementation approach

- Connect KEDA triggers to Redis queue depth.
- Define safe min/max replica bounds for burst handling.
- Combine with Knative for scale-to-zero where suitable.

## What to watch

- Lag between trigger detection and pod readiness.
- Cold-start cost when scaling from zero.
- Queue policy and retry behavior to avoid message storms.
