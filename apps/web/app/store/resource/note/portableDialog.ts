import type { JSONContent } from "@tiptap/core";

import { useResourceStore } from "@/store/resource";

// The import is started from the command bar, which the blade shell's dialogs outlive, so the preview cannot live in
// the blade alone. It is keyed by the note it was parsed for: a file read after the reader moved to another note is
// that note's import, and its preview must not open over, or import into, the next one
export const useNotePortableDialogStore = defineStore("resource/note/portableDialog", () => {
  const resourceStore = useResourceStore();
  const getResourceId = () => resourceStore.currentResourceId;
  const { data: previewDoc, getDataRef: getPreviewDocRef } = useDataMap<JSONContent | undefined>(
    getResourceId,
    undefined,
  );
  const isPreviewOpen = computed({
    get: () => Boolean(previewDoc.value),
    set: (newIsPreviewOpen) => {
      if (!newIsPreviewOpen) previewDoc.value = undefined;
    },
  });
  const openPreview = (resourceId: string, doc: JSONContent) => {
    const previewDocRef = getPreviewDocRef(resourceId);
    previewDocRef.value = doc;
  };
  const closePreview = (resourceId: string) => {
    const previewDocRef = getPreviewDocRef(resourceId);
    previewDocRef.value = undefined;
  };
  return { closePreview, isPreviewOpen, openPreview, previewDoc };
});
