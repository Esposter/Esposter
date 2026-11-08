vite-plugin: a destructured prop read inside defineExpose is left bare in the generated code, which throws ReferenceError at run time

### Area

Vite plugin

### Version

`@vizejs/vite-plugin` 0.715.0 with `@vizejs/native` 0.715.0. The same output on 0.1.0, 0.390.0, 0.713.0 and 0.714.0.

### Summary

A destructured prop read inside the argument of `defineExpose` stays bare (an unresolved name) in the generated code, so the exposed function throws `ReferenceError: foo is not defined` at run time. The source of truth, `@vue/compiler-sfc` 3.5.45, accepts the same input and rewrites the read to `__props.foo`.

### Minimal reproduction

Create the five files in an empty directory.

`package.json`:

```json
{
  "name": "vize-define-expose-repro",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@12.18.0",
  "engines": { "node": "26.13.0" },
  "scripts": { "build": "vite build" },
  "dependencies": { "vue": "3.5.45" },
  "devDependencies": { "@vizejs/vite-plugin": "0.715.0", "vite": "8.3.6" }
}
```

`vite.config.ts`:

```ts
import vize from "@vizejs/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({ plugins: [vize()] });
```

`index.html`:

```html
<!doctype html>
<html>
  <body>
    <div id="app"></div>
    <script type="module" src="/main.ts"></script>
  </body>
</html>
```

`main.ts`:

```ts
import { createApp } from "vue";
import App from "./App.vue";

const exposed = createApp(App, { foo: 1 }).mount("#app") as unknown as { bar: () => number };
console.log("bar() returns", exposed.bar());
```

`App.vue`:

```vue
<script setup lang="ts">
const { foo } = defineProps<{ foo: number }>();
defineExpose({ bar: () => foo });
</script>

<template>
  <div />
</template>
```

Run the commands:

```
pnpm install
pnpm exec vite build
pnpm exec vite preview
```

Open the preview page in a browser and read the console.

### Actual behavior

The console shows the error, and the line `bar() returns` never prints:

```
Uncaught ReferenceError: foo is not defined
```

The native compiler writes the read in `App.vue` as the author wrote it. Its generated code contains `__expose({ bar: () => foo })`, where `foo` has no binding. The built chunk keeps the same name: `setup(e,{expose:t}){return t({bar:()=>foo})`.

### Expected behavior

The source of truth writes `__expose({ bar: () => __props.foo });` for the same `App.vue`. It compiles with `compileScript` and `inlineTemplate: true`.

Proof that both compilers read the file: a `<div v-if />` in the template makes both report `v-if/v-else-if is missing expression.`

### Environment

- OS: Windows 10 Home 10.0.19045
- Architecture: x64
- Node.js: 26.13.0
- Rust: not used. The packages come from npm.
- Framework: Vite 8.3.6, Vue 3.5.45 (`@vue/compiler-sfc` from the same `vue` package)
- Browser for the console output: Microsoft Edge 157.0.4341.42, headless

### Cause

The cause is likely the skip of the `defineExpose` argument. The rewrite of props runs on the setup code only. The parser drops each line for which `is_macro_call_line` returns true, and that includes a `defineExpose` call, so the rewrite never receives the argument. The emitter then copies the argument as written.

At the 0.713.0 release commit, the parser drops the line:

