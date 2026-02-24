export const useSearchStore = defineStore("message/room/search", () => {
  const { $trpc } = useNuxtApp();
  return useCursorSearcher(
    (searchQuery, cursor, opts) =>
      $trpc.room.readRooms.query(
        {
          cursor,
          filter: { name: searchQuery },
        },
        opts,
      ),
    true,
  );
});
