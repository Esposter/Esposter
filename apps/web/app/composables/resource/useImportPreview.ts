import { useVersionHistoryStore } from "@/store/resource/versionHistory";

// The state an import preview dialog answers with. The preview an import answers is the one on the resource it was
// confirmed on, which the reader may have left by the time the import lands, so the preview closes against that one
export const useImportPreview = (isPreviewOpen: Ref<boolean>, closePreview: (resourceId: string) => void) => {
  const versionHistoryStore = useVersionHistoryStore();
  const { saveResourceRevision } = versionHistoryStore;
  const importingResourceId = ref("");
  const isImportPreviewOpen = computed({
    get: () => isPreviewOpen.value,
    set: (newIsImportPreviewOpen) => {
      if (!newIsImportPreviewOpen) closePreview(importingResourceId.value);
    },
  });
  const { answer, isPending: isImporting } = useDialogAnswer(isImportPreviewOpen);

  return { answer, importingResourceId, isImporting, saveResourceRevision };
};
