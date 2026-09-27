<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { getEffectiveColumnType } from "#shared/services/resource/sheet/column/getEffectiveColumnType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { ColumnHeaders } from "@/services/resource/sheet/column/ColumnHeaders";
import { ColumnTypeTokenMap } from "@/services/resource/sheet/column/ColumnTypeTokenMap";
import { computeColumnStatisticsForColumn } from "@/services/resource/sheet/column/computeColumnStatisticsForColumn";
import { getReorderedItems } from "@/services/shared/getReorderedItems";
import { REORDER_HANDLE_CLASS } from "@/services/ui/constants";
import { useColumnStore } from "@/store/resource/sheet/column";
import { useColumnDialogStore } from "@/store/resource/sheet/columnDialog";

interface Props {
  dataSource: DataSource;
}

const { dataSource } = defineProps<Props>();
const columnStore = useColumnStore();
const { search, selectedColumnIds, sortBy } = storeToRefs(columnStore);
const columnDialogStore = useColumnDialogStore();
const { chartingColumnName, editingColumnName } = storeToRefs(columnDialogStore);
// Both are resolved through the target so a column deleted or renamed under an open dialog drops it, instead
// Of leaving the dialog stranded on a column that is gone and re-opening it if that name appears again
const { isOpen: isChartOpen, item: chartingColumn } = useSingletonDialog(chartingColumnName, () =>
  dataSource.columns.find(({ name }) => name === chartingColumnName.value),
);
const chartingColumnStatistics = computed(() =>
  chartingColumn.value ? computeColumnStatisticsForColumn(dataSource, chartingColumn.value) : undefined,
);
const { item: editingColumn } = useSingletonDialog(editingColumnName, () =>
  dataSource.columns.find(({ name }) => name === editingColumnName.value),
);
const reorderColumns = useReorderColumns();
const isDraggable = computed(() => !search.value && sortBy.value.length === 0);
const { getColumnActionItems } = useColumnActionItems();
const { getContextMenuProps } = useContextMenu();
</script>

<template>
  <div flex flex-col gap-2>
    <UiTextField v-model="search" label="Search columns" :type="UiTextFieldType.Search" />
    <ResourceSheetColumnTopSlot v-if="selectedColumnIds.length > 0" />
    <UiDataTable
      v-model:selected-ids="selectedColumnIds"
      v-model:sort-by="sortBy"
      :columns="ColumnHeaders"
      :get-item-title="({ name }) => name"
      :get-row-props="(column) => getContextMenuProps(column.id, () => getColumnActionItems(column))"
      :is-reorderable="isDraggable || undefined"
      is-selectable
      :items="dataSource.columns"
      label="Columns"
      :search
      @reorder="(ids) => reorderColumns(getReorderedItems(dataSource.columns, ids))"
    >
      <template #cell="{ column: tableColumn, item: column, value }">
        <UiIcon
          v-if="tableColumn.key === 'drag' && isDraggable"
          :class="REORDER_HANDLE_CLASS"
          :meaning="UiIconMeaning.Drag"
          cursor-move
        />
        <ResourceSheetColumnItemSlot v-else-if="tableColumn.key === 'name'" :column />
        <UiChip v-else-if="tableColumn.key === 'type'" :token="ColumnTypeTokenMap[getEffectiveColumnType(column)]">
          {{ column.type }}
        </UiChip>
        <UiOverflowMenu
          v-else-if="tableColumn.key === 'actions'"
          :items="getColumnActionItems(column)"
          :label="`Actions for ${column.name}`"
        />
        <template v-else>{{ value }}</template>
      </template>
      <template #empty>
        <UiEmptyState :meaning="UiIconMeaning.Search" title="No columns match" />
      </template>
    </UiDataTable>
    <ResourceSheetColumnChartDialog v-model="isChartOpen" :column-statistics="chartingColumnStatistics" />
    <ResourceSheetColumnConfirmDeleteDialog :data-source />
    <ResourceSheetColumnEditDialog v-if="editingColumn" :key="editingColumn.id" :column="editingColumn" :data-source />
  </div>
</template>
