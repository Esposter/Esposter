import type { MessageEntity } from "@esposter/db-schema";

// Targets for singleton dialogs: action items write the target, the single mounted
// Dialog instance opens while it is set and clears it back to "" on close
export const useMessageDialogStore = defineStore("message/dialog", () => {
  const deletingRowKey = ref<MessageEntity["rowKey"]>("");
  const pinningRowKey = ref<MessageEntity["rowKey"]>("");
  // The room goes with the row key, since the reactions opened may be a thread pane's rather than the room's on screen
  const reactionsRoomId = ref<MessageEntity["partitionKey"]>("");
  const reactionsRowKey = ref<MessageEntity["rowKey"]>("");
  return { deletingRowKey, pinningRowKey, reactionsRoomId, reactionsRowKey };
});
