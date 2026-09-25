<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { UiDataTableColumn } from "@/models/ui/UiDataTableColumn";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { checkIsEditableColumnValue } from "@/services/resource/sheet/column/checkIsEditableColumnValue";
import { toColumnKey } from "@/services/resource/sheet/column/toColumnKey";
import { DRAG_HANDLE_CLASS } from "@/services/resource/sheet/constants";
import { DATA_TABLE_ITEMS_PER_PAGE_OPTIONS } from "@/services/ui/constants";
import { useSheetStore } from "@/store/resource/sheet";
import { useCellStore } from "@/store/resource/sheet/cell";
import { useColumnStore } from "@/store/resource/sheet/column";
import { useRowStore } from "@/store/resource/sheet/row";
import { useRowDialogStore } from "@/store/resource/sheet/rowDialog";
import { VueDraggable } from "vue-draggable-plus";

interface Props {
  dataSource: DataSource;
}

const { dataSource } = defineProps<Props>();
const table = useTemplateRef("table");
const sheetStore = useSheetStore();
const { saveSheet } = sheetStore;
const { settings } = storeToRefs(sheetStore);
const columnStore = useColumnStore();
const { displayColumns } = storeToRefs(columnStore);
const rowStore = useRowStore();
const {
  columnKeySummaryMap,
  filteredRows,
  itemsPerPage,
  page,
  rowIdIndexMap,
  search,
  selectedRowIds,
  sortBy,
  tableColumns,
} = storeToRefs(rowStore);
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
const { focusedCell, selectedCellRange } = storeToRefs(cellStore);
const {
  checkIsCellInRange,
  checkIsEditingCell,
  clearCellSelection,
  extendCellSelection,
  requestFocus,
  shiftStartCellSelection,
  startCellSelection,
} = cellStore;
const columnKeyMap = computed(
  () => new Map(displayColumns.value.map((column, columnIndex) => [toColumnKey(column.name), { column, columnIndex }])),
);
// The widths the reader dragged the columns to are the sheet's settings, by each column's id so a rename keeps its
// Width, and by its key for a column the table draws of its own
const columnKeyWidthMap = computed({
  get: () => {
    const columnIdKeyMap = new Map(displayColumns.value.map(({ id, name }) => [id, toColumnKey(name)]));
    return Object.fromEntries(
      Object.entries(settings.value.columnIdWidthMap ?? {}).map(([id, width]) => [columnIdKeyMap.get(id) ?? id, width]),
    );
  },
  set: (newColumnKeyWidthMap) => {
    settings.value.columnIdWidthMap = Object.fromEntries(
      Object.entries(newColumnKeyWidthMap).map(([key, width]) => [
        columnKeyMap.value.get(key)?.column.id ?? key,
        width,
      ]),
    );
  },
});
watchAutosave(() => settings.value.columnIdWidthMap, saveSheet);
// A data cell starts, extends and shows a range of selected cells, as a spreadsheet's does
const getCellProps = (tableColumn: UiDataTableColumn<Row>, row: Row) => {
  const columnData = columnKeyMap.value.get(tableColumn.key);
  const rowIndex = rowIdIndexMap.value.get(row.id);
  if (!columnData || rowIndex === undefined) return {};
  const { column, columnIndex } = columnData;
  return {
    "data-in-range": checkIsCellInRange(rowIndex, columnIndex) || undefined,
    onMousedown: (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        checkIsEditingCell(rowIndex, column.name) ||
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;
      // A press starts a selection rather than a text one, and still takes the cell as the grid's active one once the
      // Selection holds it, so the grid's focus leaves the range as the press made it
      event.preventDefault();
      if (event.shiftKey) shiftStartCellSelection(rowIndex, columnIndex);
      else startCellSelection(rowIndex, columnIndex);
      if (event.currentTarget instanceof HTMLElement) event.currentTarget.focus();
    },
    onMouseenter: (event: MouseEvent) => {
      if (selectedCellRange.value && event.buttons & 1) extendCellSelection(rowIndex, columnIndex);
    },
  };
};

