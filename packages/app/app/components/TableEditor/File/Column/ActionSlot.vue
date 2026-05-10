<script setup lang="ts">
import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

interface ActionSlotProps {
  column: Column;
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
