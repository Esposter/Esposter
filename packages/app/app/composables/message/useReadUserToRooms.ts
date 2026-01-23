import type { RoomInMessage } from "@esposter/db-schema";

import { useUserToRoomStore } from "@/store/message/userToRoom";

export const useReadUserToRooms = () => {
  const { $trpc } = useNuxtApp();
  const userToRoomStore = useUserToRoomStore();
  const { setNotificationTypeMap } = userToRoomStore;
  return async (roomIds: RoomInMessage["id"][]) => {
    if (roomIds.length === 0) return;

    const readUserToRooms = await $trpc.userToRoom.readUserToRooms.query({ roomIds });
    for (const { notificationType, roomId } of readUserToRooms) setNotificationTypeMap(roomId, notificationType);
  };
};
