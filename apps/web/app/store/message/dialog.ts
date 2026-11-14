// Targets for singleton dialogs: action items write the target, the single mounted
// Dialog instance opens while it is set and clears it back to "" on close
export const useMessageDialogStore = defineStore("message/dialog", () => {
  const deletingMessageId = ref<"" | ClientMessage["id"]>("");
  const pinningMessageId = ref<"" | ClientMessage["id"]>("");
  // The room goes with the message id, since the reactions opened may be a thread pane's rather than the room's on screen
  const reactionsRoomId = ref<ClientMessage["roomId"]>("");
  const reactionsMessageId = ref<"" | ClientMessage["id"]>("");
  return { deletingMessageId, pinningMessageId, reactionsMessageId, reactionsRoomId };
});
import type { ClientMessage } from "@/models/message/ClientMessage";
