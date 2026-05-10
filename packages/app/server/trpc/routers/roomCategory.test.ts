import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { roomCategoryRouter } from "@@/server/trpc/routers/roomCategory";
import { roomCategoriesInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("roomCategory", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["roomCategory"]>;
  const name = "name";
  const updatedName = "updatedName";

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(roomCategoryRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(roomCategoriesInMessage);
  });

  test("reads empty room categories", async () => {
    expect.hasAssertions();

    const readRoomCategories = await caller.readRoomCategories();

    expect(readRoomCategories).toHaveLength(0);
  });

  test("reads room categories", async () => {
    expect.hasAssertions();

    const newRoomCategory = await caller.createRoomCategory({ name });
    const readRoomCategories = await caller.readRoomCategories();

    expect(readRoomCategories).toHaveLength(1);
    expect(takeOne(readRoomCategories).id).toBe(newRoomCategory.id);
    expect(takeOne(readRoomCategories).name).toBe(name);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const newRoomCategory = await caller.createRoomCategory({ name });

    expect(newRoomCategory.name).toBe(name);
  });

  test("updates", async () => {
    expect.hasAssertions();

    const newRoomCategory = await caller.createRoomCategory({ name });
    const updatedRoomCategory = await caller.updateRoomCategory({
      id: newRoomCategory.id,
      name: updatedName,
      position: 1,
    });

    expect(updatedRoomCategory.id).toBe(newRoomCategory.id);
    expect(updatedRoomCategory.name).toBe(updatedName);
    expect(updatedRoomCategory.position).toBe(1);
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const newRoomCategory = await caller.createRoomCategory({ name });
    const deletedRoomCategory = await caller.deleteRoomCategory(newRoomCategory.id);

    expect(deletedRoomCategory.id).toBe(newRoomCategory.id);
  });
});
