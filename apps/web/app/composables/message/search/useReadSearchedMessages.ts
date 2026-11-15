import type { Filter } from "@esposter/db-schema";

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
  const {
    beginSearch,
    getBoundCount,
    getBoundIsSearching,
    getBoundResultSearch,
    getResultSearchRef,
    getSlice,
    getSliceOperationData,
  } = searchMessageStore;
  const { isMenuOpen, searchQuery, selectedFilters } = storeToRefs(searchMessageStore);
  const searchHistoryStore = useSearchHistoryStore();
  const { createSearchHistory } = searchHistoryStore;
  const readMessageCreators = useReadMessageCreators();
  // One page of a room's search. A hit is drawn only once its author is known, so the authors the hits name are read
  // With the results, as a room's messages read theirs
  const readSearchPage = async (
    roomId: string,
    cursor: string,
    { filters, query }: { filters: Filter[]; query: string },
    signal?: AbortSignal,
  ) => {
    const page = await $trpc.message.searchMessages.query({ cursor, filters, query, roomId }, { signal });
    await readMessageCreators(roomId, page.items);
    return page;
  };

  const readSearchedMessages = async () => {
    const roomId = requirePartitionKey(currentRoomId.value, readSearchedMessages.name);
    // A newer search for the room cancels this one, and this search's own signal is what its answer and its failure are
    // Judged by
    const signal = beginSearch(roomId);
    // A chip the user added but never gave a value to is not a constraint, so it is dropped here rather than sent, both
    // To the search and to the history entry the search earns, which stores what it actually ran
    const filters = getSearchableFilters(selectedFilters.value);
    const query = searchQuery.value;
    // The input schema refuses a search with nothing in it, so the read that builds the request is where that stops.
    // The field clearing itself on blur is what put an empty query here, and the answer to that is not a 400
    if (checkIsSearchQueryEmpty(query, filters)) {
      // A search this read supersedes was aborted by beginSearch, and an aborted search skips clearing the flag it
      // Raised, so the read that raised none clears it here rather than leaving the room rendered as searching
      getBoundIsSearching().value = false;
      getSlice(roomId).resetCursorPaginationData();
      getBoundResultSearch().value = undefined;
      return;
    }

    isMenuOpen.value = false;
    // The pending flag is raised and cleared inside the read that owns it, since two searches overlapping across a room
    // Switch would otherwise have the first to land clear the second's flag and leave its own room rendering as loading
    const boundIsSearching = getBoundIsSearching();
    boundIsSearching.value = true;
    openRightDrawer(RightDrawer.Search);
    // Everything the search writes back is bound before its first await, to the room it was issued for
    const boundCount = getBoundCount();
    const boundResultSearch = getBoundResultSearch();
    await getResultAsync(() =>
      withFinalizerAsync(
        async () => {
          const page = await readSearchPage(roomId, "", { filters, query }, signal);
          await createSearchHistory({ filters: filters.length > 0 ? filters : undefined, query, roomId });
          // A newer search began while this one was in flight, so its results and totals are dropped whole
          signal.throwIfAborted();
          getSlice(roomId).initializeCursorPaginationData(page);
          if (page.count !== undefined) boundCount.value = page.count;
          boundResultSearch.value = { filters, query };
        },
        () => {
          // The newer search that cancelled this one raised the flag itself, and clears it when it lands
          if (!signal.aborted) boundIsSearching.value = false;
        },
      ),
    ).match(noop, (error) => {
      // A cancelled search is silent, whatever form its failure took once the client wrapped it
      if (!signal.aborted) createErrorAlert(error);
    });
  };

  // The continuation is read for the search its results were read for, not for whatever the reader has typed since
  const readMoreSearchedMessages = async (onComplete: () => void) => {
    const roomId = requirePartitionKey(currentRoomId.value, readMoreSearchedMessages.name);
    const resultSearch = getResultSearchRef(roomId).value;
    if (!resultSearch) {
      onComplete();
      return;
    }

    await getSliceOperationData(roomId).readMoreItems(
      (cursor) => readSearchPage(roomId, cursor, resultSearch),
      onComplete,
    );
  };

  return { readMoreSearchedMessages, readSearchedMessages };
};
