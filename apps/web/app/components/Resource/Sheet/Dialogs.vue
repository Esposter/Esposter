<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { useSheetPortableDialogStore } from "@/store/resource/sheet/portableDialog";
import { useVersionHistoryStore } from "@/store/resource/versionHistory";
import { withFinalizerAsync } from "@esposter/shared";

const sheetPortableDialogStore = useSheetPortableDialogStore();
const { exportDataSourceType, isExportOpen, isPreviewOpen, isSurveyImportOpen, previewDataSource, previewName } =
  storeToRefs(sheetPortableDialogStore);
const setDataSource = useSetDataSource();
const versionHistoryStore = useVersionHistoryStore();
const { saveResourceRevision } = versionHistoryStore;
const isImporting = ref(false);
</script>

<template>
  <!-- An import shows what it is about to replace the sheet with before it does; the command that opened this
    has already parsed the file, so the confirm is the only thing left to do. The sheet it replaces becomes a
    revision first — an import is one of the writes that overwrites a draft wholesale, and it does not proceed
    when that revision did not land, because the undo is the whole reason it is taken -->
  <UiDialog
    v-model="isPreviewOpen"
    :placement="UiDialogPlacement.Middle"
    :title="`Preview: ${previewName}`"
    w="[min(64rem,90vw)]"
  >
    <div p-3 min-h-0 of-y-auto>
      <ResourceSheetPreviewTable v-if="previewDataSource" :data-source="previewDataSource" />
    </div>
    <footer p-3 flex gap-2 justify-end>
      <UiButton :variant="UiButtonVariant.Quiet" @click="isPreviewOpen = false">Cancel</UiButton>
      <UiButton
        :disabled="isImporting"
        :variant="UiButtonVariant.Accent"
        @click="
          async () => {
            isImporting = true;
            await withFinalizerAsync(
              async () => {
                if (previewDataSource && (await saveResourceRevision())) await setDataSource(previewDataSource);
                isPreviewOpen = false;
              },
              () => {
                isImporting = false;
              },
            );
          }
        "
      >
        <UiSpinner v-if="isImporting" />
        Import
      </UiButton>
    </footer>
  </UiDialog>
  <ResourceSheetExportDialog v-model="isExportOpen" :data-source-type="exportDataSourceType" />
  <ResourceSheetImportDatasetDialog v-model="isSurveyImportOpen" />
</template>
