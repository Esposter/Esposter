---
title: Configuration
description: The committed virrun.config file — backend selection, environment preset, resolution order, and the schema guarantees.
---

# Configuration

The one committed on-disk artifact virrun reads in a consuming repo: `virrun.config.{ts,mts,js,mjs,json}` at the repo root, selecting which backend a sandboxed command runs through. It lives in version control so the backend choice is reviewable and revertible like any change. It does **not** decide _whether_ a command is sandboxed — that is the prefix's job, per command ([adoption](/docs/virrun/adoption)).

## The file

```ts
// virrun.config.ts — defineConfig is a typed identity from the tiny `virrun/config` subpath entry (never import the
// `virrun` barrel here: jiti transpiles a config file's imports on every `virrun -- <cmd>`, ~11 s vs ~0.4 s measured)
import { defineConfig } from "virrun/config";

export default defineConfig({
  backend: process.platform === "win32" ? "os" : "native", // BackendType: auto | native | vfs | os
  environment: "nuxt", // Environment?: nuxt (omit the key entirely for no preset — there is no "none" value)
});
```

- **Resolution** — walk up from cwd to the first `virrun.config.*`, delegated to unconfig's `loadConfigSync`: nearest directory wins, and within a directory the candidate order is `ts > mts > js > mjs > json`. Absent file = the backend defaults to `os`, degraded to native on a host that cannot sandbox. No config is a valid, fully-functional state.
- **Every field is optional** in the file: `parseVirrunConfiguration` defaults `backend → os` and leaves `environment → undefined` (no preset), so a minimal `{}` — or no file at all — is valid. The default is the sandbox rather than `auto` because `auto` is native today and would make adopting the prefix a no-op; the host-capability degrade, not the default, is what keeps that safe. Unknown keys throw (a typo fails loud, not silent), and the resolved `VirrunConfiguration` stays fully populated — optionality is the input surface, not the internal contract.
- **Strict JSON, not jsonc** — the JSON variant is parsed with strict `JSON.parse`, so it carries no comments. Its field docs come from the shipped `schema.json` (referenced via `$schema` — the oxlint pattern), whose enums mirror `BackendType`/`Environment` in code. The TS/JS forms get their editor intelligence from types instead.
- **`environment`** selects a framework preset whose generated artifacts (Nuxt's `.nuxt`) the sandbox regenerates into a source-keyed prepare layer ([snapshot and fork](/docs/virrun/snapshot-and-fork)), so type-aware tooling reads a platform-correct, fresh copy instead of the host's (`os` backend only). Preset-driven — no overrides; `nuxt` runs `nuxt prepare` for the git-detected nuxt package.
- **No allowlist, no on/off flag** — there is no per-command matching; the prefix's presence is the sole opt-in, and the config applies the same backend to every command that carries it. Auto-fallback always degrades to **native** (the only universally-available backend); the degrade target is fixed, not a knob — a configurable target could itself be unsupported, reintroducing the very problem.

## This repo's config

The committed root `virrun.config.ts` branches on `process.platform`: **win32 → `os`** (the platform whose host-generated `.nuxt` misfires Linux type-aware tooling, so sandboxed commands read the Linux-generated prepare layer) with the `nuxt` environment; **everything else → `native`** (Linux/CI generates platform-correct artifacts in place, so the sandbox would only add overhead). `os` degrades to native on hosts without bubblewrap or a WSL Linux Node.js, so the config is a safe no-op anywhere.

## Key files

Paths relative to `packages/virrun/src/`.

| File                                                   | Role                                                                                     |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `services/configuration/resolveVirrunConfiguration.ts` | discovery + loading via unconfig's `loadConfigSync` (jiti for TS/JS, strict JSON parse)  |
| `services/configuration/parseVirrunConfiguration.ts`   | one zod schema validating + defaulting every format                                      |
| `services/configuration/resolvePrepareStep.ts`         | resolve the `environment` preset to a `{ command, outputs }` prepare step                |
| `virrun/config` subpath entry (`defineConfig`)         | the ~1 kB typed author-facing helper — the only safe config-file import                  |
| `schema.json` (package `files`)                        | editor hover docs for the JSON variant; enums mirror `BackendType`/`Environment` in code |

## Notes

- Config is committed and reviewable; the cache is gitignored and disposable ([cache](/docs/virrun/cache)) — the split is deliberate. The backend choice is code; materialized bytes are not.
- unconfig is the package's one runtime dependency, externalized from the bundle because its sync TS loading resolves jiti relative to its own installed file.
