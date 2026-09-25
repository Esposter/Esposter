import type { RoomInMessage, User } from "@esposter/db-schema";

import { useUserStore } from "@/store/message/user";

export const useReadMembersByIds = () => {
  const { $trpc } = useNuxtApp();
  const userStore = useUserStore();
  const { userMap } = storeToRefs(userStore);
  const { storeUsers } = userStore;
  return async (roomId: RoomInMessage["id"], memberIds: User["id"][]) => {
    const userIds = [...new Set(memberIds)].filter((id) => !userMap.value.has(id));
    if (userIds.length === 0) return;

    const members = await $trpc.room.readMembersByIds.query({ roomId, userIds });
    storeUsers(members);
  };
};
