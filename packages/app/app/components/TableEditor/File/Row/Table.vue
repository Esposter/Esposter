<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { toColumnKey } from "@/services/tableEditor/file/column/toColumnKey";
import { DRAG_HANDLE_CLASS } from "@/services/tableEditor/file/constants";
import { useColumnStore } from "@/store/tableEditor/file/column";
import { useRowStore } from "@/store/tableEditor/file/row";
import { VueDraggable } from "vue-draggable-plus";

interface DataTableProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<DataTableProps>();
const columnStore = useColumnStore();
const { displayColumns } = storeToRefs(columnStore);
const rowStore = useRowStore();
const { filteredRows, itemsPerPage, page, rowIndexIdMap, search, selectedRowIds, sortBy, tableHeaders } =
  storeToRefs(rowStore);
const reorderRows = useReorderRows();
const dragRows = computed({
  get: () => {
    if (itemsPerPage.value === -1) return filteredRows.value;
    const startIndex = (page.value - 1) * itemsPerPage.value;
    return filteredRows.value.slice(startIndex, startIndex + itemsPerPage.value);
  },
  set: reorderRows,
});
const isDraggable = computed(
  () => !search.value && sortBy.value.length === 0 && filteredRows.value === dataSource.rows,
);
</script>

<template>
  <v-card flat>
    <template #text>
      <TableEditorFileRowTextSlot />
    </template>
    <VueDraggable v-model="dragRows" target="tbody" :disabled="!isDraggable" :handle="`.${DRAG_HANDLE_CLASS}`">
      <StyledDataTable
        flex
        flex-1
        flex-col
        :data-table-props="{
          density: 'compact',
          headers: tableHeaders,
          itemsPerPage,
          items: filteredRows,
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
          <v-icon v-if="isDraggable" :class="DRAG_HANDLE_CLASS" icon="mdi-drag" cursor-move />
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
          <TableEditorFileRowItemSlot
            :column
            :columns="dataSource.columns"
            :item
            :row-index="rowIndexIdMap.get(item.id) ?? -1"
            :rows="filteredRows"
          />
        </template>
        <template #tfoot>
          <TableEditorFileRowFooterSlot />
        </template>
      </StyledDataTable>
    </VueDraggable>
  </v-card>
</template>
