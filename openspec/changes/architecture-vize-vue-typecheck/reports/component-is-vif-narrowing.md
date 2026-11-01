# content-mapper: TS18048 for `<component :is="x.component" v-if="x" />`, outside the `v-if` guard, in unmapped virtual code

A `<component>` element reads a property of `x` in its `:is` binding and has `v-if="x"` on the same element. `tsrs --runExternalCode` reports that `x` is possibly `undefined` four times, at positions in generated code. `vue-tsc` narrows `x` by the guard and reports nothing.

## Context

The type check of a Nuxt app moved from `vue-tsc` to `tsrs --runExternalCode` with the vize mapper. A suggestion popup renders a component that a computed value holds. The element reads `ownSuggestion.component` and has `v-if="ownSuggestion"`. The mapper reports the computed value as possibly `undefined` several times.

## Environment

`vize` 0.638.0, `tsrs` 0.20.1-ts7.1.0-beta, `vue` 3.5.44, Node 26, Windows 10. Oracle: `vue-tsc` 3.3.11 with `typescript` 6.0.3.

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
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

`src/Probe.vue`:

```vue
<script setup lang="ts">
const x = undefined as { component: string } | undefined;
</script>

<template>
  <component :is="x.component" v-if="x" />
</template>
```

```sh
npm i && npm run typecheck ; npm run typecheck:oracle
```

## Actual

`npm run typecheck` gives these errors for the file. The four positions are in generated code:

```
src/Probe.vue(68,39): error TS18048: 'x' is possibly 'undefined'.
src/Probe.vue(68,193): error TS18048: 'x' is possibly 'undefined'.
src/Probe.vue(68,287): error TS18048: 'x' is possibly 'undefined'.
src/Probe.vue(69,43): error TS18048: 'x' is possibly 'undefined'.
```

## Expected

No diagnostic, as with `vue-tsc` 3.3.11. The guard `v-if="x"` narrows `x` in the `:is` binding.

```
No output. The command exits 0.
```

`vue-tsc` checks the file. Without the guard (`NoGuard.vue`), it reports the real error.

## Isolation

One change at a time from `Probe.vue`.

| Change                                                                  | `tsrs` errors | `vue-tsc` errors |
| :---------------------------------------------------------------------- | ------------: | ---------------: |
| None (`<component :is="x.component" v-if="x" />`)                       |             4 |                0 |
| The guard on a parent `<template v-if>`                                 |             4 |                0 |
| A plain element: `<div :a="x.component" v-if="x" />`                    |             0 |                0 |
| `<component :foo="x.component" v-if="x" />`                             |             0 |                0 |
| `<component :is="x" v-if="x" />` where `x` is a `string` or `undefined` |             0 |                0 |
| Control: no `v-if` (a real error)                                       |             5 |                1 |

`vize` 0.631.0 and 0.638.0 give the same result. Earlier versions are not tested.

## Not known

The generated code from `vize check --show-virtual-ts` declares type aliases of the form `typeof x.component` at template scope. They sit outside the `if` block that holds the guard. A type query there sees the declared type of `x`. This is likely the cause. It is not confirmed that `tsrs --runExternalCode` uses the same text.

## Not a duplicate of

Searched open and closed issues and pull requests for narrowing, `component :is` and TS18048. The search matches words, not meaning. The nearest are #10251 (closed; a ref on a dynamic component loses the instance type), #10198 (closed; a ref on `<component :is>` gives TS2304) and #9360 (closed; `v-else` narrowing lost inside a parent `v-if`). None has a property read in `:is` under `v-if`.
