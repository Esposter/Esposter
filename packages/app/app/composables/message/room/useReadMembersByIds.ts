import type { User } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";
import { useUserStore } from "@/store/message/user";

export const useReadMembersByIds = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const userStore = useUserStore();
  const { userMap } = storeToRefs(userStore);
  const { storeUsers } = userStore;
  return async (memberIds: User["id"][]) => {
    if (!currentRoomId.value) return;

    const ids = [...new Set(memberIds)].filter((id) => !userMap.value.has(id));
    if (ids.length === 0) return;

    const members = await $trpc.room.readMembersByIds.query({ ids, roomId: currentRoomId.value });
    storeUsers(members);
  };
};
