import { ROOM_SEARCH_SORT_BY } from "@/services/message/room/constants";

export const useRoomSearchStore = defineStore("message/room/search", () => {
  const { $trpc } = useNuxtApp();
  return useCursorSearcher(
    (searchQuery, cursor, options) =>
      $trpc.room.readRooms.query(
        {
          cursor,
          filter: searchQuery ? { name: searchQuery } : undefined,
          includeDirectMessages: true,
          sortBy: ROOM_SEARCH_SORT_BY,
        },
        options,
      ),
    true,
  );
});
