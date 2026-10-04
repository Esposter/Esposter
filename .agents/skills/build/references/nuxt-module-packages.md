# Nuxt Module Packages

Read when creating or editing a workspace package that is a Nuxt module, or registering one in the app. The mechanism and every reason is `apps/web/content/docs/architecture/nuxt-module-packages.md`; this page is the checklist an edit is held to. `packages/trpc-nuxt-module` is the package built this way — copy its shape.

- **`src/module.ts` is the `.` entry**, a default `defineNuxtModule` export plus `ModuleOptions`; `exportsGeneration: "none"`, since a barrel over `src` would pull the runtime into the configuration-time entry.
- **`src/runtime/**` builds unbundled** — `entry: [{ index: "src/module.ts" }, "src/runtime/**/*.ts", …]`, `unbundle: true`, `root: "src"` — and `exports.exclude` keeps `runtime/**/services/**` out of the public map. Never a hand-written runtime barrel.
- **A type dependency the declarations reference is a `dependency`**: unbundled declarations cannot inline it, and the copy tsdown writes under `dist/node_modules` never publishes.
- **The runtime imports published packages** (`nuxt/app`, `nitro/h3`, `vue`, `crossws`), never `#imports`, `#app`, bare `h3` or `nitropack/*`; frameworks and engines are peers, `@nuxt/kit` and `@nuxt/schema` dependencies.
- **The app registers it by the path to its source** — `../../packages/<package>/src/module.ts` in `apps/web/configuration/modules.ts`, in the Vitest branch too when a test needs its runtime — never by package name, which fails `nuxt prepare` on a fresh clone. The module itself names its runtime by package subpath.
- **Hook names are `MODULE_NAME`-prefixed constants in `src/runtime/constants.ts`**, typed with their template literal, declared on `NitroRuntimeHooks` by a type template in the `nitro` and `nuxt` contexts.
- **Composable suites run in a `test/fixture` Nuxt app** through `defineVitestProject`, with the default environment set back to `node`; server runtime runs against a real h3 app and node server.
