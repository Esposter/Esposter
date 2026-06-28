# virrun

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

An ephemeral, in-memory virtual runner: boot a repo into a RAM-backed filesystem, run its real toolchain (pnpm/npm, native addons, scripts) fast and isolated, then snapshot and fork the warm state so repeated runs are near-instant.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

### Prerequisites

The `os` backend runs every command inside a [bubblewrap](https://github.com/containers/bubblewrap) RAM-overlay. `bwrap` is a system-level namespace tool — it is **not** an npm dependency and is intentionally not bundled (a prebuilt binary would bypass the distro's setuid/AppArmor integration and the kernel's unprivileged-userns config it relies on). Install it from your package manager:

```bash
# Debian / Ubuntu / WSL2 distro
sudo apt install bubblewrap

# Fedora / RHEL
sudo dnf install bubblewrap

# Arch
sudo pacman -S bubblewrap

bwrap --version   # verify it is on PATH
```

The `os` backend is **Linux-core and opt-in**. It runs directly on Linux, and on Windows through WSL2 when `wsl.exe`, `wslpath`, and an overlay-capable `bwrap` are available inside the default distro. Unsupported hosts still keep `Auto` on the native backend, so the package is usable everywhere; only `BackendType.Os` requires the sandbox. `isOsBackendSupported()` reports whether the current host qualifies.

### CLI

The lowest rung of adoption — wrap any single command, output streams live, the child's exit code is propagated:

```bash
virrun -- pnpm install
virrun -- pnpm test
```

### Programmatic

```ts
import { createVirrun } from "virrun";

const virrun = await createVirrun();
try {
  const { exitCode, stdout } = await virrun.exec("pnpm build");
} finally {
  await virrun.dispose();
}
```

`createVirrun` accepts a `source` (directory, in-memory file map, or git remote) and a `backend`; it returns a handle with `exec` and `dispose`. See [VirrunOptions](https://github.com/Esposter/Esposter/blob/main/packages/virrun/src/models/virrun/VirrunOptions.ts).

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/modules/virrun.html) to level up.

Design docs incubate in [`features/virrun`](https://github.com/Esposter/Esposter/tree/main/features/virrun) — start with the [architecture overview](https://github.com/Esposter/Esposter/blob/main/features/virrun/architecture.md) and the [exec-isolation spec](https://github.com/Esposter/Esposter/blob/main/features/virrun/specs/exec-isolation.md).

### Backends

| Backend  | Isolation                           | Selected by `Auto` | Notes                                                                                  |
| -------- | ----------------------------------- | :----------------: | -------------------------------------------------------------------------------------- |
| `native` | none                                |     ✓ (today)      | Runs the command directly on the host.                                                 |
| `vfs`    | none (in-process, no spawn)         |         —          | Recognised pure-JS `node` invocations in-process; falls back to native.                |
| `os`     | bubblewrap RAM-overlay + namespaces |         —          | Linux or Windows/WSL2 + `bwrap`. Never falls back — an un-isolated run would be wrong. |
| `auto`   | resolves to the best gate-proven    |         —          | Resolves to `native` until an isolating backend beats the gates.                       |

### Commands

Run from `packages/virrun/`:

```bash
pnpm build        # export:gen + rolldown bundle to dist/
pnpm bench        # vitest bench (colocated *.bench.{json,md})
pnpm test         # vitest watch mode
pnpm lint:fix     # auto-fix lint
pnpm typecheck    # type check
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/virrun/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/virrun/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/virrun/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/virrun.svg
