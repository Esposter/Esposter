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
// packages/app/shared/util/environment/constants.ts
export const IS_PRODUCTION = import.meta.env.PROD;
export const IS_TEST = import.meta.env.MODE === Environment.test;
export const IS_DEVELOPMENT = import.meta.env.DEV;
```

These are set automatically:

| Command      | `PROD`  | `DEV`   | `MODE`          |
| ------------ | ------- | ------- | --------------- |
| `nuxt dev`   | `false` | `true`  | `"development"` |
| `nuxt build` | `true`  | `false` | `"production"`  |
| Vitest       | `false` | `true`  | `"test"`        |

## Where to use what

**`useIsProduction()` / (add `useIsDevelopment`, `useIsTest` if needed)**  
The preferred choice whenever inside Vue setup context (composables, components, server composables). Uses `useRuntimeConfig().public.appEnv` — the accurate runtime value of `APP_ENV`.

**`IS_PRODUCTION` / `IS_TEST` / `IS_DEVELOPMENT` (from `constants.ts`)**  
Fallback for module-level code that cannot use a composable: class property initialisers, plain utility functions, top-level constants. Uses `import.meta.env` which Vite bakes in at build time.

**`process.env.APP_ENV` directly**  
Only in build-time config files (`configuration/`) or `server/` code where `useRuntimeConfig()` is not available and the raw string is needed.

## What not to do

Do not read `process.env.*` in code that executes in the browser — values are `undefined` at runtime and will silently evaluate to `false` for any comparison. The folder location (`shared/`) is not the deciding factor; what matters is whether the code ever runs client-side.

## Rule of thumb

- **`import.meta.env`** — for environment mode checks (`IS_PRODUCTION`, `IS_DEV`, etc.) in any code that may run client-side
- **`process.env`** — for secrets, URLs, and connection strings in code that only ever runs server-side: `server/`, `configuration/`, `packages/azure-functions/`, and `shared/` modules that are only imported from those contexts
