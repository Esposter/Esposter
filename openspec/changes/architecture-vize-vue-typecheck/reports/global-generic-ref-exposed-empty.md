# content-mapper: the template ref of a globally registered generic component has the exposed type `{}`

A generic component calls `defineExpose({ reset })` and is registered in `GlobalComponents`, as Nuxt does in `.nuxt/types/components.d.ts`. A template ref to it has the exposed type `{}`, so `child.value?.reset()` gives TS2339. `vue-tsc` types the ref as `{ reset: () => void }`.

## Context

The type check of a Nuxt app moved from `vue-tsc` to `tsrs --runExternalCode` with the vize mapper. Nuxt writes every component of the app into `GlobalComponents`. The app has generic components that expose methods and fields, and their parents call them through template refs. All of those calls give TS2339 on `{}`.

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

`src/Child.vue`:

```vue
<script setup lang="ts" generic="T">
const reset = () => {};

defineExpose({ reset });
</script>

<template>
  <div />
</template>
```

`src/components.d.ts` (the registry that Nuxt generates):

```ts
interface _GlobalComponents {
  MinChild: typeof import("./Child.vue").default;
  MinPlain: typeof import("./PlainChild.vue").default;
}

declare module "vue" {
  export interface GlobalComponents extends _GlobalComponents {}
}

export {};
```

`src/Parent.vue`:

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue";

const child = useTemplateRef("child");
const run = () => {
  child.value?.reset();
};
</script>

<template>
  <MinChild ref="child" @click="run" />
</template>
```

```sh
npm i && npm run typecheck ; npm run typecheck:oracle
```

## Actual

`npm run typecheck` gives one error for the parent:

```
src/Parent.vue(6,16): error TS2339: Property 'reset' does not exist on type '{}'.
```

## Expected

No diagnostic, as with `vue-tsc` 3.3.11. The ref has the type `{ reset: () => void } | null`.

```
No output. The command exits 0.
```

`vue-tsc` types the ref. In `ParentNope.vue`, a call to a method that does not exist is an error in both checkers.

## Isolation

One change at a time from `Parent.vue`.

| Change                                                | `tsrs` errors | `vue-tsc` errors |
| :---------------------------------------------------- | ------------: | ---------------: |
| None (generic child, global registration)             |             1 |                0 |
| A child that is not generic, global registration      |             0 |                0 |
| The generic child imported in the parent              |             0 |                0 |
| Control: the generic global child, a call to `nope()` |             1 |                1 |

`vize` 0.631.0 is the only version tested.

## Not known

The cause is not known. In the code that `vize check --show-virtual-ts` writes, the global component is a bare name (`typeof MinChild`) with no declaration, so that code does not show the type that `tsrs --runExternalCode` uses. For a tag that the mapper cannot link to an import, the generated code declares `$GlobalComponent<'…'> & $GlobalComponentFallback`, where the fallback is a function type that takes `Record<string, unknown>`. If a global generic component gets the same intersection, TypeScript may read the exposed type from the last call signature, which is the fallback. This is a guess and is not tested.

## Not a duplicate of

Searched open and closed issues and pull requests for template refs, global components and generic components. The search matches words, not meaning. The nearest are #10210 (merged; unresolved global components fall back to a permissive type, which is likely where the fallback comes from), #9797 (merged; infer generic event payloads of globally registered components) and #10251 (closed; a ref on a dynamic component loses the instance type). None covers the ref of a generic global component.
