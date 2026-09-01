# virrun — Getting Started

Wrap any command in the sandbox, or drive it programmatically. The overview lives in the [README](https://github.com/Esposter/Esposter/blob/main/packages/virrun/README.md); this is the how-to.

## Prerequisites

The sandboxed `os` backend needs the following; if either is missing, `virrun` falls back to the native backend (so every command still runs — just un-isolated).

- **Bubblewrap `>= 0.10.0`** (RAM overlay support: `--overlay-src` / `--tmp-overlay`), via your system package manager — e.g. `sudo apt install -y bubblewrap` (Debian/Ubuntu/WSL2), `sudo dnf install bubblewrap` (Fedora/RHEL), `sudo pacman -S bubblewrap` (Arch).
- **A Linux `node` inside your default WSL2 distro** (Windows hosts only) — Windows `node.exe` can't run in the Linux sandbox, so without it the sandbox still mounts but node-based commands (`pnpm`, `vitest`, …) can't resolve `node` inside it. virrun reads it from your real WSL login shell, so a version manager (fnm/nvm) counts. If that login capture fails, the command stops rather than guessing: there is no fallback probe of the guest's default-`PATH` node, and never a fall back to your Windows node — the sandbox cannot run it, and a snapshot labelled with the wrong node major is a wrong cache hit, not a stale one, whose first act is to prune the warm snapshot the correct label still points at. The version it resolved is printed in the run banner — that, not your Windows `node -v`, is what the sandbox runs. The capture is cached for a few hours, so a fresh `fnm use` shows up on the next capture (or immediately after `virrun cache clean --all`).
- **`python3`** (Linux/WSL) — used only by write-back (`run` persisting produced files) to reconcile the overlay upper onto the host; near-universal on Linux. Verification (`run --ephemeral`) and `exec` don't need it.

Run **`virrun doctor`** to check all of the above at once — it reports each prerequisite as ok / missing with the fix, and exits non-zero when the `os` backend isn't fully available.

The `vfs` and `native` backends need neither.

## CLI

The lowest rung of adoption — wrap any single command, output streams live, the child's exit code is propagated:

```bash
virrun -- pnpm install
virrun -- pnpm test
```

The `virrun -- <cmd>` prefix **is** the switch: every prefixed command is sandboxed, and opting a command in or out is adding or removing the prefix. There is no allowlist or on/off flag. Which backend a sandboxed command runs through is the only thing `virrun.config.{ts,mts,js,mjs,json}` decides — the TS form is where `process.platform` branching lives (import `defineConfig` from the tiny `virrun/config` subpath, never the `virrun` barrel: jiti transpiles a config file's imports on every prefixed command):

```ts
// virrun.config.ts
import { defineConfig } from "virrun/config";

export default defineConfig({
  backend: process.platform === "win32" ? "os" : "native",
  environment: "nuxt",
});
```

See [configuration](https://github.com/Esposter/Esposter/blob/main/packages/app/content/docs/virrun/configuration.md) and [cache](https://github.com/Esposter/Esposter/blob/main/packages/app/content/docs/virrun/cache.md).

On an `os`-backend run the CLI prints a one-time provisioning line on stderr so a multi-minute first install is explained, not a silent stall. The provisioning build's own output streams to stderr too — never stdout — so piping virrun's stdout (`virrun -- <cmd> | other`) stays safe even on a cold build:

```text
[virrun] snapshot cache miss (environment a1b2c3d4e5f6) — installing toolchain once (may take minutes); later runs reuse it
[virrun] snapshot cache hit (environment a1b2c3d4e5f6)
```

The `environment` value is the short prefix of the environment key — a hash of the lockfile digest paired with the node major the sandbox runs — so either a dependency change or a node-major bump mints a fresh snapshot.

### Subcommands

The bare `virrun -- <cmd>` prefix is shorthand for `virrun run`. The CLI (built on [unjs/citty](https://github.com/unjs/citty), so every command has `--help`) also exposes:

| Command                      | What it does                                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `virrun -- <cmd>`            | Default passthrough — forks a warm snapshot on the `os` backend, else execs natively. Alias of `virrun run`.                         |
| `virrun run -- <cmd>`        | Explicit form of the default passthrough.                                                                                            |
| `virrun exec -- <cmd>`       | Forced plain exec — runs the command directly, skipping any warm-cache fork (the cold sibling of `run`).                             |
| `virrun warm`                | Provisions the `os` backend's warm cache (dependency snapshot + prepare layer) for the current lockfile ahead of time.               |
| `virrun doctor`              | Diagnoses the `os` backend's prerequisites (bubblewrap, WSL node, python3, overlay mount); exits non-zero on a gap.                  |
| `virrun init [--backend]`    | Writes the JSON config variant selecting the backend (`--force` to overwrite); hand-write `virrun.config.ts` for platform branching. |
| `virrun cache ls`            | Lists the repo-local dependency store and host-global warm snapshots.                                                                |
| `virrun cache clean [--all]` | Removes the repo-local `.virrun` cache; `--all` also clears the host-global `~/.virrun/snapshots`.                                   |

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

`createVirrun` accepts a `source` (directory, in-memory file map, or git remote) and a `backend`; it returns a handle with `exec`, `fork` (os-backend warm-cache reuse), and `dispose`. See [VirrunOptions](https://github.com/Esposter/Esposter/blob/main/packages/virrun/src/models/virrun/VirrunOptions.ts).

## Commands

Run from `packages/virrun/`:

```bash
pnpm build        # ctix barrel + rolldown bundle to dist/
pnpm bench        # vitest bench (colocated *.bench.{json,md})
pnpm test         # vitest watch mode
pnpm lint:fix     # auto-fix lint
pnpm typecheck    # type check
```
