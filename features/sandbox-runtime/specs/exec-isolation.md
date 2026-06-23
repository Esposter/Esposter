# sandbox-runtime — Exec + Isolation Layer

The core, novel work: run a repo's **real** commands against the RAM filesystem, isolated from the host. This is the layer no existing package provides.

## Overview

Two pluggable backends behind one `ExecBackend` interface. The orchestrator picks via `backend: "vfs" | "os" | "auto"`.

## `vfs` backend — in-process, pure npm

- Runs JS workloads in-process so node:vfs/platformatic intercepts their fs + module loading.
- Cross-platform, zero host setup, but **no native subprocess** — the moment code spawns a native binary it escapes the VFS (architecture.md → "The subprocess wall").
- Use for: pure-JS scripts, evals, untrusted-JS sandboxing, lightweight runs.

## `os` backend — native, generic (Linux core)

Makes **every** process (including spawned native binaries) see the RAM FS, by moving the FS and isolation down to the OS:

- **RAM filesystem**: `overlayfs` with `lowerdir` = source (read-only), `upperdir` = `tmpfs` (RAM, read-write). Reads hit the real source; all writes (`node_modules`, build output) stay in RAM.
- **Isolation**: run the process tree inside a sandbox so it only sees the overlay. Evaluation order: `bubblewrap` (rootless, simplest) → `nsjail` → rootless `runc` → Firecracker microVM (strongest, for untrusted/multi-tenant).
- **Dep store**: shared content-addressable store on the host, hardlinked into each sandbox's store so deps download once.
- **Host bridge**: on Windows/macOS the backend runs inside WSL2 / a microVM; the orchestrator talks to it over a thin RPC.

## Acceptance test

`pnpm install` on a repo with a native postinstall (sharp or esbuild) completes **fully in RAM**, isolated from the host, and the resulting `node_modules` is invisible to the real disk. This proves the subprocess wall is broken — the entire reason the `os` backend exists.

## Constraints / Notes

- Native-binary support across platforms is impossible in pure JS; the `os` backend is Linux-only and bridged elsewhere. Accepted — see architecture.md → "Platform reality".
- The shell layer (just-bash parser/builtins) is optional sugar for running shell scripts; it is **not** an exec engine and never spawns native. See [out-of-scope/pure-js-exec.md](../out-of-scope/pure-js-exec.md).

## Key Files (planned)

| File                  | Role                                   |
| --------------------- | -------------------------------------- |
| `exec/ExecBackend.ts` | interface both backends implement      |
| `exec/vfsBackend.ts`  | in-process JS runner over the FS layer |
| `exec/osBackend.ts`   | overlayfs+tmpfs+sandbox runner (Linux) |
| `exec/hostBridge.ts`  | WSL2 / microVM RPC for non-Linux hosts |
