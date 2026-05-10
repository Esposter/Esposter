import { normalizeString } from "@esposter/shared";

export const useSearchStore = defineStore("message/room/search", () => {
  const { $trpc } = useNuxtApp();
  return useCursorSearcher((searchQuery, cursor, opts) => {
    const normalizedSearchQuery = normalizeString(searchQuery);
    return $trpc.room.readRooms.query(
      {
        cursor,
        filter: normalizedSearchQuery ? { name: normalizedSearchQuery } : undefined,
      },
      opts,
    );
  }, true);
});
