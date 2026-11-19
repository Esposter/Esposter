<script setup lang="ts">
import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { ToData } from "@esposter/shared";

import { checkIsEditableColumnValue } from "#shared/services/resource/sheet/column/checkIsEditableColumnValue";
import { useCellStore } from "#src/store/resource/sheet/cell";

interface Props {
  column: ToData<Column> | undefined;
  item: ToData<Row>;
  rowIndex: number;
}

const { column } = defineProps<Props>();
const cellStore = useCellStore();
const { checkIsEditingCell } = cellStore;
const editableColumn = computed(() => (column && checkIsEditableColumnValue(column) ? column : undefined));
</script>

<template>
  <ResourceSheetRowFieldEditable
    v-if="editableColumn && checkIsEditingCell(rowIndex, editableColumn.name)"
    :column="editableColumn"
    :item
    :row-index
  />
  <ResourceSheetRowField v-else-if="column" :column :item :row-index />
</template>
