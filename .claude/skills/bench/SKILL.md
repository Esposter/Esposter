---
name: bench
description: Esposter benchmarking conventions — colocated *.bench.ts files, vitest bench, the BenchmarkMarkdownReporter that auto-writes results.md beside results.json, and where bench tooling lives (@esposter/shared-node). Apply when adding or editing benchmarks.
---

# Benchmarking Conventions

Benchmarks run on Vitest's built-in `bench()` (tinybench under the hood). There is no separate bench runner, bin, or `tinybench` direct dependency.

## Writing benchmarks

- **Colocate `*.bench.ts` next to the source**, like `*.test.ts` (e.g. `loadFilesSource.bench.ts` beside `loadFilesSource.ts`). ctix and the build exclude `*.bench.ts`; Vitest's `bench` glob picks them up, and `vitest run` (test mode) ignores them — the two never collide.
- Use `describe(...)` + `bench(name, fn)`. The describe label becomes the markdown section title.
- **Module-level setup, not `beforeAll`** — Vitest fires `bench()` callbacks before suite hooks resolve, so set fixtures up at module scope (top-level `await` is fine for async setup like `createSandbox()`).
- Pick a meaningful scaling axis where it exists (e.g. bench `loadFilesSource` at 1 / 100 / 1000 files) so a regression in per-unit cost is visible, not drowned by fixed overhead.
- **Bench the unit, not its `use*` composable wrapper.** Bench the pure function or command class directly (`findDuplicateRows(...)`, `new DeleteRowsCommand(...).execute(item)`) — never the `useDeleteDuplicateRows`-style composable. A composable drags in `// @vitest-environment nuxt` + pinia, whose fixed setup overhead drowns the unit's signal, and it adds no new signal (its cost = the already-benched function + already-benched command + store push). The composable's correctness is covered by its `*.test.ts`.
- **Rebuild a fresh fixture inside the callback for mutating ops.** `bench()` runs the callback in a tight loop, so a command that mutates `item.dataSource` in place (any `execute`/`undo`) corrupts shared state after the first iteration. Build the item fresh inside the callback each iteration (`createBenchItem(benchRows100)`), accepting that fixed construction in the timing. Only pure, non-mutating functions (e.g. `findDuplicateRows`) may share a module-level fixture across iterations.
- **Vary input _shape_, not just size, for edge scenarios.** Bench measures speed, not correctness — drive worst/best/typical shapes that stress the algorithm differently (e.g. `findDuplicateRows` at 0% / 50% / 100% duplicates × First/Last mode), not just row count. Correctness edge cases stay in `*.test.ts`.
- **When both shape and scale vary, group by scale with nested `describe`s so `vs base` stays meaningful.** `vs base` is computed per group against the first task, so a single flat group mixing 100/1k/10k rows makes a 10k task read `0.005×` — conflating scale with shape and burying the real signal. Wrap each row count in its own inner `describe("10000 rows", …)` under the function's outer `describe`; the outer suite (no direct benches) renders no section, and each scale group compares only shape×mode at a fixed size (`mean (ms)` becomes directly comparable too). See `findDuplicateRows.bench.ts`.
- For a macro gate, bench the wrapped path against a native baseline in the same `describe` (a path that loses to native has negative value); for micro signal, isolate the unit of work with no process spawn so it isn't drowned (~100ms spawn hides everything).

## Running

`pnpm bench` (per package) = `vitest bench --run`. Nothing else to chain.

From the **repo root**, `pnpm bench` = `pnpm -r --if-present run bench` — runs every package's `bench` script recursively, **sequentially** (no `--parallel`: concurrent benches contend for CPU and skew the machine-dependent numbers). Each writes its own `bench/results.{json,md}` in its own cwd.

## Output — colocated per-file JSON + Markdown

Results are **scoped to each bench file**, the way a test is — not one merged report per package. `Foo.bench.ts` emits `Foo.bench.json` + `Foo.bench.md` **right beside it**. There is no `bench/` directory and no merged `results.{json,md}`.

