---
title: Drift detection
description: Deferred — scheduled pulumi refresh/preview to catch out-of-band changes.
---

# Drift Detection

A scheduled CI job running `pulumi refresh --preview-only` (or `preview --refresh`) and alerting when live Azure/GitHub state diverges from the Pulumi program.

**Why deferred**

- Needs Azure + Pulumi credentials in a scheduled workflow — a standing secret surface for a single-operator estate that rarely changes out-of-band.

**Revisit when:** more than one person operates the infrastructure. [Pulumi is already the source of truth](/docs/infra/pulumi-source-of-truth), so the remaining blocker is only the standing credential surface.
