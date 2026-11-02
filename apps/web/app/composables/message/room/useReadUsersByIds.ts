import type { PublicUser, RoomInMessage } from "@esposter/db-schema";

import { useUserStore } from "@/store/message/user";

export const useReadUsersByIds = () => {
  const { $trpc } = useNuxtApp();
  const userStore = useUserStore();
  const { getRoomMemberMap, storeRoomMembers, storeUsers } = userStore;
  // A user the room has already returned is current, so only the ids this room has not returned are asked for
  return async (roomId: RoomInMessage["id"], userIds: PublicUser["id"][]) => {
    const roomMemberMap = getRoomMemberMap(roomId);
    const unreadUserIds = [...new Set(userIds)].filter((id) => !roomMemberMap?.has(id));
    if (unreadUserIds.length === 0) return;

    const users = await $trpc.room.readUsersByIds.query({ roomId, userIds: unreadUserIds });
    storeUsers(users);
    storeRoomMembers(roomId, users);
  };
};
