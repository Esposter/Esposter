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
  const { initializeCursorPaginationData, pushMemberIdList } = memberStore;
  const { hasMore, nextCursor } = storeToRefs(memberStore);
  const readMoreMembers = async (onComplete: () => void) => {
    try {
      if (!currentRoomId.value) return;

      const response = await $trpc.room.readMembers.query({ cursor: nextCursor.value, roomId: currentRoomId.value });
      nextCursor.value = response.nextCursor;
      hasMore.value = response.hasMore;
      for (const user of response.items) userMap.value.set(user.id, user);
      pushMemberIdList(...response.items.map(({ id }) => id));
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
