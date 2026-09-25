import type { FileEntity, MessageEntity } from "@esposter/db-schema";

// The media viewer's target: a file card writes the id it was clicked on, and the one mounted viewer opens over
// Whatever the gallery still holds under it. The room goes with the id, since the file clicked may be in the thread
// Pane's room rather than the one on screen
export const useFileDialogStore = defineStore("message/file/dialog", () => {
  const viewingFileId = ref<FileEntity["id"]>("");
  const viewingRoomId = ref<MessageEntity["partitionKey"]>("");
  return { viewingFileId, viewingRoomId };
});
