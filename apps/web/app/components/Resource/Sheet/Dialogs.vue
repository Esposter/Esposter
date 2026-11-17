<script setup lang="ts">
import { useSheetPortableDialogStore } from "#src/store/resource/sheet/portableDialog";

const sheetPortableDialogStore = useSheetPortableDialogStore();
const { exportDataSourceType, isExportOpen, isSurveyImportOpen } = storeToRefs(sheetPortableDialogStore);
</script>

<template>
  <ResourceSheetPreviewDialog />
  <ResourceSheetExportDialog v-model="isExportOpen" :data-source-type="exportDataSourceType" />
  <ResourceSheetImportDatasetDialog v-model="isSurveyImportOpen" />
</template>
