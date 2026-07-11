---
title: Pulumi preview in CI
description: Deferred — pulumi preview as a PR check on infra changes.
---

# Pulumi Preview in CI

Run `pulumi preview` on PRs touching `packages/infra` and comment the plan — catching destructive diffs before merge.

**Why deferred**

- Infra changes are single-operator and deployed manually with a local preview already in the loop.
- The preview needs live Azure read credentials in PR CI; with `persist-credentials: false` and narrow-permission jobs as the standing policy, adding a cloud-credentialed PR job is a deliberate trade not yet worth it.

**Revisit when:** infra PRs come from more than one person, or a bad diff slips through a manual preview.
