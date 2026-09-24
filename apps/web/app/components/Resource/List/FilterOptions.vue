<script setup lang="ts" generic="T extends string">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  items: UiMenuItem<T>[];
  selectedValues: T[];
}

// A filter's choices as buttons that say whether each is on, so one list serves a filter of one choice and of several
const { items, selectedValues } = defineProps<Props>();
const emit = defineEmits<{ toggle: [value: T] }>();
</script>

<template>
  <div flex flex-col>
    <button
      v-for="{ icon, title, value } of items"
      :key="value"
      :aria-pressed="selectedValues.includes(value)"
      type="button"
      ui-item
      @click="emit('toggle', value)"
    >
      <UiItemContent :icon :title>
        <template #append>
          <UiIcon v-if="selectedValues.includes(value)" :meaning="UiIconMeaning.Selected" text-accent />
        </template>
      </UiItemContent>
    </button>
  </div>
</template>
