import { useRoomStore } from "@/store/message/room";

export const useReadUsers = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId, memberMap } = storeToRefs(roomStore);
  return async (userIds: string[]) => {
    if (!currentRoomId.value) return;

    const ids = userIds.filter((id) => !memberMap.value.has(id));
    if (ids.length === 0) return;

    const members = await $trpc.room.readMembersByIds.query({ ids, roomId: currentRoomId.value });
    for (const member of members) memberMap.value.set(member.id, member);
  };
};
