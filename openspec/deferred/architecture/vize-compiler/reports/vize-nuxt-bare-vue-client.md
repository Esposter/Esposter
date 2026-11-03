nuxt: a production build on the Nuxt 5 nightly writes bare `"vue"` imports into the client, so the page never hydrates

## Summary

With `@vizejs/nuxt` on the Nuxt 5 nightly, `nuxt build` writes client chunks that import Vue as `from"vue"`. A browser cannot resolve this specifier, so the app never starts. Nuxt 4.6.3 with the same module, and the Nuxt 5 nightly without the module, write no bare `vue` import.

## Context

I am moving the Vue tooling of a Nuxt monorepo to vize, in three steps:

1. Type check: `vue-tsc` becomes `tsrs` running the vize content mapper.
2. Library builds: `unplugin-vue` and `@vitejs/plugin-vue` become the vize rolldown and Vite plugins.
3. App build: Nuxt's Vue integration becomes `@vizejs/nuxt`.

This issue is from step 3.

**Thank you for the earlier fixes (#11455, #11592, #11593 and #11594).**

This issue is one of 3 filed together from this attempt:

- nuxt: a production build on the Nuxt 5 nightly writes bare `"vue"` imports into the client, so the page never hydrates <-- you are here
- nuxt 5: the dev stylesheet plugin imports `nitropack/runtime`, so the Nuxt 5 nightly logs NUXT_B9003, and the peer range stops at Nuxt 4
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
- Framework: `nuxt-nightly` 5.0.0-2611031025-9496b7e (Nitro 3.0.261029-rc, Vite 8.3.5). Control: `nuxt` 4.6.3.
- vue: 3.5.44
- Rust: not used. The reproduction runs the published npm binary `@vizejs/native-linux-x64-gnu` 0.676.0.
- Source of truth: the same project without `@vizejs/nuxt`, and the same project on `nuxt` 4.6.3.

## Minimal reproduction

The project has three files. Run `pnpm i` and `pnpm build`.

`package.json`

```json
{
  "private": true,
  "type": "module",
  "scripts": { "build": "nuxt build" },
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

Find the bare imports in the client chunks:

```bash
grep -lE '(from|import) ?"vue"' .output/public/_nuxt/*.js
```

Then run the server and click the button:

```bash
PORT=3000 node .output/server/index.mjs
```

Open `http://localhost:3000/` in a browser and click the button.

## Actual

Two of the three client chunks contain `from"vue"`. The server returns HTTP 200 and the server HTML shows `<button>0</button>`. The browser logs this error on load and the button stays at `0` after a click:

```text
Failed to resolve module specifier "vue". Relative references must start with either "/", "./", or "../".
```

## Expected

No bare `vue` import in any client chunk, as with the source of truth. The button shows `1` after one click. On the control, `nuxt` 4.6.3 with the same files writes no bare import, and the button shows `1` after one click.

## Cause

The cause is in `externalizeVueRuntimeForNuxtSsr` in `npm/framework/nuxt/src/ssr-runtime.ts`, lines 30 to 43, at tag `v0.676.0`. The function adds `vue` to `config.build.rolldownOptions.external`:

```ts
export function externalizeVueRuntimeForNuxtSsr(config: NuxtServerViteConfig): void {
  const rolldownOptions = config.build?.rolldownOptions;
  if (!rolldownOptions) return;
  // ...
  rolldownOptions.external = [...new Set([...existing, ...VUE_SSR_EXTERNAL])];
}
```

The `vite:extendConfig` hook in `npm/framework/nuxt/src/index.ts`, lines 303 to 313, calls it when `context.isServer` is true. The Nuxt 5 builder calls this hook once for each environment with a copy of the config (`@nuxt/vite-builder-nightly`, `dist/index.mjs`, lines 3580 to 3589):

```js
for (const environment of ["client", "ssr"]) {
	const environments = { [environment]: config.environments[environment] };
	const strippedConfig = {
		...config,
		environments
	};
	// ...
	await nuxt.hooks.callHook("vite:extendConfig", strippedConfig, ctx);
```

The copy is shallow, so `strippedConfig.build` is the same object as `config.build`. The `external` entry that the server call writes reaches the client build.

A run confirmed this cause. The one-sentence change is to set `external` on `config.environments.ssr.build.rolldownOptions` and not on `config.build.rolldownOptions`. The change in the built file `dist/index.mjs` was:

```js
const environment = config.environments?.ssr;
if (!environment) return;
environment.build ||= {};
environment.build.rolldownOptions ||= {};
const rolldownOptions = environment.build.rolldownOptions;
```

With this change, no client chunk contains a bare `vue` import, the server still answers HTTP 200, and the button shows `1` after one click.

Likely, the reason the client reads the change is the shallow copy above. I did not read Vite's merge of the environment configs.

## Real occurrence

https://github.com/esposter/esposter/blob/02613a3bb662fc51e1a7d655f49d2c301402bb76/pnpm-workspace.yaml#L198

## Isolation

One change at a time from the reproduction.

| Change from the reproduction                                | Bare `vue` import in the client | Button after one click |
| ----------------------------------------------------------- | ------------------------------- | ---------------------- |
| None: Nuxt 5 nightly, module on                             | yes, in two chunks              | `0`, error logged      |
| Module removed (`modules: []`), Nuxt 5 nightly              | no                              | not run                |
| `nuxt` 4.6.3, module on                                     | no                              | `1`                    |
| `external` set on `config.environments.ssr`, Nuxt 5 nightly | no                              | `1`                    |

The change in the last row was applied to a private copy of the published package.

## Not known

- Whether the server entry keeps an `import "vue"` that needs a `node_modules` folder above the output. A larger project showed this. The reproduction does not check it.
- Whether the Nuxt 5 builder is meant to give each hook call a separate `build` object. I read only the built file of the nightly, not the source in the Nuxt repository.
- Whether the bug also appears in development. The module runs the function only when `nuxt.options.dev` is `false`.
- Whether Nuxt 5 releases other than this nightly behave the same. I ran one nightly.

## Not a duplicate of

- #11455 (closed), `onPrehydrate` fails with `NUXT_E1006`. It is a failure in a Nuxt transform, not in the client chunk imports.
- #11592, #11593 and #11594 (closed), differences between the template output of the module and of `@vitejs/plugin-vue`. They are about compiled templates, not about the import of `vue`.
- #4137 (closed), "scope bare package Vue identity per importer". It is about the type checker, not the build of a Nuxt client.
- #10780 (closed), a Vapor slot imports `extend` from `"vue"`. It is about a missing export in one Vue version, not about the specifier that a browser cannot resolve.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
