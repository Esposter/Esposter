import type { RoomCategoryInMessage } from "@esposter/db-schema";

export const useRoomCategoryDialogStore = defineStore("message/roomCategoryDialog", () => {
  const deletingId = ref<RoomCategoryInMessage["id"]>("");
  return {
    deletingId,
  };
});
