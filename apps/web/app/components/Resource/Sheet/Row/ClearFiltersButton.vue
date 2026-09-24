<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { checkIsActiveColumnFilter } from "@/services/resource/sheet/column/checkIsActiveColumnFilter";
import { useFilterStore } from "@/store/resource/sheet/filter";

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
    :variant="UiButtonVariant.Accent"
    @click="clearColumnFilters()"
  />
</template>
