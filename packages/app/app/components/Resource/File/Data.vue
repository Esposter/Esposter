<script setup lang="ts">
import { useFileStore } from "@/store/resource/file";
import { useRowStore } from "@/store/resource/file/row";

const fileStore = useFileStore();
const { loadContent } = fileStore;
const { dataSource } = storeToRefs(fileStore);
const rowStore = useRowStore();
const { filteredRows } = storeToRefs(rowStore);
const openPanels = ref(["columns", "data"]);
const isLoading = ref(true);
// "Not yet imported" is an empty data section (the blob is written on first save)
const hasData = computed(() => dataSource.value.columns.length > 0 || dataSource.value.rows.length > 0);

onMounted(async () => {
  await loadContent();
  isLoading.value = false;
});
</script>

<template>
  <StyledSkeleton v-if="isLoading" />
  <div v-else p-4 flex flex-col gap-4>
    <div flex gap-1 items-center>
      <ResourceFileToolbarUndoButton />
      <ResourceFileToolbarRedoButton />
      <ResourceFileToolbarImportButton />
      <ResourceFileToolbarImportDatasetButton />
      <ResourceFileToolbarExportButton />
    </div>
    <template v-if="hasData">
      <ResourceFileMetadataBar :metadata="dataSource.metadata" />
      <v-expansion-panels v-model="openPanels" multiple>
        <v-expansion-panel value="columns">
          <template #title>
            Columns
            <v-spacer />
            <ResourceFileColumnCreateDialogButton :data-source="dataSource" />
          </template>
          <v-expansion-panel-text>
            <ResourceFileColumnTable :data-source="dataSource" />
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel value="data">
          <template #title>
            Data
            <v-spacer />
            <ResourceFileStatisticsBar
              mr-4
              :filtered-row-count="filteredRows.length"
              :statistics="dataSource.statistics"
            />
          </template>
          <v-expansion-panel-text>
            <ResourceFileRowTable :data-source="dataSource" />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>
    <ResourceFileEmptyState v-else />
  </div>
</template>
