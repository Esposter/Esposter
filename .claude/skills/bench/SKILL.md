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
- For a macro gate, bench the wrapped path against a native baseline in the same `describe` (a path that loses to native has negative value); for micro signal, isolate the unit of work with no process spawn so it isn't drowned (~100ms spawn hides everything).

## Running

`pnpm bench` (per package) = `vitest bench --run`. Nothing else to chain.

From the **repo root**, `pnpm bench` = `pnpm -r --if-present run bench` — runs every package's `bench` script recursively, **sequentially** (no `--parallel`: concurrent benches contend for CPU and skew the machine-dependent numbers). Each writes its own `bench/results.{json,md}` in its own cwd.

## Output — committed JSON + Markdown (best of both)

- `getVitestConfiguration()` sets both `benchmark.outputJson: "./bench/results.json"` and `benchmark.reporters: ["@esposter/shared-node/reporter"]` for every package, so the standard `vitest.config.ts` is the same `getVitestConfiguration()` one-liner everywhere — no per-package reporter override. The **machine-readable** `results.json` is the source of truth (and the future `vitest bench --compare` baseline).
- The reporter is referenced by **path string**, not import: `configuration` builds before `shared-node`, so it can't import the reporter — but a literal string stays build-first, and Vitest resolves it **in bench mode only** (`createBenchmarkReporters` runs solely when `mode === "benchmark"`) to shared-node's `./reporter` **default export**. The reporter subclasses Vitest's built-in `BenchmarkReporter`: `super.onTestRunEnd` writes `results.json` + prints the terminal table, then it (a) rewrites `results.json` with **relative** filepaths — Vitest writes them absolute, leaking the home dir; the reporter strips the package-root prefix off the raw JSON text losslessly — and (b) renders the committed **human-readable** `bench/results.md` beside it (path mirrors `outputJson`). So markdown + path normalization are side-effects of `pnpm bench` — no bin, no extra/postbench script.
- Any package that runs `pnpm bench` needs `@esposter/shared-node` as a **devDependency** for the string to resolve; packages that never bench don't (the string is never loaded outside bench mode).
- Commit **both** `results.json` and `results.md`. Numbers are machine-dependent (the md carries an environment block); only compare runs from the same host. `defineVitestProject`-based packages (e.g. the app) don't call `getVitestConfiguration()`, so they set `outputJson` + the same `reporters: ["@esposter/shared-node/reporter"]` string inline.

## The bench _is_ the speed gate — no `.speed.test.ts`

Speed regressions are caught by regenerating + diffing `results.md`, **not** by timing assertions in the unit suite. Do **not** add `*.speed.test.ts` files that spawn a baseline and `expect(ratio).toBeGreaterThan(...)`: it duplicates the bench, flakes on a loaded host, and slows `pnpm test`. The bench already measures the regression (a hot path that silently falls back to native collapses its `vs base` multiplier toward `1.00×`); CI enforcement is the **deferred bench gate**, not a per-file test. Correctness gates (`*.differential.test.ts` asserting output parity) _are_ tests — only speed lives in the bench.

## `results.md` columns

Per group: `task | vs base | mean (ms) | ±rme | p99 (ms) | ops/sec | samples`.

- **`vs base`** — throughput multiplier the formatter derives: `baseline.mean / task.mean`. Baseline = the task named `native` if the group has one, else the first declared task (so list the baseline first). Baseline reads `1.00×`; faster `> 1`, slower `< 1` (sub-1 keeps significant digits via `toPrecision`, never collapsing to `0.00×`). This makes impact legible at a glance and a regression obvious on diff. **Never pin a specific multiplier in docs** — it's machine-dependent and changes every run; reference `results.md` and describe magnitude qualitatively ("orders of magnitude").
- **`±rme`** — relative margin of error (the standard benchmark.js confidence figure), from the bench JSON.
- The **Environment** block carries `Commit` (`git rev-parse --short HEAD`, `unknown` outside a repo) for provenance — so a `results.md` can be tied to the code that produced it, since a bench can otherwise silently lag its implementation.

Adding/removing a rendered field means updating `BenchmarkResult` (schema + interface) and `formatBenchmarkMarkdown` (+ its test), then **rebuild shared-node** (`pnpm build`) before `pnpm bench` — the reporter resolves to `dist/reporter.js`, so source edits don't take effect until rebuilt. The `index.test.ts` types-size snapshot also moves when the interface changes (`-u`).

## Where bench tooling lives — `@esposter/shared-node`

Node-only shared tooling (the bench schemas, `formatBenchmarkMarkdown`, `writeBenchmarkResults`, `BenchmarkMarkdownReporter`) lives in `@esposter/shared-node`. It can't go in `@esposter/configuration` (built first; can't import a later package's reporter — which is why `getVitestConfiguration` wires the reporter as a path string, not an import) nor in `@esposter/shared` (browser bundle; no `node:os`). Build order: `configuration → shared → shared-node`. Consumers depend on it as a **devDependency** (tooling only, never runtime).

The reporter is the package's default export, exposed at the `@esposter/shared-node/reporter` subpath (a second rolldown entry → `dist/reporter.js`), because Vitest's `loadCustomReporterModule` requires a `.default` export. `vitest` is a **peerDependency** (not a devDependency — pnpm's auto-install-peers resolves it for shared-node's own typecheck/build/test): the reporter `extends BenchmarkReporter`, so it must bind to the _same_ vitest instance as the consumer's runner. Import the reporter type/value from `vitest/node`, not the deprecated `vitest/reporters`. Vitest is externalized centrally via `configuration`'s shared `external` list (`/^vitest(\/|$)/u`), so per-package rolldown configs don't repeat it — shared-node's rolldown config only adds the second `reporter` entry.
