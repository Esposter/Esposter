# virrun — Getting Started

Wrap any command in the sandbox, or drive it programmatically. The overview lives in the [README](https://github.com/Esposter/Esposter/blob/main/packages/virrun/README.md); this is the how-to.

## Prerequisites

The sandboxed `os` backend needs the following; if either is missing, `virrun` falls back to the native backend (so every command still runs — just un-isolated).

- **Bubblewrap `>= 0.10.0`** (RAM overlay support: `--overlay-src` / `--tmp-overlay`), via your system package manager — e.g. `sudo apt install -y bubblewrap` (Debian/Ubuntu/WSL2), `sudo dnf install bubblewrap` (Fedora/RHEL), `sudo pacman -S bubblewrap` (Arch).
- **A Linux `node` inside your default WSL2 distro** (Windows hosts only) — Windows `node.exe` can't run in the Linux sandbox, so without it the capability check fails and virrun runs natively on Windows.

The `vfs` and `native` backends need neither.

## CLI

The lowest rung of adoption — wrap any single command, output streams live, the child's exit code is propagated:

```bash
virrun -- pnpm install
virrun -- pnpm test
```

The `virrun -- <cmd>` prefix **is** the switch: every prefixed command is sandboxed, and opting a command in or out is adding or removing the prefix. There is no allowlist or on/off flag. Which backend a sandboxed command runs through is the only thing `virrun.config.json` decides — see [config & cache](https://github.com/Esposter/Esposter/blob/main/features/virrun/specs/config-and-cache.md).

On an `os`-backend run the CLI prints a one-time provisioning line on stderr so a multi-minute first install is explained, not a silent stall:

```text
[virrun] no sandbox dependency snapshot for lockfile a1b2c3d4e5f6 — installing the toolchain inside the sandbox once (this run may take a few minutes); later runs reuse it
[virrun] reusing the sandbox dependency snapshot (lockfile a1b2c3d4e5f6)
```

### Subcommands

The bare `virrun -- <cmd>` prefix is shorthand for `virrun run`. The CLI (built on [unjs/citty](https://github.com/unjs/citty), so every command has `--help`) also exposes:

| Command                      | What it does                                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `virrun -- <cmd>`            | Default passthrough — forks a warm snapshot on the `os` backend, else execs natively. Alias of `virrun run`.    |
| `virrun run -- <cmd>`        | Explicit form of the default passthrough.                                                                       |
| `virrun exec -- <cmd>`       | Forced plain exec — runs the command directly, skipping any warm-snapshot fork (the cold sibling of `run`).     |
| `virrun snapshot`            | Provisions the `os` backend's warm dependency snapshot for the current lockfile ahead of time (the CI warm-up). |
| `virrun init [--backend]`    | Writes a `virrun.config.json` selecting the backend (`--force` to overwrite an existing one).                   |
| `virrun cache ls`            | Lists the repo-local dependency store and host-global warm snapshots.                                           |
| `virrun cache clean [--all]` | Removes the repo-local `.virrun` cache; `--all` also clears the host-global `~/.virrun/snapshots`.              |

## Programmatic

```ts
import { createVirrun } from "virrun";

const virrun = await createVirrun();
try {
  const { exitCode, stdout } = await virrun.exec("pnpm build");
} finally {
  await virrun.dispose();
}
```

`createVirrun` accepts a `source` (directory, in-memory file map, or git remote) and a `backend`; it returns a handle with `exec`, `fork` (os-backend warm-snapshot reuse), and `dispose`. See [VirrunOptions](https://github.com/Esposter/Esposter/blob/main/packages/virrun/src/models/virrun/VirrunOptions.ts).

## Commands

Run from `packages/virrun/`:

```bash
pnpm build        # export:gen + rolldown bundle to dist/
pnpm bench        # vitest bench (colocated *.bench.{json,md})
pnpm test         # vitest watch mode
pnpm lint:fix     # auto-fix lint
pnpm typecheck    # type check
```
