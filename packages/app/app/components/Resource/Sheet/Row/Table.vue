<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { CellPropsFunction } from "vuetify/lib/components/VDataTable/types.mjs";

import { PasteMode } from "@/models/resource/sheet/commands/PasteMode";
import { ArrowKeyDeltaMap } from "@/services/resource/sheet/ArrowKeyDeltaMap";
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
const { filteredRows, itemsPerPage, page, rowIndexIdMap, search, selectedRowIds, sortBy, tableHeaders } =
  storeToRefs(rowStore);
const rowDialogStore = useRowDialogStore();
const { editingId } = storeToRefs(rowDialogStore);
// Resolved through the target so a filter, a search or a delete that takes the row out of the table drops the
// Target with it, instead of re-opening the edit dialog over that row the next time it is back in `filteredRows`
const editingRow = useSingletonDialogTarget(editingId, () =>
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
const { editingCell, focusCell, selectedCellRange } = storeToRefs(cellStore);
const {
  clearCellSelection,
  extendCellSelection,
  isCellInRange,
  isEditingCell,
  shiftStartCellSelection,
  startCellSelection,
} = cellStore;
const copyRangeToClipboard = useCopyRangeToClipboard();
const pasteRangeFromClipboard = usePasteRangeFromClipboard();
const columnKeyMap = computed(
  () => new Map(displayColumns.value.map((column, columnIndex) => [toColumnKey(column.name), { column, columnIndex }])),
);
const cellProps: CellPropsFunction<Row> = ({ column: headerColumn, item }) => {
  if (!headerColumn.key) return {};
  const columnData = columnKeyMap.value.get(headerColumn.key);
  if (!columnData) return {};
  const { column, columnIndex } = columnData;
  const rowIndex = rowIndexIdMap.value.get(item.id);
  if (rowIndex === undefined) return {};
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
      if (selectedCellRange.value && event.buttons & 1) extendCellSelection(rowIndex, columnIndex);
    },
  };
  if (isCellInRange(rowIndex, columnIndex))
    result.style = { background: "rgba(var(--v-theme-info), var(--v-disabled-opacity))" };
  return result;
};

const getIsInputFocused = () => {
  const activeElement = window.document.activeElement;
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
  await pasteRangeFromClipboard(event.shiftKey ? PasteMode.ShiftDown : PasteMode.Overwrite);
});

onKeyStroke(["a", "A"], (event) => {
  if (editingCell.value || getIsInputFocused() || (!event.ctrlKey && !event.metaKey) || event.shiftKey) return;
  event.preventDefault();
  const rowCount = filteredRows.value.length;
  const columnCount = displayColumns.value.length;
  if (rowCount > 0 && columnCount > 0) {
    startCellSelection(0, 0);
    extendCellSelection(rowCount - 1, columnCount - 1);
  }
});

onKeyStroke(["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp"], (event) => {
  if (editingCell.value || getIsInputFocused() || !focusCell.value) return;
  const arrowDelta = ArrowKeyDeltaMap[event.key];
  if (!arrowDelta) return;
  event.preventDefault();
  const [rowDelta, columnDelta] = arrowDelta;
  const rowCount = filteredRows.value.length;
  const columnCount = displayColumns.value.length;
  const newRowIndex = Math.max(0, Math.min(rowCount - 1, focusCell.value.rowIndex + rowDelta));
  const newColumnIndex = Math.max(0, Math.min(columnCount - 1, focusCell.value.columnIndex + columnDelta));
  if (event.shiftKey) extendCellSelection(newRowIndex, newColumnIndex);
  else startCellSelection(newRowIndex, newColumnIndex);
});

onClickOutside(table, () => {
  clearCellSelection();
});

onKeyStroke("Escape", () => {
  if (editingCell.value || getIsInputFocused()) return;
  clearCellSelection();
});
</script>

<template>
  <v-card flat>
    <template #text>
      <ResourceSheetRowTextSlot :data-source />
    </template>
    <VueDraggable v-model="dragRows" target="tbody" :disabled="!isDraggable" :handle="`.${DRAG_HANDLE_CLASS}`">
      <StyledDataTable
        ref="table"
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
          <ResourceSheetRowTopSlot />
        </template>
        <template #[`item.#`]="{ item }">
          {{ (rowIndexIdMap.get(item.id) ?? -1) + 1 }}
        </template>
        <template #[`item.drag`]>
          <v-icon v-if="isDraggable" :class="DRAG_HANDLE_CLASS" icon="mdi-drag" cursor-move />
        </template>
        <template #[`item.actions`]="{ item }">
          <ResourceSheetRowActionSlot :index="rowIndexIdMap.get(item.id) ?? -1" :row="item" />
        </template>
        <template
          v-for="column of displayColumns"
          :key="column.id"
          #[`header.${toColumnKey(column.name)}`]="{ column: headerColumn, getSortIcon, isSorted, toggleSort }"
        >
          <ResourceSheetRowHeaderSlot :column :get-sort-icon :header-column :is-sorted :toggle-sort />
        </template>
        <template v-for="column of displayColumns" :key="column.id" #[`item.${toColumnKey(column.name)}`]="{ item }">
          <ResourceSheetRowItemSlot
            :column
            :columns="dataSource.columns"
            :item
            :row-index="rowIndexIdMap.get(item.id) ?? -1"
            :rows="filteredRows"
          />
        </template>
        <template #tfoot>
          <ResourceSheetRowFooterSlot />
        </template>
      </StyledDataTable>
    </VueDraggable>
    <ResourceSheetRowEditDialog
      v-if="editingRow"
      :key="editingRow.id"
      :columns="dataSource.columns"
      :index="rowIndexIdMap.get(editingRow.id) ?? -1"
      :row="editingRow"
    />
    <ResourceSheetRowConfirmDeleteDialog />
  </v-card>
</template>
