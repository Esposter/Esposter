---
name: no-compatibility-debt
description: Apply when planning, building or reviewing a refactor, a migration, a rename, a schema or data-shape change, or a proposal, plan or agent brief that stages one, and whenever a change would keep an old name, shape, path or behaviour working beside its replacement. Esposter's no-compatibility-debt rule — the old form is deleted in the change that replaces it, never aliased, adapted or kept side by side, even for one phase of a plan.
---

# No Compatibility Debt

Nothing in this repository keeps an older version of itself working. The argument, the correction flow and what it rules out are `openspec/specs/architecture/no-compatibility-debt/design.md`; this skill is the trigger that puts that page in front of a session while it is still planning, and the index of the skills that own each narrower case.

## Settled — do not re-propose

- **A migration staged behind a compatibility path** — an adapter that runs the old shape beside the new until a later phase deletes it. It is the same second code path that design refuses, only scheduled; the plan's own "phase 3 deletes it" is the step that slips. The user ruled it out for the kit framework on 2026-10-11.
- **"Both shapes for now" because the move is large.** Size is a reason to script the move, never to keep two shapes.

## Rules

- **Read a plan for a second shape before building it.** A proposal, a refactor plan or a brief that keeps an old form working for any stretch — an adapter, a shim, a dual read path, a flag between two implementations, a deprecation window — is revised first (the `building-proposals` skill, `references/building.md`).
- **A migration is a series of whole-tree commits.** Each one moves every caller, scripted where the move is mechanical, and deletes what it replaces in the same commit; a behaviour guard written before the first one (a replay digest, a snapshot) proves each commit preserved behaviour, and goes in the last.
- **Only per-unit work no tree-wide commit can do gets a ledger** (the `sweeps` skill) — judgement a unit's own evidence settles, never the old shape waiting to be removed.
- **The owners of the narrower cases:**
  - a name — corrected in place, never aliased (the `naming` skill);
  - a persisted client shape or Azure Table entity — the latest shape only (the `zod` skill, "Persisted Data — Latest Shape Only");
  - stored data a schema change leaves behind — backfilled, never held for the deployed code (the `backfills` skill);
  - a deployed identity — renamed through a preview (the `pulumi-infra` skill, `references/migrations.md`);
  - a published package's export — a `refactor`, never a major (the `package-scripts` skill).
