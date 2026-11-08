# Environment Detection

## The problem

Nuxt code runs in three contexts, each with different capabilities:

| Context                                                         | Available            |
| --------------------------------------------------------------- | -------------------- |
| `server/` (Nitro, Node.js)                                      | `process.env.*`      |
| Composables / Vue setup                                         | `useRuntimeConfig()` |
| Module-level (class constructors, plain utilities, shared code) | `import.meta.env.*`  |

`process.env.APP_ENV` is a Node.js runtime value — it is `undefined` in the browser regardless of what is set at deploy time. Any module-level shared code that reads it will silently get the wrong answer on the client.

## The solution

Use `import.meta.env` for universal env constants. Vite replaces these at build time in every bundle — client, server (Nitro), and Vitest:

```ts
// apps/web/shared/util/environment/constants.ts
export const IS_PRODUCTION = import.meta.env.PROD;
export const IS_DEVELOPMENT = import.meta.env.DEV;
export const IS_TEST = import.meta.env.MODE === "test";
```

These are set automatically:

| Command      | `PROD`  | `DEV`   | `MODE`          |
| ------------ | ------- | ------- | --------------- |
| `nuxt dev`   | `false` | `true`  | `"development"` |
| `nuxt build` | `true`  | `false` | `"production"`  |
| Vitest       | `false` | `true`  | `"test"`        |

## Where to use what

**`IS_PRODUCTION` / `IS_DEVELOPMENT` (from `#shared/util/environment/constants`)** — the single consistent choice everywhere: module-level code, class property initialisers, composables, server routes, plugins. `vite.mode` is set from `APP_ENV` in `configuration/vite.ts`, so these build-time constants always reflect the deployed environment.

**`process.env.*` directly** — secrets, urls and connection strings, in code that only ever runs server-side (`server/`, `apps/functions/`, and the `shared/` modules only those contexts import) or at build time (`configuration/`, whose code the Nuxt build evaluates and never ships, apart from the values it writes under `public`), plus `APP_ENV` in the build-time config files where `import.meta.env` is not available yet. A server secret is never copied into `runtimeConfig`, so a built artifact holds none of them and a deployment supplies each one under its own name when the server starts.

## Declared per app, checked at start

Each app declares its own variables once, as an interface with the Zod schema that satisfies it: `WebEnvironmentVariables` in `apps/web/shared/models/environment/` and `FunctionsEnvironmentVariables` in `apps/functions/src/models/environment/`. The two are separate deployables with their own settings, so neither depends on the other's list and a variable that leaves one is one edit. The ten they have in common are written twice on purpose; a shared declaration would tie one app's deployment to the other's for nothing but saved lines. Everything else follows from the declaration, and nothing is generated:

- **The types.** `shared/types/env.d.ts` in the web app and `types/env.d.ts` in Functions make `ProcessEnv` extend the app's interface, so `process.env.DATABASE_URL` is a `string`. That is true rather than hoped for, because the start-up check below has already passed. A variable that may be absent (LiveKit) is `?:` in the interface and reads as `string | undefined`.
- **The check.** `validateEnvironmentVariables` from `@esposter/shared`, which knows no variable of its own, parses `process.env` against the app's schema and throws one error naming every variable that is missing or malformed, never quoting a value. The web app runs it from the first Nitro plugin (`server/plugins/environment.ts`, skipped while prerendering, where the deployment's environment is not set) and Functions from an `appStart` hook that rejects on purpose, so a deployment with a gap stops at the start instead of at the first request that needs the variable.
- **The example file.** Each app's `.env.example` is written by hand, and a test holds its names to the schema's, so the two cannot drift.

The names are the deployment's own and no framework prefix is read: a variable has the same name in a developer's `.env`, in the web host and in the Functions app's settings.

## What not to do

Do not read `process.env.*` in code that executes in the browser — values are `undefined` at runtime and will silently evaluate to `false` for any comparison. The folder location (`shared/`) is not the deciding factor; what matters is whether the code ever runs client-side.

Do not reach for `runtimeConfig` to escape that. `configuration/runtimeConfig.ts` holds only `public`, which is serialised into the client payload and readable by anyone who opens the page. A key belongs there only once it is safe to publish — an endpoint or a base url — so classify the value before placing it, and a secret that needs a client-side effect is fronted by a server route rather than moved.
