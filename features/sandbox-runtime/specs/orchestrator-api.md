# sandbox-runtime — Orchestrator API

The public, TypeScript, node-compatible surface. Everything below it (FS, exec, snapshot) is an implementation detail behind this.

## Overview

One entry point creates a sandbox from a source, runs commands, and snapshots/forks. Backend selection is explicit or `auto` (prefer `os` when available, else `vfs`).

## Sketch

```ts
import { createSandbox } from "@esposter/sandbox-runtime";

const sandbox = await createSandbox({
  // Source is a discriminated union on `type` (SourceType.Dir | Files | Git), normalized to a
  // working dir + dispose() by the source loaders.
  source: { type: SourceType.Git, repo: "https://github.com/user/repo", ref: "" },
  backend: BackendType.Auto, // Auto resolves to the fastest supported backend (Native today).
});

await sandbox.exec("pnpm install"); // real toolchain (os backend)
const snapshot = await sandbox.snapshot(); // freeze warm state

const run = await snapshot.fork(); // near-instant clone
const { stdout, exitCode } = await run.exec("pnpm test");
await run.dispose();
await sandbox.dispose();
```

## Shape (types only — to be locked in Phase 0)

| Member                     | Purpose                                                |
| -------------------------- | ------------------------------------------------------ |
| `createSandbox(options)`   | resolve source → FS layer → backend; returns `Sandbox` |
| `Sandbox.exec(cmd, opts?)` | run a command; returns `{ stdout, stderr, exitCode }`  |
| `Sandbox.fs`               | direct FS access (read/write before/after runs)        |
| `Sandbox.snapshot()`       | freeze warm state → `Snapshot`                         |
| `Snapshot.fork()`          | clone into a fresh isolated `Sandbox`                  |
| `*.dispose()`              | tear down; release RAM                                 |

## Constraints / Notes

- Async-first, resource-handle model (`dispose()`); no global mutable singletons.
- The API must not leak which backend ran — `exec` behaves the same; only capabilities differ (native support requires `os`).
- Errors use the project's standard error type once it has one; do not throw bare `Error`.

## Key Files (planned)

| File         | Role                                       |
| ------------ | ------------------------------------------ |
| `index.ts`   | `createSandbox` + public types             |
| `Sandbox.ts` | sandbox handle wiring FS + exec + snapshot |
