<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

interface ActionSlotProps {
  columns: DataSource["columns"];
  row: DataSource["rows"][number];
}

const { columns, row } = defineProps<ActionSlotProps>();
</script>

<template>
  <TableEditorFileRowEditDialogButton :columns :row />
  <TableEditorFileRowDeleteDialogButton :id="row.id" />
</template>
