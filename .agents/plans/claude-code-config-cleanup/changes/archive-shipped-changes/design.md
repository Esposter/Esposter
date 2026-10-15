## Context

The six changes are merged to `main`, and their folders are the only record of their requirements. The archive rule (`openspec/config.yaml` operations, `openspec` skill, `ship` skill) already says to archive after merge. Nothing has been archived, so the rule has never run.

## Goals / Non-Goals

**Goals:**

- `openspec/specs/` holds the merged requirements of everything shipped.
- No check goes silently empty when a change folder moves.

**Non-Goals:**

- Editing any requirement's wording. Archive copies deltas as they stand.
- Archiving changes that have not merged. `plugin-taxonomy-and-budget` and the others are merged; a future change follows the same rule.

## Decisions

1. **Archive all six in one pull request, one commit each.** The team rule is one change per pull request, which governs proposals. An archive is a mechanical move of work already merged, and six PRs would each carry the same Verify-Config run. Rejected: six branches. Recorded as a decision for the user to override.
2. **Re-point the checks, do not delete them.** Sections 5d–5h assert behaviour the archived specs now carry. Options: (a) assert against `openspec/specs/<capability>/spec.md`, which is the source of truth after the move; (b) assert against `openspec/changes/archive/...`, which keeps the check tied to the proposal. Recommended: (a) for behaviour, (b) only where a check verifies the proposal itself. Rejected: deleting sections 5d–5h, because they are the only automated guard on the behaviour they cover.
3. **Archive order is the dependency order**, with `sequence-agents-by-role` last because it modifies `build-stage`. Confirmed by reading the deltas in step 3 of the proposal.

## Risks / Trade-offs

- [Silent pass] A check that iterates a folder which has moved reports nothing and stays green. Mitigation: task 2.2 asserts a minimum count of archived or spec entries inside each re-pointed check, so an empty set fails.
- [Delta collision] Archive fails or writes a wrong merge when two deltas touch one capability. Mitigation: step 3 and step 6 of the proposal.
