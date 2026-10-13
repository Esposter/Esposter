# @esposter/shared-node

[![Apache-2.0 licensed][badge-license]][url-license]

Node-only shared tooling for Esposter — the machine-wide download cache, hidden-window child processes and benchmark reporting reused across packages. Server/build environment only; never import in browser code.

## Table of Contents

- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/api/modules/_esposter_shared-node.html) to level up.

### What's Included

The machine-wide download cache, the hidden-window child process wrappers, and the benchmark reporting toolkit consumed by the repo's `vitest bench` runs (see the `bench` skill).

`@esposter/shared-node/child-process` exports `spawn`, `spawnSync`, `execFile`, `execFileSync` and `execSync` with node's own names and types. Each forces `windowsHide: true` last, so a console child never opens its own terminal window on Windows, including from a windowless parent such as a Claude Code hook. Import these instead of `node:child_process`; the repo's lint rule enforces it.

```ts
import { spawnSync } from "@esposter/shared-node/child-process";

spawnSync("pnpm", ["install"], { stdio: "inherit" });
```

`@esposter/shared-node/cache` exports `CACHE_ROOT` (`~/Esposter/cache`), the one folder every checkout, worktree and ephemeral run on a machine shares for what it downloads, and `readContentAddressedObject`, a read-through cache for objects named by the hex SHA-256 of their bytes. A hit is read from `CONTENT_CACHE_DIRECTORY`; a miss is downloaded once and kept only if its bytes hash to its name, so a hit never goes stale and any source of the same content shares one copy.

```ts
import { readContentAddressedObject } from "@esposter/shared-node/cache";

const bytes = await readContentAddressedObject(
  hash,
  async () => new Uint8Array(await (await fetch(url)).arrayBuffer()),
);
```

| Export                                                                                           | Description                                                                      |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `BenchmarkMarkdownReporter`                                                                      | Vitest reporter — writes `Foo.bench.md` + `Foo.bench.json` beside `Foo.bench.ts` |
| `BENCHMARK_RUN_OPTIONS`                                                                          | Run options every `bench.compare` passes, fixing the iteration count             |
| `buildBenchmarkFileReport`                                                                       | Projects a module's reported tests into a structured `BenchmarkReport`           |
| `formatBenchmarkMarkdown`                                                                        | Renders a `BenchmarkReport` to Markdown tables                                   |
| `writeBenchmarkReport`                                                                           | Persists the JSON + Markdown report artifacts                                    |
| `readBenchmarkEnvironment`                                                                       | Captures CPU/OS/runtime metadata for reproducible results                        |
| `BenchmarkFile` · `BenchmarkGroup` · `BenchmarkReport` · `BenchmarkResult` · `BenchmarkTestCase` | Report data models                                                               |

### Architecture Notes

- **Node-only**: depends on Node built-ins (`fs`, `os`) — must not be bundled into the browser app.
- Depends on `@esposter/shared` for shared types and utilities.
- Wired into `vitest bench` via `BenchmarkMarkdownReporter`; the emitted artifacts are committed and diffed offline as the speed gate.

### Commands

Run from `packages/shared-node/`:

```bash
pnpm build        # compile to dist/
pnpm test         # vitest watch mode (coverage is run from the repo root)
pnpm lint:fix     # auto-fix lint
pnpm typecheck    # type check
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
