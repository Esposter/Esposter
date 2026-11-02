# content-mapper: `<component :is="map[foo]">` with a generic key still fails the generated component check (TS2345 and TS2322) when `map` holds different components

I was trying to adopt vize for Nuxt type checking and ran into this, among a few others.

This is one of a batch of issues filed together, all from that attempt:

<batch list filled in when filed>

`<component :is="map[foo]" />` gives TS2345 on the props argument and TS2322 on the required slots when `foo` has a generic type and the entries of `map` are different components. `vue-tsc` accepts the same file.

The issue #11366 reported the same two errors for a map that holds one component twice. The input of #11366 fails on 0.638.0 and passes on 0.649.0, 0.650.0 and 0.651.0. This input fails on all of them. A key that is a member expression, such as `foo.type`, also fails when the map holds one component twice.

## Environment

`vize` 0.650.0, `tsrs` 0.20.1-ts7.1.0-beta (`--runExternalCode`), `vue` 3.5.44, Nuxt 5.0.0-2611010234-c709ec8, Node 26.13.0, Linux for the reduction and Windows 11 for the Nuxt app. Oracle: `vue-tsc` 3.3.11 with `typescript` 6.0.3, which checks the same Nuxt app with no error.

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

`src/Bar.vue` and `src/Baz.vue` have the same content:

```vue
<template>
  <div />
</template>
```

`src/Probe.vue`:

```vue
<script setup lang="ts" generic="TFoo extends 'a' | 'b'">
import Bar from "./Bar.vue";
import Baz from "./Baz.vue";

const { foo } = defineProps<{ foo: TFoo }>();
const map = { a: Bar, b: Baz };
</script>

<template>
  <component :is="map[foo]" />
</template>
```

```sh
npm i && npx tsrs --runExternalCode --noEmit -p tsconfig.json
npx vue-tsc --noEmit -p tsconfig.json
```

## Actual

Both positions are the `<component>` tag in the source. The type text is cut by `tsrs`:

```
src/Probe.vue(10,4): error TS2345: Argument of type '{}' is not assignable to parameter of type '$ComponentCheckProps<____vize_dynamic_is_3_CheckProps_0, ____vize_dynamic_is_3_CheckTail_0>'.
  Type '{}' is not assignable to type '{ readonly [K in keyof ____vize_dynamic_is_3_CheckProps_0]: ____vize_dynamic_is_3_CheckProps_0[K]; }'.
src/Probe.vue(10,4): error TS2322: Type '{}' is not assignable to type '$RequiredSlots<$StructuralSlots<{ a: { readonly __vizeComponentMarker: true; readonly __vizeRawProps?: Props | undefined; readonly __vizeNativeFallthroughRoot: true; readonly __vizeHasFallthroughProps: true; readonly __vizeFallthroughProps?: ... | undefined; } & $ComponentConstructor & $VueComponentOptions; b: ... &...'.
```

## Expected

No diagnostic, as with `vue-tsc`. `vue-tsc` reads the file: adding `const qux: number = "baz";` after `const map` gives TS2322 at `src/Probe.vue(7,7)` in both tools.

## Cause

