<script setup lang="ts">
import { isActiveColumnFilter } from "@/services/tableEditor/file/column/isActiveColumnFilter";
import { useFileTableEditorStore } from "@/store/tableEditor/file";

const fileTableEditorStore = useFileTableEditorStore();
const { clearColumnFilters } = fileTableEditorStore;
const { columnFilters } = storeToRefs(fileTableEditorStore);
const hasActiveFilters = computed(() => Object.values(columnFilters.value).some((filter) => isActiveColumnFilter(filter)));
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
