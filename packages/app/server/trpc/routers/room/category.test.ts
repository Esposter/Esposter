import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { categoryRouter } from "@@/server/trpc/routers/room/category";
import { DatabaseEntityType, roomCategoriesInMessage } from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
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

  test("reads empty room categories", async () => {
    expect.hasAssertions();

    const readRoomCategories = await roomCategoryCaller.readRoomCategories();

    expect(readRoomCategories).toHaveLength(0);
  });

  test("reads room categories", async () => {
    expect.hasAssertions();

    const newRoomCategory = await roomCategoryCaller.createRoomCategory({ name });
    const readRoomCategories = await roomCategoryCaller.readRoomCategories();
    const readRoomCategory = takeOne(readRoomCategories);

    expect(readRoomCategories).toHaveLength(1);
    expect(readRoomCategory.id).toBe(newRoomCategory.id);
    expect(readRoomCategory.name).toBe(name);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const newRoomCategory = await roomCategoryCaller.createRoomCategory({ name });

    expect(newRoomCategory.name).toBe(name);
  });

  test("creates appended below the existing drag-assigned order", async () => {
    expect.hasAssertions();

    const first = await roomCategoryCaller.createRoomCategory({ name });
    const second = await roomCategoryCaller.createRoomCategory({ name: updatedName });

    expect(first.position).toBe(0);
    expect(second.position).toBe(1);

    await roomCategoryCaller.reorderRoomCategories([
      { id: first.id, position: 1 },
      { id: second.id, position: 0 },
    ]);
    const third = await roomCategoryCaller.createRoomCategory({ name });

    expect(third.position).toBe(2);
  });

  test("updates", async () => {
    expect.hasAssertions();

    const newRoomCategory = await roomCategoryCaller.createRoomCategory({ name });
    const updatedRoomCategory = await roomCategoryCaller.updateRoomCategory({
      id: newRoomCategory.id,
      name: updatedName,
      position: 1,
    });

    expect(updatedRoomCategory.id).toBe(newRoomCategory.id);
    expect(updatedRoomCategory.name).toBe(updatedName);
    expect(updatedRoomCategory.position).toBe(1);
  });

  test("reorders in one transaction", async () => {
    expect.hasAssertions();

    const first = await roomCategoryCaller.createRoomCategory({ name });
    const second = await roomCategoryCaller.createRoomCategory({ name: updatedName });
    const reorderedRoomCategories = await roomCategoryCaller.reorderRoomCategories([
      { id: first.id, position: 1 },
      { id: second.id, position: 0 },
    ]);

    expect(reorderedRoomCategories).toHaveLength(2);

    const readRoomCategories = await roomCategoryCaller.readRoomCategories();

    expect(takeOne(readRoomCategories).id).toBe(second.id);
  });

  test("rolls back the whole reorder when a row is not owned", async () => {
    expect.hasAssertions();

    const newRoomCategory = await roomCategoryCaller.createRoomCategory({ name });
    const missingId = crypto.randomUUID();

    await expect(
      roomCategoryCaller.reorderRoomCategories([
        { id: newRoomCategory.id, position: 1 },
        { id: missingId, position: 0 },
      ]),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.RoomCategory, missingId).message}]`,
    );

    const readRoomCategories = await roomCategoryCaller.readRoomCategories();

    expect(takeOne(readRoomCategories).position).toBe(newRoomCategory.position);
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newRoomCategory = await roomCategoryCaller.createRoomCategory({ name });
    const deletedRoomCategory = await roomCategoryCaller.deleteRoomCategory(newRoomCategory.id);

    expect(deletedRoomCategory.id).toBe(newRoomCategory.id);
  });
});
