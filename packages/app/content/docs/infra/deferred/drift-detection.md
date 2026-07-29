---
title: Drift detection
description: Deferred — scheduled pulumi refresh/preview to catch out-of-band changes.
---

# Drift Detection

A scheduled CI job running `pulumi refresh --preview-only` (or `preview --refresh`) and alerting when live Azure/GitHub state diverges from the Pulumi program.

**Why deferred**

- Needs Azure + Pulumi credentials in a scheduled workflow — a standing secret surface. That is the whole of the objection.

The estate does change out of band, and a single operator is enough for it to happen: role assignments have gone missing from Azure while still recorded in state. Neither `preview` nor `up` reports that — both diff the program against state, so an `up` reporting `unchanged` says nothing about the live estate, and the gap surfaces only when something that reads as deployed fails at runtime with `Forbidden`. Operator count is therefore not the trigger it was assumed to be.

**Revisit when:** the scheduled job can authenticate without a standing secret — OIDC federation, or a refresh folded into a workflow that is already authenticated. [Pulumi is already the source of truth](/docs/infra/pulumi-source-of-truth), so the credential surface is the only remaining blocker.
