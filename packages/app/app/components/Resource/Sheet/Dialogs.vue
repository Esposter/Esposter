<script setup lang="ts">
import { SnapshotReason } from "#shared/models/resource/SnapshotReason";
import { useSheetPortableDialogStore } from "@/store/resource/sheet/portableDialog";
import { useVersionHistoryStore } from "@/store/resource/versionHistory";

const sheetPortableDialogStore = useSheetPortableDialogStore();
const { exportDataSourceType, isExportOpen, isPreviewOpen, isSurveyImportOpen, previewDataSource, previewName } =
  storeToRefs(sheetPortableDialogStore);
const setDataSource = useSetDataSource();
const versionHistoryStore = useVersionHistoryStore();
const { saveResourceRevision } = versionHistoryStore;
</script>

<template>
  <!-- An import shows what it is about to replace the sheet with before it does; the command that opened this
    has already parsed the file, so the confirm is the only thing left to do. The sheet it replaces becomes a
    revision first — an import is one of the writes that overwrites a draft wholesale, and it does not proceed
    when that revision did not land, because the undo is the whole reason it is taken -->
  <StyledDialog
    v-model="isPreviewOpen"
    :card-props="{ title: `Preview: ${previewName}` }"
    :confirm-button-props="{ text: 'Import' }"
    @confirm="
      async (onComplete) => {
        if (previewDataSource && (await saveResourceRevision(SnapshotReason.BeforeImport)))
          await setDataSource(previewDataSource);
        onComplete();
      }
    "
  >
    <ResourceSheetPreviewTable v-if="previewDataSource" :data-source="previewDataSource" />
  </StyledDialog>
  <ResourceSheetExportDialog v-model="isExportOpen" :data-source-type="exportDataSourceType" />
  <ResourceSheetImportDatasetDialog v-model="isSurveyImportOpen" />
</template>
