import type { RoomInMessage } from "@esposter/db-schema";

export const useRoomDialogStore = defineStore("message/room/dialog", () => {
  const isEditRoomDialogOpen = ref(false);
  const inviteRoomId = ref<RoomInMessage["id"]>("");
  const settingsRoomId = ref<RoomInMessage["id"]>("");
  return {
    inviteRoomId,
    isEditRoomDialogOpen,
    settingsRoomId,
  };
});
