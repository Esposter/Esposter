<script setup lang="ts" generic="T extends string">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { Radio } from "@vuetify/v0";

interface Props {
  items: UiMenuItem<T>[];
  // The group's accessible name: what its buttons choose between
  label: string;
}

// One of a few ways to do the same thing, as a segmented control: quiet segments on a field's track, the chosen one
// Filled. A radio group, so it is one stop in the tab order and the arrows move the choice along it
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
    <div :="attrs" inline-flex ui-sunk>
      <Radio.Root
        v-for="{ icon, meaning, title, value } of items"
        #default="{ attrs: itemAttrs }"
        :key="value"
        :value
        renderless
      >
        <button :="itemAttrs" :data-variant="UiButtonVariant.Quiet" ui-button>
          <UiIcon v-if="meaning" :meaning />
          <span v-else-if="icon" :class="icon" aria-hidden="true" size-6 />
          {{ title }}
        </button>
      </Radio.Root>
    </div>
  </Radio.Group>
</template>
