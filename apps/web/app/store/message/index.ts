import type { UiContextMenu } from "@/models/ui/UiContextMenu";
import type { MessageEntity } from "@esposter/db-schema";

export const useMessageStore = defineStore("message", () => {
  // The message whose options menu is open, so every other message holds still under it
  const optionsMenuRowKey = ref<MessageEntity["rowKey"]>("");
  // A message's items are built only by the options bar mounted over the active message, so a context menu asked for
  // On a message waits here until that bar mounts and opens it
  const contextMenuRequest = ref<Pick<UiContextMenu, "opener" | "x" | "y"> & { rowKey: MessageEntity["rowKey"] }>();
  const editingRowKey = ref<MessageEntity["rowKey"]>("");
  return { contextMenuRequest, editingRowKey, optionsMenuRowKey };
});
