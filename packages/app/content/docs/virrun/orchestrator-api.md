---
title: Orchestrator API
description: The public TypeScript surface — createVirrun resolves a source and backend into a handle with exec, fork, and dispose.
---

# Orchestrator API

The public, TypeScript, node-compatible surface. Everything below it (FS, exec, snapshot) is an implementation detail behind this. The CLI ([adoption](/docs/virrun/adoption)) is a thin wrapper over it.

```ts
import { createVirrun } from "virrun";

const virrun = await createVirrun({
  // Source is a discriminated union on `type` (SourceType.Dir | Files | Git), normalized to a
  // working dir + dispose() by the source loaders.
  source: { type: SourceType.Git, repo: "https://github.com/user/repo", ref: "" },
  backend: BackendType.Auto, // Auto resolves to the fastest supported backend (Native today).
});

const { stdout, exitCode } = await virrun.exec("pnpm build");
const forkResult = await virrun.fork("pnpm test"); // warm-snapshot fork (os backend only)
await virrun.dispose();
```

| Member                     | Purpose                                                                     |
| -------------------------- | --------------------------------------------------------------------------- |
| `createVirrun(options)`    | resolve source → FS layer → backend; returns `Virrun`                       |
| `Virrun.backend`           | resolved backend name                                                       |
| `Virrun.exec(cmd, stdio?)` | run a command; returns `{ stdout, stderr, exitCode }`                       |
| `Virrun.fork(cmd, stdio?)` | on `os`, captures/reuses a warm snapshot; other backends behave like `exec` |
| `Virrun.dispose()`         | tear down; release RAM                                                      |

## Key files

Paths relative to `packages/virrun/src/`.

| File                              | Role                                                    |
| --------------------------------- | ------------------------------------------------------- |
| `services/virrun/createVirrun.ts` | the entrypoint — orchestrates source, backend, snapshot |
| `models/virrun/VirrunOptions.ts`  | `source` + `backend` option types                       |
| `services/source/` (loaders)      | `dir`/`files`/`git` sources → working dir + `dispose()` |

## Notes

- Async-first, resource-handle model (`dispose()`); no global mutable singletons.
- The API does not leak which backend ran — `exec` behaves the same everywhere; only capabilities differ (native-binary support requires `os`).
