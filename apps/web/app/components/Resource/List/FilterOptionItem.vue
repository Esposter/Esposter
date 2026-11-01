<script setup lang="ts" generic="T extends string">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  item: UiMenuItem<T>;
  // The mark a choice with no icon of its own leads with: what the filter reads, such as a status or a time
  meaning: UiIconMeaning;
  selectedValues: T[];
}

const { item, meaning, selectedValues } = defineProps<Props>();
const emit = defineEmits<{ toggle: [value: T] }>();
// Read once for both the pressed state and the mark, since a choice shows its mark only while it is on
const isSelected = computed(() => selectedValues.includes(item.value));
</script>

<template>
  <button :aria-pressed="isSelected" type="button" ui-item @click="emit('toggle', item.value)">
    <UiItemContent :icon="item.icon" :meaning="item.icon ? undefined : meaning" :title="item.title">
      <template #append>
        <UiIcon v-if="isSelected" :meaning="UiIconMeaning.Selected" text-accent />
      </template>
    </UiItemContent>
  </button>
</template>
