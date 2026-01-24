import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { roomRouter } from "@@/server/trpc/routers/room";
import { searchHistoryRouter } from "@@/server/trpc/routers/searchHistory";
import { DatabaseEntityType, roomsInMessage, searchHistoriesInMessage } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("searchHistory", () => {
  let searchHistoryCaller: DecorateRouterRecord<TRPCRouter["searchHistory"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let mockContext: Context;
  const name = "name";
  const query = "query";
  const updatedQuery = "updatedQuery";

  beforeAll(async () => {
    const createCaller = createCallerFactory(searchHistoryRouter);
    const createRoomCaller = createCallerFactory(roomRouter);
    mockContext = await createMockContext();
    searchHistoryCaller = createCaller(mockContext);
    roomCaller = createRoomCaller(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(searchHistoriesInMessage);
    await mockContext.db.delete(roomsInMessage);
  });

  test("reads empty search histories", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const readSearchHistories = await searchHistoryCaller.readSearchHistories({ roomId: newRoom.id });

    expect(readSearchHistories).toStrictEqual(getCursorPaginationData([], 0, []));
  });

  test("reads search histories", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newSearchHistory = await searchHistoryCaller.createSearchHistory({ query, roomId: newRoom.id });
    const readSearchHistories = await searchHistoryCaller.readSearchHistories({ roomId: newRoom.id });

    expect(readSearchHistories.items).toHaveLength(1);
    expect(readSearchHistories.items[0].id).toBe(newSearchHistory.id);
    expect(readSearchHistories.items[0].roomId).toBe(newRoom.id);
    expect(readSearchHistories.items[0].query).toBe(query);
  });

  test("fails read search histories with non-existent room id", async () => {
    expect.hasAssertions();

    await expect(
      searchHistoryCaller.readSearchHistories({ roomId: crypto.randomUUID() }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails read search histories with non-existent member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      searchHistoryCaller.readSearchHistories({ roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newSearchHistory = await searchHistoryCaller.createSearchHistory({ query, roomId: newRoom.id });

    expect(newSearchHistory.query).toBe(query);
    expect(newSearchHistory.roomId).toBe(newRoom.id);
  });

  test("fails create with non-existent room", async () => {
    expect.hasAssertions();

    await expect(
      searchHistoryCaller.createSearchHistory({ query, roomId: crypto.randomUUID() }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails create with non-existent member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      searchHistoryCaller.createSearchHistory({ query, roomId: newRoom.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("updates", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newSearchHistory = await searchHistoryCaller.createSearchHistory({ query, roomId: newRoom.id });
    const updated = await searchHistoryCaller.updateSearchHistory({ id: newSearchHistory.id, query: updatedQuery });

    expect(updated.id).toBe(newSearchHistory.id);
    expect(updated.query).toBe(updatedQuery);
  });

  test("fails update with non-existent id", async () => {
    expect.hasAssertions();

    const id = crypto.randomUUID();

    await expect(
      searchHistoryCaller.updateSearchHistory({ id, query: updatedQuery }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.SearchHistory, id).message}]`,
    );
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newSearchHistory = await searchHistoryCaller.createSearchHistory({ query, roomId: newRoom.id });
    const deletedSearchHistory = await searchHistoryCaller.deleteSearchHistory(newSearchHistory.id);

    expect(deletedSearchHistory.id).toBe(newSearchHistory.id);
  });

  test("fails delete with non-existent id", async () => {
    expect.hasAssertions();

    const id = crypto.randomUUID();

    await expect(searchHistoryCaller.deleteSearchHistory(id)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.SearchHistory, id).message}]`,
    );
  });
});
