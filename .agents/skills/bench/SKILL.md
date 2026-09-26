---
name: bench
description: Apply when adding or editing benchmarks, or changing what a *.bench.md contains. Esposter benchmarking conventions — colocated *.bench.ts files run as one bench.compare under BENCHMARK_RUN_OPTIONS, benching the unit rather than its wrapper, fresh fixtures for mutating ops, one test per scale, the bench as the only speed gate, a stopwatch as a probe never an answer, and the colocated report pipeline.
---

# Benchmarking Conventions

A benchmark is a test. `bench` comes from the test context, each registration is a value, and one `bench.compare(...)` runs the group and is what the report reads — so a bench file carries no bench-only API beyond that fixture, and there is no separate bench runner, bin, or direct `tinybench` dependency (tinybench is underneath, reached through Vitest).

`pnpm bench` is `vitest bench --run` in a package (from the root it is the chain under Running below), and a reporter writes colocated `*.bench.{json,md}` you commit and diff — the offline gate. 🏎️ Bench (CI) runs one unsharded `vitest bench --run` every push as an executes-clean smoke signal only: no reporter commit, no dashboard. Sharding it would buy nothing but repeated setup, since nothing reads its numbers.

## Settled — do not re-propose

- **A lint rule or scan for the bench rules** — whether a fixture is fresh all the way down, whether a group holds one scale, whether the thing benched is the unit or its wrapper are questions about what the code means, and the population is a dozen files; the committed-artifact rule is `scripts/src/workspace/benchArtifacts.test.ts`.

## A stopwatch is a probe, never an answer

A session wanting to know how long something takes reaches for `time` or a `performance.now()` loop, reads the
number, and moves on — and the number dies with the turn, so the next session times it again, on another host, and
compares two stopwatch readings that agree on nothing. **The number a session would quote, compare or re-check lives
in a committed `*.bench.md`, and nowhere else.** An ad-hoc timing is allowed for one thing: locating where inside a
run the time goes before a bench is written — which phase, which spawn, which read — and what it finds becomes a
bench or is dropped. A timing loop run twice on the same question is the bespoke script the section below refuses,
whether it lives in a file or in a shell history.

## Deep dive

- `references/report-pipeline.md` — when changing what a `*.bench.md` contains, touching the reporter, or adding a package that benches.
- `references/fixtures.md` — when a bench needs a fixture: shared, rebuilt per iteration, or read-only.
- `references/what-to-bench.md` — when choosing what a bench measures: the unit, the axis, the shape, a slow workload, a baseline.
- `references/running-benchmarks.md` — when running benches, adding one to `scripts`, switching one off, or gating one on CI.

## Writing benchmarks

- **Colocate `*.bench.ts` next to the source**, like `*.test.ts`. ctix and the build exclude them; Vitest's `bench` glob picks them up and `vitest run` ignores them, so the two never collide.
- **One `test()` per group, one `bench.compare()` inside it.** The test's full name is the markdown section title, so a `describe` around it nests exactly as it reads: `describe(Command, () => test("insert 100 rows", …))` renders `## Command > insert 100 rows`. A second `compare` in the same test renders a second table under a title of its own, so it has to earn one.
- **Pass `BENCHMARK_RUN_OPTIONS` (`@esposter/shared-node/bench`) as the last `compare` argument.** It zeroes the wall-clock budget and names the iteration count, which is what keeps a committed sample count machine-stable rather than a function of the host. A heavier group spreads its own counts on top: `{ ...BENCHMARK_RUN_OPTIONS, iterations: 3, warmupIterations: 0 }`.
- **A mutating op rebuilds its fixture inside the callback, fresh all the way down**; a read-only input is hoisted to module scope (`references/fixtures.md`).
- **Bench the unit, not its wrapper**, over a scaling axis, one test per scale when shape varies too (`references/what-to-bench.md`).
- **A workload measured in seconds is still a plain bench**, with an iteration override on the comparison, never a timing script (`references/what-to-bench.md`).
- **Never answer Vitest's export-getter warning from the code** — the factory suppresses it (`references/what-to-bench.md`).

## Running

`pnpm bench` in a package, or from the root one member at a time (`--workspace-concurrency=1`); a slow bench measuring the toolchain is switched off once committed, and one that destroys what CI restored skips on `CI` (`references/running-benchmarks.md`).

## The bench _is_ the speed gate — no `.speed.test.ts`

Speed regressions are caught by regenerating and diffing the colocated `*.bench.md`, never by timing assertions in the unit suite. Do **not** add `*.speed.test.ts` files that spawn a baseline and `expect(ratio).toBeGreaterThan(...)`: it duplicates the bench, flakes on a loaded host, and slows `pnpm test`. The bench already measures it — a hot path that silently falls back to native collapses its `vs base` toward `1.00×`. Correctness gates asserting output parity _are_ tests; only speed lives in the bench.
