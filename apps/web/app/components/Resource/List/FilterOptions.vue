<script setup lang="ts" generic="T extends string">
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

interface Props {
  items: UiMenuItem<T>[];
  // The mark a choice with no icon of its own leads with: what the filter reads, such as a status or a time
  meaning: UiIconMeaning;
  selectedValues: T[];
}
// A filter's choices as buttons that say whether each is on, so one list serves a filter of one choice and of several
const { items, meaning, selectedValues } = defineProps<Props>();
const emit = defineEmits<{ toggle: [value: T] }>();
</script>

<template>
  <div flex flex-col>
    <ResourceListFilterOptionItem
      v-for="item of items"
      :key="item.value"
      :item
      :meaning
      :selected-values
      @toggle="emit('toggle', $event)"
    />
  </div>
</template>
