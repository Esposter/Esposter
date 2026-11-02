# @esposter/shared-node

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Provides the Node-only tools that Esposter packages share: a machine-wide download cache, hidden-window child processes and benchmark reporting.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

Import this package only in a server or build environment, never in browser code.

1. Install the package.

```bash
pnpm i @esposter/shared-node
```

Check: `package.json` lists `@esposter/shared-node` in its dependencies.

2. Run this code.

```ts
import { spawnSync } from "@esposter/shared-node/child-process";

spawnSync("pnpm", ["install"], { stdio: "inherit" });
```

## <a name="key-exports">🧩 Key Exports</a>

| Export                                                                          | Description                                                                                                                                |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `BENCHMARK_RUN_OPTIONS` (`/bench`)                                              | Run options that every `bench.compare` call passes. They fix the iteration count.                                                          |
| `BenchmarkMarkdownReporter` (default export, `/reporter`)                       | Vitest reporter. Writes `Foo.bench.md` and `Foo.bench.json` beside `Foo.bench.ts`.                                                         |
| `spawn`, `spawnSync`, `execFile`, `execFileSync`, `execSync` (`/child-process`) | Node's own child-process functions. Each forces `windowsHide: true`, so a console child never opens a window of its own.                   |
| `execFileAsync` (`/child-process`)                                              | The promisified `execFile`, with the same window flag. Resolves `{ stdout, stderr }`.                                                      |
| `CACHE_ROOT`, `readContentAddressedObject` (`/cache`)                           | The download cache folder that every checkout shares. A read-through cache for objects named by the hex SHA-256 of their bytes.            |
| `writePartialThenMove` (`/cache`)                                               | Writes a file whole. A partial file is written beside the path and renamed onto it once written, and it is removed when either step fails. |

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/@esposter/shared-node/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/@esposter/shared-node/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/@esposter/shared-node/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/@esposter/shared-node.svg
