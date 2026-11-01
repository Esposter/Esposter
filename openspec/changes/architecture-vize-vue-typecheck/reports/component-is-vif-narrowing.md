# content-mapper: `<component :is="foo.bar" v-if="foo">` reports `possibly 'undefined'` because the generated type aliases sit outside the `v-if` guard

I was trying to adopt vize for Nuxt type checking and ran into this, among a few others.

A `<component>` whose `:is` reads a property of a value that `v-if` narrows gives TS18048. `vue-tsc` accepts the same file.

## Environment

`vize` 0.638.0, `tsrs` 0.20.1-ts7.1.0-beta (`--runExternalCode`), `vue` 3.5.44, Nuxt 5.0.0-2611010234-c709ec8, Node 26.13.0, Windows 11. Oracle: `vue-tsc` 3.3.11 with `typescript` 6.0.3, which checks the same Nuxt app with no error.

## Reproduction

`package.json` and `tsconfig.json` are the ones of the `defineModel` issue.

`src/Probe.vue`:

```vue
<script setup lang="ts">
const foo = undefined as { bar: string } | undefined;
</script>

<template>
  <component :is="foo.bar" v-if="foo" />
</template>
```

```sh
npm i && npx tsrs --runExternalCode --noEmit -p tsconfig.json
npx vue-tsc --noEmit -p tsconfig.json
```

## Actual

All four positions are in the generated code:

```
src/Probe.vue(68,35): error TS18048: 'foo' is possibly 'undefined'.
src/Probe.vue(68,185): error TS18048: 'foo' is possibly 'undefined'.
src/Probe.vue(68,275): error TS18048: 'foo' is possibly 'undefined'.
src/Probe.vue(69,39): error TS18048: 'foo' is possibly 'undefined'.
```

## Expected

No diagnostic, as with `vue-tsc`. `vue-tsc` reads the file: removing `v-if="foo"` gives TS18048 in both tools, at `Probe.vue(6,19)`.

## Cause

The mapper declares the type aliases of a `:is` member chain at the template root, outside the `v-if` guard. The guard wraps only the value call.

`:is="foo.bar"` is a static member chain, so the mapper keeps the name `foo.bar` and writes its aliases as `typeof foo.bar`. `generate_usage_declarations` writes them with no guard (`crates/vize_canon/src/virtual_ts/scope/component_props.rs:113`):

```rust
generate_usage_declarations(ts, mappings, ctx, &shared_contracts, idx, usage);
```

The guard is applied later, for the value call only (`crates/vize_canon/src/virtual_ts/expressions/generic_props_call.rs:55`):

```rust
if let Some(ref guard) = usage.vif_guard {
```

So `typeof foo.bar` is evaluated where `foo` is not narrowed.

The fix is likely to write the declarations of a usage that has a `vif_guard` inside that guard.

## Real occurrence

The shape in a real Nuxt app: [`RichTextEditor/Suggestions.vue` line 25](https://github.com/Esposter/Esposter/blob/49df4394844218f957290581ab2090a56f7a4f3d/apps/web/app/components/RichTextEditor/Suggestions.vue#L25) has `:is` reading `.component` of the value that its own `v-if` guards. `vue-tsc` accepts it.

## Not a duplicate of

Searched open and closed issues and pull requests for `v-if`, narrowing and dynamic components. The search matches words, not meaning. The nearest are #9360 (closed; `v-else` narrowing lost in a parent `v-if`), #1520 (closed; narrowing of a `v-for` source) and #10198 (closed; TS2304 on a `<component :is>` ref). The inputs differ.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
