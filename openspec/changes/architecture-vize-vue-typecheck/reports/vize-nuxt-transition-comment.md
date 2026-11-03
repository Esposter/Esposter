nuxt: a comment directly inside `<Transition>` stays in the server HTML, and hydration reports a mismatch

## Summary

With `@vizejs/nuxt`, the server HTML keeps a template comment that is a direct child of `<Transition>`. Vue's own compiler removes that comment on the server. The client does not create it, so hydration logs `Hydration completed but contains mismatches.` Without the module, the same page logs no hydration error.

## Area

Nuxt integration

## Version

`@vizejs/nuxt` 0.662.0 (`vize` 0.662.0). The same result with `@vizejs/nuxt` 0.661.0.

## Environment

- OS: macOS 27.0.1, arm64
- Node.js: 26.13.0
- Package manager: pnpm 12.16.1
- Framework: `nuxt-nightly` 5.0.0-2611030021-146df55 (Nitro 3.0.261029-rc, Vite 8.3.5). The same result with `nuxt` 4.6.4 (Nitro 2.13.6, Vite 8.3.5).
- vue: 3.5.44
- vize: 0.662.0, `@vizejs/nuxt` 0.662.0, `@vizejs/vite-plugin` 0.662.0
- Browser: Google Chrome 156.0.8078.80, driven by Playwright 1.64.1
- Rust: not used. The reproduction runs the published npm binary `@vizejs/native-darwin-arm64` 0.662.0.

## Minimal reproduction

The project has four files. Run `pnpm i`, then `pnpm dev`. Open the printed URL in Chrome, open the console and reload the page.

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

`app/pages/index.vue`

```vue
<template>
  <div>
    <Transition>
      <!-- A comment directly inside the transition -->
      <p>hello</p>
    </Transition>
  </div>
</template>
```

Control: change the `modules` line to `modules: [],`, then run `pnpm dev` again. The other files stay the same.

## Actual

With the module, the console of `/` shows these messages. The stack lines after `at <Transition>` are cut.

```text
[Vue warn]: Hydration node mismatch:
- rendered on server: JSHandle@node
- expected on client: p
  at <BaseTransition appear=false persisted=false mode=undefined  ... >
  at <Transition>
  ...
[Vue warn]: Hydration children mismatch on JSHandle@node
Server rendered element contains more child nodes than client vdom.
Hydration completed but contains mismatches.
```

The server HTML of `/` (`curl` on the dev server), with the module:

```html
<div id="__nuxt">
  <!--[--><!--placeholder-->
  <div>
    <!-- A comment directly inside the transition -->
    <p>hello</p>
  </div>
  <!--]-->
</div>
```

The server HTML without the module:

```html
<div id="__nuxt">
  <!--[--><!--placeholder-->
  <div><p>hello</p></div>
  <!--]-->
</div>
```

Without the module, the console shows no hydration message.

## Expected

The page hydrates with no mismatch, as it does without the module. The server HTML has no comment, as in the control. Vue's SSR compiler removes comment children of `<Transition>`:

- `packages/compiler-ssr/src/transforms/ssrTransformTransition.ts`, lines 28 and 29, at tag `v3.5.44`: `// #5351: filter out comment children inside transition` and `node.children = node.children.filter(c => c.type !== NodeTypes.COMMENT)`.

The client's `BaseTransition` renders only the first child that is not a comment:

- `packages/runtime-core/src/components/BaseTransition.ts`, line 157, at tag `v3.5.44`: `? findNonCommentChild(children)`.

## Cause

The cause is likely that vize writes the comment into the server HTML of `<Transition>`.

The server render of `<Transition>` calls `process_transparent_builtin` (`crates/vize_atelier_ssr/src/codegen/element/component.rs`, lines 29 and 30, at tag `v0.662.0`). That function passes `false` for `disable_comment`:

```rust
self.process_children_with_fallthrough_attrs(
    &el.children,
    false,
    false,
    false,
    inherit_attrs,
);
```

`crates/vize_atelier_ssr/src/codegen/element/transparent_builtin.rs`, lines 17 to 23, at tag `v0.662.0`: https://github.com/ubugeeei-prod/vize/blob/85fc954a6ca3d983c30c8a272483916a1c867543/crates/vize_atelier_ssr/src/codegen/element/transparent_builtin.rs#L17-L23

The child helper writes a comment only when `disable_comment` is false:

```rust
TemplateChildNode::Comment(comment) => {
    if !disable_comment && comment.directive.is_none() {
        self.process_comment(comment);
```

`crates/vize_atelier_ssr/src/codegen/helpers.rs`, lines 57 to 59, at tag `v0.662.0`: https://github.com/ubugeeei-prod/vize/blob/85fc954a6ca3d983c30c8a272483916a1c867543/crates/vize_atelier_ssr/src/codegen/helpers.rs#L57-L59

The TransitionGroup path passes `true` for the same argument, at `crates/vize_atelier_ssr/src/codegen/element/transition_group.rs` line 68.

The one-sentence change is to pass `true` as `disable_comment` in `process_transparent_builtin`, as the TransitionGroup path does. The change is not built and not run.

## Real occurrence

https://github.com/Esposter/Esposter/blob/acc014363b50fd632759a2d274b716cafee1444a/apps/web/app/components/Anime/Carousel.vue#L12

## Isolation

One change at a time from the reproduction. The rows with a module ran in one project with the same versions, except where a version is named.

| Page or change from the reproduction                                                                 | Module | Hydration error |
| ---------------------------------------------------------------------------------------------------- | ------ | --------------- |
| The reproduction, comment directly inside `<Transition>`                                             | on     | yes             |
| Control: `modules: []`                                                                               | off    | no              |
| Comment removed, `<Transition>` with one `<p>` child                                                 | on     | no              |
| Comment moved into a plain `<div>`, outside `<Transition>`                                           | on     | no              |
| `<Transition mode="out-in">` with `<KeepAlive>` and a component child, comment inside `<Transition>` | on     | yes             |
| The same page, comment removed                                                                       | on     | no              |
| Nuxt 4.6.4 in place of the nightly, otherwise the same files                                         | on     | yes             |
| `@vizejs/nuxt` 0.661.0 in place of 0.662.0, otherwise the same files                                 | on     | yes             |

## Not known

- Whether the change above also affects the `<!--v-if-->` placeholder that a `v-if` child leaves inside `<Transition>`. Not checked.
- Whether the change also needs `disable_nested_fragments` set to `true`. Vue passes `true` there (`ssrTransformTransition.ts`, line 37, at tag `v3.5.44`), and vize passes `false`. Not tested.
- The one-sentence change is not built or run, so it is not confirmed as a fix.

## Not a duplicate of

- #8048 (closed 2026-10-05), `fix(ssr): preserve Suspense and TransitionGroup builtin output`. It filters comment children for TransitionGroup. It names TransitionGroup and not Transition, and the Transition path still keeps the comment at tag `v0.662.0`.
- #10876 (closed 2026-10-26), `compiler(ssr): a comment-only <slot> fallback is dropped`. It is the opposite case: the comment is dropped where Vue keeps it.
- #10797 (closed 2026-10-26), `fix(nuxt): forward vue.compilerOptions.comments`. It covers the comments option, not the server output of a `<Transition>` child.
- #8878 (closed 2026-10-14), `fix(patina): accept custom element children inside transitions`. It is a lint rule, not the server output.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
