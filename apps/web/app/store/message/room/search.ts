import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { RoomInMessage } from "@esposter/db-schema";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";

const sortBy = [
  { key: "displayName", order: SortOrder.Asc },
  { key: "id", order: SortOrder.Asc },
] satisfies SortItem<"displayName" | keyof RoomInMessage>[];

export const useRoomSearchStore = defineStore("message/room/search", () => {
  const { $trpc } = useNuxtApp();
  return useCursorSearcher(
    (searchQuery, cursor, options) =>
      $trpc.room.readRooms.query(
        { cursor, filter: searchQuery ? { name: searchQuery } : undefined, includeDirectMessages: true, sortBy },
        options,
      ),
    true,
  );
});
