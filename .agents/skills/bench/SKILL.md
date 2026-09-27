---
name: bench
description: Apply when adding or editing benchmarks, timing how long anything takes, or changing what a *.bench.md contains. Esposter benchmarking — a benchmark is an ordinary Vitest test whose committed, colocated *.bench.md is the only speed gate and the only number a session quotes, so there is no .speed.test.ts, no timing script and no stopwatch reading kept; BENCHMARK_RUN_OPTIONS on every bench.compare, and the unit benched rather than its wrapper.
---

# Benchmarking Conventions

A benchmark is a test. `bench` comes from the test context, each registration is a value, and one `bench.compare(...)` runs the group and is what the report reads — so a bench file carries no bench-only API beyond that fixture, and there is no separate bench runner, bin, or direct `tinybench` dependency (tinybench is underneath, reached through Vitest).

A reporter writes each bench file's results to colocated `*.bench.{json,md}` you commit and diff — the offline gate; how a run is started from a package, from the root and on CI is `references/running-benchmarks.md`.

## Settled — do not re-propose

- **Sharding the 🏎️ Bench job** — it is an executes-clean smoke signal whose numbers nothing reads, so a shard buys only repeated setup (`references/running-benchmarks.md`).
- **A lint rule or scan for the bench rules** — whether a fixture is fresh all the way down, whether a group holds one scale, whether the thing benched is the unit or its wrapper are questions about what the code means, and the population is small enough to read; the committed-artifact rule is `scripts/src/workspace/benchArtifacts.test.ts`.

## Deep dive

- `references/speed-gate.md` — when about to time something with a stopwatch, or to assert a speed in a test.
- `references/report-pipeline.md` — when changing what a `*.bench.md` contains, touching the reporter, or adding a package that benches.
- `references/fixtures.md` — when a bench needs a fixture: shared, rebuilt per iteration, or read-only.
- `references/what-to-bench.md` — when choosing what a bench measures: the unit, the axis, the shape, a slow workload, a baseline.
- `references/running-benchmarks.md` — when running benches, adding one to `scripts`, switching one off, or gating one on CI.

## Writing benchmarks

- **The number a session would quote, compare or re-check lives in a committed `*.bench.md`, and nowhere else** — an ad-hoc timing only locates where a run's time goes before a bench is written (`references/speed-gate.md`).
- **The bench is the speed gate** — never a `*.speed.test.ts` asserting a ratio in the unit suite (`references/speed-gate.md`).
- **Colocate `*.bench.ts` next to the source**, like `*.test.ts`. ctix and the build exclude them; Vitest's `bench` glob picks them up and `vitest run` ignores them, so the two never collide.
- **One `test()` per group, one `bench.compare()` inside it.** The test's full name is the markdown section title, so a `describe` around it nests exactly as it reads: `describe(Command, () => test("insert 100 rows", …))` renders `## Command > insert 100 rows`. A second `compare` in the same test renders a second table under a title of its own, so it has to earn one.
- **Pass `BENCHMARK_RUN_OPTIONS` (`@esposter/shared-node/bench`) as the last `compare` argument.** It zeroes the wall-clock budget and names the iteration count, which is what keeps a committed sample count machine-stable rather than a function of the host. A heavier group spreads its own counts on top: `{ ...BENCHMARK_RUN_OPTIONS, iterations: 3, warmupIterations: 0 }`.
- **A mutating op rebuilds its fixture inside the callback, fresh all the way down**; a read-only input is hoisted to module scope (`references/fixtures.md`).
- **Bench the unit, not its wrapper**, over a scaling axis, one test per scale when shape varies too (`references/what-to-bench.md`).
- **A workload measured in seconds is still a plain bench**, with an iteration override on the comparison, never a timing script (`references/what-to-bench.md`).
- **Never answer Vitest's export-getter warning from the code** — the factory suppresses it (`references/what-to-bench.md`).

## Running

`pnpm bench` in a package, or from the root one member at a time (`--workspace-concurrency=1`); a slow bench measuring the toolchain is switched off once committed, and one that destroys what CI restored skips on `CI` (`references/running-benchmarks.md`).
