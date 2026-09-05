// @vitest-environment nuxt
import type { SearchHistoryInMessage } from "@esposter/db-schema";

import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useSearchHistoryStore } from "@/store/message/search/history";
import { takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useSearchHistoryStore, () => {
  const server = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const id = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const originalQuery = "original";
  const acceptedQuery = "accepted";
  const rejectedQuery = "rejected";
  const createSearchHistory = (query: string): SearchHistoryInMessage => ({
    createdAt: new Date(),
    deletedAt: null,
    filters: [],
    id,
    query,
    roomId,
    updatedAt: new Date(),
    userId,
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    setCurrentRoomId(roomId);
  });

  // Both edits name the same row, so the second runs behind the first and applies on top of what the first
  // Stored. A snapshot captured when the caller invoked it — before the write ahead of it had even been sent —
  // Unwinds the row past that write, back to a query the user replaced two edits ago
  test("rolls a queued update back to what the write ahead of it stored", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.searchHistory.updateSearchHistory.mutation(({ input }) => {
        if (input.query === rejectedQuery) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
        return createSearchHistory(input.query);
      }),
    );
    const searchHistoryStore = useSearchHistoryStore();
    const { items } = storeToRefs(searchHistoryStore);
    const { getSlice, updateSearchHistory } = searchHistoryStore;
    getSlice(roomId).items.value = [createSearchHistory(originalQuery)];
    await Promise.all([
      updateSearchHistory({ id, query: acceptedQuery }),
      updateSearchHistory({ id, query: rejectedQuery }),
    ]);

    expect(takeOne(items.value, 0).query).toBe(acceptedQuery);
  });

  // Same rule for a removal: the row the failed delete restores is the list the delete ahead of it left behind,
  // Never the one the user was looking at before either ran
  test("rolls a queued delete back to the list the delete ahead of it left", async () => {
    expect.hasAssertions();

    const otherId = crypto.randomUUID();
    server.use(
      trpcMsw.searchHistory.deleteSearchHistory.mutation(({ input }) => {
        if (input === id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
        return { ...createSearchHistory(originalQuery), id: input };
      }),
    );
    const searchHistoryStore = useSearchHistoryStore();
    const { items } = storeToRefs(searchHistoryStore);
    const { deleteSearchHistory, getSlice } = searchHistoryStore;
    getSlice(roomId).items.value = [
      createSearchHistory(originalQuery),
      { ...createSearchHistory(originalQuery), id: otherId },
    ];
    await Promise.all([deleteSearchHistory(otherId), deleteSearchHistory(id)]);

    expect(items.value.map((searchHistory) => searchHistory.id)).toStrictEqual([id]);
  });

  // Rows are keyed per entry, so an edit and another row's removal never queue against each other and the
  // Rejected edit owes back only the fields it wrote
  test("restores only the row whose edit was rejected", async () => {
    expect.hasAssertions();

    const otherId = crypto.randomUUID();
    server.use(
      trpcMsw.searchHistory.updateSearchHistory.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
      trpcMsw.searchHistory.deleteSearchHistory.mutation(({ input }) => ({
        ...createSearchHistory(originalQuery),
        id: input,
      })),
    );
    const searchHistoryStore = useSearchHistoryStore();
    const { items } = storeToRefs(searchHistoryStore);
    const { deleteSearchHistory, getSlice, updateSearchHistory } = searchHistoryStore;
    getSlice(roomId).items.value = [
      createSearchHistory(originalQuery),
      { ...createSearchHistory(originalQuery), id: otherId },
    ];
    await Promise.all([updateSearchHistory({ id, query: rejectedQuery }), deleteSearchHistory(otherId)]);

    expect(items.value.map((searchHistory) => searchHistory.id)).toStrictEqual([id]);
    expect(takeOne(items.value).query).toBe(originalQuery);
  });

  // The failing removal is the one that applied first, so its rollback lands after the other has persisted
  test("puts back only the row whose removal was rejected", async () => {
    expect.hasAssertions();

    const otherId = crypto.randomUUID();
    server.use(
      trpcMsw.searchHistory.deleteSearchHistory.mutation(({ input }) => {
        if (input === id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
        return { ...createSearchHistory(originalQuery), id: input };
      }),
    );
    const searchHistoryStore = useSearchHistoryStore();
    const { items } = storeToRefs(searchHistoryStore);
    const { deleteSearchHistory, getSlice } = searchHistoryStore;
    getSlice(roomId).items.value = [
      createSearchHistory(originalQuery),
      { ...createSearchHistory(originalQuery), id: otherId },
    ];
    await Promise.all([deleteSearchHistory(id), deleteSearchHistory(otherId)]);

    expect(items.value.map((searchHistory) => searchHistory.id)).toStrictEqual([id]);
  });
});