The cause is that the mapper writes the alias of the `:is` expression with no type annotation. The alias then has the deferred type `{ a: …; b: … }[TFoo]`, and the check helpers cannot resolve it (see #11366). The source is read at the tag `v0.650.0` of `ubugeeei-prod/vize`.

The generated code for the reproduction is:

```ts
// @ts-ignore Inference-only alias; the authored v-bind statement owns diagnostics.
const __vize_dynamic_is_3 = map[foo];
```

The code that writes the alias adds an annotation only when `homogeneous_index::value` returns a value (`crates/vize_canon/src/virtual_ts/scope/dynamic_component.rs:84-86`):

```rust
let annotation = homogeneous_index::value(summary, root, &usage)
    .map(|value| vize_carton::cstr!(": {value}"))
    .unwrap_or_default();
```

That function returns nothing in two cases that the reproduction and the real file hit. First, the key must be a bare identifier (`crates/vize_canon/src/virtual_ts/scope/dynamic_component/homogeneous_index.rs:21-25`):

```rust
let (Expression::Identifier(object), Expression::Identifier(_key)) =
    (&member.object, &member.expression)
```

So `map[foo.type]` and `map[props.foo]` get no annotation. Second, every entry must be the same import (`crates/vize_croquis/src/script_parser/value_binding_origins/homogeneous.rs:170`):

```rust
if selected_key.is_some_and(|key| key != canonical) {
    return None;
}
```

So `{ a: Bar, b: Baz }` gets no annotation. The same function requires `value.import` for each entry (`homogeneous.rs:26`). An entry that is a string or a `defineAsyncComponent(…)` call likely never qualifies, even when all entries are equal.

A run confirms the missing annotation. I saved the generated code of `Probe.vue` as a `.ts` file next to the components. I changed the alias line to:

```ts
const __vize_dynamic_is_3: (typeof map)[keyof typeof map] = map[foo];
```

`tsrs` then reports no error for that file. The unchanged copy reports the same two errors as `Probe.vue`.

The fix is likely to annotate the alias with the union of the entry types, `(typeof map)[keyof typeof map]`, when no single entry type is proven. A second change is to accept a member expression as the key.

## Real occurrence

The shape in a real Nuxt app: [`User/ProfileCard/Row.vue` line 27](https://github.com/Esposter/Esposter/blob/f67c89ea6421ef512da19a49a670746cb4be3b51/apps/web/app/components/User/ProfileCard/Row.vue#L27) has `:is="RowValueComponentMap[row.type]"` in a component with `generic="TType extends RowValueType"`. The map holds three different components, and `row.type` is a member expression. `vue-tsc` accepts it.

## Isolation

One change at a time from `src/Probe.vue`. Errors on `vize` 0.650.0, `tsrs` and `vue-tsc`:

| Change                                                                              | `tsrs` | `vue-tsc` |
| :---------------------------------------------------------------------------------- | -----: | --------: |
| None                                                                                |      2 |         0 |
| `const map = { a: Bar, b: Bar }` (one import twice, the input of #11366)            |      0 |         0 |
| `const map = { a: Bar, b: Bar }` and key `foo.type` with `foo: { type: TFoo }`      |      2 |         0 |
| `const map = { a: Bar, b: Baz }` and key `foo.type` with `foo: { type: TFoo }`      |      2 |         0 |
| Not generic: `foo: "a" \| "b"` without `generic`                                    |      0 |         0 |
| Constant key: `map["a"]`                                                            |      0 |         0 |
| `generic="TFoo extends 'a'"` and `const map = { a: Bar }`                           |      0 |         0 |
| A ternary in place of the map: `:is="foo === 'a' ? Bar : Baz"`                      |      0 |         0 |
| Each component has `defineModel<string>()`, and `<component>` has `v-model`         |      2 |         0 |
| `const map = { a: "div", b: "span" } as const`                                      |      2 |         0 |
| Each entry is `defineAsyncComponent(() => import("./Bar.vue"))` or `…("./Baz.vue")` |      2 |         0 |
| `const map = { a: Qux, b: Qux }` with `const Qux = defineAsyncComponent(…)`         |      2 |         0 |

The trigger is a generic key together with either of two conditions. One condition is entries that are not one imported component. The other is a key that is not a bare identifier. `v-model` and props are not part of the trigger.

## Not known

`vize` 0.638.0, 0.642.0, 0.646.0, 0.649.0 and 0.651.0 give the same two errors for `Probe.vue`, so the input is not a regression. The fix is read from the source and checked only in the generated code. It is not applied to the mapper. The effect of the union annotation on a key that selects fewer entries than the map holds is not checked.

## Not a duplicate of

Searched open and closed issues and pull requests for `component :is`, generic key, `ComponentCheckProps`, `RequiredSlots` and `homogeneous`. The search matches words, not meaning. The nearest are #11366 (closed; one component twice and a bare identifier key, fixed before 0.649.0) and #11382 (merged; it adds the annotation only for equal imports and a bare identifier key). Both leave the inputs above unchanged. Also #10272 (closed; the union of a dynamic template ref target) and #10048 (closed; listener inference for a union of dynamic components). Neither changes the type of an indexed `:is` expression.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
