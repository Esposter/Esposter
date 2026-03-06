<script setup lang="ts">
import type { ColumnItem } from "#shared/models/tableEditor/file/ColumnItem";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

interface ActionSlotProps {
  columns: ColumnItem[];
  index: number;
  row: DataSource["rows"][number];
}

const { columns, index, row } = defineProps<ActionSlotProps>();
</script>

<template>
  <TableEditorFileRowEditDialogButton :columns :index :row />
  <TableEditorFileRowDeleteDialogButton :index />
</template>
