import type { RoomInMessage } from "@esposter/db-schema";

import { useUserToRoomStore } from "@/store/message/room/userToRoom";

export const useReadMyUsersToRooms = () => {
  const { $trpc } = useNuxtApp();
  const userToRoomStore = useUserToRoomStore();
  const { setDisplayName, setMyUserToRoom } = userToRoomStore;
  return async (roomIds: RoomInMessage["id"][]) => {
    if (roomIds.length === 0) return;

    const myUsersToRooms = await $trpc.userToRoom.readMyUsersToRooms.query({ roomIds });
    for (const userToRoom of myUsersToRooms) {
      setMyUserToRoom(userToRoom.roomId, userToRoom);
      setDisplayName(userToRoom.roomId, userToRoom.userId, userToRoom.displayName);
    }
  };
};
