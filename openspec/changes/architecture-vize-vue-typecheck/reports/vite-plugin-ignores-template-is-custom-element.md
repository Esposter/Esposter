# vite-plugin: `template.compilerOptions.isCustomElement` is accepted and ignored, so a custom-renderer tag compiles as a component

I am replacing the Vue tooling of a Nuxt monorepo with vize, one tool at a time. `vue-tsc` becomes `tsrs` running the vize content mapper. `unplugin-vue` and `@vitejs/plugin-vue` become the vize rolldown and Vite plugins. Nuxt's Vue integration becomes `@vizejs/nuxt`.

This issue comes from the second step, the compile of the component libraries, and is one of a few I ran into. The type check of the first step is in separate issues.

This is one of a batch of 14 issues filed together, all from that attempt, so they can be tracked as one set:

<batch list filled in when filed>

`@vizejs/vite-plugin` types its `template` option as the `@vitejs/plugin-vue` option bag, and `template.compilerOptions` takes any key. A function in `isCustomElement` gives no error and has no effect. The plugin compiles `<TresMesh>` as `resolveComponent("TresMesh")`. `@vitejs/plugin-vue` given the same function compiles it as a native element, which a custom renderer such as TresJS needs.

The option `customElements`, a list of names and `*` patterns, works. With `customRenderer: true` it matches the rule that `@tresjs/core` ships for a file that imports `TresCanvas`. It cannot match the rule for a file that does not import it, because a pattern cannot exclude a name.

## Environment

`@vizejs/vite-plugin` 0.653.0, `@vitejs/plugin-vue` 6.0.10, `vite` 8.3.5, `vue` 3.5.44, macOS on Apple silicon. Source of truth: `@vitejs/plugin-vue`, which applies the function. The rule that `@tresjs/core` 5.10.1 ships is `(tag) => (/^Tres[A-Z]/.test(tag) || tag.startsWith("tres-")) && !whitelist.includes(tag) || tag === "primitive"`, and its whitelist holds `TresCanvas`, `TresCanvasContext`, `TresLeches` and `TresScene`.

## Reproduction

`package.json`:

```json
{
  "private": true,
  "type": "module",
  "devDependencies": {
    "@vitejs/plugin-vue": "6.0.10",
    "@vizejs/vite-plugin": "0.653.0",
    "vite": "8.3.5",
    "vue": "3.5.44"
  }
}
```

`vite.config.ts`:

```ts
import vue from "@vitejs/plugin-vue";
import vize from "@vizejs/vite-plugin";
import { defineConfig } from "vite";

const isCustomElement = (tag: string) => tag === "TresMesh";
const tool = process.env.TOOL;
const plugins = {
  vue: vue({ template: { compilerOptions: { isCustomElement } } }),
  "vize-function": vize({ isProduction: true, template: { compilerOptions: { isCustomElement } } }),
  "vize-list": vize({ customElements: ["TresMesh"], isProduction: true }),
  "vize-glob": vize({ customElements: ["Tres*"], isProduction: true }),
  "vize-negated": vize({ customElements: ["Tres*", "!TresCanvas"], isProduction: true }),
}[tool];

export default defineConfig({
  build: {
    lib: { entry: "src/index.ts", fileName: "index", formats: ["es"] },
    minify: false,
    outDir: `dist/${tool}`,
    rolldownOptions: { external: ["vue"] },
  },
  plugins: [plugins],
});
```

`src/Foo.vue`:

```vue
<template>
  <TresCanvas>
    <TresMesh />
  </TresCanvas>
</template>
```

`src/index.ts`:

```ts
export { default as Foo } from "./Foo.vue";
```

```sh
npm i
for tool in vue vize-function vize-list vize-glob vize-negated; do
  TOOL=$tool npx vite build
  grep -o 'createElementBlock("[A-Za-z]*"\|createElementVNode("[A-Za-z]*"\|resolveComponent("[A-Za-z]*")' dist/$tool/index.js | sort -u
done
```

## Actual

The `vize-function` build exits 0 and resolves both tags as components:

```
resolveComponent("TresCanvas")
resolveComponent("TresMesh")
```

## Expected

`TresMesh` compiles as a native element and `TresCanvas` as a component, as with `@vitejs/plugin-vue` (the `vue` build):

```
createElementVNode("TresMesh"
resolveComponent("TresCanvas")
```

The plugin reads the file and compiles it: the other four builds change the output.

## Cause

The cause is confirmed by a run. The plugin copies five fields of `template.compilerOptions` and never reads `isCustomElement`. The type allows the key because `compilerOptions` has an index signature, so the call type checks. A function cannot reach the native compiler. The native option is a list of strings, and a function in `customElements` fails in the binding.

The source is read at the tag `v0.653.0` of `ubugeeei-prod/vize`. The type accepts any key (`npm/builder/vite/src/plugin-vue-types.ts:27`):

```ts
  [key: string]: unknown;
```