const { getColumnActionItems } = useColumnActionItems();
const { getContextMenuProps } = useContextMenu();
// A data column's header is the column itself, so a right-click on it opens the column's commands
const getHeaderProps = (tableColumn: UiDataTableColumn<Row>) => {
  const columnData = columnKeyMap.value.get(tableColumn.key);
  return columnData ? getContextMenuProps(columnData.column.id, () => getColumnActionItems(columnData.column)) : {};
};

onClickOutside(table, () => {
  clearCellSelection();
});
</script>

<template>
  <div ref="table" class="sheet" flex flex-col gap-2>
    <ResourceSheetRowTextSlot />
    <ResourceSheetRowTopSlot v-if="selectedRowIds.length > 0" />
    <VueDraggable v-model="dragRows" target="tbody" :disabled="!isDraggable" :handle="`.${DRAG_HANDLE_CLASS}`">
      <UiDataTable
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        v-model:selected-ids="selectedRowIds"
        v-model:sort-by="sortBy"
        v-model:column-key-width-map="columnKeyWidthMap"
        :columns="tableColumns"
        :get-cell-props
        :get-header-props
        :get-item-title="({ id }) => `row ${(rowIdIndexMap.get(id) ?? -1) + 1}`"
        is-cell-navigable
        is-first-column-sticky
        is-multi-sort
        is-resizable
        is-selectable
        :items="filteredRows"
        :items-per-page-options="DATA_TABLE_ITEMS_PER_PAGE_OPTIONS"
        label="Rows"
        :search
        @edit-cell="
          (tableColumn, row) => {
            const column = columnKeyMap.get(tableColumn.key)?.column;
            const rowIndex = rowIdIndexMap.get(row.id);
            if (column && rowIndex !== undefined && checkIsEditableColumnValue(column))
              requestFocus(rowIndex, column.name);
          }
        "
        @update:active-cell="
          (activeCell) => {
            const columnIndex = activeCell && columnKeyMap.get(activeCell.columnKey)?.columnIndex;
            const rowIndex = activeCell && rowIdIndexMap.get(activeCell.itemId);
            // A cell the keys move to is the selection, as a spreadsheet's active cell is; one a press already selected,
            // Or extended the selection to, is left as it is
            if (columnIndex === undefined || rowIndex === undefined) clearCellSelection();
            else if (focusedCell?.rowIndex !== rowIndex || focusedCell.columnIndex !== columnIndex)
              startCellSelection(rowIndex, columnIndex);
          }
        "
      >
        <template #header="{ column: tableColumn }">
          <ResourceSheetRowHeaderSlot :column-key="tableColumn.key" />
        </template>
        <template #cell="{ column: tableColumn, item }">
          <UiIcon
            v-if="tableColumn.key === 'drag' && isDraggable"
            :class="DRAG_HANDLE_CLASS"
            :meaning="UiIconMeaning.Drag"
            cursor-move
          />
          <template v-else-if="tableColumn.key === '#'">{{ (rowIdIndexMap.get(item.id) ?? -1) + 1 }}</template>
          <ResourceSheetRowActionSlot
            v-else-if="tableColumn.key === 'actions'"
            :index="rowIdIndexMap.get(item.id) ?? -1"
            :row="item"
          />
          <ResourceSheetRowItemSlot
            v-else
            :column-key="tableColumn.key"
            :item
            :row-index="rowIdIndexMap.get(item.id) ?? -1"
          />
        </template>
        <template #foot="{ column: tableColumn }">{{ columnKeySummaryMap.get(tableColumn.key) ?? "" }}</template>
        <template #empty>
          <UiEmptyState :meaning="UiIconMeaning.Search" title="No rows match" />
        </template>
      </UiDataTable>
    </VueDraggable>
    <ResourceSheetRowEditDialog
      v-if="editingRow"
      :key="editingRow.id"
      :columns="dataSource.columns"
      :index="rowIdIndexMap.get(editingRow.id) ?? -1"
      :row="editingRow"
    />
    <ResourceSheetRowConfirmDeleteDialog />
  </div>
</template>

<style scoped>
/* A cell in the selected range is tinted in the info colour, as a spreadsheet's selection is */
.sheet :deep(td[data-in-range]) {
  background-color: color-mix(in srgb, var(--ui-info) 25%, transparent);
}
</style>
