## Why

Six changes are built and merged to `main` (last commits: `919a088` continuous-improvement-loop, `257809b` plugin-taxonomy-and-budget and spec-driven-lifecycle, `c9b3b45` sequence-agents-by-role, `c9446b8` tighten-openspec-practice, `2585d5e` vendored-skills), but `openspec/specs/` holds only `.gitkeep` and their folders still sit in `openspec/changes/`. The kit says `specs/` is requirement truth and equals shipped behaviour. Today it is empty, so `/spec` step 2 (read `openspec/specs/` for the capabilities a change touches) finds nothing.

## What Changes

- Archive the six changes with `openspec archive <id> --yes`, in the order given in design.md. Each archive merges its delta files into `openspec/specs/<capability>/spec.md` and moves the folder to `openspec/changes/archive/YYYY-MM-DD-<id>/`.
- Re-point the Verify-Config checks that read change folders, so they keep checking real content after the move. Without this, the `5g` loop over `openspec/changes` finds nothing and passes vacuously.
- Nothing else. No shipped requirement is edited; the one new requirement (`spec-truth`) states the archive rule itself.

## Steps (noted here, not yet run)

Run on a branch cut from `main` (`chore/archive-shipped-changes`), because the team guard blocks edits on `main`.

1. **Confirm the merge, again, at run time.** `git log main --oneline -- openspec/changes/<id>` must be non-empty for each of the six. Verified at planning; repeat before archiving.
2. **Baseline.** `openspec validate <id> --strict --no-interactive` and `node openspec/scripts/lint-scenarios.js openspec/changes/<id>` for each of the six. Keep the output in the PR description.
3. **Read the collision.** `build-stage` is touched by `spec-driven-lifecycle` and `sequence-agents-by-role`. Read both deltas. The first to archive creates the capability; the second must then modify it. A delta that is ADDED against an existing capability fails the archive; a MODIFIED against a missing one does too.
4. **Re-point Verify-Config first** (see tasks 2.x), in the same commit as the archive, so no commit exists where a check is silently empty.
5. **Archive in order** (below), one commit per archive: `openspec archive <id> --yes`, then `git add` by pathspec.
6. **Verify after each archive:** `openspec/specs/<capability>/spec.md` exists for every capability the delta named; `openspec validate --strict` passes on the specs; Verify-Config is GREEN.
7. **Open one PR** with the six commits, the baseline output and the Verify-Config result.

Proposed archive order: `vendored-skills`, `continuous-improvement-loop`, `spec-driven-lifecycle`, `tighten-openspec-practice`, `plugin-taxonomy-and-budget`, `sequence-agents-by-role`. The last one comes last because it touches `build-stage`. Step 3 may change this order; the order is confirmed by reading the deltas, not assumed.

## Rollback

Each archive is one commit. Reverting it restores the change folder and removes the merged capability content. No shipped file changes.

## Capabilities

### New Capabilities

- `spec-truth`: a merged change's requirements are recorded under `openspec/specs/`.

### Modified Capabilities

- none

## Impact

- `openspec/specs/` gains the merged capability files (24 distinct capabilities across 25 delta files).
- `openspec/changes/` loses six folders, which move to `openspec/changes/archive/`.
- `scripts/Verify-Config.ps1` sections 5d–5h and the 5g loop (paths only, no behaviour change).
- `plugins/team-core/skills/openspec/SKILL.md` and `ship/SKILL.md` refer to the archive rule; no edit needed unless step 3 finds a rule to correct.
