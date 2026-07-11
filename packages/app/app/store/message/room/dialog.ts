import type { RoomInMessage } from "@esposter/db-schema";

export const useDialogStore = defineStore("message/room/dialog", () => {
  const isEditRoomDialogOpen = ref(false);
  const settingsRoomId = ref<RoomInMessage["id"]>("");
  return {
    isEditRoomDialogOpen,
    settingsRoomId,
  };
});
