---
title: Roadmap
description: Open infrastructure work — every item links its proposal.
---

# Roadmap

Open work, each item linking its proposal — nothing is in progress right now. Ideas parked behind a revisit trigger live in [deferred](/docs/infra/deferred) instead. Rationale lives in [Cost & Security Posture](/docs/infra/optimization-review) and `packages/infra/docs/`.

## Next

- [ ] [Observability caps](/docs/proposals/infra/observability-caps) — measure ingestion, cap Log Analytics, sample App Insights
- [ ] [Pulumi source of truth](/docs/proposals/infra/pulumi-source-of-truth) — adopt Function App runtime + App Insights settings
- [ ] [Event Grid dead-letter](/docs/proposals/infra/eventgrid-dead-letter) — dead-letter container + replay script

## Blocked (app-side migration off key-based auth first)

- [ ] [Keyless auth hardening](/docs/proposals/infra/keyless-auth-hardening) — service-principal credentials in the app, then disable shared-key/local auth + network default-deny
