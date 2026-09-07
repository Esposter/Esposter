import type { RoomInMessage } from "@esposter/db-schema";

import { useUserToRoomStore } from "@/store/message/room/userToRoom";

export const useReadMyUsersToRooms = () => {
  const { $trpc } = useNuxtApp();
  const userToRoomStore = useUserToRoomStore();
  const { setMyUserToRoom, setNickname } = userToRoomStore;
  return async (roomIds: RoomInMessage["id"][]) => {
    if (roomIds.length === 0) return;

    const myUsersToRooms = await $trpc.userToRoom.readMyUsersToRooms.query({ roomIds });
    for (const userToRoom of myUsersToRooms) {
      setMyUserToRoom(userToRoom.roomId, userToRoom);
      setNickname(userToRoom.roomId, userToRoom.userId, userToRoom.nickname);
    }
  };
};
