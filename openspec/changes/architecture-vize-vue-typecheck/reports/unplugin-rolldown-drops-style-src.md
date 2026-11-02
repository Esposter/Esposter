# unplugin: a `<style src>` block is dropped from a Rolldown build, and no warning says so

I am replacing the Vue tooling of a Nuxt monorepo with vize, one tool at a time. `vue-tsc` becomes `tsrs` running the vize content mapper. `unplugin-vue` and `@vitejs/plugin-vue` become the vize rolldown and Vite plugins. Nuxt's Vue integration becomes `@vizejs/nuxt`. This issue comes from the second step, the compile of the component libraries, and is one of a few I ran into. The type check of the first step is in separate issues.

This is one of a batch of 14 issues filed together, all from that attempt, so they can be tracked as one set:

<batch list filled in when filed>

A library build that runs `tsdown` (Rolldown) with `@vizejs/unplugin/rolldown` drops the CSS of every `<style src="...">` block. The build exits 0, writes no CSS, and prints no warning. `@vizejs/vite-plugin` and `@vitejs/plugin-vue` write the CSS of the same file in a Vite build.

CSS support in this entry may be limited by design. The README of the package says that the Vite integration is the most complete one. It says that CSS Modules and preprocessors depend on the bundler's own CSS pipeline. The plugin hands a block in a preprocessor language, and a CSS module, to that pipeline.

For plain CSS the plugin writes no CSS file. It keeps a plain inline `<style>` block by putting its CSS into the JavaScript as a string. The JavaScript appends a `<style>` element at run time. A block that needs a file read, which is `src` or an `@import` inside the block, is dropped without a message.

The ask depends on the scope. If plain CSS from a file is out of scope, the plugin reports a block that it cannot process, with a warning or an error. The README then lists `<style src>` under its caveats. If it is in scope, the plugin reads the `src` file, as the Cause below says.

## Environment

`@vizejs/unplugin` 0.652.0, `@vizejs/vite-plugin` 0.652.0, `tsdown` 0.23.2 with `rolldown` 1.2.16, `@tsdown/css` 0.23.2, `vite` 8.3.5, `vue` 3.5.44, macOS on Apple silicon. Source of truth: `@vitejs/plugin-vue` 6.0.10 in a Vite library build, which writes the CSS of the file below.

## Reproduction

`package.json`:

```json
{
  "private": true,
  "type": "module",
  "devDependencies": {
    "@tsdown/css": "0.23.2",
    "@vitejs/plugin-vue": "6.0.10",
    "@vizejs/unplugin": "0.652.0",
    "@vizejs/vite-plugin": "0.652.0",
    "tsdown": "0.23.2",
    "vite": "8.3.5",
    "vue": "3.5.44"
  }
}
```

`tsdown.config.ts`:

```ts
import Vize from "@vizejs/unplugin/rolldown";
import { defineConfig } from "tsdown";

export default defineConfig({
  dts: false,
  entry: { index: "src/index.ts" },
  format: "esm",
  plugins: [Vize({ isProduction: true })],
  deps: { neverBundle: ["vue"] },
});
```

`vite.vue.config.ts` is the source of truth:

```ts
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: { entry: "src/index.ts", fileName: "index", formats: ["es"] },
    minify: false,
    outDir: "dist-vue",
    rolldownOptions: { external: ["vue"] },
  },
  plugins: [vue()],
});
```

`vite.config.ts` runs the vize Vite plugin on the same file:

```ts
import vize from "@vizejs/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: { entry: "src/index.ts", fileName: "index", formats: ["es"] },
    minify: false,
    rolldownOptions: { external: ["vue"] },
  },
  plugins: [vize({ isProduction: true })],
});
```

`src/Foo.vue`:

```vue
<template>
  <button class="foo">Foo</button>
</template>

<style scoped src="./foo.css"></style>
```

`src/foo.css`:

```css
.foo {
  color: red;
}
```

`src/index.ts`:

```ts
export { default as Foo } from "./Foo.vue";
```

```sh
npm i
npx tsdown
npx vite build -c vite.vue.config.ts
npx vite build
```

## Actual

`npx tsdown` exits 0 and prints no warning:

```
ℹ dist/index.mjs  0.33 kB │ gzip: 0.23 kB
✔ Build complete in 18ms
```

The folder `dist` holds `index.mjs` and no CSS file. The generated code sets a scope id and holds no style:

```js
const _sfc_main = {};
_sfc_main.__scopeId = "data-v-9c1c107f";
```

