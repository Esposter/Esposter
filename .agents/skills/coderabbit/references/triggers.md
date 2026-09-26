# What Triggers a Review

Read when a pull request is about to be opened, a develop-base review is wanted, or a config change is expected to apply.

CodeRabbit auto-reviews **only PRs targeting the default branch (`main`)**, and only on creation — `auto_incremental_review` is off, so a push to an open PR asks for nothing. Develop-base PRs are skipped ("Auto reviews are disabled on base/target branches other than the default branch") and are triggered by commenting `@coderabbitai review`, which keeps control of _when_ a review starts and stops every intermediate push spending a slot. `.coderabbit.yaml` is read from the PR's **base branch**, so a config change takes effect only once it is there — `references/config-editing.md`.

A review spends one of the plan's hourly slots, and a PR against `main` spends one on arrival: the release PR is the collector's to open, and any other PR against `main` is asked for every time, with its commit range settled before `gh pr create` because the moment after it is already an in-flight review. Corrections found after opening are a later push's commits; the body may be edited freely. A collaborator's PR never targets `main` for the same reason — it is opened from an `external/*` branch against `ai/queue` and squash-merged there (`apps/web/content/docs/infra/branch-namespaces.md`).
