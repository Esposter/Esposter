export const useSearchStore = defineStore("message/room/search", () => {
  const { $trpc } = useNuxtApp();
  return useCursorSearcher((searchQuery, cursor, opts) => {
    const trimmedSearchQuery = searchQuery.trim();
    return $trpc.room.readRooms.query(
      {
        cursor,
        filter: trimmedSearchQuery ? { name: trimmedSearchQuery } : undefined,
      },
      opts,
    );
  }, true);
});
