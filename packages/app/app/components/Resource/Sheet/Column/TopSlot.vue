<script setup lang="ts">
import { useColumnStore } from "@/store/resource/sheet/column";

const columnStore = useColumnStore();
const { selectedColumnIds } = storeToRefs(columnStore);
const deleteColumns = useDeleteColumns();
</script>

<template>
  <ResourceSheetSelectionToolbar v-model="selectedColumnIds" label="column" @delete="deleteColumns" />
</template>
