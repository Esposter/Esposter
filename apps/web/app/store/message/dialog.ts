import type { MessageInMessage } from "@esposter/db-schema";

// Targets for singleton dialogs: action items write the target, the single mounted
// Dialog instance opens while it is set and clears it back to "" on close
export const useMessageDialogStore = defineStore("message/dialog", () => {
  const deletingMessageId = ref<"" | MessageInMessage["id"]>("");
  const pinningMessageId = ref<"" | MessageInMessage["id"]>("");
  // The room goes with the message id, since the reactions opened may be a thread pane's rather than the room's on screen
  const reactionsRoomId = ref<MessageInMessage["roomId"]>("");
  const reactionsMessageId = ref<"" | MessageInMessage["id"]>("");
  return { deletingMessageId, pinningMessageId, reactionsMessageId, reactionsRoomId };
});
