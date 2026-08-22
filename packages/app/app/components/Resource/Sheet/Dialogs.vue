<script setup lang="ts">
import { useSheetPortableDialogStore } from "@/store/resource/sheet/portableDialog";

const sheetPortableDialogStore = useSheetPortableDialogStore();
const { exportDataSourceType, isExportOpen, isPreviewOpen, isSurveyImportOpen, previewDataSource, previewName } =
  storeToRefs(sheetPortableDialogStore);
const setDataSource = useSetDataSource();
</script>

<template>
  <!-- An import shows what it is about to replace the sheet with before it does; the command that opened this
    has already parsed the file, so the confirm is the only thing left to do -->
  <StyledDialog
    v-model="isPreviewOpen"
    :card-props="{ title: `Preview: ${previewName}` }"
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
  <ResourceSheetExportDialog v-model="isExportOpen" :data-source-type="exportDataSourceType" />
  <ResourceSheetImportDatasetDialog v-model="isSurveyImportOpen" />
</template>
