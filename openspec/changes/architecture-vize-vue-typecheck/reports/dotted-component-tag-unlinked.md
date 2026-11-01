# content-mapper: a dotted component tag (`<Parts.Foo>`) is not linked to its import, so `noUnusedLocals` reports it unused and its props are not checked

I was trying to adopt vize for Nuxt type checking and ran into this, among a few others.

A component used as `<Parts.Foo>` from `import * as Parts` is not linked to `Parts`. `tsrs` reports `Parts` as unused under `noUnusedLocals`, does not check the props, and types an event payload as `any`, which gives false errors. `vue-tsc` checks all three.

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
    "noUnusedLocals": true,
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
defineProps<{ bar: number }>();
</script>

<template>
  <div />
</template>
```

`src/parts.ts`:

```ts
export { default as Foo } from "./Foo.vue";
```

`src/Probe.vue`:

```vue
<script setup lang="ts">
import * as Parts from "./parts";
</script>

<template>
  <Parts.Foo bar="baz" />
</template>
```

```sh
npm i && npx tsrs --runExternalCode --noEmit -p tsconfig.json
npx vue-tsc --noEmit -p tsconfig.json
```

## Actual

```
src/Probe.vue(2,13): error TS6133: 'Parts' is declared but its value is never read.
```

## Expected

`vue-tsc` reports the wrong prop and no unused import:

```
src/Probe.vue(6,14): error TS2322: Type 'string' is not assignable to type 'number'.
```

A plain import gives the same TS2322 in both tools: `import Foo from "./Foo.vue"` with `<Foo bar="baz" />`.

## Second symptom: an event payload typed `any`

The stub is `any`, so a listener parameter is `any`. A `typeof` check then narrows it to `string`, which a generic target rejects. With `Child.vue` of `generic="T"`, `defineProps<{ modelValue?: T | T[] }>()` and `defineEmits<{ "update:modelValue": [value: T | T[] | undefined] }>()`, `parts.ts` exporting it as `Child` (`export { default as Child } from "./Child.vue";`), and `Probe.vue` of `generic="TFoo extends string"` with `import * as Parts from "./parts"` and `const model = defineModel<TFoo>({ required: true });`, the template is:

```vue
<Parts.Child
  :model-value="model"
  @update:model-value="
    (value) => {
      if (typeof value === 'string') model = value;
    }
  "
/>
```

`tsrs` reports `Probe.vue(12,40): error TS2322: Type 'string' is not assignable to type 'TFoo'.` `vue-tsc` reports nothing. With `import Child from "./Child.vue"` and `<Child …>`, both tools report nothing.

## Cause

The cause is likely: the mapper resolves a tag by its whole string, so `Parts.Foo` never matches the `Parts` binding.

`resolve` tries three candidates, none of which is the root segment of a dotted name (`crates/vize_canon/src/virtual_ts/component_reference.rs:144`):

```rust
for candidate in [pascal_name.as_str(), camel_name.as_str(), template_name] {
```

The stub generator for unresolved tags uses the same whole-name candidates (`crates/vize_canon/src/virtual_ts/generator/global_components.rs:155`):

```rust
let candidates = [name, camel_name.as_str(), pascal_name.as_str()];
```

The result is a stub typed `any` named `Parts_Foo`. No generated line names `Parts`, which gives TS6133, and the props are checked against `any`. The member-chain resolver runs only for `<component :is="Parts.Foo">`, and that form reports the wrong prop correctly.

The fix is likely to resolve the root segment of a dotted tag against the script bindings and use the member reference `Parts.Foo`.

## Real occurrence

The shape in a real Nuxt app: [`Ui/Alert.vue` line 17](https://github.com/Esposter/Esposter/blob/49df4394844218f957290581ab2090a56f7a4f3d/apps/web/app/components/Ui/Alert.vue#L17) uses `<Alert.Root>`. `Alert` is a named import of a namespace object on line 5 (`import { Alert } from "@vuetify/v0"`), and the mapper reports it unused. `vue-tsc` accepts the file.

## Not a duplicate of

Searched open and closed issues and pull requests for dotted and member tags and TS6133. The search matches words, not meaning. The nearest are #4050, #4051 and #3931 (closed or merged; fixes for TS6133 on names read only in the template). None of them names a dotted tag.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
