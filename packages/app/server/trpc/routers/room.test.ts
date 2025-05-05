import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { rooms } from "#shared/db/schema/rooms";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { roomRouter } from "@@/server/trpc/routers/room";
import { NIL } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("room", () => {
  let caller: DecorateRouterRecord<TRPCRouter["room"]>;
  let mockContext: Context;

  beforeAll(async () => {
    const createCaller = createCallerFactory(roomRouter);
    mockContext = await createMockContext();
    caller = createCaller(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(rooms);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const name = "name";
    const newRoom = await caller.createRoom({ name });

    expect(newRoom.name).toBe(name);
  });

  test("reads", async () => {
    expect.hasAssertions();

    const name = "name";
    const newRoom = await caller.createRoom({ name });
    const readRoom = await caller.readRoom(newRoom.id);

    expect(readRoom).toStrictEqual(newRoom);
  });

  test("fails read with non-existent id", async () => {
    expect.hasAssertions();

    await expect(caller.readRoom(NIL)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Room is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("reads latest updated room", async () => {
    expect.hasAssertions();

    const name = "name";
    await caller.createRoom({ name });
    const newRoom = await caller.createRoom({ name });
    const readRoom = await caller.readRoom();

    expect(readRoom).toStrictEqual(newRoom);
  });

  test("reads latest updated room with no rooms to be null", async () => {
    expect.hasAssertions();

    const readRoom = await caller.readRoom();

    expect(readRoom).toBeNull();
  });

  test("updates", async () => {
    expect.hasAssertions();

    const name = "name";
    const newRoom = await caller.createRoom({ name });
    const updatedName = "updatedName";
    const updatedRoom = await caller.updateRoom({ id: newRoom.id, name: updatedName });

    expect(updatedRoom.name).toBe(updatedName);
  });

  test("fails update with non-existent id", async () => {
    expect.hasAssertions();

    await expect(caller.updateRoom({ id: NIL })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: No values to set]`,
    );
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const name = "name";
    const newRoom = await caller.createRoom({ name });
    const deletedRoom = await caller.deleteRoom(newRoom.id);

    expect(deletedRoom.id).toBe(newRoom.id);
  });

  test("fails delete with non-existent id", async () => {
    expect.hasAssertions();

    await expect(caller.deleteRoom(NIL)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Delete, name: Room, 00000000-0000-0000-0000-000000000000]`,
    );
  });
});
