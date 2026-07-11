---
title: Roadmap
description: Open infrastructure work — all deferred-with-trigger, nothing in flight.
---

# Roadmap

All items are deferred-with-trigger; there is no active wave. Rationale lives in /docs/infra/optimization-review and `packages/infra/docs/`.

## Next

- [ ] **Observability caps** — measure Log Analytics / App Insights ingestion, then set daily caps + sampling (currently uncapped, `dailyQuotaGb: -1`).
- [ ] **Pulumi as full source of truth** — move Function App runtime settings + App Insights connection settings into Pulumi.
- [ ] **Event Grid dead-letter** — design a dead-letter storage target + replay process, then enable dead-letter destinations.

## Blocked (app-side migration off key-based auth first)

- [ ] **Security hardening** — disable storage shared-key / blob public access / Search + Event Grid local auth; set storage network default-deny. Each is gated on the app moving off key-based auth — see `packages/infra/docs/azure/security-constraints.md` for the code path holding each one open.
