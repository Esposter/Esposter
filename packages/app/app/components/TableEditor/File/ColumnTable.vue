<script setup lang="ts">
import { ColumnHeaders } from "@/services/tableEditor/file/ColumnHeaders";
import { ColumnTypeColorMap } from "@/services/tableEditor/file/ColumnTypeColorMap";
import { useFileTableEditorStore } from "@/store/tableEditor/file";

const fileTableEditorStore = useFileTableEditorStore();
const { dataSource } = storeToRefs(fileTableEditorStore);
</script>

<template>
  <v-data-table
    v-if="dataSource"
    :headers="ColumnHeaders"
    :items="dataSource.columns"
    density="compact"
    hide-default-footer
  >
    <template #[`item.type`]="{ item: column }">
      <v-chip :color="ColumnTypeColorMap[column.type]" label size="small">
        {{ column.type }}
      </v-chip>
    </template>
    <template #[`item.actions`]="{ item: column }">
      <TableEditorFileColumnEditDialogButton :column />
    </template>
  </v-data-table>
</template>
