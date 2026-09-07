import type { FileEntity } from "@esposter/db-schema";

// The media viewer's target: a file card writes the id it was clicked on, and the one mounted viewer opens over
// Whatever the gallery still holds under it
export const useFileDialogStore = defineStore("message/file/dialog", () => {
  const viewingFileId = ref<FileEntity["id"]>("");
  return { viewingFileId };
});
