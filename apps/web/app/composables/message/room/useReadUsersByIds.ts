import type { PublicUser, RoomInMessage } from "@esposter/db-schema";

import { setRoomUsers } from "#src/services/message/room/setRoomUsers";
import { useUserStore } from "#src/store/message/user/index";

export const useReadUsersByIds = () => {
  const { $trpc } = useNuxtApp();
  const userStore = useUserStore();
  const { getRoomMemberMap } = userStore;
  // A member the room has already returned is current, so only the ids this room has not returned as members are asked
  // For. A user who has left is not a member, so the room keeps no row for them and each read asks for them again
  return async (roomId: RoomInMessage["id"], userIds: PublicUser["id"][]) => {
    const roomMemberMap = getRoomMemberMap(roomId);
    const unreadUserIds = [...new Set(userIds)].filter((id) => !roomMemberMap?.has(id));
    if (unreadUserIds.length === 0) return;

    const users = await $trpc.room.readUsersByIds.query({ roomId, userIds: unreadUserIds });
    setRoomUsers(roomId, users);
  };
};
