---
title: Roadmap
description: Open infrastructure work — every item links its proposal.
---

# Roadmap

All items are deferred-with-trigger; there is no active wave. Rationale lives in [/docs/infra/optimization-review](/docs/infra/optimization-review) and `packages/infra/docs/`.

## Next

- [ ] [Observability caps](/docs/proposals/infra/observability-caps) — measure ingestion, cap Log Analytics, sample App Insights
- [ ] [Pulumi source of truth](/docs/proposals/infra/pulumi-source-of-truth) — adopt Function App runtime + App Insights settings
- [ ] [Event Grid dead-letter](/docs/proposals/infra/eventgrid-dead-letter) — dead-letter container + replay script

## Blocked (app-side migration off key-based auth first)

- [ ] [Keyless auth hardening](/docs/proposals/infra/keyless-auth-hardening) — service-principal credentials in the app, then disable shared-key/local auth + network default-deny
