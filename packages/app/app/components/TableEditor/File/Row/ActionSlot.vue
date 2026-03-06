<script setup lang="ts">
import type { CsvColumn } from "#shared/models/tableEditor/file/CsvColumn";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

interface ActionSlotProps {
  columns: CsvColumn[];
  index: number;
  row: DataSource["rows"][number];
}

const { columns, index, row } = defineProps<ActionSlotProps>();
</script>

<template>
  <TableEditorFileRowEditDialogButton :columns :index :row />
  <TableEditorFileRowDeleteDialogButton :index />
</template>
