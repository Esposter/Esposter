<script setup lang="ts">
import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { InternalDataTableHeader } from "vuetify/lib/components/VDataTable/types.mjs";
import type { IconValue } from "vuetify/lib/composables/icons.mjs";

import { useFilterStore } from "@/store/resource/sheet/filter";

interface Props {
  column: Column;
  getSortIcon: (column: InternalDataTableHeader) => IconValue;
  headerColumn: InternalDataTableHeader;
  isSorted: (column: InternalDataTableHeader) => boolean;
  toggleSort: (column: InternalDataTableHeader) => void;
}

const { column, getSortIcon, headerColumn, isSorted, toggleSort } = defineProps<Props>();
const filterStore = useFilterStore();
const { setColumnFilter } = filterStore;
const { columnFilters } = storeToRefs(filterStore);
</script>

<template>
  <div flex flex-col @click.stop>
    <div class="group" flex gap-1 cursor-pointer select-none items-center @click="toggleSort(headerColumn)">
      {{ column.name }}
      <v-icon
        transition-opacity
        duration-200
        :class="isSorted(headerColumn) ? '' : 'op-0 group-hover:op-50'"
        :icon="getSortIcon(headerColumn)"
      />
    </div>
    <ResourceSheetRowColumnFilterInput
      :column
      :model-value="columnFilters[column.name]"
      @update:model-value="setColumnFilter(column.name, $event)"
    />
  </div>
</template>
