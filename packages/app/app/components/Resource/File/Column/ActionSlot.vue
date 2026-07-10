<script setup lang="ts">
import type { Column } from "#shared/models/resource/file/column/Column";
import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";

interface ActionSlotProps {
  column: Column;
  dataSource: DataSource;
}

const { column, dataSource } = defineProps<ActionSlotProps>();
</script>

<template>
  <div flex>
    <ResourceFileColumnChartDialogButton :column :data-source />
    <ResourceFileColumnToggleVisibilityButton
      :column-id="column.id"
      :column-name="column.name"
      :hidden="column.hidden"
    />
    <ResourceFileColumnEditDialogButton :data-source :column />
    <ResourceFileColumnDeleteDialogButton :name="column.name" />
  </div>
</template>
