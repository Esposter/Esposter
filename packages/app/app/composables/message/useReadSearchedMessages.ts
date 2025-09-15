import type { SearchMessagesInput } from "#shared/models/db/message/SearchMessagesInput";

import { useLayoutStore } from "@/store/layout";
import { useRoomStore } from "@/store/message/room";
import { useSearchMessageStore } from "@/store/message/searchMessage";

export const useReadSearchedMessages = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const searchMessageStore = useSearchMessageStore();
  const { hasMore, isSearched, messages, searchQuery, totalItemsLength } = storeToRefs(searchMessageStore);
  const { selectedFilters } = storeToRefs(searchMessageStore);
  const layoutStore = useLayoutStore();
  const { rightDrawerOpen } = storeToRefs(layoutStore);
  return async (offset?: SearchMessagesInput["offset"]) => {
    if (!currentRoomId.value) return;

    const { count, data } = await $trpc.message.searchMessages.query({
      filters: selectedFilters.value.length > 0 ? selectedFilters.value : undefined,
      offset,
      query: searchQuery.value,
      roomId: currentRoomId.value,
    });
    messages.value = data.items;
    hasMore.value = data.hasMore;
    if (count !== undefined) totalItemsLength.value = count;
    // Mark that a search has been performed and reveal results in the right drawer
    isSearched.value = true;
    rightDrawerOpen.value = true;
  };
};
