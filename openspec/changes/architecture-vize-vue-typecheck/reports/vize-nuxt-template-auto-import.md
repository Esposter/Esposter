# `_ctx.unref is not a function` in a template call to an auto-import under `@vizejs/nuxt`

## Summary

With `@vizejs/nuxt` registered, a template call to Nuxt's auto-imported `unref` answers HTTP 500 with `_ctx.unref is not a function`. The same page answers 200 when the module is removed from `modules`. The bridge rewrites the module id so that Nuxt's auto-import transform skips the module.

## Context

I am moving a Nuxt app's Vue compilation to `@vizejs/nuxt` in place of Nuxt's default Vue plugin, in one step of the migration. This issue is from that step. This issue is one of 2 filed together from this attempt:

- (number after filing) a server-rendered `<Title>` with two children (`NUXT_E6002`)
- (number after filing) `_ctx.unref is not a function` in a template call to an auto-import <-- you are here

## Environment

- `@vizejs/nuxt` 0.662.0, which pins `vize` 0.662.0. On the day of the run, 0.664.0 was the newest release on npm. 0.664.0 shows the same result (see Isolation).
- `nuxt` 4.6.4 (`@nuxt/cli` 4.0.1, Nitro 2.13.6, Vite 8.3.5), `vue` 3.5.44
- Node v26.13.0, pnpm 12.16.1, macOS (Darwin 27.0.0) on Apple silicon
- Nuxt 5: `nuxt-nightly` 5.0.0-2611030021-146df55 (Nitro 3.0.261029-rc). `pnpm peers check` reports an unmet peer `@nuxt/schema`, which wants `^3.0.0 || ^4.0.0`. The install runs with `--config.strict-peer-dependencies=false`.
- Source of truth: the same project with `WITHOUT_VIZE=1`, which removes the module from `modules`.

## Reproduction

`package.json`:

```json
{
  "private": true,
  "type": "module",
  "scripts": { "dev": "nuxt dev --host 127.0.0.1" },
  "dependencies": { "@vizejs/nuxt": "0.662.0", "nuxt": "4.6.4", "vue": "3.5.44" }
}
```

`pnpm-workspace.yaml`:

```yaml
packages: []
allowBuilds:
  esbuild: true
minimumReleaseAge: 0
```

`nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  compatibilityDate: "2026-11-03",
  modules: process.env.WITHOUT_VIZE === "1" ? [] : ["@vizejs/nuxt"],
});
```

`app/services/bar.ts`:

```ts
export const bar = { baz: [["Foo"], ["Bar"]] };
```

`app/components/Foo/Index.vue`:

```vue
<script setup lang="ts">
import { bar } from "~/services/bar";
</script>

<template>
  <template v-for="(row, rowIndex) of unref(bar.baz)" :key="rowIndex">
    <span v-for="(text, columnIndex) of row" :key="columnIndex">{{ text }}</span>
  </template>
</template>
```

`app/pages/index.vue`:

```vue
<template>
  <Foo />
</template>
```

Commands:

```sh
pnpm i
pnpm dev --port 3101                   # module on: GET / answers 500
WITHOUT_VIZE=1 pnpm dev --port 3101    # control: GET / answers 200
curl -i http://127.0.0.1:3101/
```

The script passes `--host 127.0.0.1` because `nuxt dev` on Nuxt 4.6.4 stops without a host flag. It prints `Invalid host` followed by `options.hostname.toLowerCase is not a function`. This happens without the module too, and it is not a vize symptom.

The workspace file sets `minimumReleaseAge: 0` because pnpm 12 refuses packages published less than one day before the install.

## Actual

Module on, `GET /`:

```
[request error] [GET] /
  ✖ TypeError (500): _ctx.unref is not a function
    <nuxt-root> › ... › <Index>
    at ssrRender app/components/Foo/Index.vue:12:48
```

The position `12:48` is in generated code. The file has nine lines.

## Expected

Control (`WITHOUT_VIZE=1`), `GET /`: HTTP 200, body contains `<span>Foo</span><span>Bar</span>`.

## Cause

The cause is confirmed by a run. Two facts were checked.

1. The bridge rewrites the module id. At the tag `v0.662.0` (commit `85fc954a6ca3d983c30c8a272483916a1c867543`), `npm/framework/nuxt/src/vue-transform-bridge.ts` lines 33-39 build the id:

   ```ts
   const suffix = `${hasQuery ? "&" : "?"}${hasVueMarker ? "" : "vue&"}type=script`;
   return id + suffix;
   ```

   For `Index.vue?vue&vize` the result is `Index.vue?vue&vize&type=script`. Lines 90-94 pass this id to the plugin's function-form `transform`.

