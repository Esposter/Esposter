<script setup lang="ts">
import { useColumnStore } from "@/store/resource/file/column";

const columnStore = useColumnStore();
const { selectedColumnIds } = storeToRefs(columnStore);
const deleteColumns = useDeleteColumns();
</script>

<template>
  <ResourceFileSelectionToolbar v-model="selectedColumnIds" label="column" @delete="deleteColumns" />
</template>
