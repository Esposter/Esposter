<script setup lang="ts">
import { useRowStore } from "@/store/resource/file/row";

const rowStore = useRowStore();
const { selectedRowIds } = storeToRefs(rowStore);
const deleteRows = useDeleteRows();
</script>

<template>
  <ResourceFileSelectionToolbar v-model="selectedRowIds" label="row" @delete="deleteRows">
    <ResourceFileRowCopyToClipboardButton :row-ids="selectedRowIds" />
  </ResourceFileSelectionToolbar>
</template>
