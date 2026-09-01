---
name: git
description: Esposter git workflow conventions — commit message format, safety rules, branch hygiene, and syncing `main` back into `develop` with the `pnpm-lock.yaml` conflict that merge always brings. Apply when running git operations, merging a branch, resolving a lockfile conflict, or advising on source control workflows.
---

# Git Conventions

## Commit Message Format

Conventional-commits format and the type list are in `~/.claude/rules/git-workflow.md`.

**Commit attribution is enabled** — commits carry the `Co-Authored-By` trailer, because `includeCoAuthoredBy` is unset and defaults on. Expect it; don't strip it, and don't add it by hand either.

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
- **Never use `git stash`** — a failed/forgotten pop loses in-progress changes. To inspect prior committed state, use `git show HEAD:path/to/file` or `git diff HEAD`. To set work aside, make a WIP commit.
- **Never push into a running CodeRabbit review** — if the branch has an open PR, check the review state first; pushing mid-review cancels it, burns a rate-limit slot, and loses the in-progress findings for good (CodeRabbit won't re-review commits it has already seen). The command, the states that mean "running", and the four gates that decide the push are the `coderabbit` skill's — a second copy of that table here is how one of them goes stale.

## Pushing

Batch commits and push **once** per coherent chunk of work. Several pushes in quick succession each retrigger review, so the later ones reliably land mid-review — the exact case the rule above exists to prevent.

## Branch Hygiene

**Work is committed straight to `develop`; there are no per-chunk feature branches.** Review happens on one long-lived `develop` → `main` PR, which re-reviews incrementally on every push — the pipeline and its file budget are the **coderabbit** skill's. A feature branch here would only add a merge that buys nothing, since nothing gates entry to `develop`.

- `develop` is the working branch; `main` takes releases from it.
- Cut a branch only when the work genuinely cannot land incrementally (a spike, or an edit to `main` itself — use `git worktree` for that rather than checking it out over work in progress), and delete it after merging.

## Syncing `main` Into `develop`

`main` takes commits `develop` never saw — a Renovate PR merged straight into it, a hotfix — so `develop` goes
behind and the open `develop` → `main` PR starts showing a diff nobody wrote. Fetch and merge `main` in; never
rebase `develop`, whose commits are already pushed and already reviewed.

```bash
git fetch origin
git merge origin/main --no-edit
```

The conflict is `pnpm-lock.yaml`, every time, because both sides regenerated it (below). `pnpm-workspace.yaml`
is authored and usually auto-merges — read the merged catalog anyway rather than trusting that, since a clean
auto-merge proves only that the two sides touched different lines, never that the surviving version is the
higher one.

The merge commit itself is not a review window: it carries whatever `main` already held, and the review that
matters already ran on the PR those commits came from.

### `pnpm-lock.yaml` Conflicts — Always Regenerate, Never Hand-Resolve

The lockfile is machine state, like `snapshot.json`. A hand-merged lock (or one side taken wholesale and left alone) silently disagrees with the merged `pnpm-workspace.yaml` catalog. Resolve `pnpm-workspace.yaml` first — that one is authored and merges normally, keeping the **higher** version on every conflicting catalog entry — then regenerate the lock from it:

```bash
git checkout --ours -- pnpm-lock.yaml   # any side; it is about to be rewritten
pnpm i                                  # from the repo root — reconciles the lock to the merged catalog
git add pnpm-lock.yaml
```

`pnpm i` reporting `Lockfile is up to date` is a valid outcome, not a skipped step — it means the side you kept already resolved every merged specifier. Verify with the specifiers themselves (`grep` the bumped package in the lock) rather than trusting the message.

Escalate to `pnpm refresh:lockfile` only when `pnpm i` cannot reconcile the tree — it deletes the lock and every `node_modules`, kills running node processes, and reinstalls from scratch (minutes, and it takes down any dev server or vitest watcher).

## Verify On `develop`

The local check suite runs **once per coherent chunk, on `develop`, before pushing it** — not per commit:

1. **Commit** as the work lands; commits are free and nothing is triggered by them.
2. **Verify** the finished chunk with the check suite (see the package-scripts skill).
3. **Push** the chunk, which starts the review. Fix forward on `develop`.

Rationale: a per-commit check run is re-invalidated by the next commit in the same chunk, and the pushed state is the only state a reviewer ever sees.
