<script setup lang="ts">
import { checkIsActiveColumnFilter } from "@/services/tableEditor/file/column/checkIsActiveColumnFilter";
import { useFilterStore } from "@/store/tableEditor/file/filter";

const filterStore = useFilterStore();
const { clearColumnFilters } = filterStore;
const { columnFilters } = storeToRefs(filterStore);
const hasActiveFilters = computed(() =>
  Object.values(columnFilters.value).some((filter) => checkIsActiveColumnFilter(filter)),
);
</script>

<template>
  <v-tooltip v-if="hasActiveFilters" text="Clear Filters">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        color="primary"
        icon="mdi-filter-off"
        size="small"
        tile
        m-0
        variant="text"
        :="tooltipProps"
        @click.stop="clearColumnFilters()"
      />
    </template>
  </v-tooltip>
</template>
