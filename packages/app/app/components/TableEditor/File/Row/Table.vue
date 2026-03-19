<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { Row } from "#shared/models/tableEditor/file/Row";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { DRAG_HANDLE_CLASS } from "@/services/tableEditor/file/constants";
import { getCellId } from "@/services/tableEditor/file/getCellId";
import { useFileTableEditorStore } from "@/store/tableEditor/file";
import { takeOne } from "@esposter/shared";
import { VueDraggable } from "vue-draggable-plus";

interface DataTableProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<DataTableProps>();
const fileTableEditorStore = useFileTableEditorStore();
const { selectedRowIds } = storeToRefs(fileTableEditorStore);
const reorderRows = useReorderRows();
const page = ref(1);
const itemsPerPage = ref(10);
const headers = computed(() => [
  { key: "drag", sortable: false, title: "" },
  ...dataSource.columns
    .filter((column) => !column.hidden)
    .map((column) => ({
      key: column.name,
      title: column.name,
      value: (row: Row) => takeOne(row.data, column.name),
    })),
  { key: "actions", sortable: false, title: "Actions" },
]);
const dragRows = computed({
  get: () => {
    if (itemsPerPage.value === -1) return dataSource.rows;
    const startIndex = (page.value - 1) * itemsPerPage.value;
    return dataSource.rows.slice(startIndex, startIndex + itemsPerPage.value);
  },
  set: reorderRows,
});
const rowIndexIdMap = computed(() => new Map(dataSource.rows.map((row, index) => [row.id, index])));
const { currentOccurrenceIndex, findValue, isOpen, occurrences } = useFindReplaceState();
const { isOutlierHighlightEnabled, outlierCells } = useOutlierState();
const currentOccurrence = computed(() => occurrences.value.at(currentOccurrenceIndex.value));
const getCellText = (item: Row, columnName: string): string => {
  const value = takeOne(item.data, columnName);
  return value === null ? "" : String(value);
};
const isOutlierCell = (rowId: string, columnName: string) => outlierCells.value.has(getCellId(rowId, columnName));
const slottedColumns = computed(() => {
  const findColumns = findValue.value ? dataSource.columns.filter((column) => !column.hidden) : [];
  const outlierColumns = isOutlierHighlightEnabled.value
    ? dataSource.columns.filter((column) => column.type === ColumnType.Number && !column.hidden)
    : [];
  const seen = new Set<string>();
  return [...findColumns, ...outlierColumns].filter(({ id }) => !seen.has(id) && seen.add(id));
});

watch([currentOccurrence, itemsPerPage], async ([newCurrentOccurrence, newItemsPerPage]) => {
  if (!newCurrentOccurrence) return;
  const targetPage = Math.floor(newCurrentOccurrence.rowIndex / newItemsPerPage) + 1;
  if (page.value !== targetPage) page.value = targetPage;
  await nextTick();
  document.querySelector("[data-find-replace-current]")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
});
</script>

<template>
  <v-expand-transition>
    <TableEditorFileFindReplaceBar v-if="isOpen" />
  </v-expand-transition>
  <VueDraggable v-model="dragRows" target="tbody" :handle="`.${DRAG_HANDLE_CLASS}`">
    <StyledDataTable
      flex
      flex-1
      flex-col
      :data-table-props="{
        density: 'compact',
        headers,
        itemsPerPage,
        items: dataSource.rows,
        modelValue: selectedRowIds,
        page,
        showSelect: true,
        'onUpdate:itemsPerPage': (newItemsPerPage) => {
          itemsPerPage = newItemsPerPage;
        },
        'onUpdate:modelValue': (newModelValue) => {
          selectedRowIds = newModelValue as string[];
        },
        'onUpdate:page': (newPage) => {
          page = newPage;
        },
      }"
    >
      <template v-if="selectedRowIds.length > 0" #top>
        <TableEditorFileRowTopSlot />
      </template>
      <template #[`item.drag`]>
        <v-icon :class="DRAG_HANDLE_CLASS" icon="mdi-drag" cursor-move />
      </template>
      <template #[`item.actions`]="{ item }">
        <TableEditorFileRowActionSlot
          :columns="dataSource.columns"
          :index="rowIndexIdMap.get(item.id) ?? -1"
          :row="item"
        />
      </template>
      <template v-for="column of slottedColumns" :key="column.id" #[`item.${column.name}`]="{ item }">
        <TableEditorFileFindReplaceHighlight
          v-if="findValue"
          :class="{ 'bg-orange-100 ring-1 ring-orange-400': isOutlierCell(item.id, column.name) }"
          :is-current="
            currentOccurrence?.rowIndex === rowIndexIdMap.get(item.id) && currentOccurrence?.columnName === column.name
          "
          :search="findValue"
          :text="getCellText(item, column.name)"
        />
        <TableEditorFileRowOutlierHighlight
          v-else
          :is-outlier="isOutlierCell(item.id, column.name)"
          :text="getCellText(item, column.name)"
        />
      </template>
    </StyledDataTable>
  </VueDraggable>
</template>
