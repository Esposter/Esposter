---
name: git
description: Apply when running git operations, merging a branch, resolving a lockfile conflict, or advising on source control workflows. Esposter git workflow conventions — commit message format, safety rules (pathspec commits in a shared checkout, no stash, no push into a running review), branch hygiene (the session commits on ai/queue and the collector writes develop and main), and the `pnpm-lock.yaml` conflict every merge of `main` brings, regenerated never hand-resolved.
---

# Git Conventions

## Commit Message Format

Conventional-commits format and the type list are in `CONTRIBUTING.md` ("Commit Conventions").

A count in a subject or body is written as its magnitude — "a handful of proposals", never the number — for the same reason a docs page does (`docs`, `references/repo-owned-facts.md`).

**Commit attribution is enabled** — commits carry the `Co-Authored-By` trailer, because "includeCoAuthoredBy" is unset and defaults on. Expect it; don't strip it, and don't add it by hand either.

## Multi-line Commit Messages — Tool-Specific Syntax

A heredoc piped to `-F -` from Bash, a single-quoted here-string from PowerShell — never one tool's syntax in the other — then `git log -1 --format='%B'` (`references/commit-messages.md`).

## Safety Rules

- **Never `git add -A` without reading `git status` first.** The tree can already be dirty with someone else's work — a leftover snapshot refresh, an unfinished edit — and `-A` sweeps it into your commit, where it ships under a message that does not describe it. Stage the paths you touched, or check the status and confirm every extra file belongs. If one already landed in the commit, `git reset --soft <your sha>~1` then `git restore --staged <paths>` puts it back in the working tree with its content intact.
- **Commit by pathspec when another session shares the checkout**, leave a file `git status` lists as modified until it is committed, never `--amend` (it takes the whole index), and name a commit to reset to by its sha (`references/shared-checkout.md`).
- **A rename that only changes case needs `git -c core.ignorecase=false` on every command that names the path** — Windows checks out with `core.ignorecase=true`, so `git add` and a pathspec `git commit` refuse the new spelling as "did not match any file", and a commit that does land leaves the old spelling behind as a staged `A` that `git -c core.ignorecase=false rm --cached` clears. `git mv` alone stages the move correctly; the pathspec commit after it is where the flag is needed.
- **Never use `git stash`** — a failed/forgotten pop loses in-progress changes. To inspect prior committed state, use `git show HEAD:path/to/file` or `git diff HEAD`. To set work aside, make a WIP commit.
- **Never push into a running CodeRabbit review** — on any PR against `main` a person opened, check the review state first; pushing mid-review cancels it, burns a slot, and loses the in-progress findings for good. The command and the states that mean "running" are the `coderabbit` skill's. The release PR is not the session's to push at all (below).

## Pushing

The session pushes **`ai/queue` after every commit**, plain, behind a `git pull --rebase` that waits for a clean tree, because the collector rewrites the queue after every window — the `review-queue` skill owns the loop, why the tree must be clean, and the one lease a session may ever push with. A branch with a PR a person opened against `main` is pushed once per coherent chunk, since every push there starts a review.

## Branch Hygiene

**The session's checked-out branch is `ai/queue`; there are no per-chunk feature branches.** The review collector cuts windows from it onto `develop` and opens the one long-lived `develop` → `main` PR (`review-queue` skill). `develop` and `ai/review-fixes` have one writer, the collector; `main` takes releases the collector merges once their one review completes, plus the collector's express lane. A branch's name says whose it is and the rulesets hold it to that — `ai/` the pipeline's, `renovate/` the bot's, `external/` the one prefix a collaborator may create, anything else the maintainer's — and a collaborator's work enters as a pull request against `ai/queue` squash-merged by a maintainer, never one against `main` (`apps/web/content/docs/infra/branch-namespaces.md`). Cut a branch only when the work genuinely cannot land incrementally (a spike, or an edit to `main` itself — use `git worktree` for that rather than checking it out over work in progress), and delete it after merging.

## Merging `main` and the Lockfile

Resolve `pnpm-workspace.yaml` first, keeping the higher version on every conflict — no `pnpm` runs while its markers stand — then delete `pnpm-lock.yaml` and `pnpm i`; never hand-resolve the lock, and never merge `main` or `develop` into `ai/queue` (`references/lockfile-merges.md`).

## Verify Once Per Chunk

The local check suite runs **once per coherent chunk** (see the `package-scripts` skill), in the background, and its repairs are committed as their own commit behind the unit — never folded into it, because the collector cuts windows at commit boundaries and every cut must be green on its own. A per-commit check run is re-invalidated by the next commit in the same chunk; a queue push waits for nothing, since it starts no review.

## Reference pages

- `references/commit-messages.md` — when writing a multi-line commit message from Bash or PowerShell.
- `references/shared-checkout.md` — when another session shares the checkout.
- `references/lockfile-merges.md` — when a merge brings a `pnpm-workspace.yaml` or `pnpm-lock.yaml` conflict.
