# content-mapper: the `@select` listener of `<component :is>` inside an explicit slot template is typed as a DOM `Event`

A template renders a member of a component map with `<component :is="PickerMap[key]">` inside `<template #panel>` and listens to `@select`. The mapper types the handler's parameter as a DOM `Event`, so assigning it to the picker's declared payload type gives TS2322. `vue-tsc` types the parameter as the payload type that the picker declares.

## Context

The type check of a Nuxt app moved from `vue-tsc` to `tsrs --runExternalCode` with the vize mapper. A search input renders one picker per filter type from a component map. Every picker declares `select: [value: SerializableValue]`. The assignment in the handler gives TS2322 under the mapper.

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

`src/SerializableValue.ts`:

```ts
export type SerializableValue = boolean | Date | null | number | string;
```

`src/DatePicker.vue`:

```vue
<script setup lang="ts">
import type { SerializableValue } from "./SerializableValue";

const emit = defineEmits<{ select: [value: SerializableValue] }>();
</script>

<template>
  <button type="button" @click="emit('select', new Date(0))">pick</button>
</template>
```

`src/PanelPlain.vue`:

```vue
<script setup lang="ts">
import type { VNode } from "vue";

defineSlots<{ panel: (props: { focus: () => void }) => VNode }>();
const focus = () => {};
</script>

<template>
  <div>
    <slot name="panel" :focus />
  </div>
</template>
```

`src/InputMapLocal.vue`:

```vue
<script setup lang="ts">
import type { SerializableValue } from "./SerializableValue";

import { ref } from "vue";

import DatePicker from "./DatePicker.vue";
import PanelPlain from "./PanelPlain.vue";

const PickerMap = { after: DatePicker } as const;
const current = ref<SerializableValue>(null);
const key = ref<"after">("after");
</script>

<template>
  <PanelPlain>
    <template #panel>
      <component
        :is="PickerMap[key]"
        @select="
          (value) => {
            current = value;
          }
        "
      />
    </template>
  </PanelPlain>
</template>
```

`src/ControlNoSlot.vue` is the proof file for the Expected section. Run it in place of `InputMapLocal.vue`, as the control row of the Isolation table does:

```vue
<script setup lang="ts">
import { ref } from "vue";

import DatePicker from "./DatePicker.vue";

const count = ref<number>(0);
</script>

<template>
  <DatePicker
    @select="
      (value) => {
        count = value;
      }
    "
  />
</template>
```

```sh
npm i && npm run typecheck ; npm run typecheck:oracle
```

## Actual

`npm run typecheck` gives one error for the input:

```
src/InputMapLocal.vue(21,15): error TS2322: Type 'Event' is not assignable to type 'SerializableValue'.
```

## Expected

No diagnostic, as with `vue-tsc` 3.3.11. The parameter `value` has the type `SerializableValue`, which `DatePicker` declares for `select`.

```
No output. The command exits 0.
```

`vue-tsc` checks the handler. With `ControlNoSlot.vue` in place of `InputMapLocal.vue`, assigning the payload to a `number` is an error in both checkers. Both report this first line: `src/ControlNoSlot.vue(13,9): error TS2322: Type 'SerializableValue' is not assignable to type 'number'.`

## Isolation

One change at a time from `InputMapLocal.vue`.

| Change                                                     | `tsrs` errors | `vue-tsc` errors |
| :--------------------------------------------------------- | ------------: | ---------------: |
| None (map member, explicit `<template #panel>`, `@select`) |             1 |                0 |
| The tag in the implicit default slot                       |             0 |                0 |
| The tag in an explicit `<template #default>`               |             1 |                0 |
| The tag outside any slot                                   |             0 |                0 |
| A static `<DatePicker @select>` in `#panel`                |             0 |                0 |
| `:is="DatePicker"` in `#panel`                             |             0 |                0 |
| The event is named `pick` in place of `select`             |             0 |                0 |
| Control: no slot, and the payload assigned to a `number`   |             1 |                1 |

`vize` 0.631.0 is the only version tested.

## Not known

The generated code for the failing case holds a listener of the form `(__vize_event: Event) => …`. That is the type of a DOM listener. The rows suggest that the mapper falls back to a DOM event type when the target is unresolved and the event has a DOM name, and only inside an explicit slot template. This is a guess. It is not confirmed in the source.

## Not a duplicate of

Searched open and closed issues and pull requests for dynamic components, events and TS2322. The search matches words, not meaning. The nearest are #10026 (closed) and #10048 (merged), which fix a dynamic component union with an attribute and a listener. Here the target is a map member, and the wrong type is `Event`, only inside an explicit slot template.
