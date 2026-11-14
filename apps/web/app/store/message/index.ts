import type { ClientMessage } from "@/models/message/ClientMessage";
import type { UiContextMenu } from "@/models/ui/UiContextMenu";

export const useMessageStore = defineStore("message", () => {
  // The message whose options menu is open, so every other message holds still under it
  const optionsMenuMessageId = ref<"" | ClientMessage["id"]>("");
  // A message's items are built only by the options bar mounted over the active message, so a context menu asked for
  // On a message waits here until that bar mounts and opens it
  const contextMenuRequest = ref<Pick<UiContextMenu, "opener" | "x" | "y"> & { messageId: ClientMessage["id"] }>();
  const editingMessageId = ref<"" | ClientMessage["id"]>("");
  return { contextMenuRequest, editingMessageId, optionsMenuMessageId };
});
