# Infra

`apps/infra` manages Esposter's cloud footprint as Pulumi TypeScript. A single `prod` stack owns the Cloudflare account's resources (the zone and its records, the R2 buckets, the D1 databases, the queues and their dead-letter queues, the Workers' custom domains) and the GitHub repository settings (labels, environments, secrets, branch rulesets). The Workers' code is not a Pulumi resource: Wrangler deploys it from CI.

- [Pulumi layout](pulumi-layout/design.md) — how resources are laid out in Pulumi: one resource per file, folders by resource type, names built by one function, the provider split.
- [Pulumi source of truth](pulumi-source-of-truth/design.md) — the Workers' configuration, declared in code, with its secrets read from the secrets environment.
- [Branch namespaces](branch-namespaces/design.md) — whose a branch is, read off its name alone, and the rulesets that make the name the rule.
- [Claude interface](claude-interface/README.md) — Claude Code given a personality and a voice: a Genshin persona plugin picked by the calendar, replies spoken in each character's own cloned voice, and a set of mods in the persona's colours.
- [Cost & Security Posture](cost-and-security-posture/design.md) — the cost ceiling the estate runs under, and the posture decisions it keeps on purpose.
- [Observability](observability/design.md) — why no paid telemetry is provisioned, and what the estate relies on instead.
- [Review](review/design.md) — how what lands on `ai/queue` is reviewed: read-only haiku reviewers over amount-capped windows, one haiku fixer, and `main` advanced to each reviewed window — replacing CodeRabbit and the review collector.
- [Typed decisions](typed-decisions/design.md) — which tier answers a gate, a severity or a triage, and why the cheapest session is the one never spawned.
- [Deferred](../../deferred/infra/) — ideas waiting on a trigger.
- [Rejected](../../rejected/infra/) — ideas decided against, one page each.

Deeper operational reference lives beside the code in `apps/infra/docs/` (the Cloudflare naming conventions, the stacks), and Pulumi coding conventions live in the `pulumi-infra` skill.

## Shipped log

- **Review** — CodeRabbit and the review collector replaced by one workflow in which no step waits on a person, and whose every limit is an amount rather than a time. → [Review](review/design.md)
- **Typed decisions** — issue triage runs on a typed-decision model rather than a session. → [Typed decisions](typed-decisions/design.md)
- **Branch namespaces** — a branch's name is the whole convention for who may create and push it, enforced by rulesets. → [Branch namespaces](branch-namespaces/design.md)
- **Every GitHub default declared** — the repository's Actions surface lives in the provider beside its refs, and CodeQL scans `main`. → [Pulumi layout](pulumi-layout/design.md)
- **Claude interface** — a persona plugin and spoken replies for one workspace package; the desktop stage stays two proposals behind a gate of use. → [Claude interface](claude-interface/README.md)
- **Genshin mods** — the mods and the delegation guard run on the function hooks, so nothing is written into the person's settings. → [Genshin mods](claude-interface/genshin-mods/README.md)
- **Agent console retirement** — the console's code, specs and ideas are removed and the host package is unpublished from npm; the executable stays on the releases that carried it. → [Agent console](../../rejected/infra/agent-console/design.md)
- **Pulumi preview in CI** — every push to `ai/queue` that touches `apps/infra` previews the plan against the prod stack over OIDC, with no stored cloud credential. → [Pulumi infrastructure](../../../.agents/skills/pulumi-infra/SKILL.md)
