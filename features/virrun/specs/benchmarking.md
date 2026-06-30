# virrun — Benchmarking

The speed gate. The whole project's value is "faster than doing it normally" — so every backend and speed feature must prove it against a native baseline, continuously. A path that loses to baseline is deleted.

## The rule

For each scenario, compare against **baseline = the same command run natively on the host** (warm OS cache, normal disk, normal network). A sandbox path ships only if:

- **Warm path** (snapshot/fork or shared store hit) is **meaningfully faster** than baseline.
- **Cold path** (first-ever run, empty caches) is **no worse than baseline by more than a small, documented overhead** — the one-time cost is bought back by later warm runs.

If neither holds, the feature has negative value. Cut it.

## Scenarios

Run across a fixed corpus of real repos (small / medium / monorepo; with and without native deps):

- `install` — `pnpm install` cold, and warm (lockfile unchanged).
- `build` — typical build command.
- `test` — typical test command.
- `boot` — time to a ready sandbox.
- `fork` — time to clone a warm snapshot to a runnable state (the headline number).
- `repeated runs` — N sequential `test` runs (where warm-fork should dominate baseline).

## Cache states (measure each explicitly)

Cold (empty store + no snapshot) · warm store (deps present, no snapshot) · warm snapshot (post-install frozen). Never report a single number — report the matrix, and label which state.

## Metrics

Wall-clock (primary), plus peak RAM, disk written (should be ~0 for RAM FS), and network bytes (should be 0 on warm). Report median + p95 over ≥5 runs; pin CPU/RAM/OS of the bench host.

## Methodology

- Same host, same corpus, alternate sandbox vs baseline to cancel drift.
- Control the OS page cache between cold runs (drop caches) so "cold" is honest.
- Bench both backends; `vfs` and `os` have different cost profiles. Keep **one** `.bench.ts` source per workload — never fork the logic into `.linux.bench.ts` / `.wsl.bench.ts` files. A workload whose numbers genuinely differ by host (the `os` backend runs `os/linux` natively and `os/wsl` bridged from win32) is named `*.platform.bench.ts`: the reporter then writes per-platform artifacts (`Foo.platform.bench.<platform>.md`, keyed by `process.platform`) so a win32 run and a linux run each update only their own committed file instead of clobbering each other. Plain `*.bench.ts` stays single-artifact and cross-platform. The sandbox task is still labelled by bridge (`os/linux`, `os/wsl`) and the markdown Environment block still records the exact kernel/runner.
- Track results over time (regressions are bugs). The CI signal is hardware-independent **CodSpeed simulation** (🏎️ Bench, every push — PR regression comments + flamegraphs); the committed results file (below) is the offline diff gate. A hard wall-clock CI fail is rejected as runner-noise-flaky → [../out-of-scope/ci-walltime-gate.md](../out-of-scope/ci-walltime-gate.md). To make CodSpeed simulation a blocking check, mark it required in branch protection (a GitHub repo setting, not a workflow change).

## Results file

`pnpm bench` (Vitest `bench`, stats via `tinybench`) writes **colocated per-file artifacts** — `Foo.bench.ts` → `Foo.bench.json` + `Foo.bench.md` beside it, each the tracked source of truth for that file (no merged `bench/results.*`). A `*.platform.bench.ts` instead emits per-platform pairs (`Foo.platform.bench.<platform>.{json,md}`). Each md records environment metadata (date, **commit**, Node version, OS + release, arch, CPU model + core count, RAM) and, per group, a latency table (mean / ±rme / p99 / samples per task) plus the `vs base` multiplier against the baseline task (native = `1.00×`). Regenerate before committing and diff the multipliers. Numbers are machine-dependent — only compare runs from the same host; Linux, WSL2, and future macOS VM results are intentionally separate datapoints (the per-platform artifacts for a `*.platform.bench.ts`, or the single committed file's last-host run otherwise).

## Constraints / Notes

- No silent wins: if a speedup only appears in an unrealistic state (e.g. everything pre-warmed by the bench itself), say so.
- The biggest expected win is **warm-fork repeated runs**; the riskiest number is **cold install overhead** — watch it closely.
