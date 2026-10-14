---
name: git
description: Apply when running git operations, merging a branch, resolving a lockfile conflict, or advising on source control workflows. Esposter's git workflow — the session commits on ai/queue by pathspec in a shared checkout and the review fast-forwards main onto it; never git stash, never --amend, and a pnpm-lock.yaml conflict regenerated, never hand-resolved.
---

# Git Conventions

## Commit Message Format

Conventional-commits format and the type list are in `CONTRIBUTING.md` ("Commit Conventions").

A count in a subject or body is written as its magnitude — "a handful of proposals", never the number — for the same reason a docs page does (the `docs` skill, `references/repo-owned-facts.md`).

**Every commit ends with the `Co-Authored-By` trailer the session's attribution reminder gives**, written as the message's last line and never stripped: it is what names the model in a ledger's `Swept` cell (the `sweeps` skill, `references/ledger-files.md`).

## Multi-line Commit Messages — Tool-Specific Syntax

A heredoc piped to `-F -` from Bash, a single-quoted here-string from PowerShell — never one tool's syntax in the other — then `git log -1 --format='%B'` (`references/commit-messages.md`).

## Safety Rules

- **Never `git add -A` without reading `git status` first.** The tree can already be dirty with someone else's work — a leftover snapshot refresh, an unfinished edit — and `-A` sweeps it into your commit, where it ships under a message that does not describe it. Stage the paths you touched, or check the status and confirm every extra file belongs. If one already landed in the commit, `git reset --soft <your sha>~1` then `git restore --staged <paths>` puts it back in the working tree with its content intact.
- **Commit by pathspec when another session shares the checkout**, leave a file `git status` lists as modified until it is committed, never `--amend` (it takes the whole index), and name a commit to reset to by its sha (`references/shared-checkout.md`).
- **No command over the whole index in a shared checkout.** `git add .`, `git add -N .`, `git reset -- .` and `git restore --staged .` reach every peer's staged entry as well as your own; `git reset -- .` can drop a peer's staged files; stage by explicit path. Name your paths. The ward's whole-index guard (`packages/genshin-mods/src/services/ward/`) refuses these forms with a Bash deny while another session edits the checkout.
- **A rename that only changes case needs `git -c core.ignorecase=false` on every command that names the path** — Windows checks out with `core.ignorecase=true`, so `git add` and a pathspec `git commit` refuse the new spelling as "did not match any file", and a commit that does land leaves the old spelling behind as a staged `A` that `git -c core.ignorecase=false rm --cached` clears. `git mv` alone stages the move correctly; the pathspec commit after it is where the flag is needed.
- **Never use `git stash`** — a failed/forgotten pop loses in-progress changes. To inspect prior committed state, use `git show HEAD:path/to/file` or `git diff HEAD`. To set work aside, make a WIP commit.

## Pushing

An agent lands its commits on **`ai/queue`** from its own worktree by the `review-queue` skill's loop, a `git pull --rebase` and then a push retried only on a rejected push. The `review-queue` skill owns the loop, the worktree and the rebase's conflicts.

## Branch Hygiene

**The session's checked-out branch is `ai/queue`; there are no per-chunk feature branches.** Only the review moves `main`, and it brings a diverged `main` back into the queue itself (`apps/web/content/docs/infra/review.md`, step 2). Nothing pushes `main` by hand (`review-queue` skill). A branch's name says whose it is and the rulesets hold it to that — `ai/` the pipeline's, `renovate/` the bot's, `external/` the one prefix a collaborator may create, anything else the maintainer's (`apps/web/content/docs/infra/branch-namespaces.md`). Cut a branch only when the work genuinely cannot land incrementally (a spike — in a `git worktree` rather than checked out over work in progress), and delete it after merging.

## Merging `main` and the Lockfile

Resolve `pnpm-workspace.yaml` first, keeping the higher version on every conflict — no `pnpm` runs while its markers stand — then delete `pnpm-lock.yaml` and `pnpm i`; never hand-resolve the lock, and never merge `main` into `ai/queue` by hand — the review's diverged-main step is the one merge (`references/lockfile-merges.md`).

## Verify Once Per Sitting

The touched tests run **once, after all the edits going out together** (the `package-scripts` skill, `references/check-suite.md`), in the background — once per sitting, however many commits and queue pushes carry it — and the rest are CI's on each push (the `running-checks` skill). Commits stay per coherent chunk regardless, and a fix either one calls for is its own commit behind the unit — never folded into it, because the review cuts its windows at commit boundaries and every cut should be green on its own. A per-chunk run is re-invalidated by the next chunk going out with it; a push to `ai/queue` waits for nothing, since it starts no review.

## Reference pages

- `references/commit-messages.md` — when writing a multi-line commit message from Bash or PowerShell.
- `references/shared-checkout.md` — when another session shares the checkout.
- `references/lockfile-merges.md` — when a merge brings a `pnpm-workspace.yaml` or `pnpm-lock.yaml` conflict.
