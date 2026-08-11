---
name: bench
description: Esposter benchmarking conventions — colocated *.bench.ts files on Vitest's own bench(), module-level setup because bench callbacks fire before suite hooks, benching the unit rather than its use* composable wrapper, rebuilding a fresh fixture inside the callback for mutating ops, varying input shape as well as scale with nested describes per scale so vs base stays meaningful, running bench per package and from the root, and the bench being the speed gate so no .speed.test.ts exists — plus a deep dive on the report pipeline (the colocated per-file JSON/Markdown reporter, the stable runner, the md columns, platform-suffixed artifacts, where the tooling lives, and the dormant CodSpeed wiring). Apply when adding or editing benchmarks, or changing what a *.bench.md contains.
---

# Benchmarking Conventions

Benchmarks run on Vitest's built-in `bench()` (tinybench underneath). There is no separate bench runner, bin, or direct `tinybench` dependency.

`pnpm bench` runs plain tinybench and a reporter writes colocated `*.bench.{json,md}` you commit and diff — the offline gate. 🏎️ Bench (CI) runs sharded `vitest bench --run` every push as an executes-clean smoke signal only: no reporter commit, no dashboard.

## Deep dive

- `references/report-pipeline.md` — when changing what a `*.bench.md` contains, touching the reporter or runner, adding a package that benches, or re-enabling CodSpeed.

## Writing benchmarks

- **Colocate `*.bench.ts` next to the source**, like `*.test.ts`. ctix and the build exclude them; Vitest's `bench` glob picks them up and `vitest run` ignores them, so the two never collide.
- Use `describe(...)` + `bench(name, fn)`. The describe label becomes the markdown section title.
- **Module-level setup, not `beforeAll`** — Vitest fires `bench()` callbacks before suite hooks resolve, so fixtures are built at module scope (top-level `await` is fine).
- **Bench the unit, not its `use*` composable wrapper.** Bench the pure function or command class directly. A composable drags in the nuxt environment and pinia, whose fixed setup overhead drowns the unit's signal, and it adds none of its own — its cost is the already-benched parts plus a store push. Its correctness is covered by its `*.test.ts`.
- **Rebuild a fresh fixture inside the callback for mutating ops.** `bench()` runs the callback in a tight loop, so anything mutating its input in place (every `execute`/`undo`) corrupts shared state after the first iteration. Build the item fresh inside the callback each iteration and accept that construction in the timing. Only pure, non-mutating functions may share a module-level fixture.
- **Pick a meaningful scaling axis** where one exists (100 / 1000 / 10000 rows) so a regression in per-unit cost is visible rather than drowned by fixed overhead.
- **Vary input _shape_, not just size.** Bench measures speed, not correctness — drive worst, best and typical shapes that stress the algorithm differently. Correctness edge cases stay in `*.test.ts`.
- **When both shape and scale vary, group by scale with nested `describe`s so `vs base` stays meaningful.** `vs base` is computed per group against the first task, so one flat group mixing 100/1k/10k rows makes the 10k task read `0.005×` — conflating scale with shape and burying the real signal. Each row count gets its own inner `describe` under the function's outer one; the outer suite has no direct benches and renders no section, so each group compares only shape at a fixed size.
- For a macro gate, bench the wrapped path against a native baseline in the same `describe` — a path that loses to native has negative value. For micro signal, isolate the unit with no process spawn, or a ~100ms spawn hides everything.

## Running

`pnpm bench` per package is `vitest bench --run`. Nothing else to chain.

From the **repo root** it is `vitest bench --run --project scripts && pnpm -r --if-present run bench` — the root `scripts/` suite first, then every package's, all **sequentially**: concurrent benches contend for CPU and skew machine-dependent numbers.

The leading `--project scripts` exists because `scripts/` is not a workspace package, so `pnpm -r` skips it and it needs the root Vitest run. The flag also isolates it — a bare root `vitest bench` would re-run every package's benches in parallel, the thing being avoided. That project scopes both globs to `scripts/`, `benchmark.include` included, since the default `**/*.bench.ts` would otherwise pull every package's bench file into it. Only deterministic, CPU-bound script units earn a bench; the network and spawn helpers are I/O-bound and unbenchable.

## The bench _is_ the speed gate — no `.speed.test.ts`

Speed regressions are caught by regenerating and diffing the colocated `*.bench.md`, never by timing assertions in the unit suite. Do **not** add `*.speed.test.ts` files that spawn a baseline and `expect(ratio).toBeGreaterThan(...)`: it duplicates the bench, flakes on a loaded host, and slows `pnpm test`. The bench already measures it — a hot path that silently falls back to native collapses its `vs base` toward `1.00×`. Correctness gates asserting output parity _are_ tests; only speed lives in the bench.
