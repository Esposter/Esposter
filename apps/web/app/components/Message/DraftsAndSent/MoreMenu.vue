<script setup lang="ts">
import type { Item } from "#src/models/shared/Item";

import { getEditDeleteItems } from "#src/services/ui/getEditDeleteItems";

interface Props {
  // The actions between Edit and Delete, which always closes the menu
  actions: Item[];
  deleteLabel: string;
  editLabel: string;
  label: string;
}

const { actions, deleteLabel, editLabel } = defineProps<Props>();
const emit = defineEmits<{ delete: []; edit: [] }>();
const items = computed<Item[]>(() => {
  const [editItem, deleteItem] = getEditDeleteItems({
    deleteLabel,
    editLabel,
    onDelete: () => {
      emit("delete");
    },
    onEdit: () => {
      emit("edit");
    },
  });
  return [editItem, ...actions, { ...deleteItem, isGroupStart: true }];
});
</script>

<template>
  <UiOverflowMenu :items :label />
</template>
