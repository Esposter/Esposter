import { useMemberStore } from "@/store/message/member";
import { useRoomStore } from "@/store/message/room";

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

  let isPending = ref(false);

  if (currentRoomId.value) {
    const { data, pending, status } = await $trpc.room.readMembers.useQuery({ roomId: currentRoomId.value });
    isPending = pending;
    watchEffect(async () => {
      if (!(status.value === "success" && data.value)) return;
      const { items, ...rest } = data.value;
      const userIds = items.map(({ id }) => id);
      await readMetadata(userIds);
      initializeCursorPaginationData(Object.assign(rest, { items: userIds }));
    });
  }

  return { isPending, readMoreMembers };
};
