# check --declaration: the emitted component type still refuses undeclared attributes when the component has an emit or two required props (#11364 closed, reduction too narrow)

I was trying to adopt vize for Nuxt type checking and ran into this, among a few others.

#11364 reported that a `.vue.d.ts` written by `vize check --declaration` makes `vue-tsc` report TS2345 for an attribute that the component does not declare, for example `disabled`. The issue is closed, but the bug is not fixed on 0.650.0. The reduction in #11364 (one required prop, no emits) already passes on every release I tried, so the closing change could not show the bug. A component with one emit, or with two required props, still fails.

This is one of a batch of issues filed together, all from that attempt:

<batch list filled in when filed>

## Environment

`vize` 0.650.0 with `tsrs` 0.20.1-ts7.1.0-beta, `vue` 3.5.44, the repository's pinned Node, Linux. Oracle: the declaration that `vue-tsc` 3.3.11 writes with `typescript` 6.0.3, consumed by the same `vue-tsc`.

## Reproduction

`package.json` and `tsconfig.json` are in two folders, `producer` and `consumer`.

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

`producer/src/Foo.vue`:

```vue
<script setup lang="ts">
defineProps<{ bar: number }>();
defineEmits<{ change: [] }>();
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
mkdir -p ../consumer/src/vendor
cp ../out/Foo.vue.d.ts ../out/__vize_helpers.d.ts ../consumer/src/vendor/
cd ../consumer && npx vue-tsc --noEmit -p tsconfig.json
```

## Actual

```
src/Probe.vue(6,4): error TS2345: Argument of type '{ bar: number; disabled: boolean; }' is not assignable to parameter of type '$AuthoredKeyWitness<{ bar: number; disabled: boolean; }> & Partial<Props> & Partial<$KebabProps<Props>> & ... 9 more ... & Record<...>'.
  Property '__vizeInvalidComponentProps' is missing in type '{ bar: number; disabled: boolean; }' but required in type '{ readonly __vizeInvalidComponentProps: { readonly missing: never; readonly extra: "disabled"; }; }'.
```

## Expected

No diagnostic. The declaration that `vue-tsc --declaration --emitDeclarationOnly --rootDir src` writes for the same `Foo.vue` accepts `disabled`, and gives TS2322 for `bar="baz"`. The `vize` declaration also gives TS2322 for `bar="baz"`, so the type still checks declared props. `tsrs` with the mapper reports nothing for the consumer of the `vize` declaration, so only a `vue-tsc` consumer sees the error.

## Cause

The cause is likely the guard in the emitted constructor. It treats every key outside the declared props and emits as extra, and Vue lets undeclared attributes fall through to the root element. The emitted type is `new <$AuthoredProps = unknown>(props?: $AuthoredProps & $ComponentInput<…>, …) => … $ComponentInputGuard<Props, __EmitProps<Emits>, $AuthoredProps>` (`crates/vize_canon/src/virtual_ts/generator/component_constructors.rs`). The guard computes the extra keys against the declared props and emits only (`npm/cli/virtual-ts-globals.d.ts`, shipped as `virtual-ts-globals.d.ts` in the 0.650.0 package, lines 235 to 256):

```ts
K extends keyof Authored = Exclude<keyof Authored, keyof Allowed>,
```

and requires a property that no caller can give when a key remains:

```ts
readonly __vizeInvalidComponentProps: {
```

The shipped helper has a rule, `$RelaxedDynamicUnionExtra` (line 217), that the guard reads. It appears to let the extra key pass for a component with one required prop and no emits, which would explain why the reduction in #11364 passes, and not to apply when the component has an emit or a second required prop. That reading comes from the Isolation table and not from a trace of the type. The emitted `Foo.vue.d.ts` of 0.638.0 and 0.650.0 is byte-identical for the producer above.

In the mapper's own check, `$ComponentCheckTail` adds the global HTML attributes first (`crates/vize_canon/src/virtual_ts/scope/component_prop_checker/check_helpers.rs`). A consumer of the `.d.ts` has no such tail.

The fix is likely to drop the extra-key half of the guard from the declaration, or to allow fallthrough keys: pass `$ComponentInputProps<T, Declared> & Record<string, unknown>` as `Allowed` to `$ComponentInputGuardFor`. That edit, made in the emitted `__vize_helpers.d.ts` on 0.638.0, cleared the errors for a consumer of 57 components. It was not applied to 0.650.0.

## Real occurrence

The shape in real code: [`Domain/Screen/Row/Index.vue` lines 33 to 37](https://github.com/Esposter/Esposter/blob/f67c89ea6421ef512da19a49a670746cb4be3b51/packages/genshin-world/src/components/Domain/Screen/Row/Index.vue#L33-L37) passes `:disabled` and `@click` to a component from a sibling package whose root is a `<button>`. With the declarations of the sibling built by `vue-tsc`, `vue-tsc` accepts it. With the `vize` declarations of all components of that package, `vue-tsc` reports many errors of this one shape and the mapper reports none.

## Isolation

One change at a time from `producer/src/Foo.vue`. Errors for the `vue-tsc` consumer, `vize` 0.650.0:

| Producer                                            | Consumer passes              | `vue-tsc` errors |
| :-------------------------------------------------- | :--------------------------- | ---------------: |
| `bar: number`, `change` emit                        | `:bar="1" disabled`          |                1 |
| `bar: number`, no emits                             | `:bar="1" disabled`          |                0 |
| `bar: number; baz: number`, no emits                | `:bar="1" :baz="2" disabled` |                1 |
| `bar: number`, `change` emit, `vue-tsc` declaration | `:bar="1" disabled`          |                0 |
| `bar: number`, `change` emit                        | `bar="baz"` (real error)     |       1 (TS2322) |

The first row gives the same error on `vize` 0.652.0, the newest release at the time of writing.

## Not known

Releases between 0.638.0 and 0.650.0 other than the two ends are not tested for the emit variant. A component with a different mix of props, emits and slots may fall under `$RelaxedDynamicUnionExtra` and pass. The edit above is read and tested on 0.638.0 only.

## Not a duplicate of

#11364 (closed) is the report of the same bug with a reduction that does not fail. The nearest other issues are #5799 and #9104 (closed; the declaration of a generic component intersects the global HTML attributes), which the declaration of a component that is not generic lacks.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
