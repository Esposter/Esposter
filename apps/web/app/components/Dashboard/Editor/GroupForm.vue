<script setup lang="ts">
import { useVisualStore } from "@/store/dashboard/visual";

const visualStore = useVisualStore();
const { applyEdit } = visualStore;
const { editedItem } = storeToRefs(visualStore);
// A group has no chart or dataset to edit, so its title is the one field its form edits, and each change is written onto
// The group as it is typed, the same way a visual's form is
watchDeep(editedItem, (newEditedItem) => {
  if (newEditedItem) applyEdit(newEditedItem);
});
</script>

<template>
  <UiForm v-if="editedItem" p-3 flex flex-1 flex-col gap-4 min-h-0 of-y-auto>
    <UiTextField v-model="editedItem.chart.configuration.title" label="Title" />
  </UiForm>
</template>
