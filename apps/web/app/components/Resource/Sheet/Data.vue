<script setup lang="ts">
import { computeDataSourceStatistics } from "@/services/resource/sheet/dataSource/computeDataSourceStatistics";
import { useSheetStore } from "@/store/resource/sheet";
import { useRowStore } from "@/store/resource/sheet/row";

const sheetStore = useSheetStore();
const { loadContent } = sheetStore;
const { dataSource } = storeToRefs(sheetStore);
const rowStore = useRowStore();
const { filteredRows } = storeToRefs(rowStore);
const isColumnsOpen = ref(true);
const isDataOpen = ref(true);
const statistics = computed(() => computeDataSourceStatistics(dataSource.value));

useSheetCommands();
await loadContent();
</script>

<template>
  <div p-4 flex flex-col gap-4 ui-body>
    <div flex gap-2 items-center>
      <div flex shrink-0 gap-1>
        <ResourceSheetToolbarUndoButton />
        <ResourceSheetToolbarRedoButton />
      </div>
      <ResourceSheetMetadataBar
        v-if="dataSource.columns.length > 0 || dataSource.rows.length > 0"
        :metadata="dataSource.metadata"
        flex-1
        min-w-0
      />
    </div>
    <!-- "Not yet imported" is an empty data section (the blob is written on first save) -->
    <template v-if="dataSource.columns.length > 0 || dataSource.rows.length > 0">
      <UiCollapsible v-model="isColumnsOpen">
        <template #title>
          <h2 ui-heading>Columns</h2>
        </template>
        <template #actions>
          <ResourceSheetColumnCreateDialogButton :data-source />
        </template>
        <div pt-2>
          <ResourceSheetColumnTable :data-source />
        </div>
      </UiCollapsible>
      <UiCollapsible v-model="isDataOpen">
        <template #title>
          <h2 ui-heading>Data</h2>
        </template>
        <template #actions>
          <ResourceSheetStatisticsBar :filtered-row-count="filteredRows.length" :statistics />
        </template>
        <div pt-2>
          <ResourceSheetRowTable :data-source />
        </div>
      </UiCollapsible>
    </template>
    <ResourceSheetEmptyState v-else />
  </div>
</template>
