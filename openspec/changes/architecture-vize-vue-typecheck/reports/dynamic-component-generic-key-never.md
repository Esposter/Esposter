# content-mapper: a `<component :is>` picked from a map by a generic-typed key gets `never` for `onUpdate:modelValue` and an empty required-slots object

I was trying to adopt vize for Nuxt type checking and ran into this, among a few others.

`<component :is="map[foo]" v-model="model" />` gives TS2345 and TS2322 when `foo` has a generic type. With a non-generic key the same file passes. `vue-tsc` accepts both.

## Environment

`vize` 0.638.0, `tsrs` 0.20.1-ts7.1.0-beta (`--runExternalCode`), `vue` 3.5.44, Nuxt 5.0.0-2611010234-c709ec8, Node 26.13.0, Windows 11. Oracle: `vue-tsc` 3.3.11 with `typescript` 6.0.3, which checks the same Nuxt app with no error.

## Reproduction

`package.json` and `tsconfig.json` are the ones of the `defineModel` issue.

`src/Child.vue`:

```vue
<script setup lang="ts">
const model = defineModel<string>({ required: true });
</script>

<template>
  <div>{{ model }}</div>
</template>
```

`src/Probe.vue`:

```vue
<script setup lang="ts" generic="TKey extends 'a' | 'b'">
import Child from "./Child.vue";

const { foo } = defineProps<{ foo: TKey }>();
const map = { a: Child, b: Child };
const model = defineModel<string>({ required: true });
</script>

<template>
  <component :is="map[foo]" v-model="model" />
</template>
```

```sh
npm i && npx tsrs --runExternalCode --noEmit -p tsconfig.json
npx vue-tsc --noEmit -p tsconfig.json
```

## Actual

Both positions are in the generated code. The type text is cut:

```
src/Probe.vue(10,4): error TS2345: Argument of type '{ "onUpdate:modelValue": never; modelValue: string; }' is not assignable to parameter of type '$ComponentCheckProps<____vize_dynamic_is_3_CheckProps_0, ____vize_dynamic_is_3_CheckTail_0>'.
src/Probe.vue(10,4): error TS2322: Type '{}' is not assignable to type '$RequiredSlots<$StructuralSlots<{ a: …
```

## Expected

No diagnostic, as with `vue-tsc`. `vue-tsc` reads the file: `defineModel<number>` in `Probe.vue` gives TS2322 in `vue-tsc`. `tsrs` reports only its two errors for that file.

## Cause

The cause is not known. The generated code shows where the types go wrong. The component expression is `map[foo]`, an indexed access on a generic key that TypeScript cannot resolve, and the mapper builds its check types from it:

```ts
  const __vize_dynamic_is_3 = (map[foo]);
  …
  (undefined as unknown as ____vize_dynamic_is_3_Check_0)({
    ...{} as { "onUpdate:modelValue": never },
    "modelValue": model,
  });
  const __vize_required_slots_0: import("vize:virtual-ts").$RequiredSlots<$SlotContract_0, {}> = {};
```

The helper `$EmitListeners<____vize_dynamic_is_3_Component_0>` and `$StructuralSlots<typeof __vize_dynamic_is_3>` are conditional types over the deferred component type. They likely resolve to `never` and to a non-empty slot contract. I did not find the line that writes `"onUpdate:modelValue": never`.

## Real occurrence

The shape in a real Nuxt app: [`User/ProfileCard/Row.vue` lines 26 to 32](https://github.com/Esposter/Esposter/blob/49df4394844218f957290581ab2090a56f7a4f3d/apps/web/app/components/User/ProfileCard/Row.vue#L26-L32) picks the component with `RowValueComponentMap[row.type]` in a generic component, with `v-model`. `vue-tsc` accepts it.

## Isolation

One change at a time from `src/Probe.vue`. Errors on `vize` 0.638.0, `tsrs` and `vue-tsc`:

| Change                                                        | `tsrs` | `vue-tsc` |
| :------------------------------------------------------------ | -----: | --------: |
| None                                                          |      2 |         0 |
| No `generic` attribute and `foo: "a" \| "b"` in `defineProps` |      0 |         0 |

## Not a duplicate of

Searched open and closed issues and pull requests for dynamic components and `never`. The search matches words, not meaning. The nearest are #10026 (closed) and #10048 (merged): a dynamic component union with an attribute and a listener gave `never` in the generated code. The input there is a non-generic union without `v-model`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
