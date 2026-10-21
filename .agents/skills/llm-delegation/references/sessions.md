# Headless Sessions

Read when automation launches a headless session: its one launcher, its roles and the gate that must be able to decline each spawn.

`scripts/src/services/review/runSession.ts` is the one launcher. It takes a role and a prompt, and the role's model comes from `ReviewSessionRoleModelMap` (`scripts/src/services/review/constants.ts`). Every role is haiku, the unversioned alias. Its wall clock is `REVIEWER_TIMEOUT_MS`, `FIXER_TIMEOUT_MS` or `SETTLER_TIMEOUT_MS` from the same file, by role.

The roles are `ReviewSessionRole` (`scripts/src/models/review/ReviewSessionRole.ts`):

- **Reviewer**, per batch. `REVIEWER_TOOLS` is the whole tool list in print mode, which denies every edit.
- **Fixer**, per issue, in its own fix job. Its answer may leave a finding open, and the script carries the commits across.
- **Settler**, per open issue, run one at a time in the settle job. Its answer must dispose of every finding, and the script closes the issue after the commits land.

## Every spawn owes a gate that can decline it

No session launches unconditionally. A run that starts a session to discover there was nothing to do has already spent the window it was protecting, so a deterministic check comes first: no owed commits means no reviewers, and no findings means no fixer (`scripts/src/services/review/runReview.ts`).

A session that hits Claude's usage limit leaves no marker. Its window stays owed for a later run, so nothing downstream depends on a gate having answered.
