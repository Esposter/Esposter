<script setup lang="ts">
import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { InternalDataTableHeader } from "vuetify/lib/components/VDataTable/types.mjs";
import type { IconValue } from "vuetify/lib/composables/icons.mjs";

import { DRAG_HANDLE_CLASS } from "@/services/tableEditor/file/constants";
import { useFilterStore } from "@/store/tableEditor/file/filter";

interface HeaderSlotProps {
  column: Column;
  getSortIcon: (column: InternalDataTableHeader) => IconValue;
  headerColumn: InternalDataTableHeader;
  isDraggable: boolean;
  isSorted: (column: InternalDataTableHeader) => boolean;
  toggleSort: (column: InternalDataTableHeader) => void;
}

const { column, getSortIcon, headerColumn, isDraggable, isSorted, toggleSort } = defineProps<HeaderSlotProps>();
const filterStore = useFilterStore();
const { setColumnFilter } = filterStore;
const { columnFilters } = storeToRefs(filterStore);
</script>

<template>
  <div flex flex-col @click.stop>
    <div class="group" flex cursor-pointer select-none items-center gap-1 @click="toggleSort(headerColumn)">
      <v-icon v-if="isDraggable" :class="DRAG_HANDLE_CLASS" icon="mdi-drag" cursor-move @click.stop />
      <span>{{ column.name }}</span>
      <v-icon
        transition-opacity
        duration-200
        :class="isSorted(headerColumn) ? '' : 'opacity-0 group-hover:opacity-50'"
        :icon="getSortIcon(headerColumn)"
      />
    </div>
    <TableEditorFileRowColumnFilterInput
      :column
      :model-value="columnFilters[column.name]"
      @update:model-value="setColumnFilter(column.name, $event)"
    />
  </div>
</template>
