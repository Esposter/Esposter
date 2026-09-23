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
      flex
      gap-2
      items-center
      @click="emit('toggle', value)"
    >
      <span v-if="icon" :class="icon" aria-hidden="true" size-5 />
      <span flex-1>{{ title }}</span>
      <UiIcon v-if="selectedValues.includes(value)" :meaning="UiIconMeaning.Success" />
    </button>
  </div>
</template>
