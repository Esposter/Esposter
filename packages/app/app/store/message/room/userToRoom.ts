import type { UpdateUserToRoomInput } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";
import type { Except } from "type-fest";

import { useRoomStore } from "@/store/message/room";
import { NotificationType } from "@esposter/db-schema";

export const useUserToRoomStore = defineStore("message/room/userToRoom", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { data: notificationType, setData: setNotificationType } = useDataMap(
    () => roomStore.currentRoomId,
    NotificationType.DirectMessage,
  );

  const updateUserToRoom = async (input: Except<UpdateUserToRoomInput, "roomId">) => {
    if (!roomStore.currentRoomId) return;
    notificationType.value = input.notificationType;
    await $trpc.userToRoom.updateUserToRoom.mutate({ ...input, roomId: roomStore.currentRoomId });
  };

  return {
    notificationType,
    setNotificationType,
    updateUserToRoom,
  };
});
