---
name: openspec
description: Apply when writing or changing a specification or design decision, when creating, validating or archiving an OpenSpec change under openspec/, or when a scenario fails its check. Esposter's spec of record: where changes and shipped specs live, how a scenario becomes a test, and when a change is merged. The team's /opsx commands and stage map are the team kit's openspec skill, linked here rather than copied.
---

# OpenSpec in Esposter

OpenSpec is the spec of record for new specifications and design decisions. The team's commands (`/opsx:*`) and stage map come from the team kit's `openspec` skill, installed on every machine, which owns them. This skill holds only what is specific to this repository.

## Where things live

- `openspec/config.yaml` — the `spec-driven` schema and this repository's rules per artifact. Change a rule here; never fork the schema into the repo, because a copy drifts from the CLI.
- `openspec/changes/<id>/` — one change, one pull request: `proposal.md`, `specs/<capability>/spec.md`, `design.md`, `tasks.md`.
- `openspec/specs/<capability>/spec.md` — the current behaviour, merged in on archive.
- `openspec/changes/archive/` — shipped changes.
- `scripts/src/services/openspec/` — the scenario check, run by its test in CI.

## Process

1. Start a change: `pnpm exec openspec new change <id> --description "<one sentence>"`, then write the four artifacts.
2. Validate: `pnpm exec openspec validate <id> --strict --no-interactive`.
3. Check the scenarios: `pnpm -C scripts exec vitest run src/services/openspec`. Every scenario reads as an optional GIVEN, one WHEN and one THEN, with AND after any of them.
4. Each task names the test it writes first, and each scenario is that test's name in the suite it lands in.
5. After the pull request merges to main: `pnpm exec openspec archive <id> --yes`. The archive merges the deltas into `openspec/specs/`, so the specs describe what shipped.

## Rules

- A requirement describes behaviour an outsider can observe. File paths, class names and library choices belong in `design.md`.
- A decision in `design.md` names the alternative it rejected and the reason it lost. A decision that overturns a settled page names the old direction as rejected, so the old direction cannot quietly return.
- A change does not migrate existing pages. `apps/web/content/docs/proposals/` and the architecture pages stay as they are until the migration ledger covers them.
- A new design is never added to `apps/web/content/docs/proposals/`. The `docs` skill says the same.
