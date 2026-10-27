# @esposter/shared-node

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Node-only shared tooling for Esposter — the machine-wide download cache, hidden-window child processes and benchmark reporting reused across packages.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i @esposter/shared-node
```

```ts
import { spawnSync } from "@esposter/shared-node/child-process";

spawnSync("pnpm", ["install"], { stdio: "inherit" });
```

- Server/build environment only; never import in browser code.

## <a name="key-exports">🧩 Key Exports</a>

| Export                                                                          | Description                                                                                                                   |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `BENCHMARK_RUN_OPTIONS` (`/bench`)                                              | Run options every `bench.compare` passes, fixing the iteration count                                                          |
| `BenchmarkMarkdownReporter` (default export, `/reporter`)                       | Vitest reporter — writes `Foo.bench.md` + `Foo.bench.json` beside `Foo.bench.ts`                                              |
| `spawn`, `spawnSync`, `execFile`, `execFileSync`, `execSync` (`/child-process`) | Node's own child-process functions, each forcing `windowsHide: true` so a console child never opens a window of its own       |
| `CACHE_ROOT`, `readContentAddressedObject` (`/cache`)                           | The download cache folder every checkout shares, and a read-through cache for objects named by the hex SHA-256 of their bytes |

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=038758
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/@esposter/shared-node/latest?color=038758
[url-npm]: https://www.npmjs.com/package/@esposter/shared-node/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/@esposter/shared-node/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/@esposter/shared-node.svg
