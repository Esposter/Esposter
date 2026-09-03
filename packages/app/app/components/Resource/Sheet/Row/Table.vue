<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { CellPropsFunction } from "vuetify/lib/components/VDataTable/types.mjs";

import { toColumnKey } from "@/services/resource/sheet/column/toColumnKey";
import { DRAG_HANDLE_CLASS } from "@/services/resource/sheet/constants";
import { useCellStore } from "@/store/resource/sheet/cell";
import { useColumnStore } from "@/store/resource/sheet/column";
import { useRowStore } from "@/store/resource/sheet/row";
import { useRowDialogStore } from "@/store/resource/sheet/rowDialog";
import { VueDraggable } from "vue-draggable-plus";

interface DataTableProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<DataTableProps>();
const table = useTemplateRef("table");
const columnStore = useColumnStore();
const { displayColumns } = storeToRefs(columnStore);
const rowStore = useRowStore();
const { filteredRows, itemsPerPage, page, rowIdIndexMap, search, selectedRowIds, sortBy, tableHeaders } =
  storeToRefs(rowStore);
const rowDialogStore = useRowDialogStore();
const { editingId } = storeToRefs(rowDialogStore);
// Resolved through the target so a filter, a search or a delete that takes the row out of the table drops the
// Target with it, instead of re-opening the edit dialog over that row the next time it is back in `filteredRows`
const { item: editingRow } = useSingletonDialog(editingId, () =>
  filteredRows.value.find(({ id }) => id === editingId.value),
);
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
const cellStore = useCellStore();
const { selectedCellRange } = storeToRefs(cellStore);
const {
  checkIsCellInRange,
  checkIsEditingCell,
  clearCellSelection,
  extendCellSelection,
  shiftStartCellSelection,
  startCellSelection,
} = cellStore;
const columnKeyMap = computed(
  () => new Map(displayColumns.value.map((column, columnIndex) => [toColumnKey(column.name), { column, columnIndex }])),
);
const cellProps: CellPropsFunction<Row> = ({ column: headerColumn, item }) => {
  if (!headerColumn.key) return {};
  const columnData = columnKeyMap.value.get(headerColumn.key);
  if (!columnData) return {};
  const { column, columnIndex } = columnData;
  const rowIndex = rowIdIndexMap.value.get(item.id);
  if (rowIndex === undefined) return {};
  const result: Record<string, unknown> = {
    onMousedown: (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        checkIsEditingCell(rowIndex, column.name) ||
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;
      event.preventDefault();
      if (event.shiftKey) shiftStartCellSelection(rowIndex, columnIndex);
      else startCellSelection(rowIndex, columnIndex);
    },
    onMouseenter: (event: MouseEvent) => {
      if (selectedCellRange.value && event.buttons & 1) extendCellSelection(rowIndex, columnIndex);
    },
  };
  if (checkIsCellInRange(rowIndex, columnIndex))
    result.style = { background: "rgba(var(--v-theme-info), var(--v-disabled-opacity))" };
  return result;
};

useCellKeyboardShortcuts();

// @ts-expect-error TS2590: Expression produces a union type that is too complex to represent.
onClickOutside(table, () => {
  clearCellSelection();
});
</script>

<template>
  <v-card flat>
    <template #text>
      <ResourceSheetRowTextSlot />
    </template>
    <VueDraggable v-model="dragRows" target="tbody" :disabled="!isDraggable" :handle="`.${DRAG_HANDLE_CLASS}`">
      <v-data-table
        ref="table"
        v-model="selectedRowIds"
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        v-model:sort-by="sortBy"
        density="compact"
        multi-sort
        show-select
        flex
        flex-1
        flex-col
        :cell-props
        :headers="tableHeaders"
        :items="filteredRows"
        :search
      >
        <template v-if="selectedRowIds.length > 0" #top>
          <ResourceSheetRowTopSlot />
        </template>
        <template #[`item.#`]="{ item }">
          {{ (rowIdIndexMap.get(item.id) ?? -1) + 1 }}
        </template>
        <template #[`item.drag`]>
          <v-icon v-if="isDraggable" :class="DRAG_HANDLE_CLASS" icon="mdi-drag" cursor-move />
        </template>
        <template #[`item.actions`]="{ item }">
          <ResourceSheetRowActionSlot :index="rowIdIndexMap.get(item.id) ?? -1" :row="item" />
        </template>
        <template
          v-for="column of displayColumns"
          :key="column.id"
          #[`header.${toColumnKey(column.name)}`]="{ column: headerColumn, getSortIcon, isSorted, toggleSort }"
        >
          <ResourceSheetRowHeaderSlot :column :get-sort-icon :header-column :is-sorted :toggle-sort />
        </template>
        <template v-for="column of displayColumns" :key="column.id" #[`item.${toColumnKey(column.name)}`]="{ item }">
          <ResourceSheetRowItemSlot :column :item :row-index="rowIdIndexMap.get(item.id) ?? -1" />
        </template>
        <template #tfoot>
          <ResourceSheetRowFooterSlot />
        </template>
      </v-data-table>
    </VueDraggable>
    <ResourceSheetRowEditDialog
      v-if="editingRow"
      :key="editingRow.id"
      :columns="dataSource.columns"
      :index="rowIdIndexMap.get(editingRow.id) ?? -1"
      :row="editingRow"
    />
    <ResourceSheetRowConfirmDeleteDialog />
  </v-card>
</template>
