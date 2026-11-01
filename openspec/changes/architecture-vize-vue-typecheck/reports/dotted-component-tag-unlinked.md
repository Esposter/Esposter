# content-mapper: a dotted component tag (`<Parts.Child />`) is not linked to its import, so the import is reported unused and the tag's props and events are not checked

A `<script setup>` block imports a namespace (`import * as Parts`) and uses it only as a dotted tag, `<Parts.Child />`. `tsrs --runExternalCode` reports TS6133 for the import when `noUnusedLocals` is on. It also checks neither the props nor the event payloads of the tag. `vue-tsc` reports no TS6133 and reports both kinds of error.

## Context

The type check of a Nuxt app moved from `vue-tsc` to `tsrs --runExternalCode` with the vize mapper. The app wraps compound components in its own UI layer. Each wrapper writes the parts of the compound component as dotted tags. All wrappers give the TS6133 error.

A second effect is harder to see. In a dotted tag, the parameter of an event handler has the type `any`. In a generic component, a `typeof` guard on that parameter then gives a false TS2322 on the assignment that follows. The guard likely narrows `any` to `string` and not to the type parameter. That effect needs a generic parent and is not part of the files below.

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
    "noUnusedLocals": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ESNext"
  },
  "contentMappers": [{ "package": "vize", "extensions": [".vue"] }],
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

`src/Child.vue`:

```vue
<script setup lang="ts">
defineProps<{ count: number }>();
defineEmits<{ pick: [value: number] }>();
</script>

<template>
  <div />
</template>
```

`src/parts.ts`:

```ts
export { default as Child } from "./Child.vue";
```

`src/Dotted.vue` (the handler passes a number where a string is expected, which is an error):

```vue
<script setup lang="ts">
import * as Parts from "./parts";

const show = (value: string) => value;
</script>

<template>
  <Parts.Child :count="1" @pick="(value) => show(value)" />
</template>
```

`src/Plain.vue` (the same as `Dotted.vue` with a plain import):

```vue
<script setup lang="ts">
import { Child } from "./parts";

const show = (value: string) => value;
</script>

<template>
  <Child :count="1" @pick="(value) => show(value)" />
</template>
```

`src/DottedProp.vue` (a string where the prop wants a number, which is an error):

```vue
<script setup lang="ts">
import * as Parts from "./parts";
</script>

<template>
  <Parts.Child count="not a number" />
</template>
```

`src/PlainProp.vue` (the same as `DottedProp.vue` with a plain import):

```vue
<script setup lang="ts">
import { Child } from "./parts";
</script>

<template>
  <Child count="not a number" />
</template>
```

`src/DottedClean.vue` (no error in the source):

```vue
<script setup lang="ts">
import * as Parts from "./parts";

const show = (value: number) => value;
</script>

<template>
  <Parts.Child :count="1" @pick="(value) => show(value)" />
</template>
```

```sh
npm i && npm run typecheck ; npm run typecheck:oracle
```

## Actual

`npm run typecheck` gives these errors:

```
src/Dotted.vue(2,13): error TS6133: 'Parts' is declared but its value is never read.
src/DottedClean.vue(2,13): error TS6133: 'Parts' is declared but its value is never read.
src/DottedProp.vue(2,13): error TS6133: 'Parts' is declared but its value is never read.
src/Plain.vue(8,44): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/PlainProp.vue(6,10): error TS2322: Type 'string' is not assignable to type 'number'.
```

## Expected

The mapper should report the same four errors as `vue-tsc` and no TS6133. The template reads `Parts` in `<Parts.Child />`, so the import is used. `vue-tsc` 3.3.11 (`npm run typecheck:oracle`) gives these errors:

```
src/Dotted.vue(8,50): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/DottedProp.vue(6,16): error TS2322: Type 'string' is not assignable to type 'number'.
src/Plain.vue(8,44): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
src/PlainProp.vue(6,10): error TS2322: Type 'string' is not assignable to type 'number'.
```

`Dotted.vue` and `DottedProp.vue` each have a real error. The mapper reports neither. `DottedClean.vue` has no error, and the mapper reports TS6133 for it.

## Isolation

The first group has no error in the source, so every error is a TS6133. The second group has one real error in each file.

| Change                                                                                       | `tsrs` errors | `vue-tsc` errors |
| :------------------------------------------------------------------------------------------- | ------------: | ---------------: |
| `import * as Parts`, `<Parts.Child />`                                                       |             1 |                0 |
| `import { Parts } from "./partsObject"`, where that module exports `const Parts = { Child }` |             1 |                0 |
| `import { Child } from "./parts"` and `<Child />`                                            |             0 |                0 |
| `import * as Parts` and `void Parts;` in the script                                          |             0 |                0 |
| `import * as Parts` and no use at all                                                        |             1 |                1 |
| Real error in an event payload, dotted tag (rows count errors other than TS6133)             |             0 |                1 |
| Real error in an event payload, plain import                                                 |             1 |                1 |
| Real error in a prop, dotted tag                                                             |             0 |                1 |
| Real error in a prop, plain import                                                           |             1 |                1 |

`vize` 0.606.0, 0.627.0, 0.628.0, 0.630.0, 0.631.0 and 0.638.0 give the same results for the files shown. Earlier versions are not tested. With `noUnusedLocals` off, there is no TS6133.

## Not known

The generated code declares the tag as `$GlobalComponent<"Parts.Child"> & $GlobalComponentFallback`. It does not name the import. That is likely the reason for both effects. It is not confirmed in the source.

## Not a duplicate of

Searched open and closed issues and pull requests for dotted components, namespace imports, TS6133 and `noUnusedLocals`. The search matches words, not meaning. The nearest are #1896 (mark template bindings as used for `noUnusedLocals`), #4050 and #4051 (honor `noUnusedLocals` in Vue transforms) and #3931 (a `defineProps` result read only by the template reports TS6133). All are closed or merged. They fix other template reads, not the dotted tag.
