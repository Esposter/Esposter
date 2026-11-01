# content-mapper: `defineModel()` beside `defineProps<Props>()` gives TS7053 on the model's key when no variable has that name

A `<script setup>` block calls `defineProps<Props>()` with a type named `Props`. It also calls `defineModel()` and has no variable named like the model's key (`modelValue`, or the name passed to `defineModel`). `tsrs --runExternalCode` reports TS7053 for it. `vue-tsc` accepts the same file. `vize check` reports nothing for it.

## Context

The type check of a Nuxt app moved from `vue-tsc` to `tsrs --runExternalCode` with the vize mapper. Many components in the app declare `interface Props` and store a model in a variable with another name, such as `isOpen`. All of them give this error. A component that has a variable named like the model's key does not.

The error is in the generated code. It has no position in the source file, so the user cannot act on it.

## Environment

`vize` 0.631.0, `tsrs` 0.20.1-ts7.1.0-beta, `vue` 3.5.44, Node 26, Windows 10. Oracle: `vue-tsc` 3.3.11 with `typescript` 6.0.3.

## Reproduction

`package.json`:

```json
{
  "private": true,
  "type": "module",
  "scripts": {
    "typecheck": "tsrs --runExternalCode --noEmit -p tsconfig.json",
    "typecheck:oracle": "vue-tsc --noEmit -p tsconfig.json"
  },
  "devDependencies": {
    "tsrs": "0.20.1-ts7.1.0-beta",
    "typescript": "6.0.3",
    "vize": "0.631.0",
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

`src/Probe.vue`:

```vue
<script setup lang="ts">
interface Props {
  label: string;
}

defineProps<Props>();
defineModel<boolean>();
</script>

<template>
  <div />
</template>
```

```sh
npm i && npm run typecheck ; npm run typecheck:oracle
```

## Actual

`npm run typecheck` gives one error for the file:

```
src/Probe.vue(62,22): error TS7053: Element implicitly has an 'any' type because expression of type '"modelValue"' can't be used to index type '__DefineProps<Props, never>'.
```

Line 62 is a line of the generated code. `vize check --save-virtual-ts-for src/Probe.vue` writes the same generated code. These are its lines 16 to 19 and 58 to 62:

```ts
type $ResolvedProps = Props & { modelValue?: boolean; modelModifiers?: Partial<Record<string, true>> };

const props: __DefineProps<Props> = {} as __DefineProps<Props>;
void props; // Mark as used to avoid TS6133
const label = props["label"];
void label;
const modelValue = props["modelValue"];
```

`$ResolvedProps` holds `modelValue`. The type of `props` does not.

`vize check src/Probe.vue` reports no error for this file. It does report a real error in a file of this shape: `isOpen.value = "no"` after `const isOpen = defineModel<boolean>()` gives TS2322. The cause of the difference is not known. `vize check` may drop a diagnostic that has no source position.

## Expected

No diagnostic, as with `vue-tsc` 3.3.11. A component can call `defineProps<Props>()` and `defineModel()` together.

```
No output. The command exits 0.
```

`vue-tsc` checks the file. The statement `isOpen.value = "no"` after `const isOpen = defineModel<boolean>()` gives TS2322 in both checkers.

## Isolation

One change at a time from the reproduction. The first row is `src/Probe.vue`.

| Change                                                                                                                                  | `tsrs` errors | `vue-tsc` errors |
| :-------------------------------------------------------------------------------------------------------------------------------------- | ------------: | ---------------: |
| None (`interface Props`, `defineProps<Props>()`, `defineModel<boolean>()`)                                                              |             1 |                0 |
| `const isOpen = defineModel<boolean>()`                                                                                                 |             1 |                0 |
| `defineModel<boolean>({ required: true })`                                                                                              |             1 |                0 |
| `defineModel<boolean>("open")` (the error names `"open"`)                                                                               |             1 |                0 |
| `defineModel()` written before `defineProps()`                                                                                          |             1 |                0 |
| `const { label } = defineProps<Props>()`                                                                                                |             1 |                0 |
| `const { label } = defineProps<Props>()` and `defineModel<boolean>({ default: false })` (two errors: TS7053 and TS2339 on `modelValue`) |             2 |                0 |
| `type Props = { label: string }` in place of the interface                                                                              |             1 |                0 |
| `Props` imported from another file                                                                                                      |             1 |                0 |
| `const modelValue = defineModel<boolean>()` (a variable has the model's key)                                                            |             0 |                0 |
| `const open = defineModel<boolean>("open")` (a variable has the model's key)                                                            |             0 |                0 |
| `const isOpenModel = defineModel<boolean>("isOpen")` and `const isOpen = true`                                                          |             0 |                0 |
| The same, with `const { isOpen } = { isOpen: true }`                                                                                    |             0 |                0 |
| The same, with `import { isOpen } from "./flag"`                                                                                        |             0 |                0 |
| The interface is named `CardProps`                                                                                                      |             0 |                0 |
| `CardProps` imported from another file                                                                                                  |             0 |                0 |
| `Props` imported as `Base` (`import type { Props as Base }`)                                                                            |             0 |                0 |
| `generic="T extends string"` on the script tag                                                                                          |             0 |                0 |
| Inline type: `defineProps<{ label: string }>()`                                                                                         |             0 |                0 |
| Runtime declaration: `defineProps({ label: String })`                                                                                   |             0 |                0 |
| No `defineModel()` call                                                                                                                 |             0 |                0 |
| No `defineProps()` call                                                                                                                 |             0 |                0 |

`vize` 0.606.0, 0.627.0, 0.628.0 and 0.630.0 give the same error for the first row. Earlier versions are not tested.

## Not known

The cause is not known. The rows show that the type must be named `Props`, so the mapper may match on that name. The generated code suggests that the mapper skips the line `const modelValue = props["modelValue"]` when a variable already has that name. That reading fits the rows. It is not confirmed in the source.

In a Nuxt app, every component that matches these three conditions gives the error, and no other component gives it.

## Not a duplicate of

Searched open and closed issues and pull requests for `defineModel`, `modelValue`, TS7053 and `__DefineProps`. The search matches words, not meaning. The nearest results are #7949 (every `defineModel()` is `never` for a `.vue` outside the tsconfig directory) and #10196 (a binding named `props` collides with the mapper's own `props`). Both are closed. #7949 has a different input. #10196 is the same kind of name clash with a different name and a different trigger.
