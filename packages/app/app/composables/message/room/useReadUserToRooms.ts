import type { RoomInMessage } from "@esposter/db-schema";

import { useUserToRoomStore } from "@/store/message/room/userToRoom";

export const useReadUsersToRooms = () => {
  const { $trpc } = useNuxtApp();
  const userToRoomStore = useUserToRoomStore();
  const { setUserToRoom } = userToRoomStore;
  return async (roomIds: RoomInMessage["id"][]) => {
    if (roomIds.length === 0) return;

    const usersToRooms = await $trpc.userToRoom.readUsersToRooms.query({ roomIds });
    for (const userToRoom of usersToRooms) setUserToRoom(userToRoom.roomId, userToRoom.userId, userToRoom);
  };
};
