# sandbox-runtime — Exec + Isolation Layer

The core, novel work: run a repo's **real** commands against the RAM filesystem, isolated from the host. This is the layer no existing package provides.

## Overview

Two pluggable backends behind one `ExecBackend` interface. The orchestrator picks via `backend: "vfs" | "os" | "auto"`.

## `vfs` backend — in-process, pure npm

- Runs JS workloads in-process so node:vfs/platformatic intercepts their fs + module loading. Realized today: `node -e`/`--eval` (B1) and `node <file>` (B2, a lone non-flag path, no script args yet). A shell-aware tokenizer parses the invocation; inline code runs via `vm.runInThisContext`, a file via `require`, both inside an overlay `FsProvider` mounted at the working dir so the module loader + core fs serve virtual files (or fall through to real disk). Process streams/exit + `require` are patched for the run and restored after; the require cache is cleared back to its pre-run state so each run re-executes like a fresh process.
- **Correctness is preserved by falling back to native** for anything not run faithfully in-process — shell features, other flags, file runs with args, syntax errors, uncaught errors, async results, missing files — so the observable result always matches the baseline.
- Cross-platform, zero host setup, but **no native subprocess** — the moment code spawns a native binary it escapes the VFS (architecture.md → "The subprocess wall").
- Opt-in only: it runs code in the host process with no isolation, so `Auto` resolves to native until an isolating backend lands.
- Use for: pure-JS scripts, evals, untrusted-JS sandboxing, lightweight runs.

## `os` backend — native, generic (Linux core)

Makes **every** process (including spawned native binaries) see the RAM FS, by moving the FS and isolation down to the OS:

- **RAM filesystem** _(realized, Step A)_: `bubblewrap` supplies it directly — `--overlay-src <cwd>` is the read-only lower (source) and `--tmp-overlay <cwd>` overmounts the working dir with an overlay whose upper is an invisible `tmpfs` (RAM). Reads hit the real source; all writes (`node_modules`, build output) stay in RAM. No manual `overlayfs`/`tmpfs` root mounts and no CRIU needed for the core.
- **Isolation** _(realized, Step A)_: `bubblewrap` chosen — one unprivileged tool collapses overlay + tmpfs + namespaces (`--unshare-all`, `--die-with-parent`). `nsjail` → rootless `runc` → Firecracker microVM (strongest, for untrusted/multi-tenant) stay deferred. Unlike `vfs`, the `os` backend never falls back to native: an unsupported host (non-Linux / no bubblewrap) throws, because a silent un-isolated run would be a wrong answer disguised as success.
- **Dep store**: shared content-addressable store on the host, hardlinked into each sandbox's store so deps download once.
- **Host bridge**: on Windows/macOS the backend runs inside WSL2 / a microVM; the orchestrator talks to it over a thin RPC.

## Acceptance test

`pnpm install` on a repo with a native postinstall (sharp or esbuild) completes **fully in RAM**, isolated from the host, and the resulting `node_modules` is invisible to the real disk. This proves the subprocess wall is broken — the entire reason the `os` backend exists.

## Constraints / Notes

- Native-binary support across platforms is impossible in pure JS; the `os` backend is Linux-only and bridged elsewhere. Accepted — see architecture.md → "Platform reality".
- The shell layer (just-bash parser/builtins) is optional sugar for running shell scripts; it is **not** an exec engine and never spawns native. See [out-of-scope/pure-js-exec.md](../out-of-scope/pure-js-exec.md).

## Key Files

Realized (`vfs` + native + `os` Step A); the host-bridge row is still planned.

| File                                    | Role                                                        |
| --------------------------------------- | ----------------------------------------------------------- |
| `models/exec/ExecBackend.ts`            | interface every backend implements                          |
| `services/exec/createNativeBackend.ts`  | native passthrough (the baseline + fallback)                |
| `services/exec/createVfsBackend.ts`     | parse-and-delegate: in-process when recognised, else native |
| `services/exec/parseNodeInvocation.ts`  | recognise `node -e`/`--eval` and `node <file>`              |
| `services/exec/runNodeInProcess.ts`     | in-process runner over the overlay-mounted FS layer         |
| `services/exec/createOsBackend.ts`      | spawns commands inside the bwrap RAM-overlay (Linux)        |
| `services/exec/buildBwrapArgs.ts`       | pure builder for the bwrap overlay argv                     |
| `services/exec/isOsBackendSupported.ts` | Linux + bubblewrap availability check                       |
| `exec/hostBridge.ts` _(planned)_        | WSL2 / microVM RPC for non-Linux hosts                      |
