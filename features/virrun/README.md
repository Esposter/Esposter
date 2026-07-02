# virrun

An ephemeral, in-memory virtual runner: boot any repo into a RAM-backed filesystem, run its **real toolchain** (pnpm/npm, native addons, scripts) fast and isolated, then **snapshot and fork** the warm state so repeated runs are near-instant.

Standalone OSS project (eventually its own repo / `packages/virrun*`); design docs incubate here. This README is the index.

## What it is — and is not

- **Not a VFS.** The virtual filesystem is a _reused_ layer (`node:vfs` / `@platformatic/vfs`), not the product.
- **It is a runtime.** The product is the layer that **runs real processes** against that FS, isolates them, and snapshots/forks them. node:vfs _stores_ files; this _runs_ the toolchain over them.

## Design goals

The point is **developer experience through speed** — make the everyday toolchain (install, build, test, lint) dramatically faster by removing the two things that make it slow:

- **Network-bound waits** — deps are fetched once into a shared store and reused; a warm snapshot skips install entirely. Re-runs don't re-download.
- **Disk I/O** — files live in a RAM filesystem; `node_modules` and build output never touch real disk.

Plus: **ephemeral** (spin up / throw away, no polluted machine state), **reproducible** (same source + lockfile → same warm snapshot), **isolated** (a run can't corrupt the host), and **drop-in** (existing commands run unchanged — no per-repo rewrite).

**Adoption is a goal, not an afterthought.** A repo moves commands onto the sandbox one at a time, behind a single `virrun -- <cmd>` prefix, with auto-fallback to native — so trying it costs one token and reverting costs one token. See [specs/adoption.md](specs/adoption.md).

## Gates (non-negotiable)

Two pass/fail gates on every backend and speed feature — a violation is not shippable, however clever: **faster than the native baseline**, and **observably correct** (exit code, stdout/stderr, produced files, dependency tree) vs running the command natively. Correctness beats speed; a fast wrong answer is worthless. Both are now **CI-enforced**: differential correctness is a shared Vitest harness (a growing command corpus, an explicit `normalizeExecResult` masking seam with nothing normalized implicitly, and the `assertDifferential` helper both backends run their corpus through) that hard-fails the 🏗️ CI coverage shards on any divergence; speed is tracked by hardware-independent **CodSpeed simulation** (🏎️ Bench) plus the committed `*.bench.md` offline diff (a hard wall-clock CI fail is rejected as runner-noise-flaky → [out-of-scope/ci-walltime-gate.md](out-of-scope/ci-walltime-gate.md)). Detail: [benchmarking](specs/benchmarking.md) · [correctness](specs/correctness.md).

## Now

**Quantify the win32 mirror lift — bench re-run.** The WSL ext4 source mirror shipped (see `## Shipped`), including the follow-on fix for the PATH regression it introduced (the sandbox chdir moved off `/mnt/c`, so a bare command's `node_modules/.bin` lookup must be re-anchored at the mirror — [wsl-source-sync](specs/wsl-source-sync.md)). The one open item is re-running `pnpm bench` on win32 to record the actual speed lift honestly (no overclaim) — blocked on a healthy WSL host (this host's sandbox errors on capture). Broadening the isolation surface (macOS bridge, Firecracker) stays deferred, not a `Now` item.

## Shipped

Terse log; the linked spec holds the detail.

- **Foundations** — the `ExecBackend` seam, native passthrough backend, async `createVirrun`, `dir`/`files`/`git` source loaders, the `virrun -- <cmd>` CLI, and the `pnpm bench` foundation (colocated `*.bench.{json,md}`). → [orchestrator-api](specs/orchestrator-api.md) · [adoption](specs/adoption.md) · [benchmarking](specs/benchmarking.md)
- **VFS layer** — `FsProvider` + `createPlatformaticFsProvider` over `@platformatic/vfs` (the lone import, doubling as the `node:vfs` swap shim); mounting patches `require`/`fs` to serve virtual files. → [virtual-fs](specs/virtual-fs.md)
- **`vfs` backend** — runs `node -e`/`--eval` and `node <file>` in-process over the overlay FS, falling back to native for anything it can't run faithfully. Opt-in; `Auto` stays native. → [exec-isolation](specs/exec-isolation.md)
- **`os` backend** — real process exec inside a rootless `bubblewrap` RAM-overlay (source RO lower + tmpfs upper), plus a lazy content-addressable pnpm dep store (`.virrun/store/pnpm`, bind-mounted + reused) and the WSL2 bridge from Windows. macOS VM bridge open. → [exec-isolation](specs/exec-isolation.md)
- **WSL ext4 source mirror** — on win32 the source lower is a WSL-native ext4 mirror (`<cache>/sources/<sha256(hostCwd)>`, per-mirror `flock`, incremental `rsync -a --delete` excluding `node_modules` + `.git`) instead of `/mnt/c`, moving the toolchain's source reads off v9fs (15–64× slower). `--overlay-src`/`--chdir` point at the mirror; write-back's flush target stays `options.cwd`, independent. Because the sandbox now chdir's into the mirror (not `/mnt/c`), the os PATH prepends the mirror's own `node_modules/.bin` so a bare `tsgo`/`eslint`/`oxlint` resolves the overlaid current-platform binary ahead of the win32 host `.bin` the WSL login PATH leaks in. `virrun doctor` probes `rsync`; `cache clean --all` sweeps `sources/`. Bench quantification of the lift is still open (needs a healthy WSL host). → [wsl-source-sync](specs/wsl-source-sync.md)
- **Snapshot + warm-fork** — lockfile-hash-keyed overlay snapshot (`~/.virrun/snapshots/<hash>`): `createSnapshot` captures a warm post-install layer, `forkSnapshot` re-runs over it with writes vanishing, publish is atomic (per-pid temp + `rename`). Exposed as `fork()` on the orchestrator. → [snapshot-fork](specs/snapshot-fork.md)
- **Write-back** — a persist run forks the warm snapshot with a persistable upper and, on clean exit only, reconciles it onto the host so disk matches native — never flushing `node_modules` (the snapshot lower). The default for a bare `virrun -- <cmd>`; `run --ephemeral` keeps the vanishing fork. → [write-back](specs/write-back.md)
- **Task cache** — a persist run keyed by `sha256(lockfile-hash + working-tree-hash + command)` (working-tree hash = `git ls-files -s` + `git diff --binary` + untracked); a hit skips the sandbox and replays the recorded diff + streams. Default-on locally, off in CI (fresh commit → ~0 hits) and under `--no-cache`. → [config-and-cache](specs/config-and-cache.md)
- **Config backend selection** — a committed repo-root `virrun.config.json` (`backend`/`fallback`) pins the backend; the prefix stays the sole per-command switch (no allowlist), with host-support auto-fallback. → [config-and-cache](specs/config-and-cache.md) · [adoption](specs/adoption.md)
- **citty CLI** — `run`/`exec`/`snapshot`/`init`/`cache`/`doctor` subcommands with generated `--help`; the bare `virrun -- <cmd>` prefix preserved as the default `run`. → [getting-started](https://github.com/Esposter/Esposter/blob/main/packages/virrun/readme/getting-started.md#subcommands)
- **CI snapshot cache** — a reusable `warm-snapshot.yaml` captures the warm snapshot once per CI run, persisted as a lockfile-hash-keyed `actions/cache`; the os-backend jobs restore it read-only and `fork()` instead of cold-installing (host `pnpm i` dropped). → [virrun CI](https://github.com/Esposter/Esposter/blob/main/packages/virrun/readme/ci.md#snapshot-cache) · [snapshot-fork](specs/snapshot-fork.md)
- **Cross-process probe caches** — the os-backend capability probe and the win32 WSL environment probes (interactive-login PATH, native ext4 cache root) are persisted across processes, so a fresh `virrun -- <cmd>` on a warm host skips re-spawning the bwrap mount / `wsl.exe` round-trips. Only successful probes are cached; a transient failure re-probes. → [config-and-cache](specs/config-and-cache.md)
- **`virrun doctor`** — probes each `os`-backend prerequisite (bubblewrap `>= 0.10.0`, a Linux `node` in the WSL login shell on win32, `python3` for write-back, the real overlay-mount verdict) and prints an aligned per-check report, exiting non-zero on any gap. → [getting-started](https://github.com/Esposter/Esposter/blob/main/packages/virrun/readme/getting-started.md#cli)
- **Bench-truth** — corrected the speed story (no overclaim): cut the non-cashable install / warm-vs-cold-reinstall bench groups (the os install feeds the fork snapshot, not host disk → [out-of-scope/materialize-node-modules.md](out-of-scope/materialize-node-modules.md)) and memoized `computeLockfileHash`. On ext4 the remaining per-command tax is inherent overlayfs read cost. → [benchmarking](specs/benchmarking.md)

## Decisions

Grep [out-of-scope/](out-of-scope) (won't do) and [deferred/](deferred) (not yet) before adding a roadmap item — each decided idea lives in one file there with its rationale, so it isn't re-argued.

## Reference

- [architecture.md](architecture.md) — system overview diagram, layer map, the five layers, reuse-vs-build, the subprocess wall.
- [roadmap.md](roadmap.md) — checkbox backlog of open work.
- [specs/virtual-fs.md](specs/virtual-fs.md) — FS layer (reuse node:vfs/platformatic + one-line-swap plan).
- [specs/exec-isolation.md](specs/exec-isolation.md) — the core: real exec + isolation backends.
- [specs/snapshot-fork.md](specs/snapshot-fork.md) — warm snapshot + fork.
- [specs/wsl-source-sync.md](specs/wsl-source-sync.md) — win32: mirror the source onto WSL ext4 to kill the v9fs read tax.
- [specs/write-back.md](specs/write-back.md) — native-equivalent persistence: flush a mutation command's produced files back to host.
- [specs/orchestrator-api.md](specs/orchestrator-api.md) — the TS, node-compatible public API.
- [specs/adoption.md](specs/adoption.md) — incremental opt-in: prefix → script → config (backend selection), with auto-fallback; dogfooding ladder for this repo.
- [specs/config-and-cache.md](specs/config-and-cache.md) — the on-disk surface: `virrun.config.json` backend selection (committed) + `.virrun/` cache (gitignored).
- [specs/benchmarking.md](specs/benchmarking.md) — speed gate: baselines, metrics, methodology, must-beat-native rule.
- [specs/correctness.md](specs/correctness.md) — correctness gate: differential testing vs native, test layers, coverage.
- [reference/prior-art.md](reference/prior-art.md) — surveyed projects (node:vfs, platformatic, just-bash, WebContainers, e2b, Firecracker) and why each does/doesn't fit.
