# @esposter/shared-node

[![Apache-2.0 licensed][badge-license]][url-license]

Node-only shared tooling for Esposter — benchmark reporting and dev scripts reused across packages. Server/build environment only; never import in browser code.

## Table of Contents

- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/) to level up.

### What's Included

The benchmark reporting toolkit consumed by the repo's `vitest bench` runs (see the `bench` skill).

| Export                                                                                           | Description                                                       |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `BenchmarkMarkdownReporter`                                                                      | Vitest bench reporter — writes `results.md` beside `results.json` |
| `buildBenchmarkFileReport`                                                                       | Aggregates raw bench tasks into a structured `BenchmarkReport`    |
| `formatBenchmarkMarkdown`                                                                        | Renders a `BenchmarkReport` to Markdown tables                    |
| `writeBenchmarkReport`                                                                           | Persists the JSON + Markdown report artifacts                     |
| `readBenchmarkEnvironment`                                                                       | Captures CPU/OS/runtime metadata for reproducible results         |
| `BenchmarkFile` · `BenchmarkGroup` · `BenchmarkReport` · `BenchmarkResult` · `BenchmarkTaskNode` | Report data models                                                |

### Architecture Notes

- **Node-only**: depends on Node built-ins (`fs`, `os`) — must not be bundled into the browser app.
- Depends on `@esposter/shared` for shared types and utilities.
- Wired into `vitest bench` via `BenchmarkMarkdownReporter`; the CodSpeed dashboard layer reads the emitted artifacts.

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
