import type { Room } from "@esposter/db-schema";

import { useUserToRoomStore } from "@/store/message/room/userToRoom";

export const useReadUserToRooms = () => {
  const { $trpc } = useNuxtApp();
  const userToRoomStore = useUserToRoomStore();
  const { setNotificationType } = userToRoomStore;
  return async (roomIds: Room["id"][]) => {
    if (roomIds.length === 0) return;

    const readUserToRooms = await $trpc.userToRoom.readUserToRooms.query({ roomIds });
    for (const { notificationType, roomId } of readUserToRooms) setNotificationType(roomId, notificationType);
  };
};
