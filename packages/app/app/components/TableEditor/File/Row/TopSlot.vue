<script setup lang="ts">
import { useRowStore } from "@/store/tableEditor/file/row";

const rowStore = useRowStore();
const { selectedRowIds } = storeToRefs(rowStore);
const deleteRows = useDeleteRows();
</script>

<template>
  <TableEditorFileSelectionToolbar v-model="selectedRowIds" label="row" @delete="deleteRows">
    <TableEditorFileRowCopyToClipboardButton :row-ids="selectedRowIds" />
  </TableEditorFileSelectionToolbar>
</template>
