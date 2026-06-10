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

**`IS_PRODUCTION` / `IS_TEST` / `IS_DEVELOPMENT` (from `#shared/util/environment/constants`)**  
The single consistent choice everywhere — module-level code, class property initialisers, composables, server routes, plugins. `vite.mode` is set from `APP_ENV` in `configuration/vite.ts`, so these build-time constants always reflect the deployed environment.

**`process.env.APP_ENV` directly**  
Only in build-time config files (`configuration/`) where `import.meta.env` is not yet available.

## What not to do

Do not read `process.env.*` in code that executes in the browser — values are `undefined` at runtime and will silently evaluate to `false` for any comparison. The folder location (`shared/`) is not the deciding factor; what matters is whether the code ever runs client-side.

## Rule of thumb

- **`import.meta.env`** — for environment mode checks (`IS_PRODUCTION`, `IS_DEVELOPMENT`, etc.) in any code that may run client-side
- **`process.env`** — for secrets, URLs, and connection strings in code that only ever runs server-side: `server/`, `configuration/`, `packages/azure-functions/`, and `shared/` modules that are only imported from those contexts
