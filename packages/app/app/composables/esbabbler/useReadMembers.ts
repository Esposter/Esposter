import { useMemberStore } from "@/store/esbabbler/member";
import { useRoomStore } from "@/store/esbabbler/room";

export const useReadMembers = async () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { initializeCursorPaginationData, pushMemberList } = memberStore;
  const { hasMore, nextCursor } = storeToRefs(memberStore);
  const readMoreMembers = async (onComplete: () => void) => {
    try {
      if (!currentRoomId.value) return;

      const response = await $trpc.room.readMembers.query({ cursor: nextCursor.value, roomId: currentRoomId.value });
      nextCursor.value = response.nextCursor;
      hasMore.value = response.hasMore;
      if (response.items.length === 0) return;
      pushMemberList(...response.items);
    } finally {
      onComplete();
    }
  };

  if (currentRoomId.value)
    initializeCursorPaginationData(await $trpc.room.readMembers.query({ roomId: currentRoomId.value }));

  return readMoreMembers;
};
