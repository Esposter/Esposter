// @vitest-environment nuxt
import type { SearchHistoryInMessage } from "@esposter/db-schema";

import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useSearchHistoryStore } from "#src/store/message/search/history";
import { setRouteId } from "#src/util/router/setRouteId.test";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";

describe(useSearchHistoryStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const otherRoomId = v7();
  const query = "query";

  beforeEach(() => {
    setRouteId(roomId);
  });

  // The server mints the search's id, so the search is drawn once its answer arrives, and only in the room it was made for
  test("draws a search the server answered, in the room it was made for", async () => {
    expect.hasAssertions();

    const searchHistory: SearchHistoryInMessage = {
      createdAt: new Date(0),
      deletedAt: null,
      filters: [],
      id: v7(),
      query,
      roomId,
      updatedAt: new Date(0),
      userId: v7(),
      version: 0,
    };
    trpcMsw.searchHistory.createSearchHistory.mutation(() => searchHistory);
    const searchHistoryStore = useSearchHistoryStore();
    const { items } = storeToRefs(searchHistoryStore);
    const { createSearchHistory } = searchHistoryStore;
    await createSearchHistory({ query, roomId });
    setRouteId(otherRoomId);

    expect(items.value).toStrictEqual([]);
    setRouteId(roomId);
    expect(items.value).toStrictEqual([searchHistory]);
  });
});
