<script setup lang="ts">
import { useColumnStore } from "#src/store/resource/sheet/column";
import { useColumnDialogStore } from "#src/store/resource/sheet/columnDialog";

const columnStore = useColumnStore();
const { selectedColumnIds } = storeToRefs(columnStore);
const columnDialogStore = useColumnDialogStore();
const { deletingColumnIds } = storeToRefs(columnDialogStore);
</script>

<template>
  <ResourceSheetSelectionToolbar
    v-model="selectedColumnIds"
    label="column"
    @delete="(ids) => (deletingColumnIds = ids)"
  />
</template>
