# The benchmark report pipeline

Read when changing what a `*.bench.md` contains, touching the reporter or runner, or adding a package that benches.

## Colocated per-file JSON + Markdown

Results are **scoped to each bench file**, the way a test is — not one merged report per package. `Foo.bench.ts` emits `Foo.bench.json` + `Foo.bench.md` **right beside it**. There is no `bench/` directory and no merged `results.{json,md}`.

- `getBenchmarkTestConfiguration()` wires `benchmark.reporters: ["@esposter/shared-node/reporter"]` (**no `outputJson`** — Vitest's merged-file writer is unused) plus `test.runner: getBenchmarkRunner()`. `getVitestConfiguration()` spreads it; a config built from scratch (the app's `defineVitestProject`) spreads it directly rather than restating the fields.
- **`StableBenchmarkRunner` is what makes sample counts stable.** `getBenchmarkRunner()` returns the `@esposter/shared-node/runner` path string only when `bench` is an exact argv element, else `undefined` — `test.runner` is the single field Vitest uses for **both** modes, and the custom runner throws in `runTask`, so wiring it unconditionally would break `pnpm test`. Leaving it unset lets Vitest pick its default per mode. In bench mode it zeroes tinybench's time budget so benches run a fixed iteration count, keeping committed sample counts machine-stable.
- The reporter is referenced by **path string**, not import: `configuration` builds before `shared-node`, so it cannot import the reporter — a literal string stays build-first, and Vitest resolves it in bench mode only, to shared-node's `./reporter` **default export**.
- The reporter subclasses Vitest's `BenchmarkReporter`: `super.onTestRunEnd` prints the terminal comparison table, then `onTestRunEnd` reads the in-memory run via `this.ctx.state.getFiles()` and, per file, `writeBenchmarkReport` projects its task tree (`buildBenchmarkFileReport`) into a `BenchmarkReport`, validates it, and writes the colocated `.bench.json` (package-relative `filepath`, so no home-dir leak) + `.bench.md`.
- `buildBenchmarkFileReport` reads a small local structural contract (`BenchmarkTaskNode`), **not** Vitest's experimental bench task types — a real `File`/`Task` is structurally assignable to it, so the projection survives Vitest's bench-format churn. A bench file with no benchmarks writes nothing.
- Any package that runs `pnpm bench` needs `@esposter/shared-node` as a **devDependency** for the string to resolve. The **repo root** `package.json` declares it too (`workspace:*`), because the root drives the `scripts/` project's bench from the root cwd — without it the string fails to resolve (`Failed to load custom Reporter`).
- **Commit** every `*.bench.json` + `*.bench.md`. Numbers are machine-dependent (each md carries its own environment block); only compare runs from the same host.

## `*.bench.md` columns

Per group: `task | vs base | mean (ms) | ±rme | p99 (ms) | samples`. Each column carries a distinct facet — identity, relative comparison, central cost, confidence, tail, sample count — so none is redundant. There is deliberately **no `ops/sec` column**: it is exactly `1000 / mean (ms)`, a pure reciprocal adding no signal (the JSON record omits `hz` too).

- **`vs base`** — throughput multiplier the formatter derives: `baseline.mean / task.mean`. Baseline is the task named `native` if the group has one, else the first declared task, so list the baseline first. Baseline reads `1.00×`; faster `> 1`, slower `< 1` (sub-1 keeps significant digits via `toPrecision`, never collapsing to `0.00×`). **Never pin a specific multiplier in docs** — it is machine-dependent and changes every run; reference the colocated `*.bench.md` and describe magnitude qualitatively.
- **`±rme`** — relative margin of error, from the bench result.
- **`samples`** — the measured iteration count. The fixed-iteration runner holds it constant, but it stays as a confidence indicator since a bench may override its iteration count.
- The **Environment** block carries `Commit` for provenance, so an artifact can be tied to the code that produced it.

Changing what is rendered means updating `BenchmarkResult` (schema + interface) and `formatBenchmarkMarkdown` / `buildBenchmarkFileReport` and their tests. The pipeline lives in `shared-node` and its wiring in `configuration`, both consumed as **built dist** — so **rebuild the changed package** before `pnpm bench` or the edit will not take effect. The `shared-node` types-size snapshot moves when an exported interface changes (`-u`).

## Platform-specific benches — `*.platform.bench.ts`

Most benches are cross-platform: one `*.bench.ts`, one committed `*.bench.md`, last host to run it wins. A workload whose numbers genuinely differ by host would instead have each platform's `pnpm bench` clobber the other's file. For those, **name the source `Foo.platform.bench.ts`**: `writeBenchmarkReport` keys off the `.platform.bench` marker in the filename and suffixes artifacts with `process.platform`, so each platform's run updates only its own file. Commit all platforms' files; regenerate the one for whichever host you are on.

- **Opt in only when results meaningfully differ by host _and_ the bench is run on more than one.** A bench gated to a single platform (`describe.skipIf(...)`) writes nothing on the others, so it never clobbers and stays a plain `*.bench.ts`.
- Do **not** fork the logic into per-platform source files — one source, per-platform _output_. Task names still label the bridge, and the md Environment block records the exact kernel.

## Where bench tooling lives — `@esposter/shared-node`

Node-only shared tooling (the bench schemas, `formatBenchmarkMarkdown`, `writeBenchmarkReport`, `BenchmarkMarkdownReporter`, `StableBenchmarkRunner`) lives in `@esposter/shared-node`. It cannot go in `@esposter/configuration` (built first, so it cannot import a later package's reporter — which is why the reporter is wired as a path string) nor in `@esposter/shared` (browser bundle, no `node:os`). Build order: `configuration → shared → shared-node`. Consumers take it as a **devDependency**, never runtime.

The reporter and runner are each a default export at their own subpath (`/reporter`, `/runner`), because Vitest's `loadCustomReporterModule` requires a `.default`. Those two subpaths are the package's whole surface — the tsdown config declares exactly `{ reporter, runner }` and `package.json` exports nothing at `.`, so there is no barrel to add a module to, and a file reachable from neither entry is unbundled and unresolvable. `vitest` is a **peerDependency**, not a devDependency: the reporter `extends BenchmarkReporter`, so it must bind to the _same_ vitest instance as the consumer's runner. Import the reporter type from `vitest/node`, never the deprecated `vitest/reporters`. Declaring vitest as the peer is also what externalizes it — tsdown externalizes every `peerDependency`, so no build config mentions it.
