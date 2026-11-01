# content-mapper: `<component :is>` indexed by a generic-typed key gets `never` for `onUpdate:modelValue`

A generic component renders `<component :is="TextMap[row.type]">` with `v-model`. The key `row.type` has a type parameter as its type. `tsrs --runExternalCode` reports TS2345, because the mapper types `onUpdate:modelValue` as `never`, and TS2322 on the slots. `vue-tsc` reports nothing. A cast of the key to its constraint removes both errors.

## Context

The type check of a Nuxt app moved from `vue-tsc` to `tsrs --runExternalCode` with the vize mapper. A profile card renders one field component per row type from a component map. All members of the map have the same props. The card is generic in the row type.

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

`src/RowValueType.ts`:

```ts
export enum RowValueType {
  Image = "Image",
  Text = "Text",
  Textarea = "Textarea",
}
```

`src/ItemEntityType.ts`:

```ts
export interface ItemEntityType<T extends string> {
  type: T;
}
```

`src/Row.ts`:

```ts
import type { ItemEntityType } from "./ItemEntityType";
import type { RowValueType } from "./RowValueType";

export interface Row<TType extends RowValueType> extends ItemEntityType<TType> {
  value?: null | string;
}
```

`src/Text.vue`:

```vue
<script setup lang="ts">
import type { Row } from "./Row";
import type { RowValueType } from "./RowValueType";

interface Props {
  isEditMode: boolean;
  label: string;
  value: Row<RowValueType.Text>["value"];
}

const modelValue = defineModel<Row<RowValueType.Text>["value"]>({ required: true });
const { isEditMode, label, value } = defineProps<Props>();
</script>

<template>
  <div>{{ isEditMode }} {{ label }} {{ value }} {{ modelValue }}</div>
</template>
```

`src/RowMin.vue`:

```vue
<script setup lang="ts" generic="TType extends RowValueType">
import type { Row } from "./Row";
import type { Component } from "vue";

import { defineAsyncComponent } from "vue";
import { RowValueType } from "./RowValueType";

interface Props<TType extends RowValueType> {
  isEditMode: boolean;
  row: Row<TType>;
  title: string;
}

const TextMap = {
  [RowValueType.Image]: defineAsyncComponent(() => import("./Text.vue")),
  [RowValueType.Text]: defineAsyncComponent(() => import("./Text.vue")),
  [RowValueType.Textarea]: defineAsyncComponent(() => import("./Text.vue")),
} as const satisfies Record<RowValueType, Component>;
const modelValue = defineModel<null | string | undefined>({ required: true });
const { isEditMode, row, title } = defineProps<Props<TType>>();
</script>

<template>
  <component :is="TextMap[row.type]" v-model="modelValue" :is-edit-mode :label="title" :value="row.value" />
</template>
```

```sh
npm i && npm run typecheck ; npm run typecheck:oracle
```

## Actual

`npm run typecheck` gives these errors for the card. Long lines are cut:

```
src/RowMin.vue(24,4): error TS2345: Argument of type '{ "onUpdate:modelValue": never; modelValue: string | null | undefined; isEditMode: boolean; label: string; value: string | null | undefined; }' is not assignable to parameter o …
src/RowMin.vue(24,4): error TS2322: Type '{}' is not assignable to type '$RequiredSlots<$StructuralSlots<{ readonly Image: { __vizeEmitProps?: $StaticEmitProps | undefined; __vizeRawEmits?: $AuthoredEventMap | undefined; __vizeEve …
```

## Expected

No diagnostic, as with `vue-tsc` 3.3.11. All members of the map have the same props, so the props of the dynamic tag are valid.

```
No output. The command exits 0.
```

`vue-tsc` checks the dynamic tag. In `RowWrongLabel.vue`, a wrong prop value (`:label="42"`) is an error in `vue-tsc`.

## Isolation

One change at a time from `RowMin.vue`.

| Change                                                  | `tsrs` errors | `vue-tsc` errors |
| :------------------------------------------------------ | ------------: | ---------------: |
| None (generic `TType`, `TextMap[row.type]`)             |             2 |                0 |
| The key cast: `TextMap[row.type as RowValueType]`       |             0 |                0 |
| The card is not generic (`Row<RowValueType>`)           |             0 |                0 |
| A static `<ValueText>` in place of the dynamic tag      |             0 |                0 |
| The dynamic tag with a wrong prop value (`:label="42"`) |             2 |                1 |

`vize` 0.631.0 is the only version tested. In the last row, `tsrs` reports the same two errors as in the first row, and `vue-tsc` reports the wrong value.

## Not known

The generated code indexes the map with the key as written (`TextMap[row.type]`). The cast row shows that the type of the key decides the result. The reason for `never` is not known.

## Not a duplicate of

Searched open and closed issues and pull requests for dynamic components and `never`. The search matches words, not meaning. The nearest are #10026 (closed) and #10048 (merged): a dynamic component union with an attribute and a listener gave `never` in the mapper's generated code. They may share a cause with this report. The input here is a map member chosen by a generic-typed key, with `v-model`, and it reproduces on 0.631.0.
