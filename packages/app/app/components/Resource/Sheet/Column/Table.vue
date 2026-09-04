<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { ColumnHeaders } from "@/services/resource/sheet/column/ColumnHeaders";
import { computeColumnStatisticsForColumn } from "@/services/resource/sheet/column/computeColumnStatisticsForColumn";
import { getEffectiveColumnColor } from "@/services/resource/sheet/column/getEffectiveColumnColor";
import { DRAG_HANDLE_CLASS } from "@/services/resource/sheet/constants";
import { useColumnStore } from "@/store/resource/sheet/column";
import { useColumnDialogStore } from "@/store/resource/sheet/columnDialog";
import { VueDraggable } from "vue-draggable-plus";

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
      <v-data-table
        v-model="selectedColumnIds"
        v-model:sort-by="sortBy"
        density="compact"
        hide-default-footer
        show-select
        :headers="ColumnHeaders"
        :items="dataSource.columns"
        :search
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
      </v-data-table>
    </VueDraggable>
    <ResourceSheetColumnChartDialog v-model="isChartOpen" :column-statistics="chartingColumnStatistics" />
    <ResourceSheetColumnEditDialog v-if="editingColumn" :key="editingColumn.id" :column="editingColumn" :data-source />
    <ResourceSheetColumnConfirmDeleteDialog />
  </v-card>
</template>
