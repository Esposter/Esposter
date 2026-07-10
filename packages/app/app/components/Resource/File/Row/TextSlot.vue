<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";

import { useRowStore } from "@/store/resource/file/row";

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
    <ResourceFileFindReplaceDialogButton />
  </div>
  <ResourceFileFindReplaceBar />
  <div flex flex-wrap gap-1 items-center>
    <ResourceFileColumnStatisticsDialogButton />
    <ResourceFileRowOutlierToggleButton />
    <ResourceFileRowClearFiltersButton />
    <ResourceFileRowStringTransformationDialogButton />
    <ResourceFileRowNullStrategyDialogButton />
    <ResourceFileRowDeduplicateDialogButton />
    <ResourceFileRowCreateDialogButton :data-source />
    <ResourceFileRowCopyIncludesHeadersButton />
  </div>
</template>
