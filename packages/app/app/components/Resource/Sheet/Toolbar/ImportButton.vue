<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { useSheetStore } from "@/store/resource/sheet";
import { trimFileExtension } from "@/util/file/trimFileExtension";

const sheetStore = useSheetStore();
const { settings } = storeToRefs(sheetStore);
const setDataSource = useSetDataSource();
const importFile = useImportFile();
const dataSourceConfiguration = useDataSourceConfiguration(settings);
const previewDataSource = ref<DataSource | undefined>();
const pendingName = ref("");
const isPreviewOpen = computed({
  get: () => Boolean(previewDataSource.value),
  set: (newIsPreviewOpen) => {
    if (!newIsPreviewOpen) previewDataSource.value = undefined;
  },
});
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
    <ResourceSheetPreviewTable v-if="previewDataSource" :data-source="previewDataSource" />
  </StyledDialog>
</template>
