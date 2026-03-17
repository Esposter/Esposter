<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { Row } from "#shared/models/tableEditor/file/Row";

import { DRAG_HANDLE_CLASS } from "@/services/tableEditor/file/constants";
import { takeOne } from "@esposter/shared";
import { VueDraggable } from "vue-draggable-plus";

interface DataTableProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<DataTableProps>();
const copyToClipboard = useCopyToClipboard();
const deleteRows = useDeleteRows();
const reorderRows = useReorderRows();
const selectedRowIds = ref<string[]>([]);
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
  get: () => dataSource.rows,
  set: reorderRows,
});
const rowIndexIdMap = computed(() => new Map(dataSource.rows.map((row, index) => [row.id, index])));
const { currentOccurrenceIndex, findValue, isOpen, occurrences } = useFindReplaceState();
const highlightableColumns = computed(() =>
  findValue.value ? dataSource.columns.filter((column) => !column.hidden) : [],
);
const currentOccurrence = computed(() => occurrences.value.at(currentOccurrenceIndex.value));
const getCellText = (item: Row, columnName: string): string => {
  const value = takeOne(item.data, columnName);
  return value === null ? "" : String(value);
};

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
        items: dragRows,
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
        <v-toolbar>
          <v-toolbar-title pl-3>
            {{ selectedRowIds.length }} row{{ selectedRowIds.length === 1 ? "" : "s" }} selected
          </v-toolbar-title>
          <v-tooltip text="Copy Selected Rows">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                m-0
                icon="mdi-content-copy"
                size="small"
                tile
                :="tooltipProps"
                @click="copyToClipboard(selectedRowIds)"
              />
            </template>
          </v-tooltip>
          <StyledConfirmDeleteDialogButton
            :card-props="{
              title: `Delete ${selectedRowIds.length} Row${selectedRowIds.length === 1 ? '' : 's'}`,
              text: `Are you sure you want to delete ${selectedRowIds.length} selected row${selectedRowIds.length === 1 ? '' : 's'}?`,
            }"
            @delete="
              (onComplete) => {
                deleteRows(selectedRowIds);
                selectedRowIds = [];
                onComplete();
              }
            "
          />
        </v-toolbar>
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
      <template v-for="column of highlightableColumns" :key="column.id" #[`item.${column.name}`]="{ item }">
        <TableEditorFileFindReplaceHighlight
          :text="getCellText(item, column.name)"
          :search="findValue"
          :is-current="
            currentOccurrence?.rowIndex === rowIndexIdMap.get(item.id) && currentOccurrence?.columnName === column.name
          "
        />
      </template>
    </StyledDataTable>
  </VueDraggable>
</template>
