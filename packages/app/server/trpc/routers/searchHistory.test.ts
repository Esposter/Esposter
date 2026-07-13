import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { createCallerFactory } from "@@/server/trpc";
import { mockSessionOnce } from "@@/server/trpc/context.test";
import { searchHistoryRouter } from "@@/server/trpc/routers/searchHistory";
import { setupRoomSuite } from "@@/server/trpc/routers/setupRoomSuite.test";
import { searchHistoriesInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { randomUUID } from "node:crypto";
import { afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";

describe("searchHistory", () => {
  const { getMockContext, getRoomId } = setupRoomSuite();
  let mockContext: Context;
  let searchHistoryCaller: DecorateRouterRecord<TRPCRouter["searchHistory"]>;
  let roomId: string;
  const query = "query";
  const updatedQuery = "updatedQuery";

  beforeAll(() => {
    mockContext = getMockContext();
    searchHistoryCaller = createCallerFactory(searchHistoryRouter)(mockContext);
  });

  beforeEach(() => {
    roomId = getRoomId();
  });

  afterEach(async () => {
    await mockContext.db.delete(searchHistoriesInMessage);
  });

  test("reads empty search histories", async () => {
    expect.hasAssertions();

    const readSearchHistories = await searchHistoryCaller.readSearchHistories({ roomId });

    expect(readSearchHistories).toStrictEqual(getCursorPaginationData([], 0, []));
  });

  test("reads search histories", async () => {
    expect.hasAssertions();

    const newSearchHistory = await searchHistoryCaller.createSearchHistory({ query, roomId });
    const readSearchHistories = await searchHistoryCaller.readSearchHistories({ roomId });

    expect(readSearchHistories.items).toHaveLength(1);
    expect(takeOne(readSearchHistories.items).id).toBe(newSearchHistory.id);
    expect(takeOne(readSearchHistories.items).roomId).toBe(roomId);
    expect(takeOne(readSearchHistories.items).query).toBe(query);
  });

  test("fails read search histories with non-existent room id", async () => {
    expect.hasAssertions();

    await expect(
      searchHistoryCaller.readSearchHistories({ roomId: randomUUID() }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails read search histories with non-existent member", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);

    await expect(searchHistoryCaller.readSearchHistories({ roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("creates", async () => {
    expect.hasAssertions();

    const newSearchHistory = await searchHistoryCaller.createSearchHistory({ query, roomId });

    expect(newSearchHistory.query).toBe(query);
    expect(newSearchHistory.roomId).toBe(roomId);
  });

  test("updates", async () => {
    expect.hasAssertions();

    const newSearchHistory = await searchHistoryCaller.createSearchHistory({ query, roomId });
    const updated = await searchHistoryCaller.updateSearchHistory({ id: newSearchHistory.id, query: updatedQuery });

    expect(updated.id).toBe(newSearchHistory.id);
    expect(updated.query).toBe(updatedQuery);
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newSearchHistory = await searchHistoryCaller.createSearchHistory({ query, roomId });
    const deletedSearchHistory = await searchHistoryCaller.deleteSearchHistory(newSearchHistory.id);

    expect(deletedSearchHistory.id).toBe(newSearchHistory.id);
  });
});
