# Headless Sessions

Read when automation launches a headless session: its one launcher, its two roles and the gate that must be able to decline each spawn.

`scripts/src/services/review/runSession.ts` is the one launcher. It takes a role and a prompt and never picks a model: every session runs on `REVIEW_MODEL` (`scripts/src/services/review/constants.ts`), the unversioned alias, as every subagent does. Its wall clock is `REVIEWER_TIMEOUT_MS` or `FIXER_TIMEOUT_MS` from the same file.

The roles are `ReviewSessionRole` (`scripts/src/models/review/ReviewSessionRole.ts`):

- **Reviewer**, one per batch, read-only. Print mode allows only the tools in `REVIEWER_TOOLS`, so every edit is denied.
- **Fixer**, one per window with findings, each in its own fix job with no concurrency group, so a window's fixer runs beside the next review. It may edit and commit, and it never touches GitHub; the script lands its commits.

## Every spawn owes a gate that can decline it

No session launches unconditionally. A run that starts a session to discover there was nothing to do has already spent the window it was protecting, so a deterministic check comes first: no owed commits means no reviewers, and no findings means no fixer (`scripts/src/services/review/runReview.ts`).

A session that hits Claude's usage limit leaves no marker. Its window stays owed for a later run, so nothing downstream depends on a gate having answered.
