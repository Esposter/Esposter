# content-mapper: a generic component with `inheritAttrs: false` rejects an attribute it does not declare (TS2353), and `checkUnknownProps: false` has no effect

I was trying to adopt vize for Nuxt type checking and ran into this, among a few others.

A generic component that sets `defineOptions({ inheritAttrs: false })` makes the mapper report TS2353 for any undeclared attribute written as a plain name, for example `p0`. `vue-tsc` accepts the same file unless `strictTemplates` is on. A component that is not generic accepts the attribute with the same option. Forwarding the attributes with `v-bind="$attrs"` opens the type, and forwarding them through `mergeProps(x, $attrs)` does not.

This is one of a batch of issues filed together, all from that attempt:

<batch list filled in when filed>

## Environment

`vize` 0.650.0, `tsrs` 0.20.1-ts7.1.0-beta (`--runExternalCode`), `vue` 3.5.44, the repository's pinned Node, Linux. Oracle: `vue-tsc` 3.3.11 with `typescript` 6.0.3, which reports nothing for the file.

## Reproduction

`package.json`:

```json
{
  "private": true,
  "type": "module",
  "devDependencies": {
    "tsrs": "0.20.1-ts7.1.0-beta",
    "typescript": "6.0.3",
    "vize": "0.650.0",
    "vue": "3.5.44",
    "vue-tsc": "3.3.11"
  }
}
```

`tsconfig.json`:

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

`src/Foo.vue`:

```vue
<script setup lang="ts" generic="T extends string">
defineOptions({ inheritAttrs: false });
defineProps<{ bar: T }>();
</script>

<template>
  <div />
</template>
```

`src/Probe.vue`:

```vue
<script setup lang="ts">
import Foo from "./Foo.vue";
</script>

<template>
  <Foo bar="a" p0 />
</template>
```

```sh
npm i && npx tsrs --runExternalCode --noEmit -p tsconfig.json
npx vue-tsc --noEmit -p tsconfig.json
```

## Actual

`tsrs` reports one error at the attribute:

```
src/Probe.vue(6,16): error TS2353: Object literal may only specify known properties, and '"p0"' does not exist in type '$SetupProps & VNodeProps & AllowedComponentProps & ComponentCustomProps & { abbr?: unknown; about?: unknown; "accent-height"?: unknown; ... 679 more ...; zoomAndPan?: unknown; } & ...'.
```

## Expected

No diagnostic, as with `vue-tsc`. `vue-tsc` reads the file: `<Foo :bar="1" />` gives TS2322 in both tools. With `"vueCompilerOptions": { "strictTemplates": true }`, `vue-tsc` also reports TS2353 for `p0`, so the mapper behaves as if that option were always on for this input. Setting `"vueCompilerOptions": { "checkUnknownProps": false }` does not change the mapper's result.

## Cause

The cause is likely: the generated default export has no fallthrough surface for this component, so the props type is closed. Forwarding with `v-bind="$attrs"` or `{ ...$attrs }` opens it, and forwarding through a call such as `mergeProps(x, $attrs)` does not.

With `inheritAttrs: false`, `fallthrough_targets` returns only the targets of an explicit `v-bind="$attrs"` (`crates/vize_canon/src/virtual_ts/generator/fallthrough/types.rs:76-80`):

```rust
if summary.template_info.inherit_attrs_disabled {
    return explicit_attrs_targets(template_ast);
}
```

The template of `Foo.vue` has no such forwarding, and `explicit_attrs_targets` does not look inside a call that takes `$attrs`, so the result is `None`, and `fallthrough_props_type_ref` returns `None` (`types.rs:99-108`). The generator passes that value to `emit_default_export_declaration` (`crates/vize_canon/src/virtual_ts/generator.rs:849`). A component that is not generic with the same option is accepted, so another path handles it. That path is not traced.

The fix is likely to treat `$attrs` inside a call argument as forwarding, and to leave the props open, as `checkUnknownProps: false` asks, when `inheritAttrs` is `false` and no `$attrs` target is found.

## Real occurrence

The shape in a real Nuxt app: [`App/Dock/CommandMenu.vue` line 35](https://github.com/Esposter/Esposter/blob/f67c89ea6421ef512da19a49a670746cb4be3b51/apps/web/app/components/App/Dock/CommandMenu.vue#L35) passes `p-0` to a generic menu component that sets `inheritAttrs: false` and forwards the attributes with `:="mergeProps(activatorProps, $attrs)"` ([`Ui/Menu/Index.vue` line 47](https://github.com/Esposter/Esposter/blob/f67c89ea6421ef512da19a49a670746cb4be3b51/apps/web/app/components/Ui/Menu/Index.vue#L47)). `vue-tsc` accepts it. The same shape gives the same error in several other call sites.

## Isolation

One change at a time from `src/Probe.vue` and `src/Foo.vue`. Errors on `vize` 0.650.0, `tsrs` and `vue-tsc`:

| Change                                                    | `tsrs` | `vue-tsc` |
| :-------------------------------------------------------- | -----: | --------: |
| None                                                      |      1 |         0 |
| Remove `defineOptions({ inheritAttrs: false })`           |      0 |         0 |
| Remove `generic="T extends string"` and use `bar: string` |      0 |         0 |
| Add `v-bind="$attrs"` to the root `<div>`                 |      0 |         0 |
| Add `v-bind="{ ...$attrs }"` to the root `<div>`          |      0 |         0 |
| Add `v-bind="mergeProps({}, $attrs)"` to the root `<div>` |      1 |         0 |
| Write `data-x="1"` in place of `p0`                       |      0 |         0 |
| `vueCompilerOptions.checkUnknownProps` is `false`         |      1 |         0 |
| Write `:bar="1"` in place of `p0` (real error)            |      1 |         1 |

`vize` 0.638.0 gives the same result as the first row.

## Not known

Why the same file without `generic` is accepted is not traced. The call sites in the real app that pass a name such as `p0`, `px0` or `shrink0` to a component of this kind all report it; that count is not checked against every such component. Releases before 0.638.0 are not tested.

## Not a duplicate of

Searched open and closed issues and pull requests for `inheritAttrs`, `checkUnknownProps`, TS2353 and `generic`. The nearest are #7874 (closed; `checkUnknownProps` is ignored on 0.432.0, for a component that is not generic and has no `inheritAttrs`), #10363 (closed; intrinsic HTML attribute names assigned `never`) and #8075 (closed; opt-in strict component attributes). The inputs differ: this one needs `generic` with `inheritAttrs: false`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
