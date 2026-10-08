# Editing `.coderabbit.yaml`

Read when changing the config a review applies.

CodeRabbit reads `.coderabbit.yaml` from the pull request's **base branch**. It reviews by itself a pull request against `main`, and a pull request against a base the file lists under `reviews.auto_review.base_branches` — the window branches `review/…`, which the file lists for that reason. So a window's review applies the config of the window below it, or of `main` for the bottom one. An edit is a queue commit like any other: it reaches `main` with the window that carries it, and reaches a window through `develop`, which folds `main` in when a window is cut; a review ran under the config of its base at the time. The `review-queue` skill's `Express:` trailer sends a config-only commit to `main` ahead of its window, so the windows cut after it read it; nothing writes `main` by hand.

Read the base off a pull request rather than assuming it when the question is which config a review ran under:

```bash
git show "origin/$(gh pr view "<pr>" --json baseRefName --jq .baseRefName):.coderabbit.yaml"
```
