<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

interface ActionSlotProps {
  column: DataSource["columns"][number];
  dataSource: DataSource;
}

const { column, dataSource } = defineProps<ActionSlotProps>();
</script>

<template>
  <div flex>
    <TableEditorFileColumnChartDialogButton :column :data-source />
    <TableEditorFileColumnToggleVisibilityButton
      :column-id="column.id"
      :column-name="column.name"
      :hidden="column.hidden"
    />
    <TableEditorFileColumnEditDialogButton :data-source :column />
    <TableEditorFileColumnDeleteDialogButton :name="column.name" />
  </div>
</template>
