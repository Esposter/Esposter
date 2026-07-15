<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { useRowStore } from "@/store/resource/sheet/row";

interface TextSlotProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<TextSlotProps>();
const rowStore = useRowStore();
const { search } = storeToRefs(rowStore);
</script>

<template>
  <div flex gap-2 items-center>
    <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" hide-details single-line />
    <ResourceSheetFindReplaceDialogButton />
  </div>
  <ResourceSheetFindReplaceBar />
  <div flex flex-wrap gap-1 items-center>
    <ResourceSheetColumnStatisticsDialogButton />
    <ResourceSheetRowOutlierToggleButton />
    <ResourceSheetRowClearFiltersButton />
    <ResourceSheetRowStringTransformationDialogButton />
    <ResourceSheetRowNullStrategyDialogButton />
    <ResourceSheetRowDeduplicateDialogButton />
    <ResourceSheetRowCreateDialogButton :data-source />
    <ResourceSheetRowCopyIncludesHeadersButton />
  </div>
</template>
