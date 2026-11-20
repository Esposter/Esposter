import type { CreateSearchHistoryInput } from "#shared/models/db/searchHistory/CreateSearchHistoryInput";
import type { Page, SearchHistoryInMessage } from "@esposter/db-schema";

import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createTable } from "#src/services/shared/overlay/createTable";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useRoomStore } from "#src/store/message/room/index";
import { useOverlayStore } from "#src/store/overlay";
import { searchHistoriesInMessage } from "@esposter/db-schema";
import { compareText } from "@esposter/shared";

const searchHistoryTable = createTable(searchHistoriesInMessage);

// A search is held by its id, which the server mints, so the cursor's page names each search by its id
type SearchHistoryKey = Pick<SearchHistoryInMessage, "id">;

export const useSearchHistoryStore = defineStore("message/search/history", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const overlayStore = useOverlayStore();
  const { arrive, view, writeAwaited } = overlayStore;
  const searchHistories = view(searchHistoryTable);
  // The cursor carries the paging and the loading state of the room's history. The rows are the overlay's, so a search the
  // Server answered is drawn at once, with no page to place it on
  const cursor = useCursorPaginationDataMap<SearchHistoryKey>(() => roomStore.currentRoomId);
  // The reader's searches in the room they are on, newest first on the id, which is creation order
  const items = computed(() =>
    searchHistories.value
      .filter(({ roomId }) => roomId === roomStore.currentRoomId)
      .toSorted((firstSearch, secondSearch) => compareText(secondSearch.id, firstSearch.id)),
  );
  // A page of the history arrives row by row, and the cursor takes the ids the page named
  const readSearchHistoryPage = ({
    items: pageSearchHistories,
    ...page
  }: Page<SearchHistoryInMessage>): Page<SearchHistoryKey> => {
    for (const searchHistory of pageSearchHistories) arrive(searchHistoryTable, searchHistory);
    return { ...page, items: pageSearchHistories.map(({ id }) => ({ id })) };
  };
  // The server mints the search's id, so the search is drawn once its answer arrives, and the answer confirms nothing else
  const createSearchHistory = (input: CreateSearchHistoryInput) =>
    writeAwaited(
      async () => [createArrival(searchHistoryTable, await $trpc.searchHistory.createSearchHistory.mutate(input))],
      { onError: createErrorAlert },
    );

  return {
    createSearchHistory,
    hasMore: cursor.hasMore,
    items,
    readItems: cursor.readItems,
    readMoreItems: cursor.readMoreItems,
    readSearchHistoryPage,
  };
});
