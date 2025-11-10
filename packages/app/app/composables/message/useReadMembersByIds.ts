import type { User } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";
import { useMemberStore } from "@/store/message/user/member";

export const useReadMembersByIds = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { memberMap } = storeToRefs(memberStore);
  return async (memberIds: User["id"][]) => {
    if (!currentRoomId.value) return;

    const ids = memberIds.filter((id) => !memberMap.value.has(id));
    if (ids.length === 0) return;

    const members = await $trpc.room.readMembersByIds.query({ ids, roomId: currentRoomId.value });
    for (const member of members) memberMap.value.set(member.id, member);
  };
};
