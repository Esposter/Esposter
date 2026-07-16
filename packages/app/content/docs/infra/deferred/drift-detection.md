---
title: Drift detection
description: Deferred — scheduled pulumi refresh/preview to catch out-of-band changes.
---

# Drift Detection

A scheduled CI job running `pulumi refresh --preview-only` (or `preview --refresh`) and alerting when live Azure/GitHub state diverges from the Pulumi program.

**Why deferred**

- Meaningful only after [Pulumi becomes the full source of truth](/docs/proposals/infra/pulumi-source-of-truth) — until then it would permanently report the known Function App settings drift.
- Needs Azure + Pulumi credentials in a scheduled workflow — a standing secret surface for a single-operator estate that rarely changes out-of-band.

**Revisit when:** the source-of-truth proposal lands and more than one person operates the infrastructure.
