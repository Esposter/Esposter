import type { ClientMessage } from "@/models/message/ClientMessage";

// Targets for singleton dialogs: action items write the target, the single mounted
// Dialog instance opens while it is set and clears it back to "" on close. A message is targeted by its id as a
// String, the key every singleton target takes
export const useMessageDialogStore = defineStore("message/dialog", () => {
  const deletingMessageId = ref("");
  const pinningMessageId = ref("");
  // The room goes with the message id, since the reactions opened may be a thread pane's rather than the room's on screen
  const reactionsRoomId = ref<ClientMessage["roomId"]>("");
  const reactionsMessageId = ref("");
  return { deletingMessageId, pinningMessageId, reactionsMessageId, reactionsRoomId };
});
