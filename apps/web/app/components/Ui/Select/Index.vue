<script setup lang="ts" generic="T extends string">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { Select } from "@vuetify/v0";

interface Props {
  items: UiMenuItem<T>[];
  label: string;
}

const modelValue = defineModel<T>({ required: true });
const { items, label } = defineProps<Props>();
// A pick clears the old choice before it selects the new one, and the model passes on only the choice itself, so a
// Call site never sees the select empty in between
</script>

<template>
  <Select.Root
    :model-value
    @update:model-value="
      (value) => {
        if (typeof value === 'string') modelValue = value;
      }
    "
  >
    <UiSelectActivator :items :label />
    <Select.Content ui-popover>
      <div role="none" max-h="[40dvh]" py-1 flex flex-col of-y-auto ui-frame>
        <Select.Item v-for="{ description, title, value } of items" :id="value" :key="value" :value ui-item>
          {{ title }} <span v-if="description" text-muted>{{ description }}</span>
        </Select.Item>
      </div>
    </Select.Content>
  </Select.Root>
</template>