The options reader takes only the named fields (`npm/builder/vite/src/plugin/plugin-vue-options.ts:24` and `:32`):

```ts
  const compilerOptions = options.template?.compilerOptions;
  ...
  const templateCacheHandlers = booleanCompilerOption(compilerOptions?.cacheHandlers);
```

The text `isCustomElement` appears nowhere else under the Vite builder's source, tests excepted. The native options take a list of strings (`crates/vize_vitrine/src/napi/sfc/types.rs:78`):

```rust
    pub custom_elements: Option<Vec<String>>,
```

A function given as `customElements` stops the build with this error:

```
Error: Failed to get Array length on BatchCompileOptionsNapi.customElements
```

The smallest fix is a warning when the function is set, as #7107 does in the Nuxt module. A fuller fix calls `isCustomElement` in JavaScript for each tag of the template before the native compile. It passes the tags that answer true through `customElements`.

A copy of the built plugin calls the function over a fixed tag list and passes the answers as the list. Its output equals the output of the `vize-list` build. That copy confirms the path. It does not collect the tags of a template.

## Real occurrence

https://github.com/Esposter/Esposter/blob/6f6212cd7bfccb9acc3bc13c6a64c0429f2e8322/packages/genshin-world/tsdown.config.ts#L18

## Isolation

One change at a time from `vite.config.ts`, on `vize` 0.653.0. The column shows the calls in the output.

| Build                                                      | `TresCanvas`         | `TresMesh`           |
| :--------------------------------------------------------- | :------------------- | :------------------- |
| `@vitejs/plugin-vue`, function (source of truth)           | `resolveComponent`   | `createElementVNode` |
| `vize-function`: `template.compilerOptions` function       | `resolveComponent`   | `resolveComponent`   |
| `vize-list`: `customElements: ["TresMesh"]`                | `resolveComponent`   | `createElementVNode` |
| `vize-glob`: `customElements: ["Tres*"]`                   | `createElementBlock` | `createElementVNode` |
| `vize-negated`: `customElements: ["Tres*", "!TresCanvas"]` | `createElementBlock` | `createElementVNode` |

In the next table, `src/Foo.vue` imports `TresCanvas` in `<script setup>`, except in the last row. The import is `import { TresCanvas } from "./stub"`, and `stub.ts` exports a component. The columns are the same.

| Build                                                                                  | `TresCanvas`         | `TresMesh`           |
| :------------------------------------------------------------------------------------- | :------------------- | :------------------- |
| `@vitejs/plugin-vue`, function (source of truth)                                       | `createBlock`        | `createElementVNode` |
| `customElements: ["Tres*"]`                                                            | `createElementBlock` | `createElementVNode` |
| `customElements: ["Tres*"]` and `customRenderer: true`                                 | `createBlock`        | `createElementVNode` |
| `customElements: ["Tres*"]` and `customRenderer: true`, with no import of `TresCanvas` | `createElementBlock` | `createElementVNode` |

The trigger is a function in `template.compilerOptions.isCustomElement`. The `vize-negated` row shows that a pattern cannot exclude a name: the matcher in the native compiler reads `*` and no other syntax. The rows with an import show that `customRenderer: true` is what keeps an imported tag a component.

## Not known

`@vizejs/unplugin` has no `template` option. It takes `customElements` and `customRenderer`. A build with its rolldown entry gives the same results as the Vite plugin for the list, the glob, and the glob with `customRenderer: true`. A function in `customElements` stops that build with `Failed to get Array length on SfcCompileOptionsNapi.customElements`.

The `@tresjs/core` rule keeps four names as components, `TresCanvas`, `TresCanvasContext`, `TresLeches` and `TresScene`. A file that imports a tag keeps it a component when `customRenderer: true` is set, as the test of #4275 shows. A file that does not import it, because the app registers it globally, loses it to the pattern, and a pattern cannot exclude a name. It is not known if the pattern alone is meant to keep an imported tag a component. A way to exclude a name from a pattern is a request for more than the source of truth does. This report does not ask for it.

## Not a duplicate of

Searched open and closed issues and pull requests for `isCustomElement`, `customElements`, `TresJS` and `compilerOptions`. The search matches words, not meaning.

- #3946 (closed): asked for an equivalent of `isCustomElement` for TresJS tags. The maintainer scoped it as patterns, because a function cannot come from a JSON configuration, and #4275 added `customElements`. Step 3 of the scope note reads "The vite plugin forwards its own option (parity with `@vitejs/plugin-vue`'s `template.compilerOptions.isCustomElement`) into the same config". The plugin has `customElements`. It does not read the `isCustomElement` key of its `template` option, which is the subject of this report.
- #7003 (closed): the Nuxt module silently ignored `vue.compilerOptions`, `isCustomElement` among them. The fix, #7107, keeps Nuxt's Vue compiler when the options hold a predicate such as `isCustomElement`, and warns "instead of silently changing template behavior". That fix is in the module. The `template.compilerOptions` option of the plugin still drops the predicate without a message.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
