import type { InviteInMessage } from "@esposter/db-schema";

export const useRoomInviteDialogStore = defineStore("message/room/roomInviteDialog", () => {
  const revokingId = ref<InviteInMessage["id"]>("");
  return { revokingId };
});
