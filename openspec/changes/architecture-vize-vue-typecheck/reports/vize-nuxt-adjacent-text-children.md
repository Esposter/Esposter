# SSR splits a `<Title>` slot's text and interpolation into separate vnodes, so `<Title>` gets more than one child

## Summary

With `@vizejs/nuxt` registered, a `<Title>` whose text is an interpolation followed by text, or two interpolations in a row, renders only its first child. The server-rendered `<title>` loses the rest, and Nuxt logs `[NUXT_E6002] <Title> received more than one child in its default slot.` The same page renders the full title when the module is removed from `modules`.

## Context

I am moving a Nuxt app's Vue compilation to `@vizejs/nuxt` in place of Nuxt's default Vue plugin, in one step of the migration. This issue is from that step. This issue is one of 2 filed together from this attempt:

- (number after filing) `_ctx.unref is not a function` in a template call to an auto-import
- (number after filing) a server-rendered `<Title>` with two children (`NUXT_E6002`) <-- you are here

## Environment

- `@vizejs/nuxt` 0.662.0, which pins `vize` 0.662.0. On the day of the run, 0.664.0 was the newest release on npm. 0.664.0 shows the same output (see Isolation).
- `nuxt` 4.6.4 (`@nuxt/cli` 4.0.1, Nitro 2.13.6, Vite 8.3.5), `vue` 3.5.44
- Node v26.13.0, pnpm 12.16.1, macOS (Darwin 27.0.0) on Apple silicon
- Nuxt 5: `nuxt-nightly` 5.0.0-2611030021-146df55 (Nitro 3.0.261029-rc). The same title split appears in dev and in production.
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

`app/pages/index.vue`:

```vue
<script setup lang="ts">
const count = "0.000";
</script>

<template>
  <Head>
    <Title>{{ count }} Foo</Title>
  </Head>
</template>
```

Commands:

```sh
pnpm i
pnpm dev --port 3101                   # module on: <title>0.000</title> and the warning
WITHOUT_VIZE=1 pnpm dev --port 3101    # control: <title>0.000 Foo</title>, no warning
curl -s http://127.0.0.1:3101/ | grep -o '<title>[^<]*</title>'
```

The script passes `--host 127.0.0.1` because `nuxt dev` on Nuxt 4.6.4 stops without a host flag. This happens without the module too.

The workspace file sets `minimumReleaseAge: 0` because pnpm 12 refuses packages published less than one day before the install.

## Actual

Module on, `GET /`, server log:

```
WARN  [NUXT_E6002] <Title> received more than one child in its default slot.
```

Module on, response body: `<title>0.000</title>`. The text ` Foo` is missing.

## Expected

Control (`WITHOUT_VIZE=1`), `GET /`: `<title>0.000 Foo</title>`, and no `NUXT_E6002` line in the log.

## Cause

The cause is likely. The emitted lines were observed, and the code that emits them was read at the tag `v0.662.0` (commit `85fc954a6ca3d983c30c8a272483916a1c867543`). A Rust build was not run, and no fix was applied.

The served SSR module, fetched as `?vue&vize-ssr`, shows two vnodes for the slot:

```js
return [_createTextVNode(_toDisplayString($setup.count)), _createTextVNode(" Foo")];
```

The control, and the module's client compile, show one vnode:

```js
_createTextVNode(_toDisplayString($setup.count) + " Foo");
```

Nuxt's `Title` reads its default slot in vnode mode, which is the `else` branch of the slot function. That branch calls the fallback at `crates/vize_atelier_ssr/src/codegen/element/slot_fn.rs:90`:

```rust
let fallback = self.vnode_component_slot_children_expression(&children);
```

The fallback builds one entry per child. `vnode_child_expression` in `crates/vize_atelier_ssr/src/codegen/element/vnode.rs` lines 99-120 writes one `_createTextVNode` for each text child (line 102) and one for each interpolation child (line 112). Nothing in that path joins adjacent text and interpolation nodes.

The DOM path does join them. `transform_text_children` in `crates/vize_atelier_core/src/steps/text.rs` line 11 says it combines consecutive text and interpolation nodes.

The one-sentence change is to make the SSR vnode fallback join adjacent text and interpolation children the way `transform_text_children` does.

## Real occurrence

https://github.com/Esposter/Esposter/blob/8ca000b744d2f15d96ad4979f62ec797b6726ec9/apps/web/app/pages/clicker.vue#L15

## Isolation

Nuxt 4.6.4, `@vizejs/nuxt` 0.662.0, dev, `GET` of each page. The control is in the last column.

| Title children in the page | Module on `<title>` | Control `<title>`    |
| :------------------------- | :------------------ | :------------------- |
| `{{ count }}`              | `0.000`             | `0.000`              |
| `{{ count }} Foo`          | `0.000` (warning)   | `0.000 Foo`          |
| `Foo {{ count }}`          | `Foo ` (warning)    | `Foo 0.000`          |
| `{{ count }} {{ name }}`   | `0.000` (warning)   | `0.000 Piña Coladas` |
| `{{ count }}{{ name }}`    | `0.000` (warning)   | `0.000Piña Coladas`  |
| `Foo`                      | `Foo`               | `Foo`                |

The module logs four warnings, one for each row that has two children. The control logs none.

The other results:

- Nuxt 4.6.4 production: the module build shows the same truncation. The control shows the full titles.
- Nuxt 5 nightly, dev: the module shows the same truncation. The control shows the full titles.
- Nuxt 5 nightly, production: the module shows the same truncation. The control shows the full titles.
- `@vizejs/nuxt` 0.664.0, dev: the same truncation, and the same SSR lines in the served module.
- `@vizejs/vite-plugin` 0.662.0 in a plain Vite and Vue SSR project, rendered with `vue/server-renderer`: a child component that reads `slots.default()` gets 2 children for `{{ count }} Foo`. With `@vitejs/plugin-vue` 6.0.10 it gets 1.

## Not known

- The client-side title after hydration was not checked.
- The fix was read, not applied, and the Rust source was not built.
- Whether a `<Head>` wrapper is needed was not checked separately. The reproduction keeps it, as the app does.

## Not a duplicate of

- #7970 (closed) and #8141 (merged 2026-10-07): the same split of component slot text, in the VDOM emitter. #8141 changed `crates/vize_atelier_core/src/codegen/slots/...` and the davinci emitter. It did not change `crates/vize_atelier_ssr`, where this split is emitted.
- #9889 (closed) and #9925 (merged): the same split in `<slot>` outlet fallback content. Different element, and fixed.
- #9713 and #9457 (closed): SSR component-slot fallbacks that lost conditional metadata. The same fallback function, a different property.
- No open or closed issue matched `NUXT_E6002` in a search of `repo:ubugeeei-prod/vize`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
