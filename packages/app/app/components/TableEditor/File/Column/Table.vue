<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { SortItem } from "vuetify/lib/components/VDataTable/composables/sort.mjs";

import { ColumnHeaders } from "@/services/tableEditor/file/column/ColumnHeaders";
import { ColumnTypeColorMap } from "@/services/tableEditor/file/column/ColumnTypeColorMap";
import { DRAG_HANDLE_CLASS } from "@/services/tableEditor/file/constants";
import { takeOne } from "@esposter/shared";
import { VueDraggable } from "vue-draggable-plus";

interface ColumnTableProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<ColumnTableProps>();
const reorderColumns = useReorderColumns();
const selectedColumnIds = ref<string[]>([]);
const sortBy = ref<readonly SortItem[]>([]);
const dragColumns = computed({
  get: () => dataSource.columns,
  set: reorderColumns,
});
</script>

<template>
  <VueDraggable v-model="dragColumns" target="tbody" :handle="`.${DRAG_HANDLE_CLASS}`">
    <StyledDataTable
      :data-table-props="{
        density: 'compact',
        headers: ColumnHeaders,
        hideDefaultFooter: true,
        items: dataSource.columns,
        modelValue: selectedColumnIds,
        showSelect: true,
        sortBy,
        'onUpdate:modelValue': (newSelectedIds) => {
          selectedColumnIds = newSelectedIds as string[];
        },
        'onUpdate:sortBy': (newSortBy) => {
          sortBy = newSortBy;
        },
      }"
    >
      <template v-if="selectedColumnIds.length > 0" #top>
        <TableEditorFileColumnTopSlot v-model="selectedColumnIds" />
      </template>
      <template #item.drag>
        <v-icon v-if="sortBy.length === 0" :class="DRAG_HANDLE_CLASS" icon="mdi-drag" cursor-move />
      </template>
      <template #item.name="{ item: column }">
        <TableEditorFileColumnItemSlot :column />
      </template>
      <template #item.type="{ item: column }">
        <v-chip :color="takeOne(ColumnTypeColorMap, column.type)" label size="small">{{ column.type }}</v-chip>
      </template>
      <template #item.actions="{ item: column }">
        <TableEditorFileColumnActionSlot :data-source :column />
      </template>
    </StyledDataTable>
  </VueDraggable>
</template>
