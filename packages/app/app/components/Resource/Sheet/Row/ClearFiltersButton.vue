<script setup lang="ts">
import { checkIsActiveColumnFilter } from "@/services/resource/sheet/column/checkIsActiveColumnFilter";
import { DENSE_ICON_BUTTON_PROPS } from "@/services/shared/constants";
import { useFilterStore } from "@/store/resource/sheet/filter";

const BUTTON_PROPS = { ...DENSE_ICON_BUTTON_PROPS, color: "primary", variant: "text" as const };
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
    :button-props="BUTTON_PROPS"
    icon="mdi-filter-off"
    text="Clear Filters"
    @click.stop="clearColumnFilters()"
  />
</template>
