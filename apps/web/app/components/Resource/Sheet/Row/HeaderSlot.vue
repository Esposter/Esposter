<script setup lang="ts">
import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ToData } from "@esposter/shared";

import { checkIsEditableColumnValue } from "#shared/services/resource/sheet/column/checkIsEditableColumnValue";
import { useFilterStore } from "#src/store/resource/sheet/filter";

interface Props {
  column?: ToData<Column> | undefined;
}

const { column } = defineProps<Props>();
const filterStore = useFilterStore();
const { setColumnFilter } = filterStore;
const { columnFilters } = storeToRefs(filterStore);
// A computed column keeps no value in `row.data` for a filter to read, so it draws none
const filterableColumn = computed(() => (column && checkIsEditableColumnValue(column) ? column : undefined));
</script>

<!-- A data column's filter, under its name -->
<template>
  <div v-if="filterableColumn" pt-1>
    <ResourceSheetRowColumnFilterInput
      :column="filterableColumn"
      :model-value="columnFilters[filterableColumn.name]"
      @update:model-value="setColumnFilter(filterableColumn.name, $event)"
    />
  </div>
</template>
