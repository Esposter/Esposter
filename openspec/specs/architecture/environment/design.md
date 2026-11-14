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

The app runs in one of three environments, the `Environment` enum (`development`, `production`, `test`), and a deployment names its own in `APP_ENV`. `configuration/vite.ts` sets `vite.mode` from it, so `import.meta.env.MODE` is that value in every bundle — client, server (Nitro) — and Vitest sets it to `test` itself. The constants compare it with the enum, so exactly one is true:

```ts
// apps/web/shared/util/environment/constants.ts
export const IS_PRODUCTION = import.meta.env.MODE === Environment.Production;
export const IS_DEVELOPMENT = import.meta.env.MODE === Environment.Development;
export const IS_TEST = import.meta.env.MODE === Environment.Test;
```

| Where                              | `MODE`          |
| ---------------------------------- | --------------- |
| `nuxt dev`, `APP_ENV=development`  | `"development"` |
| `nuxt build`, `APP_ENV=production` | `"production"`  |
| Vitest                             | `"test"`        |

## Where to use what

**`IS_PRODUCTION` / `IS_DEVELOPMENT` (from `#shared/util/environment/constants`)** — the single consistent choice everywhere: module-level code, class property initialisers, composables, server routes, plugins. They read the environment the deployment declared and not the command that built it, so `nuxt dev` with `APP_ENV=production` is production, and `IS_DEVELOPMENT` is `false` under Vitest, where `IS_TEST` is the one that holds.

Rejected: Nuxt's `import.meta.dev`, with production as `!import.meta.dev`. It is typed by Nuxt and defined in Nitro, but Vitest does not define it, so it is `false` in every test, including the `nuxt` environment. `!import.meta.dev` would make `IS_PRODUCTION` true across the whole suite, switching on the rate limiter, the production volume and the production starter monsters wherever a test does not mock the constant. Rejected too: Vite's `import.meta.env.PROD` and `DEV`, which follow the command that built the bundle and not the `Environment` the deployment declared, so a second answer to the same question sat beside `APP_ENV`. The lint rule that bans `import.meta.dev` and `import.meta.env.PROD`, `DEV` and `MODE` outside the constants file stays (`packages/configuration/eslint/typescriptRules.js`).

**`process.env.*` directly** — secrets, urls and connection strings, in code that only ever runs server-side (`server/`, `apps/functions/`, and the `shared/` modules only those contexts import) or at build time (`configuration/`, whose code the Nuxt build evaluates and never ships, apart from the values it writes under `public`), plus `APP_ENV` in the build-time config files where `import.meta.env` is not available yet. A server secret is never copied into `runtimeConfig`, so a built artifact holds none of them and a deployment supplies each one under its own name when the server starts.

## Declared per app, checked at start

Each app declares its own variables once, as an interface with the Zod schema that satisfies it: `WebEnvironmentVariables` in `apps/web/shared/models/environment/` and `FunctionsEnvironmentVariables` in `apps/functions/src/models/environment/`. The two are separate deployables with their own settings, so neither depends on the other's list and a variable that leaves one is one edit. The one they share, `BASE_URL`, is written in each on purpose; a shared declaration would tie one app's deployment to the other's for a single line. Everything else follows from the declaration, and nothing is generated:

- **The types.** `shared/types/env.d.ts` in the web app and `types/env.d.ts` in Functions make `ProcessEnv` extend the app's interface, so `process.env.BASE_URL` is a `string`. That is true rather than hoped for, because the start-up check below has already passed. A variable that may be absent (RealtimeKit) is `?:` in the interface and reads as `string | undefined`.
- **The check.** `validateEnvironmentVariables` from `@esposter/shared`, which knows no variable of its own, parses `process.env` against the app's schema and throws one error naming every variable that is missing or malformed, never quoting a value. The web app runs it from the first Nitro plugin (`server/plugins/environment.ts`, skipped while prerendering, where the deployment's environment is not set). Functions runs it on the first invocation of each isolate (`validateFunctionsEnvironment`), before any handler, and returns what it checked, so a Worker with a gap throws at its first invocation instead of mid-handler and nothing re-reads the environment per message.
- **The example file.** Each app's `.env.example` is written by hand, and a test holds its names to the schema's, so the two cannot drift.
- **The tests.** The web suite runs against `MOCK_ENVIRONMENT_VARIABLES`, which the shared setup stubs before each test. It is typed `satisfies WebEnvironmentVariables`, so a variable added to the interface fails there until it has a value, and a test holds it to the schema's own checks. RealtimeKit is left out of it, which is a deployment without RealtimeKit; a test that needs a variable different or absent stubs it itself.

The names are the deployment's own and no framework prefix is read: a variable has the same name in a developer's `.env` and in the Worker it is deployed to.

**Secrets and vars.** A key marked `.meta({ secret: true })` in its schema is a Worker secret: `.github/worker-secrets.json` lists each Worker's secret names under its key, and a test in each model holds that list to the marked keys. Every other key is a wrangler var that `configuration/wrangler.ts` writes into each environment's block (the web Worker) or `wrangler.jsonc` holds (the functions Worker). A secret is never in wrangler configuration. The deploy job uploads each Worker's secrets after that Worker deploys, with `wrangler secret bulk` from the composite action `.github/actions/put-worker-secrets`, each value read from Pulumi ESC under `pulumiConfig.esposter-infra:<environment>_<NAME>`, so the dev and prod deployments hold separate values under one ESC environment. Two values the web build bakes into its runtime config (`FACEBOOK_CLIENT_ID`, `VAPID_PUBLIC_KEY`) are also read into the build from ESC before it runs; the list is `build` in the same file.

Rejected: declaring the variables the two apps share in `@esposter/shared`. It saved one line and made a variable leaving one app an edit to a package the other builds from, with a rebuild and a size record behind it. Rejected: a deploy-time check that runs the schema over the web host's settings in the release pipeline. The host's configuration is not in the repository, the start-up check already stops a server that is missing a variable, and the check would be a second thing to keep in step with where the app is deployed; revisit it only if a deployment with a gap actually reaches users.

## What not to do

Do not read `process.env.*` in code that executes in the browser — values are `undefined` at runtime and will silently evaluate to `false` for any comparison. The folder location (`shared/`) is not the deciding factor; what matters is whether the code ever runs client-side.

Do not reach for `runtimeConfig` to escape that. `configuration/runtimeConfig.ts` holds only `public`, which is serialised into the client payload and readable by anyone who opens the page. A key belongs there only once it is safe to publish — an endpoint or a base url — so classify the value before placing it, and a secret that needs a client-side effect is fronted by a server route rather than moved.
