## Why

Esposter describes behaviour in two places that nothing ties together. The proposals under `apps/web/content/docs/proposals/` are whole-subsystem designs that restate the design rather than the difference from today. The as-built page that replaces a shipped proposal is prose, and the only check on it is that its links, diagrams and backticked paths resolve. Nothing checks that the behaviour it describes is the behaviour the code has, so the page drifts, and the next product review argues from the drifted record.

OpenSpec keeps the spec of record as requirements with scenarios. Each scenario maps to one test, a change is validated before it is built, and it is merged into the current spec when it ships. The spec then serves as both the documentation and the verification.

The decision that rejected it is `apps/web/content/docs/architecture/rejected/spec-frameworks.md`. This change overturns it. `design.md` answers its argument point by point and names the rejected direction, so the decision cannot quietly flip back.

## What Changes

- New specifications and design decisions for non-trivial work are OpenSpec changes under `openspec/changes/<id>/`. Shipped behaviour is merged into `openspec/specs/` on archive.
- `openspec/` is set up on the default `spec-driven` schema. Esposter's rules live in `openspec/config.yaml`, so no schema is forked.
- A scenario check runs as a test in `scripts/` (`scripts/src/services/openspec/`), so it runs in CI with the rest of the tooling.
- The rejected page `apps/web/content/docs/architecture/rejected/spec-frameworks.md` and its row in `rejected/index.md` are removed. Its argument moves to `design.md`.
- `AGENTS.md` and the `docs` skill name OpenSpec as the home for new specifications. Existing proposals and architecture pages are not migrated here; a ledger tracks that work.
- **Capabilities:** `spec-changes` (new).

## Impact

- The docs site loses one page. `apps/web/content/docs/index.test.ts` still governs every remaining page.
- Two proposal homes exist during the migration: `proposals/`, which `pnpm ai:proposals:report` sizes, and `openspec/changes/`, which nothing sizes yet. The gap is recorded in the migration ledger.
- Other machines need `pnpm i` to get the CLI, and `/opsx-setup` once for the machine profile. The team kit's `/opsx-setup` expects a `custom` profile and an exact CLI version, which conflicts with this repository's caret pin; `design.md` records it.
