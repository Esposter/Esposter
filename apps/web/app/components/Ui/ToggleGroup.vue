<script setup lang="ts" generic="T extends string">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { Radio } from "@vuetify/v0";

interface Props {
  items: UiMenuItem<T>[];
  // The group's accessible name: what its buttons choose between
  label: string;
}

// One of a few ways to do the same thing, as a row of joined buttons with the chosen one filled: a radio group, so it
// Is one stop in the tab order and the arrows move the choice along it
const modelValue = defineModel<T>({ required: true });
const { items, label } = defineProps<Props>();
</script>

<template>
  <Radio.Group
    #default="{ attrs }"
    :model-value
    :label
    mandatory
    renderless
    @update:model-value="
      (value) => {
        if (value !== undefined) modelValue = value;
      }
    "
  >
    <div :="attrs" inline-flex>
      <Radio.Root v-for="{ title, value } of items" #default="{ attrs: itemAttrs }" :key="value" :value renderless>
        <button :="itemAttrs" ui-button>{{ title }}</button>
      </Radio.Root>
    </div>
  </Radio.Group>
</template>
