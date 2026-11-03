nuxt 5: the dev stylesheet plugin imports `nitropack/runtime`, so the Nuxt 5 nightly logs NUXT_B9003, and the peer range stops at Nuxt 4

## Summary

On the Nuxt 5 nightly, `nuxt dev` logs `NUXT_B9003` for `@vizejs/nuxt`, because the module's dev server plugin imports `nitropack/runtime`. The peer range of the module is Nuxt 2 through 4, so the package manager reports the nightly as an unmet peer. The module loads and compiles pages on the nightly. This is a request for Nuxt 5 compatibility. It is not a crash.

## Context

I am moving the Vue tooling of a Nuxt monorepo to vize, in three steps:

1. Type check: `vue-tsc` becomes `tsrs` running the vize content mapper.
2. Library builds: `unplugin-vue` and `@vitejs/plugin-vue` become the vize rolldown and Vite plugins.
3. App build: Nuxt's Vue integration becomes `@vizejs/nuxt`.

This issue is from step 3.

**Thank you for the earlier fixes (#11455, #11592, #11593 and #11594).**

This issue is one of 3 filed together from this attempt:

- nuxt: a production build on the Nuxt 5 nightly writes bare `"vue"` imports into the client, so the page never hydrates
- nuxt 5: the dev stylesheet plugin imports `nitropack/runtime`, so the Nuxt 5 nightly logs NUXT_B9003, and the peer range stops at Nuxt 4 <-- you are here
- compiler: `defineProps<T>()` gets no `props` option when `T` is imported through a tsconfig `paths` alias or through `@/` outside a `src` folder

## Area

Nuxt integration

## Version

`@vizejs/nuxt` 0.676.0 (`vize` 0.676.0).

## Environment

- OS: Linux
- Architecture: x86_64
- Node.js: 26.13.0
- Package manager: pnpm@12.16.1
- Framework: `nuxt-nightly` 5.0.0-2611031025-9496b7e (Nitro 3.0.261029-rc, Vite 8.3.5). Control: `nuxt` 4.6.3 (Nitro 2.13.6, Vite 8.3.5).
- vue: 3.5.44
- Rust: not used. The reproduction runs the published npm binary `@vizejs/native-linux-x64-gnu` 0.676.0.
- Source of truth: the same project on `nuxt` 4.6.3, and the same project without `@vizejs/nuxt`.

## Minimal reproduction

The project has three files. Run `pnpm i`, then `pnpm dev`. Open the printed URL.

`package.json`

```json
{
  "private": true,
  "type": "module",
  "scripts": { "dev": "nuxt dev" },
  "dependencies": { "@vizejs/nuxt": "0.676.0", "nuxt": "npm:nuxt-nightly@5.0.0-2611031025-9496b7e", "vue": "3.5.44" }
}
```

`nuxt.config.ts`

```ts
export default defineNuxtConfig({ compatibilityDate: "2026-11-01", modules: ["@vizejs/nuxt"] });
```

`app.vue`, inside the `app` folder

```vue
<script setup lang="ts">
const count = ref(0);
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>
```

Then run the peer check:

```bash
pnpm peers check
```

Control: change `nuxt` in `package.json` to `4.6.3`. The other files stay the same.

## Actual

`pnpm dev` logs this warning:

```text
 WARN  [NUXT_B9003] Nitro v2 compatibility was applied to server code from 1 module, because of what it imports:
  - @vizejs/nuxt (imports nitropack/runtime)
╰▶ fix: This layer is transitional and will be removed in Nuxt 6. Update the module to import from nuxt/server, registering the portable file alongside the one it ships today, or report it to the module author if the module is not your own.
```

`pnpm peers check` lists this unmet peer for the module:

```text
✕ unmet peer nuxt
  Installed: 5.0.0-2611031025-9496b7e
  Wanted:
    "^2.16.0 || ^3.0.0 || ^4.0.0":
      @vizejs/nuxt@0.676.0
```

The module otherwise works on the nightly in development. The page returns HTTP 200 and the dev log reports `0 failed` for the Vue files.

## Expected

No warning and no peer issue, as on `nuxt` 4.6.3 with the same module and the same files. On `nuxt` 4.6.3, `pnpm peers check` reports `No peer dependency issues found`, and `pnpm dev` logs no `NUXT_B9003`.

## Cause

The warning names the import. The import is on line 1 of `dist/runtime/server/dev-stylesheet-links.mjs` in the published package:

```js
import { defineNitroPlugin } from "nitropack/runtime";
```

The source is `npm/framework/nuxt/src/runtime/server/dev-stylesheet-links.ts`, line 1, at tag `v0.676.0`. The module adds the file as a Nitro server plugin in development only, in `npm/framework/nuxt/src/index.ts`, line 325, under `nuxt.options.dev && devOptions.stylesheetLinks` (line 317).

The cause of the warning is confirmed by a run. Line 1 of the file in a private copy of the published package was replaced by:

```js
import { definePlugin as defineNitroPlugin } from "nitro";
```

With this copy, `nuxt dev` on the nightly logs no `NUXT_B9003` and the page returns HTTP 200. The one-sentence change is to import `definePlugin` from `nitro` as `defineNitroPlugin`.

The peer range of `@vizejs/nuxt` is `^2.16.0 || ^3.0.0 || ^4.0.0`. The range excludes every `5.0.0` version, so the package manager reports the nightly as an unmet peer. The range is the cause of the peer report.

The module also depends on `@nuxt/kit` 3.21.8. On the nightly, `pnpm why @nuxt/kit` lists 3.21.8 from `@vizejs/nuxt` and 4.6.4 from the dependencies of `nuxt-nightly`. The warning names only `nitropack/runtime`, so the second kit is not the cause of the warning.

## Real occurrence

https://github.com/esposter/esposter/blob/02613a3bb662fc51e1a7d655f49d2c301402bb76/pnpm-workspace.yaml#L198

## Isolation

One change at a time from the reproduction.

| Change from the reproduction                                        | `NUXT_B9003` logged | Peer issue for the module |
| ------------------------------------------------------------------- | ------------------- | ------------------------- |
| None: Nuxt 5 nightly, module on                                     | yes                 | yes                       |
| Module removed (`modules: []`), Nuxt 5 nightly                      | no                  | not applicable            |
| `nuxt` 4.6.3, module on                                             | no                  | no                        |
| Line 1 of the module's file replaced by the `nitro` import, nightly | no                  | yes                       |

## Not known

- Whether `nitro` must be a declared dependency of `@vizejs/nuxt` for that import to resolve outside the reproduction. The reproduction does not declare `nitro`, and the dev server ran.
- Whether the Nuxt team intends `definePlugin` from `nitro` as the portable form. The warning names `nuxt/server`, and I did not check it for a plugin helper.
- Whether the second `@nuxt/kit` version has any runtime effect. Not checked.
- Whether a production build logs the warning. `nuxt build` in the reproduction did not log it, and I did not read the cause.

## Not a duplicate of

- #11455 (closed), `onPrehydrate` fails with `NUXT_E1006`. It is a failure in a component on Nuxt 4 and Nuxt 5, not a warning about the import of the module.
- #10946 (closed), the runtime Kit upgrade to 3.21.8. It keeps the Kit 3 line for hosts on Nuxt 2, Bridge, 3 and 4. It does not mention Nuxt 5 or `nitropack/runtime`.
- #7015 (closed), a crash on Nuxt 2 at setup with `Nuxt instance is unavailable!`. It is a crash on Nuxt 2, not a warning on Nuxt 5.
- #8631 (closed), the dev SSR style flash. It is about the stylesheet output of this plugin, and it does not name the import.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
