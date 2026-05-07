import type { RoomInMessage } from "@esposter/db-schema";

import { useUserToRoomStore } from "@/store/message/room/userToRoom";

export const useReadUserToRooms = () => {
  const { $trpc } = useNuxtApp();
  const userToRoomStore = useUserToRoomStore();
  const { userToRoomMap } = storeToRefs(userToRoomStore);
  return async (roomIds: RoomInMessage["id"][]) => {
    if (roomIds.length === 0) return;

    const userToRooms = await $trpc.userToRoom.readUserToRooms.query({ roomIds });
    for (const userToRoom of userToRooms) userToRoomMap.value.set(userToRoom.roomId, userToRoom);
  };
};
