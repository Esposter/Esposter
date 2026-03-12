<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { ColumnHeaders } from "@/services/tableEditor/file/ColumnHeaders";
import { ColumnTypeColorMap } from "@/services/tableEditor/file/ColumnTypeColorMap";

interface ColumnTableProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<ColumnTableProps>();
</script>

<template>
  <v-data-table :headers="ColumnHeaders" :items="dataSource.columns" density="compact" hide-default-footer>
    <template #[`item.type`]="{ item: column }">
      <v-chip :color="ColumnTypeColorMap[column.type]" label size="small">
        {{ column.type }}
      </v-chip>
    </template>
    <template #[`item.actions`]="{ item: column }">
      <TableEditorFileColumnEditDialogButton :column />
      <TableEditorFileColumnDeleteDialogButton :name="column.name" />
    </template>
  </v-data-table>
</template>
