<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { Row } from "#shared/models/tableEditor/file/Row";

import { toColumnKey } from "@/services/tableEditor/file/column/toColumnKey";
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
const { itemsPerPage, page, search, selectedRowIds, sortBy } = storeToRefs(rowStore);
const filterStore = useFilterStore();
const { columnFilters } = storeToRefs(filterStore);
const reorderRows = useReorderRows();
const filteredDataSource = computed(() => filterDataSourceRows(dataSource, columnFilters.value));
const displayColumns = computed(() => dataSource.columns.filter((column) => !column.hidden));
const hasPinnedColumns = computed(() => displayColumns.value.some((column) => column.fixed));
const headers = computed(() => [
  { fixed: hasPinnedColumns.value ? ("start" as const) : false, key: "drag", sortable: false, title: "" },
  { fixed: hasPinnedColumns.value ? ("start" as const) : false, key: "#", sortable: false, title: "#" },
  ...displayColumns.value.map((column) => ({
    fixed: column.fixed ? ("start" as const) : false,
    key: toColumnKey(column.name),
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
  <v-card flat>
    <template #text>
      <TableEditorFileRowTextSlot />
    </template>
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
          multiSort: true,
          page,
          search,
          showSelect: true,
          sortBy,
          'onUpdate:itemsPerPage': (newItemsPerPage) => {
            itemsPerPage = newItemsPerPage;
          },
          'onUpdate:modelValue': (newModelValue) => {
            selectedRowIds = newModelValue as string[];
          },
          'onUpdate:page': (newPage) => {
            page = newPage;
          },
          'onUpdate:sortBy': (newSortBy) => {
            sortBy = newSortBy;
          },
        }"
      >
        <template v-if="selectedRowIds.length > 0" #top>
          <TableEditorFileRowTopSlot />
        </template>
        <template #[`item.#`]="{ item }">
          {{ (rowIndexIdMap.get(item.id) ?? -1) + 1 }}
        </template>
        <template #[`item.drag`]>
          <v-icon
            v-if="sortBy.length === 0 && filteredDataSource === dataSource"
            :class="DRAG_HANDLE_CLASS"
            icon="mdi-drag"
            cursor-move
          />
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
          #[`header.${toColumnKey(column.name)}`]="{ column: headerColumn, getSortIcon, isSorted, toggleSort }"
        >
          <TableEditorFileRowHeaderSlot :column :get-sort-icon :header-column :is-sorted :toggle-sort />
        </template>
        <template v-for="column of displayColumns" :key="column.id" #[`item.${toColumnKey(column.name)}`]="{ item }">
          <TableEditorFileRowItemSlot :column :item :row-index="rowIndexIdMap.get(item.id) ?? -1" />
        </template>
        <template #tfoot>
          <TableEditorFileRowFooterSlot :data-source />
        </template>
      </StyledDataTable>
    </VueDraggable>
  </v-card>
</template>