## Expected

The CSS of the block reaches the output, as it does for an inline block. `@vitejs/plugin-vue` writes `dist-vue/index.css`:

```css
.foo[data-v-dd80ef6d] {
  color: red;
}
```

`@vizejs/vite-plugin` writes `dist/index.css` with `.foo[data-v-9c1c107f]{color: red;}` for the same file, so the compiler reads the block when the source holds its text.

## Cause

The cause is confirmed by a run. The rolldown transform hands the raw `.vue` source to `compileSfc`. The parser takes the body of a `<style>` element as its content. A `<style src>` element has no body, so the content and the compiled `css` are empty. The code that appends the style injection then skips an empty `css` and reports nothing. The Vite builder reads each `src` file and puts its text into the source before `compileSfc`. The rolldown builder does not.

The source is read at the tag `v0.652.0` of `ubugeeei-prod/vize`. The rolldown path calls the compiler with the raw source (`npm/builder/unplugin/src/compiler.ts:60`):

```ts
  const result = compileSfc(source, {
```

The Vite path resolves `src` first (`npm/builder/vite/src/compiler.ts:180` and `:183`):

```ts
  const resolved = resolveSfcSrcImports(filePath, content);
  ...
  const result = compileSfc(resolved.source, buildCompileFileOptions(filePath, options, scopeId));
```

The parser keeps the element body only (`crates/vize_croquis/src/sfc/parse/parse_sfc.rs:236` and `:237`):

```rust
                    descriptor.styles.push(SfcStyleBlock {
                        content,
```

The injection is skipped when `css` is empty (`npm/builder/unplugin/src/style.ts:178` and `:179`):

```ts
  } else if (compiled.css && !(isProduction && extractCss)) {
    output = prependInlineStyleInjection(output, compiled.css, compiled.scopeId);
```

If CSS is in scope, the fix is to inline each `<style src>` file into the source before `compileSfc` in `compileVueModule`, with the helper `resolveSfcSrcImports` that the Vite builder uses. A copy of the built plugin with that one change keeps the CSS. The CSS of a `<style scoped src>` block and of a `<style src>` block reaches the output JavaScript, as the CSS of an inline block does.

## Real occurrence

https://github.com/Esposter/Esposter/blob/6f6212cd7bfccb9acc3bc13c6a64c0429f2e8322/packages/genshin-interface/src/components/BlessingScreen/Index.vue#L157

## Isolation

One style form at a time in `src/Foo.vue`, with `npx tsdown` and `npx vite build`. The column says whether the text of the rule `color: red` is in the output.

| Style block in `Foo.vue`                     | `tsdown` with `@vizejs/unplugin/rolldown` | `vite build` with `@vizejs/vite-plugin` |
| :------------------------------------------- | :---------------------------------------- | :-------------------------------------- |
| inline `<style scoped>`                      | in the JavaScript (injected at run time)  | in `index.css`                          |
| inline `<style>`                             | in the JavaScript (injected at run time)  | in `index.css`                          |
| `<style scoped src="./foo.css">`             | **none**                                  | in `index.css`                          |
| `<style src="./foo.css">`                    | **none**                                  | in `index.css`                          |
| inline `<style>` with `@import "./foo.css";` | **none**                                  | in `index.css`                          |

The trigger is a block that needs a file read.

## Not known

Whether a plain `src` block belongs in the scope of the rolldown entry is not known. The stability page of the project lists `@vizejs/unplugin` as a compatibility preview, and its README says to test carefully before depending on it in production. A library build that ships a stylesheet is likely outside what that tier promises. This report asks only that the plugin does not drop a block without a message.

It is also not known whether the plugin should write a CSS asset for a plain inline block, as the Vite plugin does. Today the JavaScript appends the CSS as a string at run time. A library that ships a stylesheet and renders on a server needs the asset.

Two cases were read and not run. The first is `<style lang="scss" src="...">`, which the plugin hands to the bundler as a style request. The second is `<style module src="...">`. Whether the change in the Cause covers them is not known.

## Not a duplicate of

Searched open and closed issues and pull requests for `style src`, `src attribute style`, `unplugin rolldown css`, `tsdown style` and `scoped style src dropped`. The search matches words, not meaning.

- #9915 (closed): the style of a Musea art block bypasses the Vite CSS pipeline. A different block and a different plugin.
- #6987 (closed): the Vite plugin builds each component with top-level assignments, so an unused component keeps its CSS. A different path, and the CSS is present there.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
