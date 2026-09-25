export const useRoomSearchStore = defineStore("message/room/search", () => {
  const { $trpc } = useNuxtApp();
  return useCursorSearcher(
    (searchQuery, cursor, options) =>
      $trpc.room.readRooms.query({ cursor, filter: searchQuery ? { name: searchQuery } : undefined }, options),
    true,
  );
});
