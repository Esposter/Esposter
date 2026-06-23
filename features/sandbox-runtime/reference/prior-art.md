# sandbox-runtime — Prior Art

Surveyed projects and why each does or doesn't fit. Keeps us from re-deriving the landscape.

## Filesystem layer — adopt

- **`node:vfs`** ([nodejs/node#61478](https://github.com/nodejs/node/pull/61478), open) — official core virtual filesystem. Provider-based, full `fs` API compat, mount prefixes, overlay mode, module loading from virtual files, intercepts at 164+ internal points. The end state we target.
- **`@platformatic/vfs`** ([GitHub](https://github.com/platformatic/vfs), MIT, v0.4.0) — the same work extracted to userland. Memory / Sqlite / RealFS providers, overlay mode, patches `require`/`import`/`fs`. **Adopt now, swap to `node:vfs` later.** Filesystem only — explicitly _cannot_ run processes, native binaries, or `npm install`.

## Shell layer — optional reuse

- **`just-bash`** ([vercel-labs/just-bash](https://github.com/vercel-labs/just-bash), Apache-2.0, beta) — TS bash interpreter, ~80 commands **reimplemented in JS**; Python (CPython WASM), JS (QuickJS WASM), sqlite (sql.js WASM); in-memory/overlay FS. **Cannot run system binaries, no npm/pnpm, no VM isolation.** Reusable only for its bash parser + builtins; never as the exec engine. Why: [out-of-scope/pure-js-exec.md](../out-of-scope/pure-js-exec.md).

## Runtime / sandbox — study, don't adopt wholesale

- **WebContainers** (`@webcontainer/api`, StackBlitz) — node compiled to WASM, runs in-browser/in-process, `pnpm install` works. But **no native binaries**, CPU-slow. Deferred backend: [deferred/wasm-runtime.md](../deferred/wasm-runtime.md).
- **e2b** (`e2b`, npm) — TS SDK over Firecracker microVMs; runs any repo with real native support, but in their cloud / a Firecracker host you operate. Closest commercial analogue — evaluate before building the microVM path; informs the Phase 4 backend.
- **Firecracker + jailer** (AWS) — microVM, sub-second boot, snapshotting. The reference design for the untrusted/multi-tenant `os` backend and microVM snapshots.
- **CRIU** — Linux checkpoint/restore; candidate for true warm-fork (process + FS). See [specs/snapshot-fork.md](../specs/snapshot-fork.md).
- **Turborepo** — task cache (skip unchanged builds); reuse rather than reinvent in Phase 4.

## Names checked (rejected)

- **Mirage** — taken in-domain: `strukto-ai/mirage` ("Unified Virtual Filesystem for AI Agents", `@struktoai/mirage-node`) and OCaml MirageOS. Different products, same keywords — collision.
- Bare `wisp` / `skiff` / `husk` — all taken on npm; `wisp` is also a proxy protocol, `skiff` an ex-email brand. Settled on the bland, descriptive `sandbox-runtime` per monorepo naming convention.
