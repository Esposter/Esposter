import type { ClientMessage } from "#src/models/message/ClientMessage";

// Targets for singleton dialogs: action items write the target, the single mounted
// Dialog instance opens while it is set and clears it back to 0, the absent message id, on close
export const useMessageDialogStore = defineStore("message/dialog", () => {
  const deletingMessageId = ref<0 | ClientMessage["id"]>(0);
  const pinningMessageId = ref<0 | ClientMessage["id"]>(0);
  // The room goes with the message id, since the reactions opened may be a thread pane's rather than the room's on screen
  const reactionsRoomId = ref<ClientMessage["roomId"]>("");
  const reactionsMessageId = ref<0 | ClientMessage["id"]>(0);
  return { deletingMessageId, pinningMessageId, reactionsMessageId, reactionsRoomId };
});
