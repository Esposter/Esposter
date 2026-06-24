# virrun

[![Apache-2.0 licensed][badge-license]][url-license]

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
# Debian / Ubuntu / WSL2
sudo apt install bubblewrap

# Fedora / RHEL
sudo dnf install bubblewrap

# Arch
sudo pacman -S bubblewrap

bwrap --version   # verify it is on PATH
```

The `os` backend is **Linux-only and opt-in**. On any other host — or with `bwrap` absent — `Auto` resolves to the native backend, so the package is usable everywhere; only `BackendType.Os` requires `bwrap`. `isOsBackendSupported()` reports whether the current host qualifies.

### CLI

The lowest rung of adoption — wrap any single command, output streams live, the child's exit code is propagated:

```bash
virrun -- pnpm install
virrun -- pnpm test
```

### Programmatic

```ts
import { BackendType, createVirrun } from "virrun";

const virrun = await createVirrun({ backend: BackendType.Auto });
try {
  const { exitCode, stdout } = await virrun.exec("pnpm build");
} finally {
  await virrun.dispose();
}
```

`createVirrun` accepts a `source` (directory, in-memory file map, or git remote) and a `backend`; it returns a handle with `exec` and `dispose`. See [VirrunOptions](https://github.com/Esposter/Esposter/blob/main/packages/virrun/src/models/virrun/VirrunOptions.ts).

## <a name="documentation">📖 Documentation</a>

Design docs incubate in [`features/virrun`](https://github.com/Esposter/Esposter/tree/main/features/virrun) — start with the [architecture overview](https://github.com/Esposter/Esposter/blob/main/features/virrun/architecture.md) and the [exec-isolation spec](https://github.com/Esposter/Esposter/blob/main/features/virrun/specs/exec-isolation.md).

### Backends

| Backend  | Isolation                           | Selected by `Auto` | Notes                                                                       |
| -------- | ----------------------------------- | :----------------: | --------------------------------------------------------------------------- |
| `native` | none                                |     ✓ (today)      | Runs the command directly on the host.                                      |
| `vfs`    | none (in-process, no spawn)         |         —          | Recognised pure-JS `node` invocations in-process; falls back to native.     |
| `os`     | bubblewrap RAM-overlay + namespaces |         —          | Linux + `bwrap` only. Never falls back — an un-isolated run would be wrong. |
| `auto`   | resolves to the best gate-proven    |         —          | Resolves to `native` until an isolating backend beats the gates.            |

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
