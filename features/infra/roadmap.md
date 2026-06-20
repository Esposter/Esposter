# Infrastructure — Roadmap

Prioritized backlog. All items are deferred-with-trigger (no active wave); rationale lives in [`packages/infra/docs/`](../../packages/infra/docs) and [reference/optimization-review.md](reference/optimization-review.md) — not repeated here. Check off and sweep to README `## Shipped` when done.

## Loose ends (migration follow-up)

- [ ] Post-migration smoke tests — uploads, messages, push, search, Web PubSub, function processing.
- [ ] Verify the prod search indexer populated `messages-index`.

## Next

- [ ] **Observability caps** — measure Log Analytics / App Insights ingestion, then set daily caps + sampling (currently uncapped, `dailyQuotaGb: -1`).
- [ ] **Pulumi as full source of truth** — move Function App runtime settings + App Insights connection settings into Pulumi.
- [ ] **Event Grid dead-letter** — design a dead-letter storage target + replay process, then enable dead-letter destinations.

## Blocked (app-side migration off key-based auth first)

- [ ] **Security hardening** — disable storage shared-key / blob public access / Search + Event Grid local auth; set storage network default-deny. Each is gated on the app moving off key-based auth — see [`packages/infra/docs/azure/security-constraints.md`](../../packages/infra/docs/azure/security-constraints.md).
