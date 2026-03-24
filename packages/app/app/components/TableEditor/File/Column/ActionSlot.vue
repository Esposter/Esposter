<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";

interface ActionSlotProps {
  column: DataSource["columns"][number];
  dataSource: DataSource;
}

const { column, dataSource } = defineProps<ActionSlotProps>();
</script>

<template>
  <div flex>
    <TableEditorFileColumnChartDialogButton :column :data-source />
    <TableEditorFileColumnTogglePinButton :column-id="column.id" :column-name="column.name" :fixed="column.fixed" />
    <TableEditorFileColumnToggleVisibilityButton
      :column-id="column.id"
      :column-name="column.name"
      :hidden="column.hidden"
    />
    <TableEditorFileColumnEditDialogButton v-if="column.type !== ColumnType.Computed" :data-source :column />
    <TableEditorFileColumnDeleteDialogButton :name="column.name" />
  </div>
</template>
