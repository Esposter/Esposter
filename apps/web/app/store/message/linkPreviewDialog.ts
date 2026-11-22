import type { ClientMessage } from "#src/models/message/ClientMessage";

// The message whose embeds a remove confirms: an embed's remove button writes the message it sits on, and the one
// Mounted dialog reads it from that message's room, which the thread pane can hold beside another room
export const useLinkPreviewDialogStore = defineStore("message/linkPreviewDialog", () => {
  const removingMessageId = ref<0 | ClientMessage["id"]>(0);
  const removingRoomId = ref<ClientMessage["roomId"]>("");
  return { removingMessageId, removingRoomId };
});
