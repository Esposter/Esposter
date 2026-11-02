import { checkIsSearchQueryEmpty } from "#shared/services/message/checkIsSearchQueryEmpty";
import { getSearchableFilters } from "#shared/services/message/getSearchableFilters";
import { RightDrawer } from "@/models/message/RightDrawer";
import { requirePartitionKey } from "@/services/message/requirePartitionKey";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useRoomStore } from "@/store/message/room";
import { useSearchMessageStore } from "@/store/message/search";
import { useSearchHistoryStore } from "@/store/message/search/history";
import { useMessageLayoutStore } from "@/store/message/ui/layout";
import { getResultAsync, noop, withFinalizerAsync } from "@esposter/shared";

export const useReadSearchedMessages = () => {
  const { $trpc } = useNuxtApp();
  const messageLayoutStore = useMessageLayoutStore();
  const { openRightDrawer } = messageLayoutStore;
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const searchMessageStore = useSearchMessageStore();
  const { beginSearch, getBoundCount, getBoundIsSearching, getBoundPage, getReadMoreItems } = searchMessageStore;
  const { isMenuOpen, searchQuery, selectedFilters } = storeToRefs(searchMessageStore);
  const searchHistoryStore = useSearchHistoryStore();
  const { createSearchHistory } = searchHistoryStore;
  return (offset?: number) => {
    const roomId = requirePartitionKey(currentRoomId.value, useReadSearchedMessages.name);
    // A newer search for the room cancels this one, and this search's own signal is what its failure is judged by
    const signal = beginSearch(roomId);
    const readSearchedPage = getReadMoreItems(async () => {
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

      isMenuOpen.value = false;
      // The pending flag is raised and cleared inside the read that owns it rather than by the paginator's own
      // Finalizer, which is shared across every read this composable issues: two searches overlapping across a
      // Room switch would otherwise have the first to land clear the second's flag and leave its own raised
      const boundIsSearching = getBoundIsSearching();
      boundIsSearching.value = true;
      openRightDrawer(RightDrawer.Search);
      const boundCount = getBoundCount();
      const boundPage = getBoundPage();
      return withFinalizerAsync(
        async () => {
          const { count: newCount, data: items } = await $trpc.message.searchMessages.query(
            { filters, offset, query, roomId },
            { signal },
          );
          // No offset means a fresh search rather than reading the next offset page.
          if (!offset) await createSearchHistory({ filters: filters.length > 0 ? filters : undefined, query, roomId });
          // A newer search began while this one was in flight, so its results and totals are dropped whole, and the
          // Paginator writes nothing for the read the throw ends
          signal.throwIfAborted();
          if (!offset) boundPage.value = 1;
          if (newCount !== undefined) boundCount.value = newCount;
          return items;
        },
        () => {
          // The newer search that cancelled this one raised the flag itself, and clears it when it lands
          if (!signal.aborted) boundIsSearching.value = false;
        },
      );
    });
    return getResultAsync(() => readSearchedPage(offset)).match(noop, (error) => {
      // A cancelled search is silent, whatever form its failure took once the client wrapped it
      if (!signal.aborted) createErrorAlert(error);
    });
  };
};
