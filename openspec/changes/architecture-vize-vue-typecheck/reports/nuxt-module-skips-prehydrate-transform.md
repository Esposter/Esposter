# nuxt: `onPrehydrate` fails with NUXT_E1006 because the bridge patches the handler of Nuxt's prehydrate transform and not its hook filter

I am replacing the Vue tooling of a Nuxt monorepo with vize, one tool at a time. `vue-tsc` becomes `tsrs` running the vize content mapper. `unplugin-vue` and `@vitejs/plugin-vue` become the vize rolldown and Vite plugins. Nuxt's Vue integration becomes `@vizejs/nuxt`. This issue comes from the second step, the compile of the app, and is one of a few I ran into. The type check of the first step is in separate issues.

This is one of a batch of 14 issues filed together, all from that attempt, so they can be tracked as one set:

<batch list filled in when filed>

With `@vizejs/nuxt` registered, a component that calls `onPrehydrate`, or that renders Nuxt's own `<NuxtTime>`, answers HTTP 500 with `NUXT_E1006`. The same page answers 200 without the module. This happens in `nuxt dev` on Nuxt 4.6.4, which the module supports, and on a Nuxt 5 nightly. It also happens in a production build of the nightly. Nuxt 3.21.11 is not affected.

## Environment

`@vizejs/nuxt` 0.652.0, `nuxt` 4.6.4, `vue` 3.5.44, `vite` 8.3.5, `nitropack` 2.13.6, macOS on Apple silicon. The module also fails on `nuxt-nightly` 5.0.0-2611022104-802b944 (Nitro 3), and it does not fail on `nuxt` 3.21.11. Source of truth: the same project with `modules: []`.

## Reproduction

`package.json`:

```json
{ "private": true, "type": "module", "dependencies": { "@vizejs/nuxt": "0.652.0", "nuxt": "4.6.4" } }
```

`nuxt.config.ts`:

```ts
export default defineNuxtConfig({ modules: ["@vizejs/nuxt"] });
```

`app/app.vue`:

```vue
<script setup lang="ts">
onPrehydrate(() => {});
</script>

<template>
  <div>Foo</div>
</template>
```

```sh
npm i
npx nuxt dev --port 3110
curl -i http://localhost:3110/
```

Run the same steps with `modules: []` for the source of truth. A page with `<template><NuxtTime datetime="2026-01-01T00:00:00Z" /></template>` and no script gives the same two results.

## Actual

The response is HTTP 500 with this message, and the server log has `NUXT_E1006 (500)`:

```
To transform a callback into a string, `onPrehydrate` must be processed by the Nuxt build pipeline.
```

A probe plugin with `enforce: "post"` shows the module that reaches it. The id is `app.vue?vue&vize`, and the call is untouched:

```
onPrehydrate(() => {});
```

## Expected

HTTP 200, as without the module. With `modules: []` the page answers 200, and the `NuxtTime` page writes `<time ... data-prehydrate-id=...>`. The transform of Nuxt replaces the callback with a string:

```
onPrehydrate("(()=>{})");
```

## Cause

The cause is confirmed by a run. Nuxt's transform `nuxt:prehydrate-transform` is an object hook with a `filter`. The host reads the filter and calls the handler only when the id matches. The id of a module that vize compiles is `app.vue?vue&vize`, and it matches none of the patterns, so the handler never runs. The bridge of the module changes the id that the handler receives. It does not change the filter, which the host checks first.

Nuxt 4.6.4 declares the transform in its published package, in `dist/index.mjs`:

```js
		name: "nuxt:prehydrate-transform",
		transform: {
			filter: {
				id: {
					include: [...VUE_SCRIPT_ID_FILTER, JS_ID_RE],
					exclude: VUE_NON_SCRIPT_BLOCK_RE
				},
				code: { include: /onPrehydrate\(/ }
			},
```

The id patterns in the same file:

```js
const VUE_FILE_RE = /\.vue$/;
const MACRO_QUERY_RE$1 = /[?&]macro=/;
const VUE_SCRIPT_BLOCK_RE = /[?&]vue&type=script\b/;
```

