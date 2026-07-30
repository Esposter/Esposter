<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { ColumnHeaders } from "@/services/resource/sheet/column/ColumnHeaders";
import { computeColumnStatisticsForColumn } from "@/services/resource/sheet/column/computeColumnStatisticsForColumn";
import { getEffectiveColumnColor } from "@/services/resource/sheet/column/getEffectiveColumnColor";
import { DRAG_HANDLE_CLASS } from "@/services/resource/sheet/constants";
import { useColumnStore } from "@/store/resource/sheet/column";
import { useColumnDialogStore } from "@/store/resource/sheet/columnDialog";
import { VueDraggable } from "vue-draggable-plus";

interface ColumnTableProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<ColumnTableProps>();
const columnStore = useColumnStore();
const { search, selectedColumnIds, sortBy } = storeToRefs(columnStore);
const columnDialogStore = useColumnDialogStore();
const { chartingColumnName, editingColumnName } = storeToRefs(columnDialogStore);
const { isOpen: isChartOpen } = useSingletonDialog(chartingColumnName);
const chartingColumnStatistics = computed(() => {
  const chartingColumn = dataSource.columns.find(({ name }) => name === chartingColumnName.value);
  return chartingColumn ? computeColumnStatisticsForColumn(dataSource, chartingColumn) : undefined;
});
// Resolved through the target so a column deleted or renamed under the open dialog drops it, instead of
// Re-opening the edit dialog if a column of that name appears again
const { item: editingColumn } = useSingletonDialog(editingColumnName, () =>
  dataSource.columns.find(({ name }) => name === editingColumnName.value),
);
const reorderColumns = useReorderColumns();
const isDraggable = computed(() => !search.value && sortBy.value.length === 0);
const dragColumns = computed({
  get: () => dataSource.columns,
  set: reorderColumns,
});
</script>

<template>
  <v-card flat>
    <template #text>
      <ResourceSheetColumnTextSlot />
    </template>
    <VueDraggable v-model="dragColumns" target="tbody" :disabled="!isDraggable" :handle="`.${DRAG_HANDLE_CLASS}`">
      <StyledDataTable
        :data-table-props="{
          density: 'compact',
          headers: ColumnHeaders,
          hideDefaultFooter: true,
          items: dataSource.columns,
          modelValue: selectedColumnIds,
          search,
          showSelect: true,
          sortBy,
          'onUpdate:modelValue': (newSelectedColumnIds) => {
            selectedColumnIds = newSelectedColumnIds as string[];
          },
          'onUpdate:sortBy': (newSortBy) => {
            sortBy = newSortBy;
          },
        }"
      >
        <template v-if="selectedColumnIds.length > 0" #top>
          <ResourceSheetColumnTopSlot />
        </template>
        <template #[`item.drag`]>
          <v-icon v-if="isDraggable" :class="DRAG_HANDLE_CLASS" icon="mdi-drag" cursor-move />
        </template>
        <template #[`item.name`]="{ item: column }">
          <ResourceSheetColumnItemSlot :column />
        </template>
        <template #[`item.type`]="{ item: column }">
          <v-chip :color="getEffectiveColumnColor(column)" label size="small">{{ column.type }}</v-chip>
        </template>
        <template #[`item.actions`]="{ item: column }">
          <ResourceSheetColumnActionSlot :column />
        </template>
      </StyledDataTable>
    </VueDraggable>
    <ResourceSheetColumnChartDialog v-model="isChartOpen" :column-statistics="chartingColumnStatistics" />
    <ResourceSheetColumnEditDialog v-if="editingColumn" :key="editingColumn.id" :column="editingColumn" :data-source />
    <ResourceSheetColumnConfirmDeleteDialog />
  </v-card>
</template>
