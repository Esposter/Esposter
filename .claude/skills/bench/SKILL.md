---
name: bench
description: Esposter benchmarking conventions — colocated *.bench.ts files, vitest bench, the BenchmarkMarkdownReporter that writes colocated per-file *.bench.{json,md} beside each source, the StableBenchmarkRunner, the dormant CodSpeed wiring, and where bench tooling lives (@esposter/shared-node). Apply when adding or editing benchmarks.
---

# Benchmarking Conventions

Benchmarks run on Vitest's built-in `bench()` (tinybench under the hood). There is no separate bench runner, bin, or `tinybench` direct dependency.

There are **two layers** over the same colocated `*.bench.ts` files (see [CodSpeed](#codspeed-dormant-wiring)):

1. **Local committed `*.bench.md`** — the offline gate. `pnpm bench` runs plain tinybench and the `BenchmarkMarkdownReporter` writes colocated `*.bench.{json,md}` you commit and diff. Unchanged, cross-platform, no cloud. 🏎️ Bench (CI) runs plain `vitest bench --run --shard=i/8` shards every push as an executes-clean smoke signal — no reporter commit, no dashboard.
2. **CodSpeed hosted dashboard** — removed from CI, wiring dormant. See [CodSpeed](#codspeed-dormant-wiring).

## Writing benchmarks

- **Colocate `*.bench.ts` next to the source**, like `*.test.ts` (e.g. `createVfsBackend.bench.ts` beside `createVfsBackend.ts`). ctix and the build exclude `*.bench.ts`; Vitest's `bench` glob picks them up, and `vitest run` (test mode) ignores them — the two never collide.
- Use `describe(...)` + `bench(name, fn)`. The describe label becomes the markdown section title.
- **Module-level setup, not `beforeAll`** — Vitest fires `bench()` callbacks before suite hooks resolve, so set fixtures up at module scope (top-level `await` is fine for async setup like `createVirrun()`).
- Pick a meaningful scaling axis where it exists (e.g. bench `findDuplicateRows` at 100 / 1000 / 10000 rows) so a regression in per-unit cost is visible, not drowned by fixed overhead.
- **Bench the unit, not its `use*` composable wrapper.** Bench the pure function or command class directly (`findDuplicateRows(...)`, `new DeleteRowsCommand(...).execute(item)`) — never the `useDeleteDuplicateRows`-style composable. A composable drags in `// @vitest-environment nuxt` + pinia, whose fixed setup overhead drowns the unit's signal, and it adds no new signal (its cost = the already-benched function + already-benched command + store push). The composable's correctness is covered by its `*.test.ts`.
- **Rebuild a fresh fixture inside the callback for mutating ops.** `bench()` runs the callback in a tight loop, so a command that mutates `item.dataSource` in place (any `execute`/`undo`) corrupts shared state after the first iteration. Build the item fresh inside the callback each iteration (`createBenchDataSource(benchRows100)`), accepting that fixed construction in the timing. Only pure, non-mutating functions (e.g. `findDuplicateRows`) may share a module-level fixture across iterations.
- **Vary input _shape_, not just size, for edge scenarios.** Bench measures speed, not correctness — drive worst/best/typical shapes that stress the algorithm differently (e.g. `findDuplicateRows` at 0% / 50% / 100% duplicates × First/Last mode), not just row count. Correctness edge cases stay in `*.test.ts`.
- **When both shape and scale vary, group by scale with nested `describe`s so `vs base` stays meaningful.** `vs base` is computed per group against the first task, so a single flat group mixing 100/1k/10k rows makes a 10k task read `0.005×` — conflating scale with shape and burying the real signal. Wrap each row count in its own inner `describe("10000 rows", …)` under the function's outer `describe`; the outer suite (no direct benches) renders no section, and each scale group compares only shape×mode at a fixed size (`mean (ms)` becomes directly comparable too). See `findDuplicateRows.bench.ts`.
- For a macro gate, bench the wrapped path against a native baseline in the same `describe` (a path that loses to native has negative value); for micro signal, isolate the unit of work with no process spawn so it isn't drowned (~100ms spawn hides everything).

## Running

`pnpm bench` (per package) = `vitest bench --run`. Nothing else to chain.

From the **repo root**, `pnpm bench` = `vitest bench --run --project scripts && pnpm -r --if-present run bench` — the root `scripts/` suite runs first, then every package's `bench` script recursively, all **sequentially** (no `--parallel`: concurrent benches contend for CPU and skew the machine-dependent numbers). Each package emits the colocated `*.bench.{json,md}` files described below, beside their source.

The leading `vitest bench --run --project scripts` exists because `scripts/` is **not** a workspace package, so `pnpm -r` skips it — it needs the root Vitest run instead. `--project scripts` isolates it: a bare root `vitest bench` would re-run every package's benches too, in parallel (the thing we avoid). The scripts project (in the root `vitest.config.ts`) scopes both globs to `scripts/` — crucially `benchmark.include: ["scripts/**/*.bench.ts"]`, since the default `**/*.bench.ts` would otherwise pull every package's bench file into the scripts project. Only deterministic, CPU-bound script units earn a bench (e.g. `parseLockResolvedVersions` over the lock yaml); the network/spawn helpers (`pnpm outdated` in `checkDependencies`, registry fetches in `scripts/services/`) are I/O-bound and unbenchable.

## Output — colocated per-file JSON + Markdown

Results are **scoped to each bench file**, the way a test is — not one merged report per package. `Foo.bench.ts` emits `Foo.bench.json` + `Foo.bench.md` **right beside it**. There is no `bench/` directory and no merged `results.{json,md}`.

- `getVitestConfiguration()` wires `benchmark.reporters: ["@esposter/shared-node/reporter"]` (**no `outputJson`** — we don't use Vitest's merged-file writer), plus `test.runner: getBenchmarkRunner()`, `hookTimeout`, and `getBenchmarkPlugins()`.
- **`StableBenchmarkRunner` is what makes sample counts stable.** `getBenchmarkRunner()` returns the `@esposter/shared-node/runner` path string only when `bench` is an exact argv element, else `undefined` — `test.runner` is the single field Vitest uses for **both** modes, and the custom runner throws in `runTask`, so wiring it unconditionally would break `pnpm test`. Leaving it unset lets Vitest pick its default per mode. In bench mode it zeroes tinybench's time budget so benches run a fixed iteration count, keeping the committed `*.bench.md` sample counts machine-stable.
- The reporter is referenced by **path string**, not import: `configuration` builds before `shared-node`, so it can't import the reporter — but a literal string stays build-first, and Vitest resolves it **in bench mode only** to shared-node's `./reporter` **default export**.
- The reporter subclasses Vitest's `BenchmarkReporter`: `super.onTestRunEnd` prints the terminal comparison table, then `onTestRunEnd` reads the in-memory run via **`this.ctx.state.getFiles()`** and, per file, `writeBenchmarkReport` projects its task tree (`buildBenchmarkFileReport`) into a `BenchmarkReport`, validates it, and writes the colocated `.bench.json` (package-relative `filepath`, so no home-dir leak) + `.bench.md`. No bin, no merged file, no `outputJson` round-trip.
- `buildBenchmarkFileReport` reads a small local structural contract (`BenchmarkTaskNode`), **not** Vitest's experimental bench task types — a real `File`/`Task` is structurally assignable to it, so the projection survives Vitest's bench-format churn. A bench file with no benchmarks (e.g. a shared bench helper) writes nothing.
- Any package that runs `pnpm bench` needs `@esposter/shared-node` as a **devDependency** for the string to resolve; packages that never bench don't (the string is never loaded outside bench mode). The **repo root** `package.json` also declares it (`workspace:*`), because the root drives the `scripts/` project's bench from the root cwd — without it the reporter string fails to resolve (`Failed to load custom Reporter`).
- **Commit** every `*.bench.json` + `*.bench.md`. Numbers are machine-dependent (each md carries its own environment block); only compare runs from the same host. `defineVitestProject`-based packages (e.g. the app) don't call `getVitestConfiguration()`, so they set the same `reporters: ["@esposter/shared-node/reporter"]` string inline.

## Platform-specific benches — `*.platform.bench.ts`

Most benches are cross-platform: one `*.bench.ts`, one committed `*.bench.md` (last host to run it wins; compare only same-host runs). But a workload whose numbers genuinely differ by host — e.g. virrun's `os` backend runs `os/linux` natively and `os/wsl` bridged from win32 — would have each platform's `pnpm bench` clobber the other's committed file. For those, **name the source `Foo.platform.bench.ts`**: the reporter (`writeBenchmarkReport`, keyed off the `.platform.bench` marker in the filename) suffixes the artifacts with `process.platform`, so it writes `Foo.platform.bench.win32.{json,md}` on Windows and `Foo.platform.bench.linux.{json,md}` on Linux — each platform's run updates only its own file. Commit all platforms' files; regenerate the one for whichever host you're on.

- **Opt in only when results meaningfully differ by host _and_ you run the bench on more than one** — not for every cross-platform bench. A bench gated to a single platform (e.g. `describe.skipIf(process.platform !== "linux")`) writes nothing on the others, so it never clobbers and stays a plain `*.bench.ts`.
- Do **not** fork the logic into separate `.linux.bench.ts` / `.wsl.bench.ts` files — one source, per-platform _output_. The describe/task names still label the bridge (`os/linux` vs `os/wsl`); the md Environment block records the exact kernel.

## The bench _is_ the speed gate — no `.speed.test.ts`

Speed regressions are caught by regenerating + diffing the colocated `*.bench.md`, **not** by timing assertions in the unit suite. Do **not** add `*.speed.test.ts` files that spawn a baseline and `expect(ratio).toBeGreaterThan(...)`: it duplicates the bench, flakes on a loaded host, and slows `pnpm test`. The bench already measures the regression (a hot path that silently falls back to native collapses its `vs base` multiplier toward `1.00×`); CI enforcement is the **deferred bench gate**, not a per-file test. Correctness gates (`*.differential.test.ts` asserting output parity) _are_ tests — only speed lives in the bench.

## `*.bench.md` columns

Per group: `task | vs base | mean (ms) | ±rme | p99 (ms) | samples`. Each column carries a distinct facet — identity, relative comparison, central cost, confidence, tail, sample count — so none is redundant. Notably there is **no `ops/sec` column**: it is exactly `1000 / mean (ms)`, a pure reciprocal that adds no signal, so it was dropped (the JSON record omits `hz` too).

- **`vs base`** — throughput multiplier the formatter derives: `baseline.mean / task.mean`. Baseline = the task named `native` if the group has one, else the first declared task (so list the baseline first). Baseline reads `1.00×`; faster `> 1`, slower `< 1` (sub-1 keeps significant digits via `toPrecision`, never collapsing to `0.00×`). This makes impact legible at a glance and a regression obvious on diff. **Never pin a specific multiplier in docs** — it's machine-dependent and changes every run; reference the colocated `*.bench.md` and describe magnitude qualitatively ("orders of magnitude").
- **`±rme`** — relative margin of error (the standard benchmark.js confidence figure), from the bench result.
- **`samples`** — the bench's measured iteration count. The fixed-iteration stable runner holds it constant by default, but it's kept as a baseline clarity/confidence indicator since a bench may override its iteration count.
- The **Environment** block carries `Commit` (`git rev-parse --short HEAD`, `unknown` outside a repo) for provenance — so an artifact can be tied to the code that produced it, since a bench can otherwise silently lag its implementation.

Changing what's rendered means updating `BenchmarkResult` (schema + interface) and `formatBenchmarkMarkdown`/`buildBenchmarkFileReport` (+ their tests). The reporter pipeline lives in `shared-node` and its wiring (`reporters`, dropping `outputJson`) in `configuration` — both are consumed as **built dist**, so **rebuild the changed package** (`pnpm build`) before `pnpm bench` or the edit won't take effect. The `shared-node` `index.test.ts` types-size snapshot moves when an exported interface changes (`-u`).

## Where bench tooling lives — `@esposter/shared-node`

Node-only shared tooling (the bench schemas, `formatBenchmarkMarkdown`, `writeBenchmarkReport`, `BenchmarkMarkdownReporter`, `StableBenchmarkRunner`) lives in `@esposter/shared-node`. It can't go in `@esposter/configuration` (built first; can't import a later package's reporter — which is why `getVitestConfiguration` wires the reporter as a path string, not an import) nor in `@esposter/shared` (browser bundle; no `node:os`). Build order: `configuration → shared → shared-node`. Consumers depend on it as a **devDependency** (tooling only, never runtime).

The reporter and runner are each a default export at their own subpath (`@esposter/shared-node/reporter`, `/runner`), because Vitest's `loadCustomReporterModule` requires a `.default` export. Those two subpaths are the package's whole surface — the rolldown config declares exactly `{ reporter, runner }` and `package.json` exports nothing at `.`, so there is no barrel to add a module to and a file reachable from neither entry is unbundled and unresolvable. `vitest` is a **peerDependency** (not a devDependency — pnpm's auto-install-peers resolves it for shared-node's own typecheck/build/test): the reporter `extends BenchmarkReporter`, so it must bind to the _same_ vitest instance as the consumer's runner. Import the reporter type/value from `vitest/node`, not the deprecated `vitest/reporters`. Vitest is externalized centrally via `configuration`'s shared `external` list (`/^vitest(\/|$)/u`), so per-package rolldown configs don't repeat it — shared-node's rolldown config only adds the second `reporter` entry.

## CodSpeed (dormant wiring)

CodSpeed was the hosted rich-metrics dashboard over the same `*.bench.ts` files. **Removed from CI** (exceeded the free tier's 600 min/month; failed uploads posted red statuses), but the wiring stays so restoring the `CodSpeedHQ/action` step re-enables it: `getBenchmarkPlugins()` returns `[]` unless `CODSPEED_ENV` is set and lazy-imports the plugin only inside that branch, and `BenchmarkMarkdownReporter` returns early under `CODSPEED_ENV` so dashboard runs don't rewrite the committed artifacts.

- **Dependency placement.** `@codspeed/vitest-plugin` is an **optional `peerDependency` of `configuration`** and must stay in the shared `external` list (`/^@codspeed\//u`) — bundling breaks its `__dirname`-relative sibling/prebuild loading. Because the import is lazy and `CODSPEED_ENV`-gated, the optional peer isn't auto-installed, so only the packages that actually bench (`app`, `virrun`) declare it as a `devDependency`; other vitest packages carry no codspeed dep. See [Build › external = peerDependency](../build/SKILL.md).
