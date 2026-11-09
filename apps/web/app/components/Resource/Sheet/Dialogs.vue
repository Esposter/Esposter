<script setup lang="ts">
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiDialogSize } from "@/models/ui/UiDialogSize";
import { useResourceStore } from "@/store/resource";
import { useSheetPortableDialogStore } from "@/store/resource/sheet/portableDialog";

const sheetPortableDialogStore = useSheetPortableDialogStore();
const { exportDataSourceType, isExportOpen, isPreviewOpen, isSurveyImportOpen, previewDataSource, previewName } =
  storeToRefs(sheetPortableDialogStore);
const { closePreview } = sheetPortableDialogStore;
const resourceStore = useResourceStore();
const { currentResourceId } = storeToRefs(resourceStore);
const getDataSourceSetter = useSetDataSource();
const { answer, importingResourceId, isImporting, saveResourceRevision } = useImportPreview(
  isPreviewOpen,
  closePreview,
);
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
    :size="UiDialogSize.ExtraLarge"
  >
    <ResourceSheetPreviewTable v-if="previewDataSource" :data-source="previewDataSource" />
    <template #footer>
      <ResourceImportPreviewFooter
        :is-pending="isImporting"
        @cancel="isPreviewOpen = false"
        @confirm="
          answer(async () => {
            // The import awaits a revision before it writes, so the sheet it lands in is named when it is confirmed
            importingResourceId = currentResourceId;
            const dataSource = previewDataSource;
            const setDataSource = getDataSourceSetter();
            if (!dataSource || !(await saveResourceRevision())) return false;
            await setDataSource(dataSource);
          })
        "
      />
    </template>
  </UiDialog>
  <ResourceSheetExportDialog v-model="isExportOpen" :data-source-type="exportDataSourceType" />
  <ResourceSheetImportDatasetDialog v-model="isSurveyImportOpen" />
</template>
