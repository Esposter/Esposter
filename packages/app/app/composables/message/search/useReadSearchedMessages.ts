import { checkIsSearchQueryEmpty } from "#shared/services/message/checkIsSearchQueryEmpty";
import { getSearchableFilters } from "#shared/services/message/getSearchableFilters";
import { RightDrawer } from "@/models/message/RightDrawer";
import { useLayoutStore } from "@/store/layout";
import { useRoomStore } from "@/store/message/room";
import { useSearchMessageStore } from "@/store/message/search";
import { useSearchHistoryStore } from "@/store/message/search/history";
import { useMessageLayoutStore } from "@/store/message/ui/layout";
import { CompositeKeyPropertyNames } from "@esposter/azure";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";

export const useReadSearchedMessages = () => {
  const { $trpc } = useNuxtApp();
  const layoutStore = useLayoutStore();
  const { isRightDrawerOpen } = storeToRefs(layoutStore);
  const messageLayoutStore = useMessageLayoutStore();
  const { rightDrawer } = storeToRefs(messageLayoutStore);
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const searchMessageStore = useSearchMessageStore();
  const { getBoundCount, getBoundIsSearching, getBoundPage, getReadMoreItems } = searchMessageStore;
  const { menu, searchQuery, selectedFilters } = storeToRefs(searchMessageStore);
  const searchHistoryStore = useSearchHistoryStore();
  const { createSearchHistory } = searchHistoryStore;
  return getReadMoreItems(async (offset) => {
    const roomId = currentRoomId.value;
    if (!roomId)
      throw new InvalidOperationError(
        Operation.Read,
        useReadSearchedMessages.name,
        CompositeKeyPropertyNames.partitionKey,
      );

    // Everything this read writes back is resolved before its first await, exactly as the result slice it is
    // Issued against is: the room can move while it is in flight, and its totals, its page and its history
    // Entry all belong to the search that was actually run, not to whatever is on screen when the response lands
    // A chip the user added but never gave a value to is not a constraint, so it is dropped here rather than
    // Sent — both to the search and to the history entry the search earns, which stores what it actually ran
    const filters = getSearchableFilters(selectedFilters.value);
    const query = searchQuery.value;
    // The input schema refuses a search with nothing in it, so the read that builds the request is where that
    // Stops rather than at each of the surfaces that can issue one — an Enter, a history row, a page change.
    // The field clearing itself on blur is what put an empty query here, and the answer to that is not a 400
    if (checkIsSearchQueryEmpty(query, filters)) return { hasMore: false, items: [] };

    menu.value = false;
    // The pending flag is raised and cleared inside the read that owns it rather than by the paginator's own
    // Finalizer, which is shared across every read this composable issues: two searches overlapping across a
    // Room switch would otherwise have the first to land clear the second's flag and leave its own raised
    const boundIsSearching = getBoundIsSearching();
    boundIsSearching.value = true;
    isRightDrawerOpen.value = true;
    rightDrawer.value = RightDrawer.Search;
    const boundCount = getBoundCount();
    const boundPage = getBoundPage();
    const searchedMessages = await withFinalizerAsync(
      async () => {
        const { count: newCount, data } = await $trpc.message.searchMessages.query({
          filters,
          offset,
          query,
          roomId,
        });
        // No offset means a fresh search rather than reading the next offset page.
        if (!offset) {
          boundPage.value = 1;
          await createSearchHistory({ filters: filters.length > 0 ? filters : undefined, query, roomId });
        }
        if (newCount !== undefined) boundCount.value = newCount;
        return data;
      },
      () => {
        boundIsSearching.value = false;
      },
    );
    return searchedMessages;
  });
};
