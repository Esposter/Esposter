import type { UpdateUserToRoomInput } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";

import { useRoomStore } from "@/store/message/room";
import { NotificationType } from "@esposter/db-schema";

export const useUserToRoomStore = defineStore("message/userToRoom", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { data: notificationType, setDataMap: setNotificationTypeMap } = useDataMap<NotificationType>(
    () => roomStore.currentRoomId,
    NotificationType.DirectMessage,
  );

  const updateUserToRoom = async (input: UpdateUserToRoomInput) => {
    setNotificationTypeMap(input.roomId, input.notificationType);
    await $trpc.userToRoom.updateUserToRoom.mutate(input);
  };

  return {
    notificationType,
    setNotificationTypeMap,
    updateUserToRoom,
  };
});
