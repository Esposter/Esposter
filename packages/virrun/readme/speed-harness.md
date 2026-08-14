# virrun — Speed Harness

The whole project's value is "faster than doing it normally", so every backend and speed feature proves it against a native baseline, continuously. A path that loses to baseline is deleted. Full methodology (scenarios, cache-state matrix, metrics) lives in the [benchmarking docs page](https://github.com/Esposter/Esposter/blob/main/packages/app/content/docs/virrun/benchmarking.md); this is the operational summary.

## The rule

For each scenario, baseline = the same command run natively on the host (warm OS cache, normal disk/network). A sandbox path ships only if its **warm** path (snapshot/fork or shared-store hit) is meaningfully faster than baseline, and its **cold** path (first run, empty caches) is no worse than baseline by more than a small, documented one-time overhead that later warm runs buy back.

## Committed artifacts

`pnpm bench` (Vitest `bench`, stats via `tinybench`) writes **colocated per-file artifacts** beside each bench — `Foo.bench.ts` → `Foo.bench.json` + `Foo.bench.md`, the tracked source of truth for that file (no merged results file). The markdown records environment metadata (date, commit, Node, OS, arch, CPU, RAM) and, per group, a latency table plus a **`vs base` multiplier** against the baseline task (native = `1.00×`, higher is faster, a fast task drifting back toward `1.00×` is a regression).

Regenerate before committing and diff the multipliers — this is the offline regression gate. Numbers are machine-dependent: only compare runs from the same host.

- A workload whose numbers genuinely differ by host (the `os` backend runs `os/linux` natively and `os/wsl` bridged from win32) is named `*.platform.bench.ts`. The reporter then writes per-platform artifacts (`Foo.platform.bench.<platform>.{json,md}`, keyed by `process.platform`) so a win32 run and a linux run each update only their own committed file instead of clobbering each other.
- Plain `*.bench.ts` stays single-artifact and cross-platform.

## CI smoke signal

The 🏎️ Bench workflow runs the same colocated `*.bench.ts` files as a plain sharded `vitest bench --run` on every push. It is a smoke signal only — that every bench still executes — not a speed gate: shared-runner wall-clock is too noisy for a pass/fail bar, so regression detection stays with the committed `*.bench.md` diffed offline. It is its own workflow rather than a 🏗️ CI job, so it never blocks a merge.

The reporter does rewrite `*.bench.md` beside each bench on the runner, but that is ephemeral disk and nothing commits it, so the tracked artifacts are untouched.

See [CI](https://github.com/Esposter/Esposter/blob/main/packages/virrun/readme/ci.md) for how the speed gate is enforced.
