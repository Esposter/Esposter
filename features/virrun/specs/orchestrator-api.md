# virrun — Orchestrator API

The public, TypeScript, node-compatible surface. Everything below it (FS, exec, snapshot) is an implementation detail behind this.

## Overview

One entry point creates a sandbox from a source, runs commands, and snapshots/forks. Backend selection is explicit or `auto` (prefer `os` when available, else `vfs`).

## Sketch

```ts
import { createVirrun } from "virrun";

const virrun = await createVirrun({
  // Source is a discriminated union on `type` (SourceType.Dir | Files | Git), normalized to a
  // working dir + dispose() by the source loaders.
  source: { type: SourceType.Git, repo: "https://github.com/user/repo", ref: "" },
  backend: BackendType.Auto, // Auto resolves to the fastest supported backend (Native today).
});

await virrun.exec("pnpm install"); // real toolchain (os backend)
const snapshot = await virrun.snapshot(); // freeze warm state

const run = await snapshot.fork(); // near-instant clone
const { stdout, exitCode } = await run.exec("pnpm test");
await run.dispose();
await virrun.dispose();
```

## Shape (types only — to be locked in Phase 0)

| Member                    | Purpose                                               |
| ------------------------- | ----------------------------------------------------- |
| `createVirrun(options)`   | resolve source → FS layer → backend; returns `Virrun` |
| `Virrun.exec(cmd, opts?)` | run a command; returns `{ stdout, stderr, exitCode }` |
| `Virrun.fs`               | direct FS access (read/write before/after runs)       |
| `Virrun.snapshot()`       | freeze warm state → `Snapshot`                        |
| `Snapshot.fork()`         | clone into a fresh isolated `Virrun`                  |
| `*.dispose()`             | tear down; release RAM                                |

## Constraints / Notes

- Async-first, resource-handle model (`dispose()`); no global mutable singletons.
- The API must not leak which backend ran — `exec` behaves the same; only capabilities differ (native support requires `os`).
- Errors use the project's standard error type once it has one; do not throw bare `Error`.

## Key Files (planned)

| File        | Role                                       |
| ----------- | ------------------------------------------ |
| `index.ts`  | `createVirrun` + public types              |
| `Virrun.ts` | sandbox handle wiring FS + exec + snapshot |