[`parser.rs#L532`](https://github.com/ubugeeei-prod/vize/blob/03081892a4c5aee8de383e7c7864bcc65238e4da/crates/vize_atelier_sfc/src/compile_script/inline/compiler/parser.rs#L532)

```rust
        if !trimmed.is_empty() && !is_macro_call_line(trimmed) {
```

The rewrite runs on the setup code only:

[`body.rs#L124`](https://github.com/ubugeeei-prod/vize/blob/03081892a4c5aee8de383e7c7864bcc65238e4da/crates/vize_atelier_sfc/src/compile_script/inline/compiler/body.rs#L124)

```rust
            transform_destructured_props_with_edits(&setup_code, destructure)
```

The emitter writes the argument text as read:

[`setup_emit.rs#L257-L259`](https://github.com/ubugeeei-prod/vize/blob/03081892a4c5aee8de383e7c7864bcc65238e4da/crates/vize_atelier_sfc/src/compile_script/inline/compiler/setup_emit.rs#L257-L259)

```rust
        let args = expose_macro.args.trim();
        output.extend_from_slice(b"__expose(");
        output.extend_from_slice(args.as_bytes());
```

The change that fixes it is likely to apply the props rewrite to the `defineExpose` argument before `setup_emit.rs` writes it.

### Isolation

One change at a time from the reproduction. The native compiler output comes from `compileSfc`. The source of truth output comes from `@vue/compiler-sfc`.

| Case                                                                                                 | Native compiler                                      | Source of truth |
| :--------------------------------------------------------------------------------------------------- | :--------------------------------------------------- | :-------------- |
| Reproduction: `defineExpose({ bar: () => foo })`                                                     | bare                                                 | `__props.foo`   |
| Method: `defineExpose({ bar() { return foo; } })`                                                    | bare                                                 | `__props.foo`   |
| Function expression: `defineExpose({ bar: function () { return foo; } })`                            | bare                                                 | `__props.foo`   |
| Arrow with a parameter: `defineExpose({ bar: (x: number) => foo + x })`                              | bare                                                 | `__props.foo`   |
| Plain value: `defineExpose({ bar: foo })`                                                            | bare                                                 | `__props.foo`   |
| Getter: `defineExpose({ get bar() { return foo; } })`                                                | bare                                                 | `__props.foo`   |
| Object literal: `defineExpose({ bar: () => ({ foo }) })`                                             | bare                                                 | `__props.foo`   |
| Arrow in a variable, then `defineExpose({ bar })`                                                    | `__props.foo`, and the page prints `bar() returns 1` | `__props.foo`   |
| Plain value in a variable, then `defineExpose({ bar })`                                              | `__props.foo`                                        | `__props.foo`   |
| Arrow in a variable, no `defineExpose`                                                               | `__props.foo`                                        | `__props.foo`   |
| `const bar = ref(() => foo)`, no `defineExpose`                                                      | `__props.foo`                                        | `__props.foo`   |
| Props not destructured: `const props = defineProps<...>()`, `defineExpose({ bar: () => props.foo })` | `props.foo`                                          | `props.foo`     |
| Runtime props `defineProps(["foo"])`, no `lang="ts"`                                                 | bare                                                 | `__props.foo`   |
| No `<template>` block                                                                                | bare                                                 | `__props.foo`   |
| Renamed to `Foo` and `Bar`                                                                           | bare                                                 | `__props.Foo`   |
| Plugin option `features.propsDestructure` set to `false` or `"error"`                                | bare in both                                         | not compared    |
| `@vizejs/vite-plugin` 0.1.0, 0.390.0, 0.713.0 and 0.714.0                                            | bare in the built chunk of each                      | not compared    |

### Not known

- The change that fixes it is read, not applied. No Rust toolchain was available, so no patched native build was made.
- `@vizejs/vite-plugin` 0.0.1-alpha.8 did not install with pnpm 12. The oldest release that installed is 0.1.0.

### Not a duplicate of

- #6720 (closed): the props rewrite misses reads in call spread arguments, computed keys and default parameters. Those reads sit in statements that the rewrite walks. This read sits in a macro argument that the rewrite never receives.
- #7881 (closed): a dynamic `v-on` or `v-bind` argument reads `_ctx.<name>`. The output reports a Vue warning, not a `ReferenceError`, and the read is in a directive key.
- #8835 (closed): a rest element in a `defineProps` destructure throws `rest is not defined`. The binding is the rest prop, and its fix builds a rest proxy.
- #10891 (closed) and #10923 (merged pull request): a non-inline `<script setup>` omits the `__expose()` call. This report is about the argument of a call that the inline output already makes. #10923 states that inline render functions keep their behavior.
- #12149 (open pull request): rejects unresolved shapes of type-based `defineProps`. It changes the prop types, not the reads in the setup code.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
