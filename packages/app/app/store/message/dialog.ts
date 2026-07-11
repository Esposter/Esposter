import type { MessageEntity } from "@esposter/db-schema";

// Targets for singleton dialogs: action items write the target, the single mounted
// dialog instance opens while it is set and clears it back to "" on close
export const useMessageDialogStore = defineStore("message/dialog", () => {
  const deletingRowKey = ref<MessageEntity["rowKey"]>("");
  const pinningRowKey = ref<MessageEntity["rowKey"]>("");
  return {
    deletingRowKey,
    pinningRowKey,
  };
});
