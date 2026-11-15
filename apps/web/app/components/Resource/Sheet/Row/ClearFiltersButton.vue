<script setup lang="ts">
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { checkIsActiveColumnFilter } from "#src/services/resource/sheet/column/checkIsActiveColumnFilter";
import { useFilterStore } from "#src/store/resource/sheet/filter";

const filterStore = useFilterStore();
const { clearColumnFilters } = filterStore;
const { columnFilters } = storeToRefs(filterStore);
const hasActiveFilters = computed(() =>
  Object.values(columnFilters.value).some((filter) => checkIsActiveColumnFilter(filter)),
);
</script>

<template>
  <UiIconButton
    v-if="hasActiveFilters"
    label="Clear filters"
    :meaning="UiIconMeaning.ClearFilter"
    @click="clearColumnFilters()"
  />
</template>
