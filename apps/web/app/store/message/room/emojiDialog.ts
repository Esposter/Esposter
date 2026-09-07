import type { RoomEmojiInMessage } from "@esposter/db-schema";

export const useRoomEmojiDialogStore = defineStore("message/room/emojiDialog", () => {
  const deletingId = ref<RoomEmojiInMessage["id"]>("");
  return {
    deletingId,
  };
});
