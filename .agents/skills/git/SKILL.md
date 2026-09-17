---
name: git
description: Apply when running git operations, merging a branch, resolving a lockfile conflict, or advising on source control workflows. Esposter git workflow conventions — commit message format, safety rules (pathspec commits in a shared checkout, no stash, no push into a running review), branch hygiene (the session commits on ai/queue and the collector writes develop and main), and the `pnpm-lock.yaml` conflict every merge of `main` brings, regenerated never hand-resolved.
---

# Git Conventions

## Commit Message Format

Conventional-commits format and the type list are in `CONTRIBUTING.md` ("Commit Conventions").

**Commit attribution is enabled** — commits carry the `Co-Authored-By` trailer, because "includeCoAuthoredBy" is unset and defaults on. Expect it; don't strip it, and don't add it by hand either.

## Multi-line Commit Messages — Tool-Specific Syntax

The **Bash** tool is POSIX sh, NOT PowerShell. Never use PowerShell here-string syntax (`@'...'@`) in the Bash tool — it is taken literally and leaves stray `@` lines in the commit message. Pick the form matching the tool:

- **Bash tool** → heredoc piped to `-F -`:

  ```bash
  git commit -F - <<'EOF'
  fix: short subject

  Body line.
  EOF
  ```

- **PowerShell tool** → single-quoted here-string with `@'` / `'@` at column 0:

  ```powershell
  git commit -m @'
  fix: short subject

  Body line.
  '@
  ```

After committing, verify with `git log -1 --format='%B'` before pushing.

## Safety Rules

- **Never `git add -A` without reading `git status` first.** The tree can already be dirty with someone else's work — a leftover snapshot refresh, an unfinished edit — and `-A` sweeps it into your commit, where it ships under a message that does not describe it. Stage the paths you touched, or check the status and confirm every extra file belongs. If one already landed in the commit, `git reset --soft HEAD~1` then `git restore --staged <paths>` puts it back in the working tree with its content intact.
- **Commit by pathspec when another session shares the checkout** — `git commit -F - -- <your paths>`. The index is shared: a rename or edit the other session already staged rides into a plain `git commit` even when only your files were `git add`ed, and staging yours does not unstage theirs. A pathspec commit takes only the paths named and leaves the rest of the index as it was; an `R`, `M` or `A` in `git status --short` on a file you did not touch is the tell that the index is not yours. **A file both sessions have edited cannot be committed by pathspec at all**: the pre-commit format hook restages the whole file, so the other session's hunks ride out under your message. Save their copy aside, write the file as `HEAD` plus your change alone, commit, then put their copy back.
- **Never use `git stash`** — a failed/forgotten pop loses in-progress changes. To inspect prior committed state, use `git show HEAD:path/to/file` or `git diff HEAD`. To set work aside, make a WIP commit.
- **Never push into a running CodeRabbit review** — on any PR against `main` a person opened, check the review state first; pushing mid-review cancels it, burns a slot, and loses the in-progress findings for good. The command and the states that mean "running" are the `coderabbit` skill's. The release PR is not the session's to push at all (below).

## Pushing

The session pushes **`ai/queue` after every commit**, plain, behind a `git pull --rebase` that waits for a clean tree, because the collector rewrites the queue after every window — the `review-queue` skill owns the loop, why the tree must be clean, and the one lease a session may ever push with. A branch with a PR a person opened against `main` is pushed once per coherent chunk, since every push there starts a review.

## Branch Hygiene

**The session's checked-out branch is `ai/queue`; there are no per-chunk feature branches.** The review collector cuts windows from it onto `develop` and opens the one long-lived `develop` → `main` PR (`review-queue` skill). `develop` and `ai/review-fixes` have one writer, the collector; `main` takes releases the collector merges once a review is clean (a person merges one the bot rates riskier), plus the collector's express lane. A branch's name says whose it is and the rulesets hold it to that — `ai/` the pipeline's, `renovate/` the bot's, `external/` the one prefix a collaborator may create, anything else the maintainer's — and a collaborator's work enters as a pull request against `ai/queue` squash-merged by a maintainer, never one against `main` (`apps/web/content/docs/infra/branch-namespaces.md`). Cut a branch only when the work genuinely cannot land incrementally (a spike, or an edit to `main` itself — use `git worktree` for that rather than checking it out over work in progress), and delete it after merging.

## Merging `main` and the Lockfile

`main` takes commits `develop` never saw — a Renovate PR merged straight into it — and the collector folds them into the next window as a merge commit, resolving the lockfile the way below. The same procedure applies to any merge a session makes by hand (`main` into a spike branch, a worktree branch into `ai/queue`) — never `main` or `develop` into `ai/queue`, which catches up by rebase alone (`review-queue` skill). Never rebase a branch whose commits are already pushed and reviewed.

`pnpm-workspace.yaml` is authored and usually auto-merges — read the merged catalog anyway, since a clean
auto-merge proves only that the two sides touched different lines, never that the surviving version is the
higher one.

### `pnpm-lock.yaml` Conflicts — Always Regenerate, Never Hand-Resolve

The lockfile is machine state, like `snapshot.json`. Never hand-merge it, and never reason about which side to
keep — a resolved-by-hand lock silently disagrees with the merged `pnpm-workspace.yaml` catalog. Resolve
`pnpm-workspace.yaml` first, since that one is authored and merges normally: keep the **higher** version on
every conflicting catalog entry. Then throw the lock away and let pnpm rebuild it:

```bash
rm pnpm-lock.yaml
pnpm i                  # from the repo root
git add pnpm-lock.yaml
```

This is the whole procedure, on every merge, in either direction. It is safe because `pnpm i` rebuilds the lock
from the already-installed `node_modules` tree rather than re-resolving each caret to the newest release it
allows — so existing pins survive verbatim, including majors the other branch has never seen. It is fast for the
same reason: under a second, not a reinstall.

`Already up to date` is the normal report, and a rebuilt lock that comes back byte-identical to the one you
deleted is the expected outcome, not a skipped step — it means the merged catalog was already fully resolved.
A merge that resolves byte-identical to the branch is likewise correct: it means `main` brought no catalog entry
it lacked. The merge commit is still made, since it records the ancestry, and it simply carries a zero-content
diff.

Escalate to `pnpm refresh:lockfile` only when `pnpm i` cannot reconcile the tree — that one deletes every
`node_modules` as well, kills running node processes, and reinstalls from scratch (minutes, and it takes down any
dev server or vitest watcher).

## Verify Once Per Chunk

The local check suite runs **once per coherent chunk** (see the `package-scripts` skill), in the background, and its repairs are committed as their own commit behind the unit — never folded into it, because the collector cuts windows at commit boundaries and every cut must be green on its own. A per-commit check run is re-invalidated by the next commit in the same chunk; a queue push waits for nothing, since it starts no review.
