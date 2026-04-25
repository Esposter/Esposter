<script setup lang="ts">
import { isActiveColumnFilter } from "@/services/tableEditor/file/column/isActiveColumnFilter";
import { useFilterStore } from "@/store/tableEditor/file/filter";

const filterStore = useFilterStore();
const { clearColumnFilters } = filterStore;
const { columnFilters } = storeToRefs(filterStore);
const hasActiveFilters = computed(() =>
  Object.values(columnFilters.value).some((filter) => isActiveColumnFilter(filter)),
);
</script>

<template>
  <v-tooltip v-if="hasActiveFilters" text="Clear Filters">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        color="primary"
        icon="mdi-filter-off"
        m-0
        size="small"
        tile
        variant="text"
        :="tooltipProps"
        @click.stop="clearColumnFilters()"
      />
    </template>
  </v-tooltip>
</template>
