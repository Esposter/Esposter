# content-mapper: a type alias in a generic component's script is not instantiated for a slot's payload, and `Props` is reported unused

A generic component declares a type alias in its script that uses a type parameter, and uses the alias in its slot type or its props. A consumer sees the slot payload with the default type argument (`any` or `unknown`) and not the inferred type. This gives TS7053 on an index and TS2339 on an extra field. Under `noUnusedLocals`, the mapper also reports the component's `Props` interface as unused (TS6196). `vue-tsc` reports none of these.

## Context

The type check of a Nuxt app moved from `vue-tsc` to `tsrs --runExternalCode` with the vize mapper. The app has a generic list component that takes rows with extra fields and passes each row to its slots. Its consumers read the extra fields in the slot. They give TS2339 under the mapper. A second consumer indexes a constant map with a field of the row and gives TS7053.

Without a default on the type parameter, the slot payload is `any`, so a wrong read goes unreported (see the rows for `TExtra` without a default).

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

`src/SlotChild.vue`:

```vue
<script setup lang="ts" generic="T extends string">
import type { VNode } from "vue";

type Item = { value: T };

defineSlots<{ mark?: (props: { item: Item }) => VNode }>();
const { items } = defineProps<{ items: { value: T }[] }>();
</script>

<template>
  <div v-for="item of items" :key="item.value">
    <slot name="mark" :item />
  </div>
</template>
```

`src/SlotParent.vue`:

```vue
<script setup lang="ts">
import SlotChild from "./SlotChild.vue";

const tokenMap = { a: "error", b: "warning" } as const;
const items = [{ value: "a" as const }];
</script>

<template>
  <SlotChild :items="items">
    <template #mark="{ item }">
      <span :class="tokenMap[item.value]" />
    </template>
  </SlotChild>
</template>
```

`src/ExtraChild.vue`:

```vue
<script setup lang="ts" generic="TExtra = unknown">
import type { VNode } from "vue";

type ExtendedListItem = TExtra & { title: string; value: string };

defineProps<{ items: ExtendedListItem[] }>();
defineSlots<{ mark?: (props: { item: ExtendedListItem }) => VNode }>();
</script>

<template>
  <div v-for="item of items">
    <slot name="mark" :item />
  </div>
</template>
```

`src/ExtraParent.vue`:

```vue
<script setup lang="ts">
import ExtraChild from "./ExtraChild.vue";

const listItems: { item: { image: string }; title: string; value: string }[] = [
  { item: { image: "a.png" }, title: "a", value: "a" },
];
</script>

<template>
  <ExtraChild :items="listItems">
    <template #mark="slotProps">
      <img :src="slotProps.item.item.image" alt="" />
    </template>
  </ExtraChild>
</template>
```

`src/PropsChild.vue`:

```vue
<script setup lang="ts" generic="T extends string">
type Item = { value: T };

interface Props {
  items: Item[];
}

const { items } = defineProps<Props>();
</script>

<template>
  <span>{{ items.length }}</span>
</template>
```

```sh
npm i && npm run typecheck ; npm run typecheck:oracle
```

## Actual

`npm run typecheck` gives these errors: the missing field in `ExtraParent.vue`, the unused `Props` in `PropsChild.vue` and the `any` index in `SlotParent.vue`.

```
src/ExtraParent.vue(12,33): error TS2339: Property 'item' does not exist on type '{ title: string; value: string; }'.
src/PropsChild.vue(4,11): error TS6196: 'Props' is declared but never used.
src/SlotParent.vue(11,21): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ readonly a: "error"; readonly b: "warning"; }'.
```

## Expected

No diagnostic, as with `vue-tsc` 3.3.11. The consumer's slot payload has the inferred type, so `tokenMap[item.value]` and `slotProps.item.item.image` are valid, and `Props` is used by `defineProps<Props>()`.

```
No output. The command exits 0.
```

`vue-tsc` checks the consumers. In the row for `TExtra` without a default and a read of a field that does not exist, `vue-tsc` reports the error and the mapper does not.

## Isolation

One change at a time. Each row names the consumer or child file it counts errors in.

| Change                                                                        | `tsrs` errors | `vue-tsc` errors |
| :---------------------------------------------------------------------------- | ------------: | ---------------: |
| Generic child, `type Item = { value: T }` in the slot type (`SlotParent.vue`) |             1 |                0 |
| The slot type written inline, with no alias                                   |             0 |                0 |
| A child that is not generic, with an alias                                    |             0 |                0 |
| Alias `TExtra & { … }` with `TExtra = unknown` (`ExtraParent.vue`)            |             1 |                0 |
| `TExtra` without a default                                                    |             0 |                0 |
| `TExtra` without a default, and a read of a field that does not exist         |             0 |                1 |
| Generic child, alias used in `Props` (TS6196 under `noUnusedLocals`)          |             1 |                0 |
| Generic child, `Props` without the alias                                      |             0 |                0 |
| Child that is not generic, alias in `Props`                                   |             0 |                0 |

`vize` 0.631.0 and 0.638.0 give the same result. Earlier versions are not tested.

## Not known

The generated code from `vize check --show-virtual-ts` declares the alias a second time at module scope, with a default type argument (`type Item<T extends string = any> = { value: T }`), next to the setup-scope alias. A consumer's view of the slot payload likely uses the module-scope copy, so it sees the default. This is a guess. It is not confirmed that `tsrs --runExternalCode` uses the same text. A fix is not tested.

## Not a duplicate of

Searched open and closed issues and pull requests for generic slots, type aliases, hoisted generics and TS6196. The search matches words, not meaning. The nearest are #10221 (merged; capture setup-scoped slot types, which made the slots type generic), #10883 and #10886 (closed and merged; the slot outlet inside the child read the defaults) and #3354 (closed; generic declaration constructors do not instantiate the slot, emit and expose type parameters). Those fix the outlet in the child or a built declaration. This input is a script-scope type alias, and the effect is on the consumer and on an unused `Props`.
