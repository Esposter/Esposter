# Editing `.coderabbit.yaml`

Read when changing the config a review applies.

CodeRabbit reads `.coderabbit.yaml` from the pull request's **base branch**, and it reviews by itself only a pull request against `main` — the one the collector opens there is the release, `develop` → `main` — so the config a release's review applies is `main`'s. An edit is a queue commit like any other: it reaches `main` with the release that carries it, and the review of that release still ran under the old config. The `review-queue` skill's `Express:` trailer sends a config-only commit to `main` ahead of its window, so the next release's review reads it; nothing writes `main` by hand.

Read the base off a pull request rather than assuming it when the question is which config a review ran under:

```bash
git show "origin/$(gh pr view "<pr>" --json baseRefName --jq .baseRefName):.coderabbit.yaml"
```
