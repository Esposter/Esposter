import { dedupeFilters } from "#shared/services/message/dedupeFilters";
import { RightDrawer } from "@/models/message/RightDrawer";
import { useLayoutStore } from "@/store/layout";
import { useRoomStore } from "@/store/message/room";
import { useSearchMessageStore } from "@/store/message/search";
import { useSearchHistoryStore } from "@/store/message/search/history";
import { useMessageLayoutStore } from "@/store/message/ui/layout";
import { CompositeKeyPropertyNames } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const useReadSearchedMessages = () => {
  const { $trpc } = useNuxtApp();
  const layoutStore = useLayoutStore();
  const { isRightDrawerOpen } = storeToRefs(layoutStore);
  const messageLayoutStore = useMessageLayoutStore();
  const { rightDrawer } = storeToRefs(messageLayoutStore);
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const searchMessageStore = useSearchMessageStore();
  const { getBoundCount, getBoundPage, getReadMoreItems } = searchMessageStore;
  const { hasFiles, isSearching, menu, searchQuery } = storeToRefs(searchMessageStore);
  const { selectedFilters } = storeToRefs(searchMessageStore);
  const searchHistoryStore = useSearchHistoryStore();
  const { createSearchHistory } = searchHistoryStore;
  return getReadMoreItems(
    async (offset) => {
      const roomId = currentRoomId.value;
      if (!roomId)
        throw new InvalidOperationError(
          Operation.Read,
          useReadSearchedMessages.name,
          CompositeKeyPropertyNames.partitionKey,
        );

      menu.value = false;
      isSearching.value = true;
      isRightDrawerOpen.value = true;
      rightDrawer.value = RightDrawer.Search;
      // Everything this read writes back is resolved before its first await, exactly as the result slice it is
      // Issued against is: the room and the tab can both move while it is in flight, and its totals, its page
      // And its history entry all belong to the search that was actually run, not to whatever is on screen when
      // The response lands
      const isFilesSearch = hasFiles.value;
      const filters = [...selectedFilters.value];
      const query = searchQuery.value;
      const boundCount = getBoundCount();
      const boundPage = getBoundPage();
      const { count: newCount, data } = await $trpc.message.searchMessages.query({
        filters: dedupeFilters(filters),
        hasFiles: isFilesSearch,
        offset,
        query,
        roomId,
      });
      // No offset means a fresh search rather than reading the next offset page.
      if (!offset) {
        boundPage.value = 1;
        // The Files tab is a browse, not a text query, so it is never written to search history.
        if (!isFilesSearch)
          await createSearchHistory({
            filters: filters.length > 0 ? filters : undefined,
            query,
            roomId,
          });
      }
      if (newCount !== undefined) boundCount.value = newCount;
      return data;
    },
    () => {
      isSearching.value = false;
    },
  );
};
