<script setup lang="ts">
import { useColumnStore } from "@/store/tableEditor/file/column";

const columnStore = useColumnStore();
const { selectedColumnIds } = storeToRefs(columnStore);
const deleteColumns = useDeleteColumns();
</script>

<template>
  <TableEditorFileSelectionToolbar v-model="selectedColumnIds" label="column" @delete="deleteColumns" />
</template>
