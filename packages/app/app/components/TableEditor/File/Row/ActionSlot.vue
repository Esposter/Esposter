<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

interface ActionSlotProps {
  columns: DataSource["columns"];
  index: number;
  row: DataSource["rows"][number];
}

const { columns, index, row } = defineProps<ActionSlotProps>();
</script>

<template>
  <div flex>
    <TableEditorFileRowCopyToClipboardButton :row-ids="[row.id]" />
    <TableEditorFileRowEditDialogButton :columns :index :row />
    <TableEditorFileRowDeleteDialogButton :id="row.id" :index />
  </div>
</template>
