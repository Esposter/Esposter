<script setup lang="ts">
import { computeDataSourceStatistics } from "@/services/resource/sheet/dataSource/computeDataSourceStatistics";
import { useSheetStore } from "@/store/resource/sheet";
import { useRowStore } from "@/store/resource/sheet/row";

const sheetStore = useSheetStore();
const { loadContent } = sheetStore;
const { dataSource } = storeToRefs(sheetStore);
const rowStore = useRowStore();
const { filteredRows } = storeToRefs(rowStore);
const openPanels = ref(["columns", "data"]);
const isLoading = ref(true);
const statistics = computed(() => computeDataSourceStatistics(dataSource.value));

onMounted(async () => {
  await loadContent();
  isLoading.value = false;
});
</script>

<template>
  <StyledSkeleton v-if="isLoading" />
  <div v-else p-4 flex flex-col gap-4>
    <div flex gap-1 items-center>
      <ResourceSheetToolbarUndoButton />
      <ResourceSheetToolbarRedoButton />
      <ResourceSheetToolbarImportButton />
      <ResourceSheetToolbarImportDatasetButton />
      <ResourceSheetToolbarExportButton />
    </div>
    <!-- "Not yet imported" is an empty data section (the blob is written on first save) -->
    <template v-if="dataSource.columns.length > 0 || dataSource.rows.length > 0">
      <ResourceSheetMetadataBar :metadata="dataSource.metadata" />
      <v-expansion-panels v-model="openPanels" multiple>
        <v-expansion-panel value="columns">
          <template #title>
            Columns
            <v-spacer />
            <ResourceSheetColumnCreateDialogButton :data-source />
          </template>
          <v-expansion-panel-text>
            <ResourceSheetColumnTable :data-source />
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel value="data">
          <template #title>
            Data
            <v-spacer />
            <ResourceSheetStatisticsBar mr-4 :filtered-row-count="filteredRows.length" :statistics />
          </template>
          <v-expansion-panel-text>
            <ResourceSheetRowTable :data-source />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>
    <ResourceSheetEmptyState v-else />
  </div>
</template>
