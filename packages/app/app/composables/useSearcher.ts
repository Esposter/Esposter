import type { Room } from "#shared/db/schema/rooms";

import { createCursorPaginationData } from "@/services/shared/pagination/cursor/createCursorPaginationData";

export const useSearcher = () => {
  const searchQuery = ref("");
  const isEmptySearchQuery = computed(() => !searchQuery.value.trim());
  const throttledSearchQuery = useThrottle(searchQuery);
  const { initializeCursorPaginationData, itemList, resetCursorPaginationData } = createCursorPaginationData<Room>();
  const { $trpc } = useNuxtApp();

  watch(isEmptySearchQuery, (newIsEmptySearchQuery) => {
    if (!newIsEmptySearchQuery) return;
    resetCursorPaginationData();
  });

  watch(throttledSearchQuery, async (newThrottledSearchQuery) => {
    const sanitizedNewThrottledSearchQuery = newThrottledSearchQuery.trim();
    if (!sanitizedNewThrottledSearchQuery) return;
    initializeCursorPaginationData(
      await $trpc.room.readRooms.query({
        filter: { name: sanitizedNewThrottledSearchQuery },
      }),
    );
  });

  return { itemList, searchQuery: throttledSearchQuery };
};
