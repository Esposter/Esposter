---
title: Roadmap
description: Open infrastructure work — every item links its proposal.
---

# Roadmap

Open work, each item linking its proposal. Ideas parked behind a revisit trigger live in [deferred](/docs/infra/deferred) instead. Rationale lives in [Cost & Security Posture](/docs/infra/cost-and-security-posture) and `apps/infra/docs/`.

## In progress

- [ ] [Review collector](/docs/proposals/infra/review-collector) — the event-triggered, idempotent collector that drains CodeRabbit findings and ports `queue` windows onto `develop`
  - [ ] the `ai:coderabbit:collect` cycle and its workflow
  - [ ] the `REVIEW_COLLECTOR_TOKEN` secret declared in Pulumi and supplied to the stack
  - [ ] the `coderabbit` skill's pipelining and cutting pages rewritten around one `queue` branch

## Blocked (app-side migration off key-based auth first)

- [ ] [Keyless auth hardening](/docs/proposals/infra/keyless-auth-hardening) — service-principal credentials in the app, then disable shared-key/local auth + network default-deny
