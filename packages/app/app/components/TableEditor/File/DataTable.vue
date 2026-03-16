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
const { deleteRows, reorderRows } = useEditedItemDataSourceOperations();
const selectedRowIds = ref<string[]>([]);
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
const dragRows = computed({
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
        density: 'compact',
        headers,
        items: dragRows,
        modelValue: selectedRowIds,
        showSelect: true,
        'onUpdate:modelValue': (newSelectedIds) => {
          selectedRowIds = newSelectedIds as string[];
        },
      }"
    >
      <template v-if="selectedRowIds.length > 0" #top>
        <v-toolbar>
          <v-toolbar-title pl-3>
            {{ selectedRowIds.length }} row{{ selectedRowIds.length === 1 ? "" : "s" }} selected
          </v-toolbar-title>
          <StyledConfirmDeleteDialogButton
            :card-props="{
              title: `Delete ${selectedRowIds.length} Row${selectedRowIds.length === 1 ? '' : 's'}`,
              text: `Are you sure you want to delete ${selectedRowIds.length} selected row${selectedRowIds.length === 1 ? '' : 's'}?`,
            }"
            @delete="
              (onComplete) => {
                deleteRows(selectedRowIds);
                selectedRowIds = [];
                onComplete();
              }
            "
          />
        </v-toolbar>
      </template>
      <template #[`item.drag`]>
        <v-icon :class="DRAG_HANDLE_CLASS" icon="mdi-drag" cursor-move />
      </template>
      <template #[`item.actions`]="{ item }">
        <TableEditorFileRowActionSlot
          :columns="dataSource.columns"
          :index="dataSource.rows.findIndex((row) => row.id === item.id)"
          :row="item"
        />
      </template>
    </StyledDataTable>
  </VueDraggable>
</template>
