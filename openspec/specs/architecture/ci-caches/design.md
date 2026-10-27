# CI caches

Which CI runs save a cache, and which only read one. A cache is written from the default branch and `ai/queue`, and every other branch restores what those two saved. A store or a mirror is keyed on its content, so a save happens only when that key is new. The requirements of record are in `spec.md`.

## Why the branches split

GitHub scopes a cache to the branch that wrote it, and a run reads only its own branch's caches and the default branch's. A cache written on a Renovate or pull request branch therefore serves that branch alone. Every such write still counts toward the repository's ten-gigabyte cap, and the cap evicts the least recently used entry, so a write that no other run will read pushes out one that will. The mirror of the game data is the entry the coverage shards depend on, and when it was evicted each run downloaded it again from the dev account.

`main` is the one scope every run can read, and `ai/queue` is the scope most runs write. So those two write, and the rest read.

## How it works

```mermaid
flowchart TD
  Run["a workflow run"] --> Restore["restore the newest cache it can see:<br/>its own branch, then the default branch"]
  Restore --> Exact{"exact key hit?"}
  Exact -->|yes| Skip["nothing is saved"]
  Exact -->|no| Work["the job's work fills the cache"]
  Work --> Branch{"default branch or ai/queue?"}
  Branch -->|yes| Save["save under the content key"]
  Branch -->|no| Nothing["the run saves nothing"]
```

The pnpm store is keyed on the lockfile's hash. `install-projects` saves it after its install, and only when the restore did not hit that exact key. The game-data mirror is keyed on the lock's hash, and `build-packages` fills it and saves it under that key. The vp task cache is keyed per run, so it is the one cache that changes on every executed run; it is small, and its save is gated the same way as the others.

## What the regression test checks

`scripts/src/workspace/ciCaches.test.ts` scans every workflow and composite action. It fails if a file uses the combined cache action, which saves on every run, if a file turns on the pnpm store's own cache, or if a cache save step lacks the default-branch-and-`ai/queue` condition. It names the file, so a new save added without the condition fails the workspace suite.

## Key files

| File                                                     | Role                                                                      |
| -------------------------------------------------------- | ------------------------------------------------------------------------- |
| `.github/actions/setup-project-dependencies/action.yaml` | keys the pnpm store on the lockfile and restores it, and hands its key on |
| `.github/actions/install-projects/action.yaml`           | saves the pnpm store after the install, on a miss from the two branches   |
| `.github/actions/run-cached-task/action.yaml`            | restores and saves the vp task cache; the save is gated                   |
| `.github/workflows/build-packages.yaml`                  | restores the game-data mirror everywhere; fills and saves it on the two   |
| `.github/workflows/CI.yaml`                              | the coverage shards restore the mirror and never save it                  |
| `scripts/src/workspace/ciCaches.test.ts`                 | the guard: no combined cache action, no per-run store cache, gated saves  |

## Notes

- A branch's first run finds no cache of its own and falls back to the default branch's, so a Renovate or pull request branch's first run reads `main`'s store and mirror, and fetches only what their lock adds.
- A cache is evicted by least recent use once the repository passes its cap, so the mirror and the store survive because the two saving branches read them on every run.
- The lockfile verification cache that `pnpm/setup` saves either way is a single small entry, and CodeQL's internal cache is not written by this repository's workflows. Neither is governed by this rule.
