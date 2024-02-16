import { useMemberStore } from "@/store/esbabbler/member";
import { useRoomStore } from "@/store/esbabbler/room";

export const useReadMembers = async () => {
  const { $client } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { initializeCursorPaginationData, pushMemberList } = memberStore;
  const { nextCursor, hasMore } = storeToRefs(memberStore);
  const readMoreMembers = async (onComplete: () => void) => {
    try {
      if (!currentRoomId.value) return;

      const response = await $client.room.readMembers.query({ roomId: currentRoomId.value, cursor: nextCursor.value });
      pushMemberList(response.items);
      nextCursor.value = response.nextCursor;
      hasMore.value = response.hasMore;
    } finally {
      onComplete();
    }
  };

  if (currentRoomId.value)
    initializeCursorPaginationData(await $client.room.readMembers.query({ roomId: currentRoomId.value }));

  return readMoreMembers;
};
