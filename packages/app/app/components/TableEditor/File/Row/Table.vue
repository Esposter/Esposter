<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { Row } from "#shared/models/tableEditor/file/datasource/Row";
import type { CellPropsFunction } from "vuetify/lib/components/VDataTable/types.mjs";

import { ArrowKeyDeltaMap } from "@/services/tableEditor/file/ArrowKeyDeltaMap";
import { toColumnKey } from "@/services/tableEditor/file/column/toColumnKey";
import { DRAG_HANDLE_CLASS } from "@/services/tableEditor/file/constants";
import { useCellStore } from "@/store/tableEditor/file/cell";
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
const cellStore = useCellStore();
const { editingCell, focusCell, isSelectingCells, selectedCellRange } = storeToRefs(cellStore);
const {
  clearCellSelection,
  endCellSelection,
  extendCellSelection,
  isCellInRange,
  isEditingCell,
  shiftStartCellSelection,
  startCellSelection,
} = cellStore;
const copyRangeToClipboard = useCopyRangeToClipboard();
const pasteRangeFromClipboard = usePasteRangeFromClipboard();
const cellProps: CellPropsFunction<Row> = ({ column: headerColumn, item }) => {
  const column = displayColumns.value.find((col) => toColumnKey(col.name) === headerColumn.key);
  if (!column) return {};
  const columnIndex = displayColumns.value.indexOf(column);
  const rowIndex = rowIndexIdMap.value.get(item.id) ?? -1;
  const result: Record<string, unknown> = {
    onMousedown: (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        isEditingCell(rowIndex, column.name) ||
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;
      event.preventDefault();
      if (event.shiftKey) shiftStartCellSelection(rowIndex, columnIndex);
      else startCellSelection(rowIndex, columnIndex);
    },
    onMouseenter: (event: MouseEvent) => {
      if (!isSelectingCells.value) return;
      else if (event.buttons & 1) extendCellSelection(rowIndex, columnIndex);
      else endCellSelection();
    },
  };
  if (isCellInRange(rowIndex, columnIndex))
    result.style = { background: "rgba(var(--v-theme-info), var(--v-disabled-opacity))" };
  return result;
};

const getIsInputFocused = () => {
  const activeElement = document.activeElement;
  return activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;
};

onKeyStroke(["c", "C"], async (event) => {
  if (
    editingCell.value ||
    getIsInputFocused() ||
    (!event.ctrlKey && !event.metaKey) ||
    event.shiftKey ||
    !selectedCellRange.value
  )
    return;
  event.preventDefault();
  await copyRangeToClipboard();
});

onKeyStroke(["v", "V"], async (event) => {
  if (editingCell.value || getIsInputFocused() || (!event.ctrlKey && !event.metaKey) || !selectedCellRange.value)
    return;
  event.preventDefault();
  await pasteRangeFromClipboard(event.shiftKey);
});

onKeyStroke(["a", "A"], (event) => {
  if (editingCell.value || getIsInputFocused() || (!event.ctrlKey && !event.metaKey) || event.shiftKey) return;
  event.preventDefault();
  const rowCount = filteredRows.value.length;
  const columnCount = displayColumns.value.length;
  if (rowCount > 0 && columnCount > 0) {
    startCellSelection(0, 0);
    extendCellSelection(rowCount - 1, columnCount - 1);
    endCellSelection();
  }
});

onKeyStroke("Escape", () => {
  if (editingCell.value || getIsInputFocused() || !selectedCellRange.value) return;
  clearCellSelection();
});

onKeyStroke(["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp"], (event) => {
  if (editingCell.value || getIsInputFocused() || !focusCell.value) return;
  const arrowKeyDelta = ArrowKeyDeltaMap[event.key];
  if (!arrowKeyDelta) return;
  event.preventDefault();
  const [rowDelta, columnDelta] = arrowKeyDelta;
  const rowCount = filteredRows.value.length;
  const columnCount = displayColumns.value.length;
  const newRowIndex = Math.max(0, Math.min(rowCount - 1, focusCell.value.rowIndex + rowDelta));
  const newColumnIndex = Math.max(0, Math.min(columnCount - 1, focusCell.value.columnIndex + columnDelta));
  if (event.shiftKey) extendCellSelection(newRowIndex, newColumnIndex);
  else {
    startCellSelection(newRowIndex, newColumnIndex);
    endCellSelection();
  }
});
</script>

<template>
  <v-card flat>
    <template #text>
      <TableEditorFileRowTextSlot :data-source />
    </template>
    <VueDraggable v-model="dragRows" target="tbody" :disabled="!isDraggable" :handle="`.${DRAG_HANDLE_CLASS}`">
      <StyledDataTable
        flex
        flex-1
        flex-col
        :data-table-props="{
          cellProps,
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
