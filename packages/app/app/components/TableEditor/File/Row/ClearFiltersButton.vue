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
  <StyledTooltipIconButton
    v-if="hasActiveFilters"
    :button-props="{ class: 'm-0', color: 'primary', size: 'small', tile: true, variant: 'text' }"
    icon="mdi-filter-off"
    text="Clear Filters"
    @click.stop="clearColumnFilters()"
  />
</template>
