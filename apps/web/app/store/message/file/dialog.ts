import type { ClientMessage } from "@/models/message/ClientMessage";
import type { FileEntity } from "@esposter/db-schema";

// The media viewer's target: a file card writes the id it was clicked on, and the one mounted viewer opens over
// Whatever the gallery still holds under it. The room goes with the id, since the file clicked may be in the thread
// Pane's room rather than the one on screen — and so does a delete's, with the message that carries the file
export const useFileDialogStore = defineStore("message/file/dialog", () => {
  const viewingFileId = ref<FileEntity["id"]>("");
  const viewingRoomId = ref<ClientMessage["roomId"]>("");
  const deletingFileId = ref<FileEntity["id"]>("");
  const deletingRoomId = ref<ClientMessage["roomId"]>("");
  const deletingMessageId = ref<"" | ClientMessage["id"]>("");
  return { deletingFileId, deletingMessageId, deletingRoomId, viewingFileId, viewingRoomId };
});
