# Infra

`apps/infra` manages Esposter's cloud footprint as Pulumi TypeScript. A single `prod` stack owns both the development and production Azure resource groups plus the GitHub repository settings (labels, environments, secrets, branch rulesets). Everything runs on free or near-free SKUs, and the whole estate is cost-guarded: `$0.01` budgets trigger Logic App automation that stops Function Apps and deletes Event Grid subscriptions the moment anything exits the free tier.

- [Azure Pulumi layout](azure-pulumi-layout/design.md) — how resources are laid out in Pulumi: one resource per file, ARM-aligned paths, provider split, naming convention.
- [Branch namespaces](branch-namespaces/design.md) — whose a branch is, read off its name alone, and the rulesets that make the name the rule.
- [Claude interface](claude-interface/README.md) — Claude Code given a personality, a voice and a working surface: a Genshin persona plugin picked by the calendar, replies spoken in each character's own cloned voice, a set of mods in the persona's colours, and the agent console that works the terminal's sessions from a page of the app.
- [Cost & Security Posture](cost-and-security-posture/design.md) — the budget guard cycle and why each hardening step is deliberately deferred.
- [Event Grid dead-letter](eventgrid-dead-letter/design.md) — failed deliveries land in a blob container whose writes push-trigger an automatic, attempt-capped replay.
- [Observability](observability/design.md) — why App Insights and Log Analytics are deliberately not provisioned, and what the estate relies on instead.
- [Pulumi source of truth](pulumi-source-of-truth/design.md) — Function App runtime settings managed in Pulumi.
- [Review](review/design.md) — how what lands on `ai/queue` is reviewed: read-only haiku reviewers over amount-capped windows, one haiku fixer, and `main` advanced to each reviewed window — replacing CodeRabbit and the review collector.
- [Typed decisions](typed-decisions/design.md) — which tier answers a gate, a severity or a triage, and why the cheapest session is the one never spawned.
- [Roadmap](../../changes/infra-roadmap/tasks.md) — open items (key-auth-gated hardening); every item links its proposal.
- [Deferred](../../deferred/infra/) — ideas waiting on a trigger.
- [Rejected](../../rejected/infra/) — ideas decided against, one page each.

Deeper operational reference lives beside the code in `apps/infra/docs/` (naming conventions, security constraints, search indexes, stacks), and Pulumi coding conventions live in the `pulumi-infra` skill.

## Shipped log

- **Pulumi adoption** — imported the manually-created Azure resources into Pulumi (one resource per file, `protect: true`).
- **Posture review** — cost / security / network / identity review; recorded constraints and follow-ups. → [Cost & Security Posture](cost-and-security-posture/design.md)
- **Safe cleanup** — Web PubSub trace ACL left as-is (Azure rejects ACL changes on `Free_F1`).
- **Storage safety** — disabled blob versioning (unused, paid), kept 7-day blob/container soft delete, kept `Standard_LRS`.
- **Observability cost controls** — `$0.01` guard budgets wired to Logic App stop/delete automation.
- **Workflow review** — mapped the Function App / Logic App / API connection / Event Grid automation into the stop-start + delete-restore free-tier guard cycle.
- **Managed identity / RBAC** — Azure Functions use `DefaultAzureCredential` with least-privilege role assignments adopted into Pulumi; the Railway-hosted app stays key-based (no Azure MSI path).
- **Stack rename + naming convention** — `dev` stack renamed to `prod`; adopted the CAF-aligned naming convention (`apps/infra/docs/azure/naming-conventions.md`).
- **Naming migration** — migrated all dev + prod resources (stateless, stateful, monitoring) to the convention with `parent` hierarchy, including storage/table/search data migration and the Railway endpoint cutover.
- **Provider split + GitHub** — split `src/azure/`; added `@pulumi/github` managing repo settings, labels, environments, and secrets (via ESC); migrated branch protection to a single `develop`+`main` ruleset with `required_approving_review_count: 0`.
- **Post-migration verification** — smoke-tested uploads, messages, push, search, Web PubSub, and function processing; confirmed the prod search indexer populated `messages-index`.
- **Event Grid dead-letter** — a deadletter container and a capped replay that its writes push-trigger. → [Event Grid dead-letter](eventgrid-dead-letter/design.md)
- **Observability removal** — deleted App Insights, Log Analytics, smart-detector rules, and scheduled-query alerts (dev + prod) to stay in the free tier; the `$0.01` budget guard is the cost ceiling. → [Observability](observability/design.md)
- **Pulumi source of truth** — adopted the Function Apps' runtime app settings into Pulumi; secrets flow from ESC. → [Pulumi source of truth](pulumi-source-of-truth/design.md)
- **Review** — CodeRabbit and the review collector replaced by one workflow in which no step waits on a person, and whose every limit is an amount rather than a time. → [Review](review/design.md)
- **Typed decisions** — issue triage runs on a typed-decision model rather than a session. → [Typed decisions](typed-decisions/design.md)
- **Branch namespaces** — a branch's name is the whole convention for who may create and push it, enforced by rulesets. → [Branch namespaces](branch-namespaces/design.md)
- **Every GitHub default declared** — the repository's Actions surface lives in the provider beside its refs, and CodeQL scans `main`. → [Azure Pulumi layout](azure-pulumi-layout/design.md)
- **Claude interface** — a persona plugin and spoken replies for one workspace package; the desktop stage stays two proposals behind a gate of use. → [Claude interface](claude-interface/README.md)
- **Agent console** — the terminal's working surface moved into a page of the app, its gaps to full parity named on the parity page. → [Agent console](claude-interface/agent-console/README.md)
- **Genshin mods** — the mods and the delegation guard run on the function hooks, so nothing is written into the person's settings. → [Genshin mods](claude-interface/genshin-mods/README.md)
