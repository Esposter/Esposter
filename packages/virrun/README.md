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

To use the sandboxed `os` backend, your host environment must meet the following requirements. If any requirement is missing, `virrun` safely falls back to the native backend.

#### 1. Bubblewrap (Linux / WSL2 Distro)

Bubblewrap is a system-level namespace tool and must be installed via your system package manager.

- **Version Requirement:** Bubblewrap **`>= 0.10.0`** is required for RAM overlay support (`--overlay-src` and `--tmp-overlay`).
- **Installation:**

  ```bash
  # Debian / Ubuntu / WSL2 Distro
  sudo apt update && sudo apt install -y bubblewrap

  # Fedora / RHEL
  sudo dnf install bubblewrap

  # Arch Linux
  sudo pacman -S bubblewrap
  ```

- **Verify installation:**
  ```bash
  bwrap --version
  ```

#### 2. Linux Node.js (For Windows/WSL2 users)

If you are developing on Windows and want `virrun` to run commands inside the WSL2 sandbox:

- **WSL2 Distro Requirement:** You must have a **Linux Node.js** binary installed inside your default WSL2 Linux distribution (e.g. via `nvm`, `fnm`, or `apt`).
- **Why:** Windows executables (`node.exe`) cannot run inside the Linux bubblewrap sandbox. If no Linux `node` executable is found inside WSL2, the environment capability check fails and `virrun` will fall back to native Windows execution.

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
