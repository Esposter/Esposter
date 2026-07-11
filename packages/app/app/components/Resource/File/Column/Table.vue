<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";

import { ColumnHeaders } from "@/services/resource/file/column/ColumnHeaders";
import { computeColumnStatistics } from "@/services/resource/file/column/computeColumnStatistics";
import { getEffectiveColumnColor } from "@/services/resource/file/column/getEffectiveColumnColor";
import { DRAG_HANDLE_CLASS } from "@/services/resource/file/constants";
import { useColumnStore } from "@/store/resource/file/column";
import { useColumnDialogStore } from "@/store/resource/file/columnDialog";
import { VueDraggable } from "vue-draggable-plus";

interface ColumnTableProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<ColumnTableProps>();
const columnStore = useColumnStore();
const { search, selectedColumnIds, sortBy } = storeToRefs(columnStore);
const columnDialogStore = useColumnDialogStore();
const { chartingColumnName, editingColumnName } = storeToRefs(columnDialogStore);
const isChartOpen = computed({
  get: () => Boolean(chartingColumnName.value),
  set: (value) => {
    if (value) return;
    chartingColumnName.value = "";
  },
});
const chartingColumnStatistics = computed(() =>
  chartingColumnName.value
    ? (computeColumnStatistics(dataSource).find(({ columnName }) => columnName === chartingColumnName.value) ?? null)
    : null,
);
const editingColumn = computed(() => dataSource.columns.find(({ name }) => name === editingColumnName.value));
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
      <ResourceFileColumnTextSlot />
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
          <ResourceFileColumnTopSlot />
        </template>
        <template #[`item.drag`]>
          <v-icon v-if="isDraggable" :class="DRAG_HANDLE_CLASS" icon="mdi-drag" cursor-move />
        </template>
        <template #[`item.name`]="{ item: column }">
          <ResourceFileColumnItemSlot :column />
        </template>
        <template #[`item.type`]="{ item: column }">
          <v-chip :color="getEffectiveColumnColor(column)" label size="small">{{ column.type }}</v-chip>
        </template>
        <template #[`item.actions`]="{ item: column }">
          <ResourceFileColumnActionSlot :column />
        </template>
      </StyledDataTable>
    </VueDraggable>
    <ResourceFileColumnChartDialog v-model="isChartOpen" :column-statistics="chartingColumnStatistics" />
    <ResourceFileColumnEditDialog v-if="editingColumn" :key="editingColumn.id" :column="editingColumn" :data-source />
    <ResourceFileColumnConfirmDeleteDialog />
  </v-card>
</template>
