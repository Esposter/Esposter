import type { RoomInMessage, User } from "@esposter/db-schema";

import { useUserToRoomStore } from "@/store/message/room/userToRoom";

export const useReadNicknames = () => {
  const { $trpc } = useNuxtApp();
  const userToRoomStore = useUserToRoomStore();
  const { setNickname } = userToRoomStore;
  return async (roomId: RoomInMessage["id"], userIds: User["id"][]) => {
    if (userIds.length === 0) return;

    const nicknames = await $trpc.userToRoom.readNicknames.query({ roomId, userIds });
    for (const { nickname, roomId: nicknameRoomId, userId } of nicknames) setNickname(nicknameRoomId, userId, nickname);
  };
};
