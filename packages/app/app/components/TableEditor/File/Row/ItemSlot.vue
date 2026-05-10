<script setup lang="ts">
import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { Row } from "#shared/models/tableEditor/file/datasource/Row";

import { isEditableColumnValue } from "@/services/tableEditor/file/column/isEditableColumnValue";
import { useCellStore } from "@/store/tableEditor/file/cell";

interface ItemSlotProps {
  column: Column;
  columnIndex: number;
  columns: Column[];
  item: Row;
  rowIndex: number;
  rows: Row[];
}

const { column, columnIndex, columns, item, rowIndex, rows } = defineProps<ItemSlotProps>();
const cellStore = useCellStore();
const { isSelectingCells } = storeToRefs(cellStore);
const { endCellSelection, extendCellSelection, isCellInRange, isEditingCell, startCellSelection } = cellStore;
const editableColumn = computed(() => (isEditableColumnValue(column) ? column : null));
const isSelected = computed(() => isCellInRange(rowIndex, columnIndex));

const onMousedown = (event: MouseEvent) => {
  if (
    event.button !== 0 ||
    isEditingCell(rowIndex, column.name) ||
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement
  )
    return;
  event.preventDefault();
  startCellSelection(rowIndex, columnIndex);
};

const onMouseenter = (event: MouseEvent) => {
  if (!isSelectingCells.value) return;
  else if (!(event.buttons & 1)) endCellSelection();
  else extendCellSelection(rowIndex, columnIndex);
};
</script>

<template>
  <div
    :style="isSelected ? { background: 'rgba(var(--v-theme-info), 0.15)' } : {}"
    @mousedown="onMousedown"
    @mouseenter="onMouseenter"
  >
    <TableEditorFileRowFieldEditable
      v-if="isEditingCell(rowIndex, column.name) && editableColumn"
      :column="editableColumn"
      :columns
      :item
      :row-index
      :rows
    />
    <TableEditorFileRowField v-else :column :columns :item :row-index :rows />
  </div>
</template>
