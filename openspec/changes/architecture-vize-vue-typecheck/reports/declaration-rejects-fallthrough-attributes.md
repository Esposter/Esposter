# check --declaration: the emitted component type refuses attributes that are not declared and fall through to the root element

I was trying to adopt vize for Nuxt type checking and ran into this, among a few others.

A `.vue.d.ts` written by `vize check --declaration` makes `vue-tsc` report TS2345 for any attribute that the component does not declare, for example `disabled`. The declaration that `vue-tsc` writes for the same component accepts them. This is the common way to use a component whose root is a native element.

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
  <Foo :bar="1" disabled />
</template>
```

```sh
cd producer && npx vize check --declaration --declaration-dir ../out src/Foo.vue
cp ../out/Foo.vue.d.ts ../out/__vize_helpers.d.ts ../consumer/src/vendor/
cd ../consumer && npx vue-tsc --noEmit -p tsconfig.json
```

## Actual

```
src/Probe.vue(6,4): error TS2345: Argument of type '{ bar: number; disabled: boolean; }' is not assignable to parameter of type '$AuthoredKeyWitness<{ bar: number; disabled: boolean; }> & Partial<Props> & … & Record<...>'.
  Property '__vizeInvalidComponentProps' is missing in type '{ bar: number; disabled: boolean; }' but required in type '{ readonly __vizeInvalidComponentProps: { readonly missing: never; readonly extra: "disabled"; }; }'.
```

## Expected

No diagnostic. The declaration that `vue-tsc --declaration --emitDeclarationOnly` writes for `Foo.vue` accepts `disabled`, `id`, `role`, `onClick="x"` and `unknown-thing="x"`, and gives TS2322 for `bar="baz"`. With the `vize` declaration, `class`, `aria-label` and `@click` also give no error, and the others do.

## Cause

The emitted constructor carries a guard that treats every key outside the props and emits as extra, and Vue lets undeclared attributes fall through to the root element.

The emitted type is `new <$AuthoredProps = unknown>(props?: $AuthoredProps & $ComponentInput<…>, …) => … $ReplaceComponentProps<…, $ComponentInputGuard<Props, __EmitProps<Emits>, $AuthoredProps>>` (`crates/vize_canon/src/virtual_ts/generator/component_constructors.rs:172`). The guard computes the extra keys against the declared props and emits only (`npm/cli/virtual-ts-globals.d.ts:230-239`):

```ts
K extends keyof Authored = Exclude<keyof Authored, keyof Allowed>,
```

and requires a property that no caller can give when any key remains (`virtual-ts-globals.d.ts:251-259`):

```ts
readonly __vizeInvalidComponentProps: {
```

In the mapper's own check, `$ComponentCheckTail` adds the global HTML attributes first (`crates/vize_canon/src/virtual_ts/scope/component_prop_checker/check_helpers.rs:173`, `$ComponentGlobalHtmlAttrs`). A consumer of the `.d.ts` has no such tail.

One edit confirms the cause. In the emitted `__vize_helpers.d.ts`, the line that passes `$ComponentInputProps<T, Declared>` as `Allowed` to `$ComponentInputGuardFor` was changed to pass `$ComponentInputProps<T, Declared> & Record<string, unknown>`. After that, `vue-tsc` and the mapper report no error for a consumer of 57 components. Allowing only `import("vue").HTMLAttributes` is not enough: it removes the errors for `id`, `role` and `onClick`, and `disabled` still fails because it belongs to the button element.

The declaration of a generic component already intersects `__VizeComponentGlobalHtmlAttrs` (#5799 and #9104). The fix is likely to drop the extra-key half of the guard from the declaration, or to allow fallthrough keys as above.

## Real occurrence

The shape in real code: [`Domain/Screen/Row/Index.vue` lines 33 to 37](https://github.com/Esposter/Esposter/blob/49df4394844218f957290581ab2090a56f7a4f3d/packages/genshin-world/src/components/Domain/Screen/Row/Index.vue#L33-L37) passes `:disabled` and `@click` to a component from a sibling package whose root is a `<button>`. With the declarations of the sibling built by `vue-tsc`, `vue-tsc` accepts it. With the `vize` declarations of all 57 components of that package, `vue-tsc` reports 51 errors of this one shape, and the mapper reports none.

## Not known

Versions before 0.638.0 are not tested for this input. The one-line edit that removes the errors was applied to the emitted helper and not to the source.

## Not a duplicate of

Searched open and closed issues and pull requests for `--declaration`, `$AuthoredKeyWitness`, `__vizeInvalidComponentProps` and declaration attributes. The search matches words, not meaning. The nearest are #5799 and #9104 (both merged): they accept the global HTML attributes in the declarations of generic components. The component here is not generic, and the refused attribute is not a global one. #3984 (open) tracks correct declaration emit in general and does not name this input.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
