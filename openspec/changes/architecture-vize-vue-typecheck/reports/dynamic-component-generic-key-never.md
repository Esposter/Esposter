# content-mapper: `<component :is="map[foo]" v-model>` with a generic-typed key fails the generated component check (TS2345 and TS2322)

I was trying to adopt vize for Nuxt type checking and ran into this, among a few others.

`<component :is="map[foo]" v-model="model" />` gives TS2345 on the props argument and TS2322 on the required slots when `foo` has a generic type. With a non-generic key the same file passes. `vue-tsc` accepts both.

## Environment

`vize` 0.638.0, `tsrs` 0.20.1-ts7.1.0-beta (`--runExternalCode`), `vue` 3.5.44, Nuxt 5.0.0-2611010234-c709ec8, Node 26.13.0, Windows 11. Oracle: `vue-tsc` 3.3.11 with `typescript` 6.0.3, which checks the same Nuxt app with no error.

## Reproduction

`package.json`:

```json
{
  "private": true,
  "type": "module",
  "devDependencies": {
    "tsrs": "0.20.1-ts7.1.0-beta",
    "typescript": "6.0.3",
    "vize": "0.638.0",
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

The mapper checks the props of `<component :is>` with a mapped type over the component's props. When the component type is an indexed access on a generic key, `keyof` of that props type is deferred and no object is assignable to it.

The generated code builds the check from the type of `map[foo]`:

```ts
  const __vize_dynamic_is_3 = (map[foo]);
  …
  (undefined as unknown as ____vize_dynamic_is_3_Check_0)({
    ...{} as { "onUpdate:modelValue": never },
    "modelValue": model,
  });
```

The `never` entry is not the defect. It is a witness that the mapper writes for each static listener, so that a required `onFoo` key is satisfied (`crates/vize_canon/src/virtual_ts/expressions/props_literal.rs:81-88`). It only appears in the message. The elaboration of the first error names the failing target:

```
Type '{ "onUpdate:modelValue": never; modelValue: string; }' is not assignable to type '{ readonly [K in keyof ____vize_dynamic_is_3_CheckProps_0]: ____vize_dynamic_is_3_CheckProps_0[K]; }'.
```

That type is `$ComponentCheckProps` (`crates/vize_canon/src/virtual_ts/scope/component_prop_checker/check_helpers.rs:181`):

```ts
type $ComponentCheckProps<P, T> = { readonly [K in keyof P]: P[K] } & T;
```

Plain TypeScript shows the same failure with only this shape:

```ts
type Raw<C> = C extends { raw: infer R } ? R : Record<string, unknown>;
type CheckProps<P, T> = { readonly [K in keyof P]: P[K] } & T;
declare function check<C>(component: C): (props: CheckProps<Raw<C>, {}>) => void;
type Entry = { raw: { modelValue: string } };
declare const map: { a: Entry; b: Entry };

declare const concrete: "a" | "b";
check(map[concrete])({ modelValue: "x" }); // no error

function generic<TKey extends "a" | "b">(key: TKey) {
  check(map[key])({ modelValue: "x" }); // TS2345: not assignable to '{ readonly [K in keyof Raw<…[TKey]>]: … }'
}
```

The second error, `{}` not assignable to `$RequiredSlots<$StructuralSlots<…>>` (`scope/component_slots.rs:62`), is a conditional type over the same deferred component type. It is likely the same kind of failure. I could not reproduce it outside vize with a faithful model.

The fix is likely to skip the mapped type and the slot check when the component type is not concrete, for example by checking against `P & T`, or by taking the loose path that already exists for `any`.

## Real occurrence

The shape in a real Nuxt app: [`User/ProfileCard/Row.vue` lines 26 to 32](https://github.com/Esposter/Esposter/blob/49df4394844218f957290581ab2090a56f7a4f3d/apps/web/app/components/User/ProfileCard/Row.vue#L26-L32) picks the component with `RowValueComponentMap[row.type]` in a generic component, with `v-model`. `vue-tsc` accepts it.

## Isolation

One change at a time from `src/Probe.vue`. Errors on `vize` 0.638.0, `tsrs` and `vue-tsc`:

| Change                                                        | `tsrs` | `vue-tsc` |
| :------------------------------------------------------------ | -----: | --------: |
| None                                                          |      2 |         0 |
| No `generic` attribute and `foo: "a" \| "b"` in `defineProps` |      0 |         0 |

## Not known

The second error is not reproduced outside vize. The fix is read from the source and not applied. Versions before 0.638.0 are not tested for this input.

## Not a duplicate of

Searched open and closed issues and pull requests for dynamic components and `never`. The search matches words, not meaning. The nearest are #10026 (closed) and #10048 (merged): a dynamic component union with an attribute and a listener gave `never` in the generated code. The input there is a non-generic union without `v-model`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
