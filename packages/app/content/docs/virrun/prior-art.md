---
title: Prior art
description: Surveyed projects and why each does or doesn't fit — keeps the landscape from being re-derived.
---

# Prior art

Surveyed projects and why each does or doesn't fit. Keeps the landscape from being re-derived.

## Filesystem layer — adopt

- **`node:vfs`** ([nodejs/node#61478](https://github.com/nodejs/node/pull/61478), open) — official core virtual filesystem. Provider-based, full `fs` API compat, mount prefixes, overlay mode, module loading from virtual files. The end state virrun targets.
- **`@platformatic/vfs`** (MIT) — the same work extracted to userland. Memory / Sqlite / RealFS providers, overlay mode, patches `require`/`import`/`fs`. **Adopted now, swap to `node:vfs` later** — one module owns the import ([execution backends](/docs/virrun/execution-backends)). Filesystem only; explicitly cannot run processes, native binaries, or `npm install`.

## Shell layer — optional reuse

- **`just-bash`** (vercel-labs, Apache-2.0) — TS bash interpreter, ~80 commands reimplemented in JS, WASM Python/JS/sqlite. Cannot run system binaries, no package-manager support, no VM isolation. Reusable only for its bash parser + builtins; never as the exec engine — [pure-JS exec is rejected](/docs/virrun/rejected/pure-js-exec).

## Runtime / sandbox — study, don't adopt wholesale

- **WebContainers** (`@webcontainer/api`, StackBlitz) — node compiled to WASM, runs in-process/in-browser, `pnpm install` works. No native binaries, CPU-slow. [Deferred as a backend](/docs/virrun/deferred/wasm-runtime).
- **e2b** — TS SDK over Firecracker microVMs; real native support, but in their cloud / a Firecracker host you operate. Closest commercial analogue — evaluate before ever building the microVM path.
- **Firecracker + jailer** (AWS) — microVM, sub-second boot, snapshotting. The reference design for an untrusted/multi-tenant backend ([deferred](/docs/virrun/deferred/additional-isolation-targets)).
- **CRIU** — Linux checkpoint/restore; the candidate for true process-state warm-fork if FS-only snapshotting ever proves insufficient ([snapshot and fork](/docs/virrun/snapshot-and-fork)).
- **Turborepo** — task cache prior art (skip unchanged builds); virrun's [task cache](/docs/virrun/task-cache) is the same idea content-keyed on lockfile + working tree + command.

## Names checked (rejected)

`mirage` (taken in-domain — strukto-ai/mirage, MirageOS), bare `wisp`/`skiff`/`husk` (all taken on npm). Settled on `virrun` — a contraction of _virtual runner_, short, unclaimed, published unscoped.
