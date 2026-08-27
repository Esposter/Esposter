import type { RoomInMessage } from "@esposter/db-schema";

import { useBanStore } from "@/store/message/user/ban";
import { noop, normalizeString } from "@esposter/shared";

export const useReadBans = (roomId: RoomInMessage["id"]) => {
  const { $trpc } = useNuxtApp();
  const banStore = useBanStore();
  const { readItems, readMoreItems } = banStore;
  const searchQuery = ref("");
  const filter = computed(() => {
    const name = normalizeString(searchQuery.value);
    return name ? { name } : undefined;
  });
  const readMoreBans = (onComplete: () => void) =>
    readMoreItems(
      // The term rides along with the cursor, so a ban placed mid-scroll cannot appear in a later page of a
      // Search it does not match
      (cursor) => $trpc.message.moderation.readBans.query({ cursor, filter: filter.value, roomId }),
      onComplete,
    );
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
  return { isPending, readMoreBans, searchQuery };
};
