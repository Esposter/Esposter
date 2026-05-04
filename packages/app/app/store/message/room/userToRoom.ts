import type { UpdateUserToRoomInput } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";

import { useRoomStore } from "@/store/message/room";
import { NotificationType } from "@esposter/db-schema";

export const useUserToRoomStore = defineStore("message/room/userToRoom", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { data: notificationType, setData: setNotificationType } = useDataMap(
    () => roomStore.currentRoomId,
    NotificationType.DirectMessage,
  );
  const lastMessageAtMap = ref(new Map<string, Date>());
  const updateUserToRoom = async (input: UpdateUserToRoomInput) => {
    await $trpc.userToRoom.updateUserToRoom.mutate(input);
  };
  return {
    lastMessageAtMap,
    notificationType,
    setNotificationType,
    updateUserToRoom,
  };
});
