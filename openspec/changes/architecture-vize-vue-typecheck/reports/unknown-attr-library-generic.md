# content-mapper: an undeclared attribute on a library function component reports TS2353 when the project and `vize` do not share one `vue`

I am replacing the Vue tooling of a Nuxt monorepo with vize, one tool at a time. `vue-tsc` becomes `tsrs` running the vize content mapper. `unplugin-vue` and `@vitejs/plugin-vue` become the vize rolldown and Vite plugins. Nuxt's Vue integration becomes `@vizejs/nuxt`.

This issue comes from the first step, the type check, and is one of a few I ran into. A first run of this check on the app reported 103 diagnostics that `vue-tsc` does not report. The twelve issues of the first batch are closed, and a run on `vize` 0.652.0 reported 15. This issue is none of those 15, because the app now lists `vue` beside `vize` in its root manifest. It stays open because the mapper then reports a false error with no warning when it cannot find that `vue`.

This is one of a batch of 14 issues filed together, all from that attempt, so they can be tracked as one set:

<batch list filled in when filed>

A library component declared as a function that returns `VNode & { __ctx }` gives TS2353 for an attribute that no prop declares. `vue-tsc` writes this form for a generic SFC. `vue-tsc` accepts the same file. The mapper accepts the attribute only when it can use its shared helpers. In a monorepo where `vue` and `vize` sit in different `node_modules` folders, it cannot.

## Environment

`vize` 0.650.0, `tsrs` 0.20.1-ts7.1.0-beta (`--runExternalCode`), `vue` 3.5.44, Linux 6.18. Source of truth: `vue-tsc` 3.3.11 with `typescript` 6.0.3, which reports no error for the reproduction. On `vize` 0.652.0 and 0.653.0 (macOS on Apple silicon), the reproduction below gives the same diagnostics at the same positions. `vue-tsc` reports none.

## Reproduction

A pnpm workspace. `vize` is in the root manifest and `vue` is only in the `consumer` manifest, as in a monorepo. `foo-lib` stands for a library that ships a generic component declaration.

`package.json`:

```json
{
  "private": true,
  "type": "module",
  "devDependencies": { "tsrs": "0.20.1-ts7.1.0-beta", "typescript": "6.0.3", "vize": "0.650.0", "vue-tsc": "3.3.11" }
}
```

`pnpm-workspace.yaml`:

```yaml
packages:
  - consumer
```

`consumer/package.json`:

```json
{ "private": true, "type": "module", "dependencies": { "foo-lib": "file:../foo-lib", "vue": "3.5.44" } }
```

`consumer/tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ESNext"
  },
  "contentMappers": [{ "package": "vize", "extensions": [".vue"] }],
  "include": ["src/**/*.vue"]
}
```

`foo-lib/package.json`:

```json
{ "name": "foo-lib", "version": "1.0.0", "type": "module", "types": "./index.d.ts", "peerDependencies": { "vue": "*" } }
```

`foo-lib/index.d.ts`. This is the shape of a generic SFC that `vue-tsc` compiles in a library, reduced to the lines that matter:

```ts
import type { PublicProps, VNode } from "vue";

export declare const Foo: <T>(
  props: PublicProps & { value?: T } & (typeof globalThis extends { __VLS_PROPS_FALLBACK: infer P } ? P : {}),
) => VNode & { __ctx?: object };
```

`consumer/src/Probe.vue`:

```vue
<script setup lang="ts">
import { Foo } from "foo-lib";
</script>

<template>
  <Foo value="a" data-bar="a" />
</template>
```

```sh
pnpm i
cd consumer
pnpm exec tsrs --runExternalCode --noEmit -p tsconfig.json
pnpm exec vue-tsc --noEmit -p tsconfig.json
```

## Actual

`tsrs` reports one error and exits with code 2. The position maps to the attribute in the source file:

```
src/Probe.vue(6,18): error TS2353: Object literal may only specify known properties, and '"dataBar"' does not exist in type 'VNodeProps & AllowedComponentProps & ComponentCustomProps & { value?: string | undefined; }'.
```

The generated code passes the attribute as `"dataBar": 'a'` in the object literal of the call to `Foo`. An attribute such as `pt-4` gives the same error with the name `pt4`.

## Expected

No diagnostic, as with `vue-tsc`. The type that `vue-tsc` checks for `Foo` ends with `& Record<string, unknown>`, which is the library's own `__VLS_PROPS_FALLBACK` term. The mapper accepts the same attribute when `vue` is in the same `node_modules` folder as `vize` (see Isolation).

`vue-tsc` reads the file. In `Probe.vue`, add `const bar: number = "baz";` to the script: both tools report TS2322 on it. Add `:baz="nope"` to the template: both tools report TS2339 for `nope`.

## Cause

The cause is confirmed by two runs in Isolation (the `vue` change and the declaration change). The source is read at the tag `v0.653.0` of `ubugeeei-prod/vize`.

`content_mapper_helper_capability` returns `None` when the `vue` that the project resolves is not the `vue` that `vize` resolves (`crates/vize/src/commands/content_mapper/project.rs:192-197`):

```rust
let same_vue = resolve_node_package(project_directory, "vue")
    .zip(resolve_node_package(helper_directory, "vue"))
    .is_some_and(|(project_vue, helper_vue)| project_vue == helper_vue);
if !same_vue {
    return None;
}
```

