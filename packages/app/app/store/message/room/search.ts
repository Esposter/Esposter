export const useSearchStore = defineStore("message/room/search", () => {
  const { $trpc } = useNuxtApp();
  return useCursorSearcher(
    (searchQuery, cursor) =>
      $trpc.room.readRooms.useQuery({
        cursor,
        filter: { name: searchQuery },
      }),
    (searchQuery, cursor) =>
      $trpc.room.readRooms.query({
        cursor,
        filter: { name: searchQuery },
      }),
    true,
  );
});
