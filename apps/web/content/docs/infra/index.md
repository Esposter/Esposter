---
title: Infra
description: Azure infrastructure managed as Pulumi code — one prod stack covering dev and prod resource groups, a cost-guarded free-tier posture, and GitHub repository settings.
---

# Infra

`apps/infra` manages Esposter's cloud footprint as Pulumi TypeScript. A single `prod` stack owns both the development and production Azure resource groups plus the GitHub repository settings (labels, environments, secrets, branch rulesets). Everything runs on free or near-free SKUs, and the whole estate is cost-guarded: `$0.01` budgets trigger Logic App automation that stops Function Apps and deletes Event Grid subscriptions the moment anything exits the free tier.

- [Azure Pulumi layout](/docs/infra/azure-pulumi-layout) — how resources are laid out in Pulumi: one resource per file, ARM-aligned paths, provider split, naming convention.
- [Branch namespaces](/docs/infra/branch-namespaces) — whose a branch is, read off its name alone, and the rulesets that make the name the rule.
- [Claude interface](/docs/infra/claude-interface) — Claude Code given a personality, a voice and a working surface: a Genshin persona plugin picked by the calendar, replies spoken in each character's own cloned voice, and the agent console that works the terminal's sessions from a page of the app.
- [Cost & Security Posture](/docs/infra/cost-and-security-posture) — the budget guard cycle and why each hardening step is deliberately deferred.
- [Event Grid dead-letter](/docs/infra/eventgrid-dead-letter) — failed deliveries land in a blob container whose writes push-trigger an automatic, attempt-capped replay.
- [Observability](/docs/infra/observability) — why App Insights and Log Analytics are deliberately not provisioned, and what the estate relies on instead.
- [Pulumi source of truth](/docs/infra/pulumi-source-of-truth) — Function App runtime settings managed in Pulumi.
- [Review collector](/docs/infra/review-collector) — the event-triggered collector that drains CodeRabbit findings, cuts windows from `ai/queue` onto `develop`, sends what claims no review straight to `main`, and merges each release the moment its one review completes — never waiting on a person.
- [Typed decisions](/docs/infra/typed-decisions) — which tier answers a gate, a severity or a triage, and why the cheapest session is the one never spawned.
- [Roadmap](/docs/infra/roadmap) — open items (key-auth-gated hardening); every item links its proposal.
- [Deferred](/docs/infra/deferred) — ideas waiting on a trigger.
- [Rejected](/docs/infra/rejected) — ideas decided against, one page each.

Deeper operational reference lives beside the code in `apps/infra/docs/` (naming conventions, security constraints, search indexes, stacks), and Pulumi coding conventions live in the `pulumi-infra` skill.

## Shipped log

- **Pulumi adoption** — imported the manually-created Azure resources into Pulumi (one resource per file, `protect: true`).
- **Posture review** — cost / security / network / identity review; recorded constraints and follow-ups. → [Cost & Security Posture](/docs/infra/cost-and-security-posture)
- **Safe cleanup** — Web PubSub trace ACL left as-is (Azure rejects ACL changes on `Free_F1`).
- **Storage safety** — disabled blob versioning (unused, paid), kept 7-day blob/container soft delete, kept `Standard_LRS`.
- **Observability cost controls** — `$0.01` guard budgets wired to Logic App stop/delete automation.
- **Workflow review** — mapped the Function App / Logic App / API connection / Event Grid automation into the stop-start + delete-restore free-tier guard cycle.
- **Managed identity / RBAC** — Azure Functions use `DefaultAzureCredential` with least-privilege role assignments adopted into Pulumi; the Railway-hosted app stays key-based (no Azure MSI path).
- **Stack rename + naming convention** — `dev` stack renamed to `prod`; adopted the CAF-aligned naming convention (`apps/infra/docs/azure/naming-conventions.md`).
- **Naming migration** — migrated all dev + prod resources (stateless, stateful, monitoring) to the convention with `parent` hierarchy, including storage/table/search data migration and the Railway endpoint cutover.
- **Provider split + GitHub** — split `src/azure/`; added `@pulumi/github` managing repo settings, labels, environments, and secrets (via ESC); migrated branch protection to a single `develop`+`main` ruleset with `required_approving_review_count: 0`.
- **Post-migration verification** — smoke-tested uploads, messages, push, search, Web PubSub, and function processing; confirmed the prod search indexer populated `messages-index`.
- **Event Grid dead-letter** — a `deadletter` container that every application subscription dead-letters into once a tightened retry policy runs out, a lifecycle rule expiring what lands there, and a storage system topic that push-triggers the replay with an attempt cap and a quarantine prefix. → [Event Grid dead-letter](/docs/infra/eventgrid-dead-letter)
- **Observability removal** — deleted App Insights, Log Analytics, smart-detector rules, and scheduled-query alerts (dev + prod) to stay in the free tier; the `$0.01` budget guard is the cost ceiling. → [Observability](/docs/infra/observability)
- **Pulumi source of truth** — adopted the Function Apps' runtime app settings into Pulumi; secrets flow from ESC. → [Pulumi source of truth](/docs/infra/pulumi-source-of-truth)
- **Review collector** — the review pipeline moved off a person entirely: no step of it waits on one, and the only Azure-side cost was the collector token as a Pulumi-managed repository secret. → [Review collector](/docs/infra/review-collector)
- **Typed decisions** — the drain’s finding order and issue triage moved off a Claude Code session onto a typed-decision model, and the lockfile conflict a replay brings moved off one onto the code that already knew the answer. → [Typed decisions](/docs/infra/typed-decisions)
- **Branch namespaces** — the ref ownership the collector assumes became rulesets, and a branch's name became the whole convention for who may create and push it; the only cost was one prefix, `external/`, left open. → [Branch namespaces](/docs/infra/branch-namespaces)
- **Every GitHub default declared** — the repository's Actions surface moved into the provider beside its refs, so the only GitHub state a preview cannot prove is the one rule parameter the provider has no field for; CodeQL came with it, scanning `main` alone so an open alert is a red the [review collector](/docs/infra/review-collector/repair) repairs. → [Azure Pulumi layout](/docs/infra/azure-pulumi-layout)
- **Claude interface** — the terminal got a personality and a voice for one workspace package and nothing in the estate: replies read in a clone of each character's own voice by an engine the plugin installs into its state directory, with the desktop stage left as two proposals behind a gate of use rather than built early; nothing was added that a rewrite of the terminal would ever have to carry. → [Claude interface](/docs/infra/claude-interface)
- **Agent console** — the terminal's working surface moved into a page of the app, with the gaps to full parity named on its parity page: one published host package on the person's own machine and one route, nothing in the estate, and every session still the terminal's own to resume. → [Agent console](/docs/infra/claude-interface/agent-console)
