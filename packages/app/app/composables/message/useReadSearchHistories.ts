import { useRoomStore } from "@/store/message/room";
import { useSearchHistoryStore } from "@/store/message/searchHistory";

export const useReadSearchHistories = async () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const searchHistoryStore = useSearchHistoryStore();
  const { initializeCursorPaginationData } = searchHistoryStore;
  const { hasMore, nextCursor } = storeToRefs(searchHistoryStore);
  const readMoreSearchHistories = async (onComplete: () => void) => {
    if (!currentRoomId.value) return;

    try {
      const data = await $trpc.message.readSearchHistories.query({
        cursor: nextCursor.value,
        roomId: currentRoomId.value,
      });
      initializeCursorPaginationData(data);
    } finally {
      onComplete();
    }
  };

  let isPending = ref(false);

  if (currentRoomId.value) {
    const { data, pending, status } = await $trpc.message.readSearchHistories.useQuery({
      roomId: currentRoomId.value,
    });
    isPending = pending;
    watchEffect(() => {
      if (!(status.value === "success" && data.value)) return;
      initializeCursorPaginationData(data.value);
    });
  }

  return { hasMore, isPending, readMoreSearchHistories };
};
