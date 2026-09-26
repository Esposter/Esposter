# Merging `main` and the Lockfile

Read when merging `main` into a branch, a worktree branch into `ai/queue`, or resolving a `pnpm-workspace.yaml` or `pnpm-lock.yaml` conflict.

`main` takes commits `develop` never saw — a Renovate PR merged straight into it — and the collector folds them into the next window as a merge commit, resolving the lockfile the way below. The same procedure applies to any merge a session makes by hand (`main` into a spike branch, a worktree branch into `ai/queue`) — never `main` or `develop` into `ai/queue`, which catches up by rebase alone (`review-queue` skill). Never rebase a branch whose commits are already pushed and reviewed.

`pnpm-workspace.yaml` is authored and usually auto-merges — read the merged catalog anyway, since a clean
auto-merge proves only that the two sides touched different lines, never that the surviving version is the
higher one. When it does conflict, resolve it before running anything: `pnpm` parses that file at the start of
every command, so while the markers are in it **no `pnpm` in this checkout runs at all** — not the `pnpm i`
below, not a check, not the `pnpm dlx` a collector session launches (`× load configuration … simple key
expected ':'`). `pnpm --ignore-workspace` is the way past it for a command that needs nothing from the file.

## `pnpm-lock.yaml` Conflicts — Always Regenerate, Never Hand-Resolve

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
same reason: under a second, not a reinstall. That is a precondition, not a given: the installed tree has to be
the one the branch's own lock produced, so run `pnpm i` before the merge on a checkout that has none. On a clean
checkout the delete re-resolves every caret instead — take the branch's lock back (`git checkout --ours
pnpm-lock.yaml`), install, then delete and rebuild.

`Already up to date` is the normal report, and a rebuilt lock that comes back byte-identical to the one you
deleted is the expected outcome, not a skipped step — it means the merged catalog was already fully resolved.
A merge that resolves byte-identical to the branch is likewise correct: it means `main` brought no catalog entry
it lacked. The merge commit is still made, since it records the ancestry, and it simply carries a zero-content
diff.

Escalate to `pnpm refresh:lockfile` only when `pnpm i` cannot reconcile the tree — that one deletes every
`node_modules` as well, kills running node processes, and reinstalls from scratch (minutes, and it takes down any
dev server or vitest watcher).
