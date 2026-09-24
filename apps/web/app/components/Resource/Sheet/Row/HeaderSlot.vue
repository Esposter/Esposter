<script setup lang="ts">
import { toColumnKey } from "@/services/resource/sheet/column/toColumnKey";
import { useColumnStore } from "@/store/resource/sheet/column";
import { useFilterStore } from "@/store/resource/sheet/filter";

interface Props {
  columnKey: string;
}

const { columnKey } = defineProps<Props>();
const columnStore = useColumnStore();
const { displayColumns } = storeToRefs(columnStore);
const filterStore = useFilterStore();
const { setColumnFilter } = filterStore;
const { columnFilters } = storeToRefs(filterStore);
const column = computed(() => displayColumns.value.find(({ name }) => toColumnKey(name) === columnKey));
</script>

<!-- A data column's filter, under its name -->
<template>
  <div v-if="column" pt-1>
    <ResourceSheetRowColumnFilterInput
      :column
      :model-value="columnFilters[column.name]"
      @update:model-value="setColumnFilter(column.name, $event)"
    />
  </div>
</template>
