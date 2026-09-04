# virrun — CI

How the two gates are enforced in CI, and where the warm cache lives. Design rationale lives in the [benchmarking](https://github.com/Esposter/Esposter/blob/main/packages/app/content/docs/virrun/benchmarking.md) and [correctness](https://github.com/Esposter/Esposter/blob/main/packages/app/content/docs/virrun/correctness.md) docs pages.

## The two gates

A change that fails either gate does not ship. Correctness beats speed — a fast wrong answer is worthless.

| Gate                         | What it proves                                                            | How it's enforced                                                                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Differential correctness** | A backend is observably identical to native (exit code + stdout + stderr) | The `*.differential.test.ts` files are plain Vitest. They run in the 🏗️ CI coverage shards (bubblewrap enabled), so a divergence **hard-fails the build**.                                  |
| **Speed**                    | A sandbox path beats the native baseline                                  | The committed `*.bench.md` from local `pnpm bench` is the offline diff gate; 🏎️ Bench runs plain `vitest bench` shards every push as a smoke signal that every `*.bench.ts` still executes. |

A hard wall-clock CI fail was considered and rejected — shared-runner wall-clock is too noisy for a pass/fail bar (it would be flaky-red). CodSpeed (simulation dashboard, PR regression comments, flamegraphs, and the walltime/memory modes on its bare-metal runners) previously covered regression detection but was removed: the runs exceeded the free tier's 600 min/month, after which every upload failed and posted a red commit status. → [decision](https://github.com/Esposter/Esposter/blob/main/packages/app/content/docs/virrun/rejected/ci-walltime-gate.md)

### Run the gates locally

```bash
pnpm test path/to/foo.differential.test.ts   # one differential corpus
pnpm bench                                    # regenerate the committed *.bench.md, then diff the vs-base multipliers
```

## Native on Linux CI

The committed `virrun.config.ts` branches on `process.platform`: **win32 → `os`** (the WSL sandbox with its warm snapshot + prepare layer), **everything else → `native`**. The Linux CI runners therefore run every `virrun -- <cmd>` as a plain native exec — the sandbox and its overlay layers exist to fix a _Windows_ problem (the host's win32-generated `.nuxt` misfiring Linux type-aware tooling), and a Linux runner generates platform-correct artifacts in place.

What the os-backend warm layers provided in CI maps onto standard, backend-free equivalents:

- **Dependency snapshot → the pnpm store cache.** Every job runs a plain `pnpm i` restored from the `pnpm/setup` pnpm store cache — the same lockfile-keyed reuse, without bubblewrap, the warm-capture job, or the multi-gigabyte snapshot `actions/cache` entry.
- **Prepare layer → `postinstall: nuxt prepare`.** The install itself regenerates the Linux `.nuxt` in place on every job, platform-correct by construction.

This dropped an entire serialization stage from the critical path (the former `warm-cache.yaml` job every verify job `needs`-ed) plus the per-job bubblewrap install, and let every non-bwrap job move from the pinned `ubuntu-26.04` image back to `ubuntu-latest` (26.04 was only needed for bubblewrap >= 0.10.0; 24.04 ships 0.9.0). The one exception is `coverage`: it stays on `ubuntu-26.04` **with** bubblewrap because the suite tests virrun's own os backend — on an image without a capable bwrap the `*.differential.test.ts` files `describe.skipIf` themselves away, silently deleting the correctness gate.

## Snapshot + prepare cache (win32 / local)

The `os` backend keys a warm post-install snapshot by the environment it was installed under — the pnpm lockfile digest plus the node major the sandbox runs — and stores it at `~/.virrun/snapshots/<hash>`; with an `environment` preset it also provisions a source-keyed prepare layer (`~/.virrun/prepare/<key>`, the framework's Linux-generated `.nuxt`). A `fork()` stacks both read-only beside the source, so a routed command reuses the dep tree and generated artifacts instead of reinstalling and re-running `nuxt prepare`. These layers are consumed by overlay lower-stacking, so they are inherently os-backend artifacts — the native backend's equivalents are the host's own real `node_modules` and `.nuxt`, which is exactly what Linux CI uses above. `virrun warm` provisions both ahead of time on an os-backend host.

The snapshot upper is built with pnpm `package-import-method=copy`, so it is self-contained — a fork never reads the repo-local `.virrun/store` (which is recreated empty if absent). A dependency change — or a node major change, since the installed tree is ABI-bound — yields a new key → a new snapshot, so a stale snapshot is never reused.

## Task cache in CI

The [task cache](https://github.com/Esposter/Esposter/blob/main/packages/app/content/docs/virrun/task-cache.md) (skip unchanged builds) is **disabled in CI** and `~/.virrun/tasks` is deliberately **not** persisted across runs. It is a dev-loop lever: a hit needs the command, lockfile, and whole working tree to be unchanged, but every CI push is a fresh commit that changes the working-tree hash — so hits would be ~0 while the per-command source hashing (`git ls-files -s` + `git diff`) only adds cost. `isTaskCacheEnabled` short-circuits when the `CI` env var is truthy, so the CI jobs pay neither the hashing nor a lookup. The pnpm store cache + `package-builds` artifact above are what make CI fast; the task cache is orthogonal and local.

The **capability cache** (`~/.virrun/capability.json`) is likewise not worth persisting in CI — a fresh runner re-probes once, cheaply, on the first routed command. Its payoff is the local dev loop, where every `virrun -- <cmd>` is a new process that would otherwise re-run the probe (on win32, three `wsl.exe` round-trips).
