<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { ColumnHeaders } from "@/services/tableEditor/file/column/ColumnHeaders";
import { ColumnTypeColorMap } from "@/services/tableEditor/file/column/ColumnTypeColorMap";
import { DRAG_HANDLE_CLASS } from "@/services/tableEditor/file/constants";
import { useColumnStore } from "@/store/tableEditor/file/column";
import { takeOne } from "@esposter/shared";
import { VueDraggable } from "vue-draggable-plus";

interface ColumnTableProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<ColumnTableProps>();
const columnStore = useColumnStore();
const { search, selectedColumnIds, sortBy } = storeToRefs(columnStore);
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
      <TableEditorFileColumnTextSlot />
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
          <TableEditorFileColumnTopSlot />
        </template>
        <template #[`item.drag`]>
          <v-icon v-if="isDraggable" :class="DRAG_HANDLE_CLASS" icon="mdi-drag" cursor-move />
        </template>
        <template #[`item.name`]="{ item: column }">
          <TableEditorFileColumnItemSlot :column />
        </template>
        <template #[`item.type`]="{ item: column }">
          <v-chip :color="takeOne(ColumnTypeColorMap, column.type)" label size="small">{{ column.type }}</v-chip>
        </template>
        <template #[`item.actions`]="{ item: column }">
          <TableEditorFileColumnActionSlot :data-source :column />
        </template>
      </StyledDataTable>
    </VueDraggable>
  </v-card>
</template>
