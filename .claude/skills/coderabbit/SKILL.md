---
name: coderabbit
description: Esposter CodeRabbit review conventions — checking review state before pushing (never push into a running review), .coderabbit.yaml lives on main and is read from the PR base branch, per-file path_filters for mechanical renames, and the standardized exclude/re-enable commit pair. Apply before any git push to a branch with an open PR, when a PR is too large for review, when excluding files from CodeRabbit, or when the user says "remove the exclusions".
---

# CodeRabbit Conventions

## Config Lives on `main`

`.coderabbit.yaml` sits at the repo root. CodeRabbit reads it from the **base branch** of a PR, not the head branch. PRs target `develop`, and `develop` merges to `main` — so an exclusion only takes effect once it is on the branch the PR is based against.

Commit exclusions **directly to `main`** as a standalone commit, separate from the work they cover. An exclusion committed on the feature branch does nothing.

## Why Per-File, Not Globs

CodeRabbit's `path_filters` are static globs with no notion of "this file was only renamed". A glob like `!packages/app/app/services/resource/sheet/**` excludes that tree for **every future PR**, permanently blinding review of real changes until someone remembers to revert it.

List every excluded file explicitly instead. It is verbose, and that verbosity is the point — a 70-line block is obviously temporary and obviously scoped, where a 3-line glob quietly rots.

Keep permanent structural entries (`!pnpm-lock.yaml`, generated migrations) at the top of `path_filters`, above any temporary block.

## Never Push Into an In-Flight Review

**Check CodeRabbit's state before every push to a branch with an open PR.** Pushing while a review is running cancels it and retriggers a fresh one, which costs a rate-limit slot and loses the in-progress review's findings. CodeRabbit is an **incremental** system — it does not re-review commits it has already reviewed — so a cancelled review's comments do not reliably come back on the next run. They are simply gone.

The check run exposes the state directly:

```bash
gh pr checks --json name,state,description --jq '.[] | select(.name=="CodeRabbit")'
# {"description":"Review completed","name":"CodeRabbit","state":"SUCCESS"}
```

Push only on `SUCCESS` / `Review completed`. Anything else (`PENDING`, a review-in-progress description) means **wait** — poll until it settles, then push. If there is no open PR for the branch yet, there is no review to interrupt; push freely.

This applies per push, not per work session — a second push minutes after the first will land while the first push's review is still running. Batch commits and push once when the work is coherent, rather than pushing each commit as it lands.

Symptoms that a push landed mid-review: a `> [!CAUTION] Failed to replace (edit) comment` / `putComment timed out` comment from `coderabbitai[bot]`, or a review that silently returns far fewer comments than the diff warrants.

## PR File Budget

CodeRabbit's free tier has a hard cap of ~150 files per PR. Keep every chunk of work to **~100 changed files measured from the branch point** — work is committed and pushed continuously, so dirty-file counts see nothing:

```bash
git diff --name-only "$(git merge-base <base-branch> HEAD)" | wc -l   # committed changes since branching (base is what this branch was cut from, e.g. develop)
git status --porcelain -uall | wc -l                                  # plus anything not yet committed
```

Run both and sum before starting a sweep. When the budget is reached, stop and hand back for a PR.

## When to Exclude

Chunk at the budget where you can. A mechanical rename can't be chunked — it's one atomic commit — so exclude the files within it that carry no reviewable content.

Only exclude **pure renames**: 100% similarity, zero content change. A file that was renamed _and_ edited still needs review.

## Generating the List

`R100` is git's marker for a rename with no content change:

```bash
git diff --name-status -M <base>..<head> | awk '$1=="R100"{print "    - \"!" $3 "\""}' | sort
```

Verify the count matches what you expect before committing, and validate the result parses:

```bash
node -e "
const yaml=require('./node_modules/.pnpm/js-yaml@4.3.0/node_modules/js-yaml');
const d=yaml.load(require('fs').readFileSync('.coderabbit.yaml','utf8'));
console.log('path_filters:', d.reviews.path_filters.length);
"
```

## The Commit Pair

Exclusions are always temporary. Every exclusion commit names its own revert so the cleanup is unambiguous later.

**Adding** — subject is `chore: exclude <scope> from CodeRabbit review`. The body states why, and quotes the exact removal subject:

```text
chore: exclude File -> Sheet rename files from CodeRabbit review

The File -> Sheet resource rename touches 426 files, of which 70 are pure
renames with no content change. Exclude those so the review stays under
the free-tier file limit and focuses on the files that actually changed.

Revert with "chore: re-enable CodeRabbit review for File -> Sheet rename
files" once the rename PR merges.
```

**Removing** — subject is `chore: re-enable CodeRabbit review for <scope>`, reusing the same `<scope>` wording:

```text
chore: re-enable CodeRabbit review for File -> Sheet rename files

The rename PR has merged, so these files are reviewable again.
```

Mark the temporary block in the yaml with a comment naming its scope, so "remove the exclusions" resolves to an exact set of lines:

```yaml
# pure renames from the File -> Sheet resource rename (no content change);
# remove these once that PR merges
```

## Removal Procedure

When the user says "remove the exclusions" or "re-enable review":

1. `git switch main && git pull --ff-only origin main`
2. Delete the commented temporary block from `.coderabbit.yaml`, leaving the permanent entries
3. Commit as `chore: re-enable CodeRabbit review for <scope>`, taking `<scope>` from the block's comment
4. Push to `main`

If more than one temporary block exists, ask which scope to remove rather than clearing all of them.