The module lists the transform among the ones it adapts (`npm/framework/nuxt/src/vue-transform-bridge.ts:26`, at the tag `v0.652.0` of `ubugeeei-prod/vize`):

```ts
  "nuxt:prehydrate-transform",
```

For an object hook it wraps `handler` only (`npm/framework/nuxt/src/vue-transform-bridge.ts:64` and `:68`):

```ts
  const transform = plugin.transform as ViteTransformObject | undefined;
  ...
  transform.handler = function (this: unknown, code: string, id: string, ...args: unknown[]) {
```

The fix is to widen `filter.id` of the object hook to accept the vize module id, or to remove the filter, in the same function that wraps the handler. A copy of the built module with `if (plugin.name === "nuxt:prehydrate-transform") delete transform.filter;` before the handler wrap answers 200, and the call becomes `onPrehydrate("(()=>{})")`. The `<NuxtTime>` page also answers 200 with that copy, and it writes the same `<time ... data-prehydrate-id=...>` as the source of truth. The rewritten id `app.vue?vue&vize&type=script` that the wrapper builds does not match `VUE_SCRIPT_BLOCK_RE` either, because `vue&type=script` is not adjacent there. That has no effect today, because the handler reads no id gate.

## Real occurrence

https://github.com/Esposter/Esposter/blob/6f6212cd7bfccb9acc3bc13c6a64c0429f2e8322/apps/web/app/components/Post/Byline.vue#L22

## Isolation

One change at a time. The column shows the response for the page that the row names.

| Change                                                                                         | Response                                                   |
| :--------------------------------------------------------------------------------------------- | :--------------------------------------------------------- |
| `nuxt` 4.6.4, `modules: ["@vizejs/nuxt"]`, `onPrehydrate` page                                 | 500                                                        |
| the same, `modules: []`                                                                        | 200                                                        |
| the same page with `<NuxtTime>` in place of the call                                           | 500                                                        |
| `nuxt-nightly` 5.0.0-2611022104-802b944, `nuxt dev`                                            | 500                                                        |
| the same, a production build and `node .output/server/index.mjs`                               | 500                                                        |
| the same, `modules: []`, in each of the two modes                                              | 200                                                        |
| `nuxt` 3.21.11, `<NuxtTime>` page, module on                                                   | 200                                                        |
| module option `{ handleNodeModulesVue: false }` on the Nuxt 5 nightly                          | 500                                                        |
| scratch copy with the filter removed for `nuxt:prehydrate-transform` only, `onPrehydrate` page | 200                                                        |
| the same copy, `<NuxtTime>` page                                                               | 200                                                        |
| scratch copy with the filter removed for every adapted transform                               | 500, `TypeError: undefined is not a function` at `useHead` |

The trigger is the module, a Nuxt of 4 or later, and any call of `onPrehydrate` in a component that vize compiles.

## Not known

The other transforms in the same list (`nuxt:components-loader`, `nuxt:lazy-hydration-macro`, `nuxt:imports-transform` and others) have object hooks too. Whether their filters reject the vize id was not checked. Removing the filter of every adapted transform gives a different error. The change has to be made for each transform. The module declares the peer range `nuxt ^2.16.0 || ^3.0.0 || ^4.0.0`, and a Nuxt 5 nightly installs only with `--legacy-peer-deps`. On that nightly Nuxt also prints `NUXT_B9003`: the module imports `nitropack/runtime`, and Nuxt applies a Nitro 2 compatibility layer to it. This report does not ask for Nuxt 5 support.

## Not a duplicate of

Searched open and closed issues and pull requests for `NuxtTime`, `onPrehydrate`, `NUXT_E1006`, `Nuxt 5` and `nitropack runtime`. The search matches words, not meaning. No result names `onPrehydrate` or `NuxtTime`.

- #7003 (closed): the module ignored `vue.compilerOptions` from the Nuxt config. A different option path.
- #10349 (closed): the module setup resolved a package from the working directory. A different failure.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
