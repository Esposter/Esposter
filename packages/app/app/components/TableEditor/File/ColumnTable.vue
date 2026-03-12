<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { ColumnHeaders } from "@/services/tableEditor/file/ColumnHeaders";
import { ColumnTypeColorMap } from "@/services/tableEditor/file/ColumnTypeColorMap";
import { DRAG_HANDLE_ID } from "@/services/tableEditor/file/constants";
import { VueDraggable } from "vue-draggable-plus";

interface ColumnTableProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<ColumnTableProps>();
const { reorderColumns } = useEditedItemDataSource();
const dragColumns = computed({
  get: () => dataSource.columns,
  set: reorderColumns,
});
</script>

<template>
  <VueDraggable v-model="dragColumns" target="tbody" :handle="`#${DRAG_HANDLE_ID}`">
    <v-data-table :headers="ColumnHeaders" :items="dragColumns" density="compact" hide-default-footer>
      <template #[`item.drag`]>
        <v-icon :id="DRAG_HANDLE_ID" icon="mdi-drag" cursor-move />
      </template>
      <template #[`item.type`]="{ item: column }">
        <v-chip :color="ColumnTypeColorMap[column.type]" label size="small">{{ column.type }}</v-chip>
      </template>
      <template #[`item.actions`]="{ item: column }">
        <TableEditorFileColumnEditDialogButton :data-source :column />
        <TableEditorFileColumnDeleteDialogButton :name="column.name" />
      </template>
    </v-data-table>
  </VueDraggable>
</template>
