import type { Context } from "@@/server/trpc/context";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { categoryRouter } from "@@/server/trpc/routers/room/category";
import { roomCategoriesInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("room/category", () => {
  let mockContext: Context;
  let roomCategoryCaller: DecorateRouterRecord<typeof categoryRouter>;
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

    expect(readRoomCategories).toHaveLength(1);
    expect(takeOne(readRoomCategories).id).toBe(newRoomCategory.id);
    expect(takeOne(readRoomCategories).name).toBe(name);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const newRoomCategory = await roomCategoryCaller.createRoomCategory({ name });

    expect(newRoomCategory.name).toBe(name);
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

  test("deletes", async () => {
    expect.hasAssertions();

    const newRoomCategory = await roomCategoryCaller.createRoomCategory({ name });
    const deletedRoomCategory = await roomCategoryCaller.deleteRoomCategory(newRoomCategory.id);

    expect(deletedRoomCategory.id).toBe(newRoomCategory.id);
  });
});
