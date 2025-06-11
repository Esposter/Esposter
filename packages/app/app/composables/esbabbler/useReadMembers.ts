import { useEsbabblerStore } from "@/store/esbabbler";
import { useMemberStore } from "@/store/esbabbler/member";
import { useRoomStore } from "@/store/esbabbler/room";

export const useReadMembers = async () => {
  const { $trpc } = useNuxtApp();
  const esbabblerStore = useEsbabblerStore();
  const { userMap } = storeToRefs(esbabblerStore);
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { initializeCursorPaginationData, pushMemberIds } = memberStore;
  const { hasMore, nextCursor } = storeToRefs(memberStore);
  const readUserStatuses = useReadUserStatuses();
  const readMoreMembers = async (onComplete: () => void) => {
    try {
      if (!currentRoomId.value) return;

      const {
        hasMore: newHasMore,
        items,
        nextCursor: newNextCursor,
      } = await $trpc.room.readMembers.query({ cursor: nextCursor.value, roomId: currentRoomId.value });
      const memberIds = items.map(({ id }) => id);
      nextCursor.value = newNextCursor;
      hasMore.value = newHasMore;
      for (const user of items) userMap.value.set(user.id, user);
      await readUserStatuses(memberIds);
      pushMemberIds(...memberIds);
    } finally {
      onComplete();
    }
  };

  if (currentRoomId.value) {
    const response = await $trpc.room.readMembers.query({ roomId: currentRoomId.value });
    for (const user of response.items) userMap.value.set(user.id, user);
    initializeCursorPaginationData(Object.assign(response, { items: response.items.map(({ id }) => id) }));
  }

  return readMoreMembers;
};
