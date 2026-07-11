---
title: Benchmarking
description: The speed gate — must beat the native baseline, measured by committed colocated bench artifacts diffed offline.
---

# Benchmarking

The speed gate. The project's value is "faster than doing it normally," so every backend and speed feature must prove it against a native baseline, continuously. A path that loses to baseline is deleted.

## The rule

For each scenario, compare against **baseline = the same command run natively on the host** (warm OS cache, normal disk). A sandbox path ships only if the **warm path** (snapshot/fork or store hit) is meaningfully faster than baseline, and the **cold path** is no worse than a small, documented overhead the warm runs buy back. If neither holds, the feature has negative value — cut it.

## Results artifacts

`pnpm bench` (Vitest `bench`, stats via tinybench) writes **colocated per-file artifacts**: `Foo.bench.ts` → `Foo.bench.json` + `Foo.bench.md` beside it, each the tracked source of truth for that file — no merged results file. Each md records environment metadata (date, commit, Node version, OS + release, arch, CPU, RAM) and, per group, a latency table (mean / ±rme / p99 / samples) plus the `vs base` multiplier against the native baseline task (`1.00×`). Regenerate before committing and diff the multipliers — the committed artifact is the offline regression gate.

Keep **one** `.bench.ts` source per workload — never fork the logic into per-host files. A workload whose numbers genuinely differ by host is named `*.platform.bench.ts`: the reporter writes per-platform artifacts (`Foo.platform.bench.<platform>.md`, keyed by `process.platform`) so a win32 run and a Linux run each update only their own committed file. Numbers are machine-dependent — only compare runs from the same host; Linux and WSL2 results are intentionally separate datapoints.

## Methodology

- Same host, same corpus, alternate sandbox vs baseline to cancel drift; report median-style stats over multiple runs.
- **A "cold install" bench must run over a source with no `node_modules`.** The overlay lower _is_ the source, so a cold task pointed at the live repo installs into an already-populated `node_modules` — pnpm no-ops and "cold" silently measures the warm path. The cache-layer bench clones HEAD into a gitignored-free checkout (`createCleanRepositoryCheckout`) as its source; it is deliberately **store-warm cold**, so it installs offline and measures the materialise cost rather than a flaky network download.
- Track results over time — regressions are bugs. The 🏎️ Bench CI job runs plain `vitest bench` shards every push as an executes-clean smoke signal only; a hard wall-clock CI gate is rejected as runner-noise-flaky ([CI wall-time gate](/docs/virrun/rejected/ci-walltime-gate)).
- No silent wins: if a speedup only appears in an unrealistic state (everything pre-warmed by the bench itself), say so. There is **no install bench group** — the os install feeds the fork snapshot, not host disk, so a head-to-head vs native install would imply a substitution that can't be made ([materialize node_modules](/docs/virrun/rejected/materialize-node-modules)).

## What the numbers say

The biggest win is **warm-fork repeated runs**; the riskiest number is cold overhead. On ext4 the remaining per-command tax is inherent overlayfs read cost (~30–50% on the file I/O a command does) — the OS page cache already serves a warm native run from RAM, so "RAM filesystem" is not a per-command speedup; the product is skipping installs, skipping unchanged re-runs, and not paying bridge taxes ([architecture](/docs/virrun/architecture)). Post source-mirror, win32 `vs base` sits at 0.46–0.91× with build/persist/test in the Linux 0.76–0.95× band ([WSL source mirror](/docs/virrun/wsl-source-mirror)).

## Notes

- Bench both backends — `vfs` and `os` have different cost profiles. The sandbox task is labelled by bridge (`os/linux`, `os/wsl`) and the md Environment block records the exact kernel/runner.
- CodSpeed (hardware-independent CPU simulation with PR regression comments) was removed after exceeding its 600 min/month free tier; the `CODSPEED_ENV`-gated plugin wiring remains for easy re-enable.
- The operational how-to lives in `packages/virrun/readme/speed-harness.md` (published npm docs).
