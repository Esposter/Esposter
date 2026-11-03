nuxt 5: the dev stylesheet plugin imports `nitropack/runtime`, so the Nuxt 5 nightly logs NUXT_B9003

## Summary

On the Nuxt 5 nightly, `nuxt dev` logs `NUXT_B9003` for `@vizejs/nuxt`. The module's dev server plugin imports `nitropack/runtime`. The module still loads and compiles pages. Nuxt 4.6.4 logs no warning for the same files. This is a request for Nuxt 5 compatibility. It is not a crash.

## Area

Nuxt integration

## Version

`@vizejs/nuxt` 0.662.0 (`vize` 0.662.0).

## Environment

- OS: macOS 27.0.1, arm64
- Node.js: 26.13.0
- Package manager: pnpm 12.16.1
- Framework: `nuxt-nightly` 5.0.0-2611030021-146df55 (Nitro 3.0.261029-rc, Vite 8.3.5). Control: `nuxt` 4.6.4 (Nitro 2.13.6, Vite 8.3.5).
- vue: 3.5.44
- vize: 0.662.0, `@vizejs/nuxt` 0.662.0
- Rust: not used. The reproduction runs the published npm binary `@vizejs/native-darwin-arm64` 0.662.0.

## Minimal reproduction

The project has five files. Run `pnpm i`, then `pnpm dev`. Open the printed URL.

`package.json`

```json
{
  "private": true,
  "type": "module",
  "scripts": { "dev": "nuxt dev", "build": "nuxt build" },
  "dependencies": { "@vizejs/nuxt": "0.662.0", "nuxt": "npm:nuxt-nightly@5.0.0-2611030021-146df55", "vue": "3.5.44" }
}
```

`pnpm-workspace.yaml`

```yaml
packages: []
minimumReleaseAge: 0
```

pnpm 12 holds back a package published in the last 24 hours. `minimumReleaseAge: 0` lets the install use the releases of 2026-11-03.

`nuxt.config.ts`

```ts
export default defineNuxtConfig({ compatibilityDate: "2026-11-03", modules: ["@vizejs/nuxt"] });
```

`app/app.vue`

```vue
<template>
  <NuxtPage />
</template>
```

`app/pages/index.vue`

```vue
<template>
  <div>
    <p>hello</p>
  </div>
</template>
```

Control: change `nuxt` in `package.json` to `4.6.4`, and add `allowBuilds` with `esbuild: true` to `pnpm-workspace.yaml`. pnpm 12 stops the Nuxt 4 install at the esbuild build script without it. The other files stay the same. Run `pnpm dev --port 3102 --host localhost`. On Nuxt 4.6.4, `pnpm dev --port 3102` without `--host` stopped in `@nuxt/cli` 4.0.1 with `options.hostname.toLowerCase is not a function`, before the server started. The module is not in that stack.

## Actual

With the Nuxt 5 nightly, `pnpm dev` logs this warning:

```text
 WARN  [NUXT_B9003] Nitro v2 compatibility was applied to server code from 1 module, because of what it imports:
  - @vizejs/nuxt (imports nitropack/runtime)
╰▶ fix: This layer is transitional and will be removed in Nuxt 6. Update the module to import from nuxt/server, registering the portable file alongside the one it ships today, or report it to the module author if the module is not your own.
```

`pnpm peers check` lists this unmet peer:

```text
✕ unmet peer nuxt
  Installed: 5.0.0-2611030021-146df55
  Wanted:
    "^2.16.0 || ^3.0.0 || ^4.0.0":
      @vizejs/nuxt@0.662.0
```

The module otherwise works on the Nuxt 5 nightly. The dev log reports `0 failed` for the two page files, the page returns HTTP 200, and the page mounts with no console error. `nuxt build` on a larger test project with the same module logged no `NUXT_B9003`.

## Expected

No warning and no peer issue, as on Nuxt 4.6.4 with the same module and the same page. On Nuxt 4.6.4, `pnpm peers check` reports no issue, and `pnpm dev` logs no `NUXT_B9003`.

## Cause

