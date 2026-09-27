import type { RoomRoleInMessage } from "@esposter/db-schema";

export const useRoleDialogStore = defineStore("message/room/roleDialog", () => {
  const deletingId = ref<RoomRoleInMessage["id"]>("");
  return { deletingId };
});
