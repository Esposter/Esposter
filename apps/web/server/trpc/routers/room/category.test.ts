import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createMockContext } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { categoryRouter } from "#server/trpc/routers/room/category";
import { DatabaseEntityType, roomCategoriesInMessage } from "@esposter/db-schema";
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
    expect(roomCategories).toHaveLength(0);
  });

  // A deletion keeps the category as a tombstone, so the version it leaves is the one a later arrival of the row loses to
  test("deletes as a tombstone at a higher version, which the list leaves out", async () => {
    expect.hasAssertions();

    const newRoomCategory = await roomCategoryCaller.createRoomCategory({ id: v7(), name });
    const deletedRoomCategory = await roomCategoryCaller.deleteRoomCategory(newRoomCategory.id);
    const roomCategories = await roomCategoryCaller.readRoomCategories();

    expect(deletedRoomCategory.deletedAt).not.toBeNull();
    expect(deletedRoomCategory.version).toBeGreaterThan(newRoomCategory.version);
    expect(roomCategories).toHaveLength(0);
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
});