The warning names the import. The import is on line 1 of `node_modules/@vizejs/nuxt/dist/runtime/server/dev-stylesheet-links.mjs`:

```js
import { defineNitroPlugin } from "nitropack/runtime";
```

The source of this file at tag `v0.662.0` is `npm/framework/nuxt/src/runtime/server/dev-stylesheet-links.ts`, line 1 (see "Real occurrence").

`dist/index.mjs` adds the file as a Nitro server plugin in dev only, on lines 1504 and 1505. The source is `npm/framework/nuxt/src/index.ts`, lines 317 and 325, under `nuxt.options.dev && devOptions.stylesheetLinks`.

Nuxt 5 maps `nitropack/runtime` through its Nitro v2 compatibility barrel (`@nuxt/nitro-server-nightly/dist/index.mjs`, line 2058). The barrel exports `defineNitroPlugin` as `definePlugin` from `nitro` (`dist/runtime/compat/nitro-v2.mjs`, line 8). Nuxt logs `NUXT_B9003` when it applies the barrel (`dist/index.mjs`, line 2459).

The cause is confirmed by a run. Line 1 of the module's dist file was replaced by `import { definePlugin as defineNitroPlugin } from "nitro";`. The warning was gone, the page returned HTTP 200, and the two stylesheet links in the server HTML were the same as before. The one-sentence change is to import `definePlugin` from `nitro` as `defineNitroPlugin`.

The warning's suggested path does not supply the plugin helper. The `nuxt/server` surface on this nightly (`node_modules/nuxt/dist/server/`) contains no plugin helper.

Kit: `@vizejs/nuxt` depends on `@nuxt/kit` 3.21.8. On the Nuxt 5 project, `pnpm why @nuxt/kit` lists 3.21.8 from `@vizejs/nuxt` and 4.6.3 from `@dxup/nuxt`, which `nuxt-nightly` depends on. The warning names only `nitropack/runtime`, so the second kit is not the cause the warning shows.

## Real occurrence

https://github.com/ubugeeei-prod/vize/blob/85fc954a6ca3d983c30c8a272483916a1c867543/npm/framework/nuxt/src/runtime/server/dev-stylesheet-links.ts#L1

## Isolation

One change at a time from the reproduction.

| Change from the reproduction                                                    | Result                    |
| ------------------------------------------------------------------------------- | ------------------------- |
| None: Nuxt 5 nightly, module on                                                 | `NUXT_B9003` logged       |
| Module removed (`modules: []`), Nuxt 5 nightly                                  | no warning                |
| `nuxt` 4.6.4, module on, same page                                              | no warning, no peer issue |
| Line 1 of the module's dist file replaced by the `nitro` import, Nuxt 5 nightly | no warning                |

## Not known

- Whether `nitro` must be a declared dependency of `@vizejs/nuxt` for that import to resolve outside the test project. The test project does not declare `nitro`, and the dev server ran.
- Whether the Nuxt team intends `definePlugin` from `nitro` as the portable form. The warning says the compatibility layer will be removed in Nuxt 6.
- Whether the second `@nuxt/kit` version has any runtime effect. Not checked.

## Not a duplicate of

- #7015 (closed 2026-09-28), a crash on Nuxt 2 at setup with `Nuxt instance is unavailable!` despite the `^2.16.0` peer range. It is a crash on Nuxt 2, not a warning on Nuxt 5.
- #10946 (closed 2026-10-28), the runtime Kit upgrade to 3.21.8 for advisories. It keeps the "existing v3 compatibility line" for Nuxt 2, Bridge, 3 and 4 hosts. It does not mention Nuxt 5 or `nitropack/runtime`.
- #11455 (closed 2026-11-03), `onPrehydrate` answers `NUXT_E1006` with the module on Nuxt 4.6.4 and on the Nuxt 5 nightly. It is a runtime failure in a component, not a warning about the module's import.
- #8631 (closed 2026-10-16, fixed in v0.457.0 by #8602), the dev SSR style flash. It is about dev SSR CSS, the area this plugin works in, and it does not name the import.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
