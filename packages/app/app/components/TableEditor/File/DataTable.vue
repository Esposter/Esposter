<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { Row } from "#shared/models/tableEditor/file/Row";

import { DRAG_HANDLE_CLASS } from "@/services/tableEditor/file/constants";
import { takeOne } from "@esposter/shared";
import { VueDraggable } from "vue-draggable-plus";

interface DataTableProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<DataTableProps>();
const { reorderRows } = useEditedItemDataSourceOperations();
const headers = computed(() => [
  { key: "drag", sortable: false, title: "" },
  ...dataSource.columns
    .filter((column) => !column.hidden)
    .map((column) => ({
      key: column.name,
      title: column.name,
      value: (row: Row) => takeOne(row.data, column.name),
    })),
  { key: "actions", sortable: false, title: "Actions" },
]);
const dragRows = computed<DataSource["rows"]>({
  get: () => dataSource.rows,
  set: reorderRows,
});
</script>

<template>
  <VueDraggable v-model="dragRows" target="tbody" :handle="`.${DRAG_HANDLE_CLASS}`">
    <StyledDataTable
      flex
      flex-1
      flex-col
      :data-table-props="{
        height: '100%',
        headers,
        items: dragRows,
      }"
    >
      <template #[`item.drag`]>
        <v-icon :class="DRAG_HANDLE_CLASS" icon="mdi-drag" cursor-move />
      </template>
      <template #[`item.actions`]="{ item, index }">
        <TableEditorFileRowActionSlot :columns="dataSource.columns" :index :row="item" />
      </template>
    </StyledDataTable>
  </VueDraggable>
</template>