In the reproduction, `vue` is in the `node_modules` of `consumer` and `vize` is in the root `node_modules`, so the search from `vize` finds no `vue`. With `None`, `resolve_open_project` does not enable the shared virtual module (`project.rs:158-163`). Each generated file then embeds its helpers, with `emit_import_meta_augmentation` as the only global (`crates/vize_canon/src/virtual_ts/generator/preamble.rs:28-31`, `crates/vize_canon/src/virtual_ts/import_meta.rs:11-20`).

Only the shared header declares the fallback that `vue-tsc` declares (`crates/vize_canon/src/virtual_ts/helpers/declarations/shared-header.d.ts.txt:20-22`, and the same line in `npm/cli/virtual-ts-globals.d.ts:28`):

```ts
declare var __VLS_PROPS_FALLBACK: Record<string, unknown>;
```

`$PropChecker` returns a library function component unchanged, with none of the open tail that every other component gets (`crates/vize_canon/src/virtual_ts/scope/component_prop_checker/check_helpers.rs:233-236`):

```rust
"  type $IsLibraryGenericExport<C> = ... '__ctx' extends keyof __R ? true : false : false;\n"
...
$IsLibraryGenericExport<C> extends true ? C : (props: $ComponentCheckProps<P, T>) => void
```

So the library's own term `typeof globalThis extends { __VLS_PROPS_FALLBACK: infer P } ? P : {}` is `{}` in the embedded mode, and the call is closed. The fix is likely to declare `var __VLS_PROPS_FALLBACK: Record<string, unknown>` in the embedded preamble, as the shared header does, in the `declare global` block of `emit_import_meta_augmentation`.

## Real occurrence

https://github.com/Esposter/Esposter/blob/f67c89ea6421ef512da19a49a670746cb4be3b51/apps/web/app/components/Ui/Tree/Item.vue#L18

## Isolation

One change at a time from the reproduction. Errors on `vize` 0.650.0, `tsrs` and `vue-tsc`:

| Change                                                                                 | `tsrs` | `vue-tsc` |
| :------------------------------------------------------------------------------------- | -----: | --------: |
| None                                                                                   |      1 |         0 |
| `vue` is also in the root manifest, so `vize` and `vue` share one folder               |      0 |         0 |
| Same, and the library props have no `__VLS_PROPS_FALLBACK` term                        |      1 |         0 |
| `declare global { var __VLS_PROPS_FALLBACK: Record<string, unknown> }` in the consumer |      0 |         0 |
| The library props have no `__VLS_PROPS_FALLBACK` term                                  |      1 |         0 |
| The declaration is not generic (`value?: string`, no `<T>`)                            |      1 |         0 |
| The return type is `VNode`, with no `__ctx`                                            |      0 |         0 |
| The library exports `DefineComponent<{ value?: string }>`                              |      0 |         0 |
| A local `.vue` component with `defineProps<{ value?: string }>()`                      |      0 |         0 |
| The tag is dotted: `import * as Lib` and `<Lib.Foo>`                                   |      1 |         0 |
| The attribute is bound: `:data-bar="'a'"`                                              |      1 |         0 |
| The attribute is `pt-4`                                                                |      1 |         0 |
| `"vueCompilerOptions": { "checkUnknownProps": false }`                                 |      1 |         0 |
| `vize` 0.638.0                                                                         |      1 |         0 |
| `vize` 0.651.0                                                                         |      1 |         0 |

The real library `@vuetify/v0` 1.3.1 in place of `foo-lib`, with `<Treeview.Item :data-item-id="'a'" />`, gives 1 error in `tsrs` and 0 in `vue-tsc` in the workspace layout. The same file in a single project, where `vue` and `vize` share one `node_modules` folder, gives 0 and 0.

Three conditions must hold: a library component with `__ctx`, an undeclared attribute, and a project with the shared helpers off. A generic declaration, a dotted tag and a bound attribute are not needed. The `checkUnknownProps: false` option has no effect here because the fallback, not the option, opens the call.

The mapper generates the shared mode with `import type {} from "vize/virtual-ts"` and the embedded mode with inline helpers. The dump of `Probe.vue` shows the first with `vue` in the root manifest and the second with `vue` only in `app`.

## Not known

Versions older than 0.638.0 are not tested. The fix is read from the source and not applied. The run that removes the error declares the same variable in the project. That is the same declaration as the shared header.

Other differences between the embedded mode and the shared mode are not checked. The `None` result for a `vize` folder without `content-mapper-helpers.d.ts` is not tested. The TS2353 message names the first undeclared attribute of a call only, so the number of undeclared attributes in a real file is not known.

## Not a duplicate of

Searched open and closed issues and pull requests for `__VLS_PROPS_FALLBACK`, `checkUnknownProps`, TS2353 and the mapper's shared helpers. The search matches words, not meaning. The nearest are listed here. Each differs: none covers an undeclared attribute on a library component with the default option.

- #9103 (closed pull request): adds `__VLS_PROPS_FALLBACK` to the shared helpers for generic library children. It does not add it to the embedded helpers.
- #9383 and #10373 (closed): `checkUnknownProps: true` is ignored or reports intrinsic attributes, the opposite direction.
- #10406 (merged pull request): publishes the shared attribute helpers as a type-only subpath. It adds the condition that the project and the helper package resolve the same `vue`, which is the condition that fails here.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
