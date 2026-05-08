import type { RoomInMessage } from "@esposter/db-schema";

import { useUserToRoomStore } from "@/store/message/room/userToRoom";

export const useReadMyUsersToRooms = () => {
  const { $trpc } = useNuxtApp();
  const userToRoomStore = useUserToRoomStore();
  const { setNickname, setUserToRoom } = userToRoomStore;
  return async (roomIds: RoomInMessage["id"][]) => {
    if (roomIds.length === 0) return;

    const myUsersToRooms = await $trpc.userToRoom.readMyUsersToRooms.query({ roomIds });
    for (const userToRoom of myUsersToRooms) {
      setUserToRoom(userToRoom.roomId, userToRoom.userId, userToRoom);
      setNickname(userToRoom.roomId, userToRoom.userId, userToRoom.nickname);
    }
  };
};
