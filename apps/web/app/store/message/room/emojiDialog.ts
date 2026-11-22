import type { RoomEmojiInMessage } from "@esposter/db-schema";

export const useRoomEmojiDialogStore = defineStore("message/room/emojiDialog", () => {
  const deletingId = ref<RoomEmojiInMessage["id"]>("");
  // The create dialog has no target of its own, so the picker that opens it writes this flag
  const isCreateOpen = ref(false);
  return { deletingId, isCreateOpen };
});
