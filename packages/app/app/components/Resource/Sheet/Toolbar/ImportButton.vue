<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { useSheetStore } from "@/store/resource/sheet";
import { trimFileExtension } from "@/util/file/trimFileExtension";
import { takeOne } from "@esposter/shared";

const sheetStore = useSheetStore();
const { settings } = storeToRefs(sheetStore);
const setDataSource = useSetDataSource();
const importFile = useImportFile();
const dataSourceConfiguration = useDataSourceConfiguration(settings);
const previewDataSource = ref<DataSource | null>(null);
const pendingName = ref("");
const isPreviewOpen = computed({
  get: () => previewDataSource.value !== null,
  set: (newIsPreviewOpen) => {
    if (!newIsPreviewOpen) previewDataSource.value = null;
  },
});
const previewHeaders = computed(
  () =>
    previewDataSource.value?.columns.map((column) => ({
      key: column.name,
      title: column.name,
      value: (row: Row) => takeOne(row.data, column.name),
    })) ?? [],
);
const previewRows = computed(() => previewDataSource.value?.rows.slice(0, 5) ?? []);
</script>

<template>
  <StyledTooltipIconButton
    icon="mdi-upload"
    :text="`Import ${settings.type}`"
    @click="
      importFile(dataSourceConfiguration.mimeType, dataSourceConfiguration.accept, async (file) => {
        const result = await dataSourceConfiguration.deserialize(file, settings);
        pendingName = trimFileExtension(result.metadata.name);
        previewDataSource = result;
      })
    "
  />
  <StyledDialog
    v-model="isPreviewOpen"
    :card-props="{ title: `Preview: ${pendingName}` }"
    :confirm-button-props="{ text: 'Import' }"
    @confirm="
      async (onComplete) => {
        if (previewDataSource) await setDataSource(previewDataSource);
        onComplete();
      }
    "
  >
    <v-data-table density="compact" hide-default-footer :headers="previewHeaders" :items="previewRows" />
  </StyledDialog>
</template>
