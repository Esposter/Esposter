# virrun

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

An ephemeral, in-memory virtual runner: boot a repo into a RAM-backed filesystem, run its real toolchain (pnpm/npm, native addons, scripts) fast and isolated, then snapshot and fork the warm state so repeated runs are near-instant.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧱 [Backends](#backends)
- ✅ [Shipped](#shipped)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
virrun -- pnpm install
virrun -- pnpm test
```

The `virrun -- <cmd>` prefix sandboxes any command; the child's exit code is propagated and output streams live. On a capable host the `os` backend runs it in a bubblewrap RAM overlay, otherwise it falls back to native. The CLI (built on [unjs/citty](https://github.com/unjs/citty)) also has `run`/`exec`/`snapshot`/`init`/`cache` subcommands — run `virrun --help`. Prerequisites, the subcommand reference, the programmatic API, and the package scripts are in the [Getting Started guide][doc-getting-started].

## <a name="backends">🧱 Backends</a>

| Backend  | Isolation                           | Selected by `Auto` | Notes                                                                                  |
| -------- | ----------------------------------- | :----------------: | -------------------------------------------------------------------------------------- |
| `native` | none                                |     ✓ (today)      | Runs the command directly on the host.                                                 |
| `vfs`    | none (in-process, no spawn)         |         —          | Recognised pure-JS `node` invocations in-process; falls back to native.                |
| `os`     | bubblewrap RAM-overlay + namespaces |         —          | Linux or Windows/WSL2 + `bwrap`. Never falls back — an un-isolated run would be wrong. |
| `auto`   | resolves to the best gate-proven    |         —          | Resolves to `native` until an isolating backend beats the gates.                       |

## <a name="shipped">✅ Shipped</a>

What's landed and dogfooded in this repo (the [roadmap](https://github.com/Esposter/Esposter/blob/main/features/virrun/roadmap.md) tracks open work; both gates — differential correctness + speed — run from the first backend onward):

- **`vfs` backend** — recognised pure-JS `node` invocations run in-process, no spawn; falls back to native otherwise.
- **`os` backend** — bubblewrap RAM-overlay exec with a shared CAS dep store and the WSL2 bridge (macOS bridge is the one open piece).
- **Snapshot + warm-fork** — a lockfile-hash-keyed warm post-install snapshot, forked read-only per run so commands reuse the dep tree instead of reinstalling.
- **Task cache** — a persist run whose inputs are unchanged (keyed by lockfile hash + working-tree hash + command) skips the sandbox entirely and replays the recorded output, so re-running an unchanged build/test/lint is near-instant. Default-on locally, off in CI (a fresh commit means ~0 hits) and under `--no-cache`. The capability probe is likewise cached across processes so each `virrun -- <cmd>` skips re-probing.
- **Write-back persistence** — a normal `virrun -- <cmd>` flushes produced files to the host so disk matches native; the ephemeral fork stays for CI/verification. → [write-back.md](https://github.com/Esposter/Esposter/blob/main/features/virrun/specs/write-back.md)
- **CLI (citty)** — `run` / `exec` / `snapshot` / `init` / `cache` subcommands with `--help`, the bare `virrun -- <cmd>` prefix preserved as the default.
- **Config backend selection** — committed `virrun.config.json` picks the backend; the prefix stays the sole on/off switch (no allowlist).
- **Dogfooded scripts** — `format`, `lint`/`lint:fix`, `test`, `typecheck`, and the producing `build:app` / `build:docs` route through the prefix; the matching 🏗️ CI jobs fork the warm snapshot. `build:packages` (bootstrap) and `coverage` (correctness gate) stay native by design — see [ci.md](https://github.com/Esposter/Esposter/blob/main/packages/virrun/readme/ci.md).

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/modules/virrun.html) to level up.

- 🚀 [Getting Started][doc-getting-started] — prerequisites, CLI, programmatic API, package scripts.
- 🤖 [CI][doc-ci] — the two gates (differential correctness + speed) and the CI snapshot cache.
- 🏎️ [Speed Harness][doc-speed-harness] — benchmarking conventions, committed `*.bench.md`, CodSpeed.

Design docs incubate in [`features/virrun`](https://github.com/Esposter/Esposter/tree/main/features/virrun) — start with the [architecture overview](https://github.com/Esposter/Esposter/blob/main/features/virrun/architecture.md) and the [exec-isolation spec](https://github.com/Esposter/Esposter/blob/main/features/virrun/specs/exec-isolation.md).

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[doc-getting-started]: https://github.com/Esposter/Esposter/blob/main/packages/virrun/readme/getting-started.md
[doc-ci]: https://github.com/Esposter/Esposter/blob/main/packages/virrun/readme/ci.md
[doc-speed-harness]: https://github.com/Esposter/Esposter/blob/main/packages/virrun/readme/speed-harness.md
[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/virrun/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/virrun/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/virrun/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/virrun.svg
