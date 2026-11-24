import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createMockContext, getMockSession } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { getUncoveredWrites } from "#server/trpc/optimisticWriteCrossCheck.test";
import { categoryRouter } from "#server/trpc/routers/room/category";
import { roomCategoryTable } from "#src/services/message/roomCategory/constants";
import { getCreateRoomCategoryEntry } from "#src/services/message/roomCategory/getCreateRoomCategoryEntry";
import { getDeleteRoomCategoryEntry } from "#src/services/message/roomCategory/getDeleteRoomCategoryEntry";
import { getReorderRoomCategoriesEntry } from "#src/services/message/roomCategory/getReorderRoomCategoriesEntry";
import { DatabaseEntityType, NO_ROW_VERSION, roomCategoriesInMessage } from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { v7 } from "uuid";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("categoryRouter", () => {
  let mockContext: Context;
  let roomCategoryCaller: DecorateRouterRecord<TRPCRouter["room"]["category"]>;
  const name = "name";
  const updatedName = "updatedName";

  beforeAll(async () => {
    mockContext = await createMockContext();
    roomCategoryCaller = createCallerFactory(categoryRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(roomCategoriesInMessage);
  });

  test("reads room categories", async () => {
    expect.hasAssertions();

    const newRoomCategory = await roomCategoryCaller.createRoomCategory({ id: v7(), name });
    const roomCategories = await roomCategoryCaller.readRoomCategories();
    const roomCategory = takeOne(roomCategories);

    expect(roomCategories).toHaveLength(1);
    expect(roomCategory.id).toBe(newRoomCategory.id);
    expect(roomCategory.name).toBe(name);
  });

  test("creates a room category under the id the client gives it", async () => {
    expect.hasAssertions();

    const id = v7();
    const newRoomCategory = await roomCategoryCaller.createRoomCategory({ id, name });

    expect(newRoomCategory.id).toBe(id);
  });

  test("creates appended below the existing drag-assigned order", async () => {
    expect.hasAssertions();

    const first = await roomCategoryCaller.createRoomCategory({ id: v7(), name });
    const second = await roomCategoryCaller.createRoomCategory({ id: v7(), name: updatedName });

    expect(first.position).toBe(0);
    expect(second.position).toBe(1);

    await roomCategoryCaller.reorderRoomCategories([
      { id: first.id, position: 1 },
      { id: second.id, position: 0 },
    ]);
    const third = await roomCategoryCaller.createRoomCategory({ id: v7(), name });

    expect(third.position).toBe(2);
  });

  test("creates concurrently at distinct positions", async () => {
    expect.hasAssertions();

    const [first, second] = await Promise.all([
      roomCategoryCaller.createRoomCategory({ id: v7(), name }),
      roomCategoryCaller.createRoomCategory({ id: v7(), name: updatedName }),
    ]);

    expect(
      [first.position, second.position].toSorted((firstPosition, secondPosition) => firstPosition - secondPosition),
    ).toStrictEqual([0, 1]);
  });

  test("reorders to the positions given, and reads the category moved to the front first", async () => {
    expect.hasAssertions();

    const first = await roomCategoryCaller.createRoomCategory({ id: v7(), name });
    const second = await roomCategoryCaller.createRoomCategory({ id: v7(), name: updatedName });
    const reorderedRoomCategories = await roomCategoryCaller.reorderRoomCategories([
      { id: first.id, position: 1 },
      { id: second.id, position: 0 },
    ]);

    expect(reorderedRoomCategories).toHaveLength(2);

    const roomCategories = await roomCategoryCaller.readRoomCategories();

    expect(takeOne(roomCategories).id).toBe(second.id);
  });

  test("moves nothing when a row is not owned", async () => {
    expect.hasAssertions();

    const newRoomCategory = await roomCategoryCaller.createRoomCategory({ id: v7(), name });
    const missingId = v7();

    await expect(
      roomCategoryCaller.reorderRoomCategories([
        { id: newRoomCategory.id, position: 1 },
        { id: missingId, position: 0 },
      ]),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.RoomCategory, missingId).message}]`,
    );

    const roomCategories = await roomCategoryCaller.readRoomCategories();

    expect(takeOne(roomCategories).position).toBe(newRoomCategory.position);
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newRoomCategory = await roomCategoryCaller.createRoomCategory({ id: v7(), name });
    const deletedRoomCategory = await roomCategoryCaller.deleteRoomCategory(newRoomCategory.id);
    const roomCategories = await roomCategoryCaller.readRoomCategories();

    expect(deletedRoomCategory.id).toBe(newRoomCategory.id);
    expect(takeOne(roomCategories).deletedAt).not.toBeNull();
  });

  // A deletion keeps the category as a tombstone.
  // The version it leaves is the one a later arrival of the row loses to.
  // The read returns the tombstone, so a client holding the row removes it.
  test("deletes as a tombstone at a higher version, which the read returns with its deletedAt", async () => {
    expect.hasAssertions();

    const newRoomCategory = await roomCategoryCaller.createRoomCategory({ id: v7(), name });
    const deletedRoomCategory = await roomCategoryCaller.deleteRoomCategory(newRoomCategory.id);
    const roomCategories = await roomCategoryCaller.readRoomCategories();

    expect(deletedRoomCategory.deletedAt).not.toBeNull();
    expect(deletedRoomCategory.version).toBeGreaterThan(newRoomCategory.version);
    expect(takeOne(roomCategories)).toStrictEqual(deletedRoomCategory);
  });

  test("revives a deleted category created again under its id, at a higher version", async () => {
    expect.hasAssertions();

    const id = v7();
    await roomCategoryCaller.createRoomCategory({ id, name });
    const deletedRoomCategory = await roomCategoryCaller.deleteRoomCategory(id);
    const revivedRoomCategory = await roomCategoryCaller.createRoomCategory({ id, name: updatedName });
    const roomCategories = await roomCategoryCaller.readRoomCategories();

    expect(revivedRoomCategory.deletedAt).toBeNull();
    expect(revivedRoomCategory.name).toBe(updatedName);
    expect(revivedRoomCategory.version).toBeGreaterThan(deletedRoomCategory.version);
    expect(takeOne(roomCategories).id).toBe(id);
  });

  // Each category write's optimistic entry shows every row its answer names, checked against the seeded state
  test("the category create's entry covers the category row the server names", async () => {
    expect.hasAssertions();

    const id = v7();
    const { named, uncovered } = await getUncoveredWrites({
      call: (context) => createCallerFactory(categoryRouter)(context).createRoomCategory({ id, name }),
      context: mockContext,
      entry: getCreateRoomCategoryEntry({
        createdAt: new Date(),
        deletedAt: null,
        id,
        name,
        position: 0,
        updatedAt: new Date(),
        userId: getMockSession().user.id,
        version: NO_ROW_VERSION,
      }),
      path: "createRoomCategory",
      tables: [roomCategoryTable],
    });

    expect(named).toHaveLength(1);
    expect(uncovered).toStrictEqual([]);
  });

  test("the category delete's entry covers the category row the server names", async () => {
    expect.hasAssertions();

    const roomCategory = await roomCategoryCaller.createRoomCategory({ id: v7(), name });
    const { named, uncovered } = await getUncoveredWrites({
      call: (context) => createCallerFactory(categoryRouter)(context).deleteRoomCategory(roomCategory.id),
      context: mockContext,
      entry: getDeleteRoomCategoryEntry(roomCategory.id, new Date()),
      path: "deleteRoomCategory",
      tables: [roomCategoryTable],
    });

    expect(named).toHaveLength(1);
    expect(uncovered).toStrictEqual([]);
  });

  test("the category reorder's entry covers every category row the server names", async () => {
    expect.hasAssertions();

    const first = await roomCategoryCaller.createRoomCategory({ id: v7(), name });
    const second = await roomCategoryCaller.createRoomCategory({ id: v7(), name: updatedName });
    const updates = [
      { id: first.id, position: 1 },
      { id: second.id, position: 0 },
    ];
    const { named, uncovered } = await getUncoveredWrites({
      call: (context) => createCallerFactory(categoryRouter)(context).reorderRoomCategories(updates),
      context: mockContext,
      entry: getReorderRoomCategoriesEntry(updates),
      path: "reorderRoomCategories",
      tables: [roomCategoryTable],
    });

    expect(named).toHaveLength(2);
    expect(uncovered).toStrictEqual([]);
  });
});
