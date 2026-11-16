<script setup lang="ts">
import type { Item } from "#src/models/shared/Item";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

interface Props {
  // The actions before Delete, which always closes the menu
  actions: Item[];
  deleteLabel: string;
  label: string;
}

const { actions, deleteLabel } = defineProps<Props>();
const emit = defineEmits<{ delete: [] }>();
const items = computed<Item[]>(() => [
  ...actions,
  {
    isDanger: true,
    isGroupStart: true,
    meaning: UiIconMeaning.Delete,
    onClick: () => {
      emit("delete");
    },
    title: deleteLabel,
  },
]);
</script>

<template>
  <UiOverflowMenu :items :label />
</template>
