# content-mapper: a component that declares an event in both camelCase and kebab-case gives TS2345 on a listener of that event (`[value: number] & [value: number]`)

I was trying to adopt vize for Nuxt type checking and ran into this, among a few others.

This is one of a batch of issues filed together, all from that attempt:

<batch list filled in when filed>

A component that declares both `barBaz` and `bar-baz` gives TS2345 on a listener for either name. `vue-tsc` accepts the same file. `@vuetify/v0` declares both `update:modelValue` and `update:model-value` on `Slider.Root`, so `<Slider.Root :model-value="1" @update:model-value="…">` gives the same error.

## Environment

`vize` 0.650.0, `tsrs` 0.20.1-ts7.1.0-beta (`--runExternalCode`), `vue` 3.5.44, Linux x64, Node 26.13.0. Oracle: `vue-tsc` 3.3.11 with `typescript` 6.0.3, which checks the same Nuxt app with no error.

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
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

`src/Foo.vue`:

```vue
<script setup lang="ts">
defineEmits<{ barBaz: [value: number]; "bar-baz": [value: number] }>();
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
  <Foo @bar-baz="(value) => value.toFixed()" />
</template>
```

```sh
npm i && npx tsrs --runExternalCode --noEmit -p tsconfig.json
npx vue-tsc --noEmit -p tsconfig.json
```

## Actual

`tsrs` reports one error. The position is in the generated code, which has no place in the source file. The statement at that position is `(__vize_handler_7_18 as __Foo_7_bar_baz_listener)(...__vize_args);`.

```
src/Probe.vue(81,102): error TS2345: Argument of type 'number[]' is not assignable to parameter of type '[value: number] & [value: number]'.
  Type 'number[]' is not assignable to type '[value: number]'.
    Target requires 1 element(s) but source may have fewer.
```

## Expected

No diagnostic, as with `vue-tsc`. `vue-tsc` reads the file: `value.nope()` in place of `value.toFixed()` gives TS2339 in both tools, on type `number`. `tsrs` then reports the TS2345 error as well.

## Cause

The cause is `__EmitProps`: it maps two events to one handler key. The source is read at the tag `v0.650.0` of `ubugeeei-prod/vize`.

`crates/vize_canon/src/virtual_ts/helpers/declarations/shared-emit-props.d.ts.txt:2` (shipped as `npm/cli/virtual-ts.d.ts:92-96`):

```ts
[K in keyof __EmitOptions<T> & string as $HandlerKey<K> | `on${Capitalize<K>}`]?: __EmitOptions<T>[K]
```

`$HandlerKey<K>` camelizes the event name (`crates/vize_canon/src/virtual_ts/helpers/declarations/emit-overloads.d.ts.txt:9`). For `bar-baz` it gives `onBarBaz`. The event `barBaz` also gives `onBarBaz`. The mapped type writes both into one property. The property type is the union of two function types. Each function type has its own labeled tuple `[value: number]`.

The listener type reads the parameters of that property with `infer __A`. The result is the intersection `[value: number] & [value: number]`. The generated call spreads `...__vize_args` and the argument type is `number[]`.

Two checks confirm the cause. Tuples without labels, or one shared type alias for both events, give one type and no error (see Isolation). A patch to a copy of the installed `virtual-ts.d.mts` removes the error for the reproduction and for `Slider.Root`. The patch drops the camelized key when an event with that exact name exists:

```ts
as ($HandlerKey<K> extends `on${Capitalize<keyof __EmitOptions<T> & string>}` ? never : $HandlerKey<K>) | `on${Capitalize<K>}`
```

The fix is likely to emit the camelized key only when no event with that exact camelCase name exists.

## Real occurrence

The shape in a real Nuxt app: [`Ui/Slider.vue` line 41](https://github.com/Esposter/Esposter/blob/f67c89ea6421ef512da19a49a670746cb4be3b51/apps/web/app/components/Ui/Slider.vue#L41) has `@update:model-value` on the `Slider.Root` component of `@vuetify/v0` next to a bound `:model-value`. `vue-tsc` accepts it.

## Isolation

One change at a time from `src/Probe.vue` and `src/Foo.vue`. Errors on `vize` 0.650.0:

| Change                                                                | `tsrs` | `vue-tsc` |
| :-------------------------------------------------------------------- | -----: | --------: |
| None                                                                  |      1 |         0 |
| Listener `@barBaz` in place of `@bar-baz`                             |      1 |         0 |
| Handler is a function reference in place of an inline arrow           |      1 |         0 |
| The second tuple is `[other: number]`                                 |      1 |         0 |
| Only `barBaz` is declared                                             |      0 |         0 |
| The tuples have no label: `[number]`                                  |      0 |         0 |
| Both events use `type Payload = [value: number]`                      |      0 |         0 |
| Both events have no payload: `[]`                                     |      0 |         0 |
| The second event is `bazBar` in place of `bar-baz`                    |      0 |         0 |
| `defineEmits(["barBaz", "bar-baz"])` in place of the type declaration |      0 |         0 |

A library component needs one more input. With `@vuetify/v0` 1.3.1 added to `package.json`, `src/Probe.vue` is:

```vue
<script setup lang="ts">
import { Slider } from "@vuetify/v0";

const onValue = (value: number | number[]) => value;
</script>

<template>
  <Slider.Root :model-value="1" @update:model-value="(value) => onValue(value)" />
</template>
```

| Change                                    | `tsrs` | `vue-tsc` |
| :---------------------------------------- | -----: | --------: |
| None (the attribute `:model-value="1"`)   |      1 |         0 |
| Remove the attribute                      |      0 |         0 |
| `class="baz"` in place of the attribute   |      1 |         0 |
| `:max="1"` in place of the attribute      |      1 |         0 |
| `v-model="foo"` in place of the attribute |      1 |         0 |
| `@end` in place of `@update:model-value`  |      0 |         0 |

`Slider.Root` declares `update:modelValue` and `update:model-value`, both with the type `(value: number | number[]) => any`.

The first reproduction gives one error on `vize` 0.638.0, 0.640.0, 0.644.0, 0.645.0 and 0.651.0. The `Slider.Root` probe gives one error on 0.645.0, 0.646.0, 0.648.0, 0.650.0 and 0.651.0, and no error on 0.640.0, 0.642.0 and 0.644.0. On 0.644.0 the generated code types the dotted tag `Slider.Root` as a global component stub (`$GlobalComponentFallback`). From 0.645.0 it types the tag as the imported component. So the version difference is the tag resolution and not a change to `__EmitProps`.

## Not known

For `Slider.Root`, the generated code adds a call of `__vize_emit_props_0` (`$EmitPropsFactory`) only when the file passes an attribute. The call returns `__EmitProps<E>`, where `E` is the `$emit` type of the library component. Without an attribute the generated code has no such call and `Slider.Root` gives no error. This is read from the generated code and not from the Rust source. The patch is applied to a copy of the installed helper and not to the Rust source. Versions before 0.638.0 are not tested. `vize check` reports no error for the reproduction.

## Not a duplicate of

Searched open and closed issues and pull requests for `__EmitProps`, `HandlerKey`, `update:model-value`, TS2345 and `Target requires 1 element`. The search matches words, not meaning. The nearest are #9639 (closed; it added the raw kebab-case key `on${Capitalize<K>}` next to the camelized key, which is the origin of the two keys that collide here) and #10026 (closed; TS2345 on a listener of a dynamic component union). Neither names two events that camelize to one key.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
