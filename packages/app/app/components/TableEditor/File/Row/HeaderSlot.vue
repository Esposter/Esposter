<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { InternalDataTableHeader } from "vuetify/lib/components/VDataTable/types.mjs";

import { useFileTableEditorStore } from "@/store/tableEditor/file";
import type { IconValue } from "vuetify/lib/composables/icons.mjs";

interface HeaderSlotProps {
  column: DataSource["columns"][number];
  getSortIcon: (column: InternalDataTableHeader) => IconValue;
  headerColumn: InternalDataTableHeader;
  isSorted: (column: InternalDataTableHeader) => boolean;
  toggleSort: (column: InternalDataTableHeader) => void;
}

const { column, getSortIcon, headerColumn, isSorted, toggleSort } = defineProps<HeaderSlotProps>();
const page = defineModel<number>("page", { required: true });
const fileTableEditorStore = useFileTableEditorStore();
const { setColumnFilter } = fileTableEditorStore;
const { columnFilters } = storeToRefs(fileTableEditorStore);
</script>

<template>
  <div flex flex-col @click.stop>
    <div class="group" flex cursor-pointer select-none items-center gap-1 @click="toggleSort(headerColumn)">
      <span>{{ column.name }}</span>
      <v-icon
        class="transition-opacity duration-200"
        :class="isSorted(headerColumn) ? '' : 'opacity-0 group-hover:opacity-50'"
        :icon="getSortIcon(headerColumn)"
      />
    </div>
    <TableEditorFileRowColumnFilterInput
      v-model:page="page"
      :column
      :model-value="columnFilters[column.name]"
      @update:model-value="setColumnFilter(column.name, $event)"
    />
  </div>
</template>
