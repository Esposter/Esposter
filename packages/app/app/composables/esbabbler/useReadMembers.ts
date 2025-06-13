import { useMemberStore } from "@/store/esbabbler/member";
import { useRoomStore } from "@/store/esbabbler/room";

export const useReadMembers = async () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { initializeCursorPaginationData, pushMemberIds } = memberStore;
  const { hasMore, nextCursor } = storeToRefs(memberStore);
  const readUsers = useReadUsers();
  const readUserStatuses = useReadUserStatuses();
  const readMetadata = (userIds: string[]) => Promise.all([readUsers(userIds), readUserStatuses(userIds)]);
  const readMoreMembers = async (onComplete: () => void) => {
    try {
      if (!currentRoomId.value) return;

      const {
        hasMore: newHasMore,
        items,
        nextCursor: newNextCursor,
      } = await $trpc.room.readMembers.query({ cursor: nextCursor.value, roomId: currentRoomId.value });
      const userIds = items.map(({ id }) => id);
      nextCursor.value = newNextCursor;
      hasMore.value = newHasMore;
      await readMetadata(userIds);
      pushMemberIds(...userIds);
    } finally {
      onComplete();
    }
  };

  if (currentRoomId.value) {
    const response = await $trpc.room.readMembers.query({ roomId: currentRoomId.value });
    const userIds = response.items.map(({ id }) => id);
    await readMetadata(userIds);
    initializeCursorPaginationData(Object.assign(response, { items: userIds }));
  }

  return readMoreMembers;
};