2. Nuxt's `nuxt:imports-transform` rejects that id. Nuxt 4.6.4 `dist/index.mjs` line 271 defines `VUE_SCRIPT_BLOCK_RE = /[?&]vue&type=script\b/`, which needs `vue&type=script` adjacent. Line 305 defines `isVue`. Line 6218 defines the transform, and its `transformInclude` at line 6220 returns `isVue(id, { type: ["script", "template"] })` or `isJS(id)`. Both fail for the rewritten id. A copy of the `isVue` patterns checks the two forms: `Index.vue?vue&vize&type=script` gives false, and `Index.vue?vue&type=script` gives true.

The transform sees the code and returns `null`. The served module shows the result.

Control, `_renderList(("unref" in _ctx ? _ctx.unref : __unimport_unref_(__unimport_unref))($setup.optionGrid.grid), ...` with `import { unref as __unimport_unref, unref as __unimport_unref_ } from vue`.

Module, `_renderList(_ctx.unref($setup.optionGrid.grid), ...` with no `unref` import.

The fix was tested in a scratch copy with `pnpm patch`. The copy adds one line after line 896: `if (hasVueMarker) return id.replace(/([?&])vue&/, "$1vue&type=script&");`. With that line, `GET /` answers 200 with `Foo` and `Bar`, and every route in Isolation that renders answers 200.

The one-sentence change is to build the id so that `vue&type=script` stays adjacent, for example `Index.vue?vue&type=script&vize`.

The responsible part is the bridge's id rewrite. Nuxt's transform is correct for the ids it accepts.

## Real occurrence

https://github.com/Esposter/Esposter/blob/8ca000b744d2f15d96ad4979f62ec797b6726ec9/apps/web/app/components/Dungeons/Title/Menu/Content/Index.vue#L7

## Isolation

Nuxt 4.6.4, `@vizejs/nuxt` 0.662.0, dev. Each row is one template position. The status is the SSR response, with the control in the last column.

| Template position                                               | Module on                                                         | Control                          |
| :-------------------------------------------------------------- | :---------------------------------------------------------------- | :------------------------------- |
| interpolation `{{ unref("Foo") }}`                              | 500                                                               | 200                              |
| `v-for` over `unref(localRows)`                                 | 500                                                               | 200                              |
| `v-for` over `unref(bar.baz)` in a component (the reproduction) | 500                                                               | 200                              |
| prop `:text="unref('Foo')"`                                     | 500                                                               | 200                              |
| event `@click="unref('Foo')"`                                   | 200 SSR; after a click, `pageerror: _ctx.unref is not a function` | 200 SSR; after a click, no error |
| `computed` in `<script setup>`, no template call                | 200                                                               | 200                              |

The other results:

- Nuxt 4.6.4 production (`nuxt build`, then `node .output/server/index.mjs`): the module build answers 500 on the four failing routes, and its log has `_ctx.unref is not a function`. The control answers 200.
- Nuxt 5 nightly, dev: 500 on the same four routes. The control answers 200.
- Nuxt 5 nightly, production: 500 with the body `500 - Internal Server Error`, and the log has `_ctx.unref is not a function`. The control answers 200.
- `@vizejs/nuxt` 0.664.0 with Nuxt 4.6.4, dev: the same four 500 responses, and the click error.
- `@vizejs/vite-plugin` 0.662.0 in a plain Vite and Vue SSR project: not applicable. The bug needs Nuxt's auto-import transform. A template call to an explicit `import { unref } from "vue"` renders `unref=Foo` with both plugins.

## Not known

- The fix is not applied in the Vize repository. It was tested only in a scratch copy of the built package, and the Rust source was not built.
- The served module for the patched run was not captured, so the patched guard form is not shown.
- The client-side render after hydration was checked only for the event route.

## Not a duplicate of

- #11455 (closed, fixed by #11467): `onPrehydrate` answers NUXT_E1006. Same bridge, but its gate is an object hook `filter`, which #11467 widens. This bug is the function-form `transformInclude` gate of `nuxt:imports-transform`, and the bridge's function branch (lines 90-94 at the tag) is not widened.
- #10066 (closed): `$route` in templates, with the same `isVue` gate on `nuxt:route-injection-plugin`. That transform is an object hook, so the widening covers it. The issue names `nuxt:imports-transform` as probably affected and does not verify it. This report verifies it.
- #1003 (closed): the CLI does not unref injected props. Different area.
- No open or closed issue matched `_ctx.unref` in a search of `repo:ubugeeei-prod/vize`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
