# Infrastructure Phase 2 Optimization

This feature plan tracks infrastructure cost, security, and operational optimization after the Azure resources were adopted into Pulumi.

## Goals

- Reduce unnecessary Azure spend.
- Tighten public access, local auth, callback URL, and managed identity posture.
- Keep observability useful while adding sensible ingestion and retention limits.
- Preserve current Azure resource names unless a separate rename migration is planned.
- Make one small Pulumi change at a time with preview review before apply.

## References

- `packages/infra/docs/overview.md`
- `packages/infra/docs/naming-conventions.md`
- `packages/infra/docs/optimization-review.md`
- `packages/infra/docs/roadmap.md`
- `packages/infra/docs/security-constraints.md`
- `packages/infra/docs/stacks.md`

## Work Items

- [ ] Capture a clean baseline with `pnpm infra:preview`.
- [x] Document current blockers for storage shared key access, storage blob public access, Search local auth, Event Grid local auth, Web PubSub public client access, Web PubSub local auth/REST API, and storage deny-by-default network rules.
- [x] Remove public Web PubSub Trace access.
- [x] Fix Speech Services `Application` tag alignment.
- [ ] Review storage account lifecycle and redundancy.
- [ ] Plan storage migration away from shared-key SAS generation before disabling shared key access.
- [x] Review Web PubSub public ACL request types, local auth, and SKU without blocking browser client access.
- [ ] Review Function App hosting plans, inbound access, runtime settings, and managed identity permissions.
- [ ] Review Logic Apps, API connections, action groups, callback URL handling, and control-plane permissions.
- [ ] Review budgets, notification thresholds, and automated stop/delete actions.
- [ ] Review Event Grid retry policy, event filters, and dead-letter needs.
- [ ] Review Log Analytics and Application Insights retention, daily caps, public ingestion, and sampling.
- [ ] Review Cognitive Search and Speech Services public access, local auth, SKU, and usage.
- [ ] Plan Search and Event Grid managed-identity migrations before disabling local auth.
- [ ] Document accepted risks and intentional exceptions in `packages/infra/docs/optimization-review.md`.
