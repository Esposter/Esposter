import { useRoomStore } from "@/store/message/room";
import { useMemberStore } from "@/store/message/user/member";

export const useReadUsers = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { members } = storeToRefs(memberStore);
  const { pushMembers } = memberStore;
  return async (userIds: string[]) => {
    if (!currentRoomId.value) return;

    const ids = userIds.filter((id) => !members.value.some((m) => m.id === id));
    if (ids.length === 0) return;

    const membersByIds = await $trpc.room.readMembersByIds.query({ ids, roomId: currentRoomId.value });
    pushMembers(...membersByIds);
  };
};