- `getVitestConfiguration()` sets only `benchmark.reporters: ["@esposter/shared-node/reporter"]` (**no `outputJson`** — we don't use Vitest's merged-file writer). Same one-liner everywhere.
- The reporter is referenced by **path string**, not import: `configuration` builds before `shared-node`, so it can't import the reporter — but a literal string stays build-first, and Vitest resolves it **in bench mode only** to shared-node's `./reporter` **default export**.
- The reporter subclasses Vitest's `BenchmarkReporter`: `super.onTestRunEnd` prints the terminal comparison table, then `onTestRunEnd` reads the in-memory run via **`this.ctx.state.getFiles()`** and, per file, `writeBenchmarkReport` projects its task tree (`buildBenchmarkFileReport`) into a `BenchmarkReport`, validates it, and writes the colocated `.bench.json` (package-relative `filepath`, so no home-dir leak) + `.bench.md`. No bin, no merged file, no `outputJson` round-trip.
- `buildBenchmarkFileReport` reads a small local structural contract (`BenchmarkTaskNode`), **not** Vitest's experimental bench task types — a real `File`/`Task` is structurally assignable to it, so the projection survives Vitest's bench-format churn. A bench file with no benchmarks (e.g. a shared bench helper) writes nothing.
- Any package that runs `pnpm bench` needs `@esposter/shared-node` as a **devDependency** for the string to resolve; packages that never bench don't (the string is never loaded outside bench mode).
- **Commit** every `*.bench.json` + `*.bench.md`. Numbers are machine-dependent (each md carries its own environment block); only compare runs from the same host. `defineVitestProject`-based packages (e.g. the app) don't call `getVitestConfiguration()`, so they set the same `reporters: ["@esposter/shared-node/reporter"]` string inline.

## The bench _is_ the speed gate — no `.speed.test.ts`

Speed regressions are caught by regenerating + diffing the colocated `*.bench.md`, **not** by timing assertions in the unit suite. Do **not** add `*.speed.test.ts` files that spawn a baseline and `expect(ratio).toBeGreaterThan(...)`: it duplicates the bench, flakes on a loaded host, and slows `pnpm test`. The bench already measures the regression (a hot path that silently falls back to native collapses its `vs base` multiplier toward `1.00×`); CI enforcement is the **deferred bench gate**, not a per-file test. Correctness gates (`*.differential.test.ts` asserting output parity) _are_ tests — only speed lives in the bench.

## `*.bench.md` columns

Per group: `task | vs base | mean (ms) | ±rme | p99 (ms) | ops/sec | samples`.

- **`vs base`** — throughput multiplier the formatter derives: `baseline.mean / task.mean`. Baseline = the task named `native` if the group has one, else the first declared task (so list the baseline first). Baseline reads `1.00×`; faster `> 1`, slower `< 1` (sub-1 keeps significant digits via `toPrecision`, never collapsing to `0.00×`). This makes impact legible at a glance and a regression obvious on diff. **Never pin a specific multiplier in docs** — it's machine-dependent and changes every run; reference the colocated `*.bench.md` and describe magnitude qualitatively ("orders of magnitude").
- **`±rme`** — relative margin of error (the standard benchmark.js confidence figure), from the bench result.
- The **Environment** block carries `Commit` (`git rev-parse --short HEAD`, `unknown` outside a repo) for provenance — so an artifact can be tied to the code that produced it, since a bench can otherwise silently lag its implementation.

Changing what's rendered means updating `BenchmarkResult` (schema + interface) and `formatBenchmarkMarkdown`/`buildBenchmarkFileReport` (+ their tests). The reporter pipeline lives in `shared-node` and its wiring (`reporters`, dropping `outputJson`) in `configuration` — both are consumed as **built dist**, so **rebuild the changed package** (`pnpm build`) before `pnpm bench` or the edit won't take effect. The `shared-node` `index.test.ts` types-size snapshot moves when an exported interface changes (`-u`).

## Where bench tooling lives — `@esposter/shared-node`

Node-only shared tooling (the bench schemas, `formatBenchmarkMarkdown`, `writeBenchmarkResults`, `BenchmarkMarkdownReporter`) lives in `@esposter/shared-node`. It can't go in `@esposter/configuration` (built first; can't import a later package's reporter — which is why `getVitestConfiguration` wires the reporter as a path string, not an import) nor in `@esposter/shared` (browser bundle; no `node:os`). Build order: `configuration → shared → shared-node`. Consumers depend on it as a **devDependency** (tooling only, never runtime).

The reporter is the package's default export, exposed at the `@esposter/shared-node/reporter` subpath (a second rolldown entry → `dist/reporter.js`), because Vitest's `loadCustomReporterModule` requires a `.default` export. `vitest` is a **peerDependency** (not a devDependency — pnpm's auto-install-peers resolves it for shared-node's own typecheck/build/test): the reporter `extends BenchmarkReporter`, so it must bind to the _same_ vitest instance as the consumer's runner. Import the reporter type/value from `vitest/node`, not the deprecated `vitest/reporters`. Vitest is externalized centrally via `configuration`'s shared `external` list (`/^vitest(\/|$)/u`), so per-package rolldown configs don't repeat it — shared-node's rolldown config only adds the second `reporter` entry.
