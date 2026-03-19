<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { Row } from "#shared/models/tableEditor/file/Row";

import { DRAG_HANDLE_CLASS } from "@/services/tableEditor/file/constants";
import { filterDataSourceRows } from "@/services/tableEditor/file/dataSource/filterDataSourceRows";
import { useFilterStore } from "@/store/tableEditor/file/filter";
import { useRowStore } from "@/store/tableEditor/file/row";
import { takeOne } from "@esposter/shared";
import { VueDraggable } from "vue-draggable-plus";

interface DataTableProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<DataTableProps>();
const rowStore = useRowStore();
const { itemsPerPage, page, selectedRowIds } = storeToRefs(rowStore);
const filterStore = useFilterStore();
const { columnFilters } = storeToRefs(filterStore);
const reorderRows = useReorderRows();
const filteredDataSource = computed(() => filterDataSourceRows(dataSource, columnFilters.value));
const displayColumns = computed(() => dataSource.columns.filter((column) => !column.hidden));
const headers = computed(() => [
  { key: "drag", sortable: false, title: "" },
  ...displayColumns.value.map((column) => ({
    key: column.name,
    title: column.name,
    value: (row: Row) => takeOne(row.data, column.name),
  })),
  { key: "actions", sortable: false, title: "Actions" },
]);
const dragRows = computed({
  get: () => {
    if (itemsPerPage.value === -1) return filteredDataSource.value.rows;
    const startIndex = (page.value - 1) * itemsPerPage.value;
    return filteredDataSource.value.rows.slice(startIndex, startIndex + itemsPerPage.value);
  },
  set: reorderRows,
});
const rowIndexIdMap = computed(() => new Map(filteredDataSource.value.rows.map((row, index) => [row.id, index])));
</script>

<template>
  <TableEditorFileFindReplaceBar />
  <VueDraggable v-model="dragRows" target="tbody" :handle="`.${DRAG_HANDLE_CLASS}`">
    <StyledDataTable
      flex
      flex-1
      flex-col
      :data-table-props="{
        density: 'compact',
        headers,
        itemsPerPage,
        items: filteredDataSource.rows,
        modelValue: selectedRowIds,
        page,
        showSelect: true,
        'onUpdate:itemsPerPage': (newItemsPerPage) => {
          itemsPerPage = newItemsPerPage;
        },
        'onUpdate:modelValue': (newModelValue) => {
          selectedRowIds = newModelValue as string[];
        },
        'onUpdate:page': (newPage) => {
          page = newPage;
        },
      }"
    >
      <template v-if="selectedRowIds.length > 0" #top>
        <TableEditorFileRowTopSlot />
      </template>
      <template #[`item.drag`]>
        <v-icon :class="DRAG_HANDLE_CLASS" icon="mdi-drag" cursor-move />
      </template>
      <template #[`item.actions`]="{ item }">
        <TableEditorFileRowActionSlot
          :columns="dataSource.columns"
          :index="rowIndexIdMap.get(item.id) ?? -1"
          :row="item"
        />
      </template>
      <template
        v-for="column of displayColumns"
        :key="column.id"
        #[`header.${column.name}`]="{ column: headerColumn, getSortIcon, isSorted, toggleSort }"
      >
        <TableEditorFileRowHeaderSlot
          :column
          :getSortIcon
          :headerColumn
          :isSorted
          :toggleSort
        />
      </template>
      <template v-for="column of displayColumns" :key="column.id" #[`item.${column.name}`]="{ item }">
        <TableEditorFileRowCellSlot
          :column
          :item
          :rowIndex="rowIndexIdMap.get(item.id) ?? -1"
        />
      </template>
    </StyledDataTable>
  </VueDraggable>
</template>
