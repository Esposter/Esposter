# The benchmark report pipeline

Read when changing what a `*.bench.md` contains, touching the reporter, or adding a package that benches.

## Colocated per-file JSON + Markdown

Results are **scoped to each bench file**, the way a test is — not one merged report per package. `Foo.bench.ts` emits `Foo.bench.json` + `Foo.bench.md` **right beside it**. There is no `bench/` directory and no merged `results.{json,md}`.

- `getBenchmarkTestConfiguration()` wires `test.reporters: ["default", "@esposter/shared-node/reporter"]`. A benchmark is an ordinary test result now, so there is no bench-only reporter slot and no merged-file writer in play; `"default"` leads because naming reporters **replaces** the default list, and it is what still prints the terminal comparison table. `getVitestConfiguration()` spreads it; a config built from scratch (the app's `defineVitestProject`) spreads it directly rather than restating the fields.
- **`getBenchmarkReporters()` returns the pair only when `bench` is the Vitest subcommand** — `process.argv[2]`, not any argv element, because `vitest run bench` and `vitest --project bench` carry the same word as a filter and would hand an ordinary run the `*.bench.md` rewriter and a bench's hour-long timeout — else `undefined` — and the factory then spreads **nothing at all**. A present `reporters: undefined` is an empty reporter list rather than an absent setting, and a `pnpm test` that reports nothing still exits non-zero on the failure it never printed, which is the worst way to find this out.
- **`BENCHMARK_RUN_OPTIONS` is what makes sample counts stable.** It zeroes tinybench's time budget and names the iteration count, and a bench file passes it as the last `bench.compare(...)` argument.
- The reporter is referenced by **path string**, not import: `configuration` builds before `shared-node`, so it cannot import the reporter — a literal string stays build-first, and Vitest resolves it in bench mode only, to shared-node's `./reporter` **default export**.
- **That string resolves from wherever Vitest is running**, so every project that can start a bench run declares `@esposter/shared-node` as a devDependency — the repo root included, since the 🏎️ Bench job's `vitest bench --run` starts there. The root has no other use for it, which is exactly why it reads as removable; dropping it leaves a run that resolves nothing in CI and nothing anywhere else that notices.
- The reporter implements `Reporter` and does one thing in `onTestRunEnd(testModules)`: per module, `writeBenchmarkReport` projects its reported tests (`buildBenchmarkFileReport`) into a `BenchmarkReport` and writes the colocated `.bench.json` (package-relative `filepath`, so no home-dir leak) + `.bench.md`.
- `buildBenchmarkFileReport` reads a small local structural contract (`BenchmarkTestCase`), **not** Vitest's experimental bench result types — a real `TestCase` is structurally assignable to it, so the projection survives Vitest's bench-format churn and stays unit-testable without a live run. A file that recorded no benchmarks writes nothing.
- Any package that runs `pnpm bench` needs `@esposter/shared-node` as a **devDependency** for the string to resolve. The **repo root** `package.json` declares it too (`workspace:*`), because the root drives the `scripts/` project's bench from the root cwd — without it the string fails to resolve (`Failed to load custom Reporter`).
- **Commit** every `*.bench.json` + `*.bench.md`. Numbers are machine-dependent (each md carries its own environment block); only compare runs from the same host.

## `*.bench.md` columns

Per group: `task | vs base | mean (ms) | ±rme | p99 (ms) | samples`. Each column carries a distinct facet — identity, relative comparison, central cost, confidence, tail, sample count — so none is redundant. There is deliberately **no `ops/sec` column**: it is exactly `1000 / mean (ms)`, a pure reciprocal adding no signal (the JSON record omits `hz` too).

- **Rows are ordered fastest first**, by the `rank` Vitest reports rather than by where a registration sits in the file — the report never sees registration order, so this is the only ordering two runs of one group can share.
- **`vs base`** — throughput multiplier the formatter derives: `baseline.mean / task.mean`. Baseline is the task named `native` if the group has one — the host-baseline benches, where beating native is the whole point — else the fastest task. Baseline reads `1.00×`; faster `> 1`, slower `< 1` (sub-1 keeps significant digits via `toPrecision`, never collapsing to `0.00×`). **Never pin a specific multiplier in docs** — it is machine-dependent and changes every run; reference the colocated `*.bench.md` and describe magnitude qualitatively.
- **`±rme`** — relative margin of error, from the bench result.
- **`samples`** — the measured iteration count. `BENCHMARK_RUN_OPTIONS` holds it constant, but it stays as a confidence indicator since a registration may override its own iteration count.
- The **Environment** block carries `Commit` for provenance, so an artifact can be tied to the code that produced it.

Changing what is rendered means updating `BenchmarkResult` (schema + interface) and `formatBenchmarkMarkdown` / `buildBenchmarkFileReport` and their tests. The pipeline lives in `shared-node` and its wiring in `configuration`, both consumed as **built dist** — so **rebuild the changed package** before `pnpm bench` or the edit will not take effect. The `shared-node` types-size snapshot moves when an exported interface changes (`-u`).

## Platform-specific benches — `*.platform.bench.ts`

Most benches are cross-platform: one `*.bench.ts`, one committed `*.bench.md`, last host to run it wins. A workload whose numbers genuinely differ by host would instead have each platform's `pnpm bench` clobber the other's file. For those, **name the source `Foo.platform.bench.ts`**: `writeBenchmarkReport` keys off the `.platform.bench` marker in the filename and suffixes artifacts with `process.platform`, so each platform's run updates only its own file. Commit all platforms' files; regenerate the one for whichever host you are on.

- **Opt in only when results meaningfully differ by host _and_ the bench is run on more than one.** A bench gated to a single platform (`test.skipIf(...)`) writes nothing on the others, so it never clobbers and stays a plain `*.bench.ts`.
- Do **not** fork the logic into per-platform source files — one source, per-platform _output_. Task names still label the bridge, and the md Environment block records the exact kernel.

## Where bench tooling lives — `@esposter/shared-node`

Node-only shared tooling (the bench schemas, `formatBenchmarkMarkdown`, `writeBenchmarkReport`, `BenchmarkMarkdownReporter`, `BENCHMARK_RUN_OPTIONS`) lives in `@esposter/shared-node`. It cannot go in `@esposter/configuration` (built first, so it cannot import a later package's reporter — which is why the reporter is wired as a path string) nor in `@esposter/shared` (browser bundle, no `node:os`). Build order: `configuration → shared → shared-node`. Consumers take it as a **devDependency**, never runtime.

The reporter is a default export at `/reporter`, because Vitest's `loadCustomReporterModule` requires a `.default`; the run options are a named export at `/bench`, which a bench file imports. Those two subpaths are the package's whole surface — the tsdown config declares exactly `{ bench, reporter }` and `package.json` exports nothing at `.`, so there is no barrel to add a module to, and a file reachable from neither entry is unbundled and unresolvable. `vitest` is a **peerDependency**, not a devDependency: the reporter binds to the _same_ vitest instance as the consumer's run. Import the reporter types from `vitest/node`; `vitest/reporters` no longer exists. Declaring vitest as the peer is also what externalizes it — tsdown externalizes every `peerDependency`, so no build config mentions it.
