import type { UiContextMenu } from "@/models/ui/UiContextMenu";
import type { MessageInMessage } from "@esposter/db-schema";

export const useMessageStore = defineStore("message", () => {
  // The message whose options menu is open, so every other message holds still under it
  const optionsMenuMessageId = ref<"" | MessageInMessage["id"]>("");
  // A message's items are built only by the options bar mounted over the active message, so a context menu asked for
  // On a message waits here until that bar mounts and opens it
  const contextMenuRequest = ref<Pick<UiContextMenu, "opener" | "x" | "y"> & { messageId: MessageInMessage["id"] }>();
  const editingMessageId = ref<"" | MessageInMessage["id"]>("");
  return { contextMenuRequest, editingMessageId, optionsMenuMessageId };
});
