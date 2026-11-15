import type { RoomInMessage } from "@esposter/db-schema";

import { useBanStore } from "@/store/message/user/ban";
import { noop, normalizeString } from "@esposter/shared";

export const useReadBans = (roomId: RoomInMessage["id"]) => {
  const { $trpc } = useNuxtApp();
  const banStore = useBanStore();
  const { getSliceOperationData } = banStore;
  const { hasMore, items, readItems, readMoreItems } = getSliceOperationData(roomId);
  const searchQuery = ref("");
  const filter = computed(() => {
    const name = normalizeString(searchQuery.value);
    return name ? { name } : undefined;
  });
  const readMoreBans = (onComplete: () => void) => {
    // The term the continuation belongs to is taken as the read is issued, so a retry after the reader typed a new term
    // Still asks for the rows of the search its cursor came from
    const issuedFilter = filter.value;
    return readMoreItems(
      (cursor) => $trpc.message.moderation.readBans.query({ cursor, filter: issuedFilter, roomId }),
      onComplete,
    );
  };
  // An empty query is a query rather than a reset, which is what makes an emptied field list the room's bans
  // Again instead of leaving the last term's results on screen — and what makes the first of them the list this
  // Panel opens on
  const { isPending } = useAutoSearch(searchQuery, {
    isIncludeEmptySearchQuery: true,
    reset: noop,
    search: async (_searchQuery, signal) => {
      await readItems(() => $trpc.message.moderation.readBans.query({ filter: filter.value, roomId }, { signal }));
    },
  });
  return { hasMore, isPending, items, readMoreBans, searchQuery };
};
