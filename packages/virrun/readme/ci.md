# virrun — CI

How the two gates are enforced in CI, and how the warm snapshot is cached across runs. Design rationale lives in the [benchmarking](https://github.com/Esposter/Esposter/blob/main/features/virrun/specs/benchmarking.md) and [correctness](https://github.com/Esposter/Esposter/blob/main/features/virrun/specs/correctness.md) specs.

## The two gates

A change that fails either gate does not ship. Correctness beats speed — a fast wrong answer is worthless.

| Gate                         | What it proves                                                            | How it's enforced                                                                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Differential correctness** | A backend is observably identical to native (exit code + stdout + stderr) | The `*.differential.test.ts` files are plain Vitest. They run in the 🏗️ CI coverage shards (bubblewrap enabled), so a divergence **hard-fails the build**.                              |
| **Speed**                    | A sandbox path beats the native baseline                                  | **CodSpeed simulation** (🏎️ Bench, every push) — hardware-independent CPU/cache simulation → PR regression comments + flamegraphs. The committed `*.bench.md` is the offline diff gate. |

A hard wall-clock CI fail was considered and rejected — shared-runner wall-clock is too noisy for a pass/fail bar (it would be flaky-red). CodSpeed simulation covers regression detection instead. To make the CodSpeed check blocking, mark it **required** in branch protection (a GitHub repo setting, not a workflow change). → [decision](https://github.com/Esposter/Esposter/blob/main/features/virrun/out-of-scope/ci-walltime-gate.md)

### Run the gates locally

```bash
pnpm test path/to/foo.differential.test.ts   # one differential corpus
pnpm bench                                    # regenerate the committed *.bench.md, then diff the vs-base multipliers
```

## Snapshot cache

The `os` backend keys a warm post-install snapshot by the pnpm lockfile hash and stores it at `~/.virrun/snapshots/<hash>`. A `fork()` stacks that frozen overlay upper read-only beside the source, so a routed command reuses the dep tree instead of reinstalling.

In CI this directory is persisted across runs with `actions/cache`, mirroring the repo's `build-packages` content-hash cache:

- A reusable **`warm-snapshot.yaml`** job captures the snapshot **once** per run (`virrun -- true`, cold path = install) and the `actions/cache` entry — keyed by `hashFiles('pnpm-lock.yaml')` — persists `~/.virrun/snapshots` for this run and every later run.
- The `format` / `lint` / `typecheck` / `build` / `build-docs` jobs `needs: [build-packages, warm-snapshot]` and restore that cache read-only, so each `virrun -- <cmd>` forks the warm snapshot instead of cold-installing. One install per run, reused across runs. (`build` / `build-docs` route the Nuxt + TypeDoc builds through the prefix now that write-back flushes produced files to host — see [write-back.md](https://github.com/Esposter/Esposter/blob/main/features/virrun/specs/write-back.md).)

These jobs (and the cold-path capture) run `setup-packages` with **`install: false`**: `node_modules` comes from the frozen snapshot inside the sandbox, so a host `pnpm i` is redundant — it only ever served to resolve the `virrun` bin. Instead the action exposes a `virrun` launcher on `$GITHUB_PATH` (a one-line wrapper over the self-contained `dist/cli.js` delivered by the `build-packages` artifact), so the unchanged `virrun -- <cmd>` scripts still resolve without `node_modules/.bin`:

```yaml
- name: 📦 Setup Packages
  uses: ./.github/actions/setup-packages
  with:
    install: false # skip the redundant host pnpm i; expose the virrun bin from the artifact
```

This drops the multi-minute host install from every verify job. The `package-builds` dist artifact is still downloaded — `typecheck` resolves `@esposter/*` to their built `main`.

Only `~/.virrun/snapshots` is cached. The upper is built with pnpm `package-import-method=copy`, so it is self-contained — a fork never reads the repo-local `.virrun/store` (which is recreated empty if absent). The `coverage` job is the exception: it runs Vitest **natively**, not through `virrun`. Write-back now persists produced files, so the discarded-upper concern is moot — the real blocker is **nesting**: the suite exercises virrun's own os backend, and `isOsBackendSupported()` probes by spawning a nested `bwrap` + overlay. Inside a virrun sandbox that nested probe fails (unprivileged user namespaces forbid it), so the `*.differential.test.ts` files `describe.skipIf` themselves away — silently removing the correctness gate the coverage shards exist to enforce. Coverage stays native to keep that gate live.

A dependency change yields a new lockfile hash → a new cache key and snapshot, so a stale snapshot is never reused.
