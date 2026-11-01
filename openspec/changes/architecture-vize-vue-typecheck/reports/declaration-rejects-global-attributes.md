# check --declaration: the emitted component type rejects global HTML attributes (`id`, `role`) for a consumer checked by `vue-tsc`

I was trying to adopt vize for Nuxt type checking and ran into this, among a few others.

A `.vue.d.ts` written by `vize check --declaration` makes `vue-tsc` report TS2345 when a consumer passes `id` or `role` to the component. The declaration that `vue-tsc` writes for the same component accepts both.

## Environment

`vize` 0.638.0 with `tsrs` 0.20.1-ts7.1.0-beta, `vue` 3.5.44, Nuxt 5.0.0-2611010234-c709ec8, Node 26.13.0, Windows 11. Oracle: the declaration that `vue-tsc` 3.3.11 writes with `typescript` 6.0.3, consumed by the same `vue-tsc`.

## Reproduction

`package.json` and `tsconfig.json` are the ones of the `defineModel` issue, in two folders: `producer` and `consumer`.

`producer/src/Foo.vue`:

```vue
<script setup lang="ts">
defineProps<{ bar: number }>();
</script>

<template>
  <div />
</template>
```

`consumer/src/Probe.vue`:

```vue
<script setup lang="ts">
import Foo from "./vendor/Foo.vue";
</script>

<template>
  <Foo :bar="1" id="baz" />
</template>
```

```sh
cd producer && npx vize check --declaration --declaration-dir ../out src/Foo.vue
cp ../out/Foo.vue.d.ts ../out/__vize_helpers.d.ts ../consumer/src/vendor/
cd ../consumer && npx vue-tsc --noEmit -p tsconfig.json
```

## Actual

```
src/Probe.vue(6,4): error TS2345: Argument of type '{ bar: number; id: string; }' is not assignable to parameter of type '$AuthoredKeyWitness<{ bar: number; id: string; }> & Partial<Props> & … & Record<...>'.
  Property '__vizeInvalidComponentProps' is missing in type '{ bar: number; id: string; }' but required in type '{ readonly __vizeInvalidComponentProps: { readonly missing: never; readonly extra: "id"; }; }'.
```

## Expected

No diagnostic. The declaration that `vue-tsc --declaration --emitDeclarationOnly` writes for `Foo.vue` accepts `id` and `role`, and gives TS2322 for `bar="baz"` in both cases. `role="note"` gives the same error as `id`, and `class` and `aria-label` give none.

## Cause

The cause is likely: the emitted constructor carries a guard that treats every key outside the props and emits as extra. The mapper adds the global HTML attributes in its own check path, and the declaration does not. The source was read; no run has confirmed it.

The emitted type is `new <$AuthoredProps = unknown>(props?: $AuthoredProps & $ComponentInput<…>, …) => … $ReplaceComponentProps<…, $ComponentInputGuard<Props, __EmitProps<Emits>, $AuthoredProps>>` (`crates/vize_canon/src/virtual_ts/generator/component_constructors.rs:172`). The guard computes the extra keys against the declared props and emits only (`npm/cli/virtual-ts-globals.d.ts:230-239`):

```ts
K extends keyof Authored = Exclude<keyof Authored, keyof Allowed>,
```

and requires a missing property when any exist (`virtual-ts-globals.d.ts:251-259`):

```ts
readonly __vizeInvalidComponentProps: {
```

`id` is not in `Allowed`, so it is extra. In the mapper's own check, `$ComponentCheckTail` adds the global attributes first (`crates/vize_canon/src/virtual_ts/scope/component_prop_checker/check_helpers.rs:173`, `$ComponentGlobalHtmlAttrs`). A consumer of the `.d.ts` has no such tail.

The declaration of a generic component already intersects `__VizeComponentGlobalHtmlAttrs` (#5799 and #9104). The fix is likely to do the same for a component that is not generic, in the guard of the emitted constructor.

## Real occurrence

The shape in real code: [`Cooking/Screen/Index.vue` line 103](https://github.com/Esposter/Esposter/blob/49df4394844218f957290581ab2090a56f7a4f3d/packages/genshin-world/src/components/Cooking/Screen/Index.vue#L103) passes `role`, `aria-modal` and `aria-label` to a component from a sibling package. With the declarations of the sibling built by `vue-tsc`, `vue-tsc` accepts it.

## Not a duplicate of

Searched open and closed issues and pull requests for `--declaration`, `$AuthoredKeyWitness`, `__vizeInvalidComponentProps` and declaration attributes. The search matches words, not meaning. The nearest are #5799 and #9104 (both merged): they accept the global HTML attributes in the declarations of generic components. The component here is not generic. #3984 (open) tracks correct declaration emit in general and does not name this input.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
