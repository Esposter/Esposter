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

// Run a command inside the runner environment
const { stdout, exitCode } = await virrun.exec("pnpm build");

// Run a command over a warm snapshot of its post-run state (os backend only)
const forkResult = await virrun.fork("pnpm test");

await virrun.dispose();
```

## Shape (realized API)

| Member                     | Purpose                                                   |
| -------------------------- | --------------------------------------------------------- |
| `createVirrun(options)`    | resolve source → FS layer → backend; returns `Virrun`     |
| `Virrun.backend`           | resolved backend name                                     |
| `Virrun.exec(cmd, stdio?)` | run a command; returns `{ stdout, stderr, exitCode }`     |
| `Virrun.fork(cmd, stdio?)` | runs a command over a warm snapshot of its post-run state |
| `Virrun.dispose()`         | tear down; release RAM                                    |

## Constraints / Notes

- Async-first, resource-handle model (`dispose()`); no global mutable singletons.
- The API must not leak which backend ran — `exec` behaves the same; only capabilities differ (native support requires `os`).
- Errors use the project's standard error type once it has one; do not throw bare `Error`.

## Key Files (planned)

| File        | Role                                       |
| ----------- | ------------------------------------------ |
| `index.ts`  | `createVirrun` + public types              |
| `Virrun.ts` | sandbox handle wiring FS + exec + snapshot |
