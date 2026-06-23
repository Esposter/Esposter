# sandbox-runtime — Virtual Filesystem Layer

RAM-backed filesystem for the sandbox. **Reused, not built** — the design choice is _which_ implementation and how to stay swappable.

## Overview

The FS layer provides files to the sandbox without touching real disk. Node is standardizing this as a core `node:vfs` module ([PR #61478](https://github.com/nodejs/node/pull/61478)); `@platformatic/vfs` (MIT) is the same work extracted to userland today. We adopt platformatic now and swap the import to `node:vfs` when it lands.

## Decision

- Depend on `@platformatic/vfs` behind a thin internal interface (`FsProvider`). One module owns the import so the swap to `node:vfs` is a single-file change.
- Use its providers: `Memory` (default), `RealFS` (sandboxed real-dir access), overlay mode (virtual paths intercepted, everything else falls through to real disk).
- Do **not** use just-bash's FS abstraction — platformatic _is_ node's fs, not a parallel one, so in-process tooling and the module loader see virtual files for free.

## Capabilities (from platformatic / node:vfs)

- fs API compat: `readFileSync`/`writeFileSync`/`mkdirSync`/streams/promises/symlinks/watchers.
- Mount at a path prefix; overlay mode for coexistence with real disk.
- Module loading: `require`/`import` resolve from virtual files.

## Hard limit (drives the whole project)

In-process JS only. **Child processes and native binaries bypass it** (raw syscalls hit real disk). The FS layer therefore cannot, by itself, host a real `pnpm install`. Closing that gap is the `os` backend's job — see [exec-isolation.md](exec-isolation.md) and architecture.md → "The subprocess wall".

## Key Files (planned)

| File                          | Role                                                     |
| ----------------------------- | -------------------------------------------------------- |
| `vfs/FsProvider.ts`           | internal interface the rest of the runtime codes against |
| `vfs/platformaticProvider.ts` | adapter over `@platformatic/vfs`; the one import to swap |
