# @esposter/shared-node

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Node-only shared tooling for Esposter — the machine-wide download cache, hidden-window child processes and benchmark reporting reused across packages.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⌨️ [Commands](#commands)
- 🔗 [Related Documentation](#related)
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

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://github.com/Esposter/Esposter/tree/main/openspec/specs) to level up.

Server/build environment only; never import in browser code.

### What's Included

The machine-wide download cache, the hidden-window child process wrappers, and the benchmark reporting toolkit consumed by the repo's `vitest bench` runs (see the `bench` skill).

`@esposter/shared-node/child-process` exports `spawn`, `spawnSync`, `execFile`, `execFileSync` and `execSync` with node's own names and types. Each forces `windowsHide: true` last, so a console child never opens its own terminal window on Windows, including from a windowless parent such as a Claude Code hook. Import these instead of `node:child_process`; the repo's lint rule enforces it.

```ts
import { spawnSync } from "@esposter/shared-node/child-process";

spawnSync("pnpm", ["install"], { stdio: "inherit" });
```

`@esposter/shared-node/cache` exports `CACHE_ROOT` (`{data-root}/cache`), the one folder every checkout, worktree and ephemeral run on a machine shares for what it downloads, and `readContentAddressedObject`, a read-through cache for objects named by the hex SHA-256 of their bytes. A hit is read from `CONTENT_CACHE_DIRECTORY`; a miss is downloaded once and kept only if its bytes hash to its name, so a hit never goes stale and any source of the same content shares one copy.

```ts
import { readContentAddressedObject } from "@esposter/shared-node/cache";

const bytes = await readContentAddressedObject(
  hash,
  async () => new Uint8Array(await (await fetch(url)).arrayBuffer()),
);
```

| Export                                                    | Description                                                                      |
| --------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `BENCHMARK_RUN_OPTIONS` (`/bench`)                        | Run options every `bench.compare` passes, fixing the iteration count             |
| `BenchmarkMarkdownReporter` (default export, `/reporter`) | Vitest reporter — writes `Foo.bench.md` + `Foo.bench.json` beside `Foo.bench.ts` |

### Architecture Notes

- Depends on `@esposter/shared` for shared types and utilities.
- **Node-only**: depends on Node built-ins (`fs`, `os`) — must not be bundled into the browser app.
- Wired into `vitest bench` via `BenchmarkMarkdownReporter`; the emitted artifacts are committed and diffed offline as the speed gate.

## <a name="commands">⌨️ Commands</a>

Run from `packages/shared-node/`:

```bash
pnpm build        # compile to dist/
pnpm lint         # eslint
pnpm lint:fix     # auto-fix lint
pnpm test         # vitest watch mode (coverage is run from the repo root)
pnpm typecheck    # type check
```

## <a name="related">🔗 Related Documentation</a>

- [Claude Code](https://code.claude.com/docs)
- [Vitest](https://vitest.dev/guide/)

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/@esposter/shared-node/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/@esposter/shared-node/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/@esposter/shared-node/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/@esposter/shared-node.svg
