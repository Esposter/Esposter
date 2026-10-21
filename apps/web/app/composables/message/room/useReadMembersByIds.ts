import type { PublicUser, RoomInMessage } from "@esposter/db-schema";

import { useUserStore } from "@/store/message/user";

export const useReadMembersByIds = () => {
  const { $trpc } = useNuxtApp();
  const userStore = useUserStore();
  const { getRoomMemberMap, storeRoomMembers, storeUsers } = userStore;
  // A member already read for this room is current, so only the rows this room has not returned are asked for
  return async (roomId: RoomInMessage["id"], memberIds: PublicUser["id"][]) => {
    const roomMemberMap = getRoomMemberMap(roomId);
    const userIds = [...new Set(memberIds)].filter((id) => !roomMemberMap?.has(id));
    if (userIds.length === 0) return;

    const members = await $trpc.room.readMembersByIds.query({ roomId, userIds });
    storeUsers(members);
    storeRoomMembers(roomId, members);
  };
};
