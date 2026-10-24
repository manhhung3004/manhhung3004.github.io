---
title: Observability Stack in Practice
date: 2026-03-21
description: Monitoring and log strategy with Prometheus, Grafana, Loki, and ELK.
---

Observability is about answering unknown questions during incidents. A practical stack should connect metrics, logs, and alert context in one operational flow.

## Stack components

- Prometheus for time-series metrics and alert rules.
- Grafana for dashboarding, SLO tracking, and alert visual context.
- Loki and ELK for centralized log indexing and correlation.

## Operational notes

- Define dashboards by service ownership, not by infrastructure layer only.
- Alert on symptoms first, then enrich with root-cause hints.
- Keep retention and cardinality under control to avoid noisy systems.
