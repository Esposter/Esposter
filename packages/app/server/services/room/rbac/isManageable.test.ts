// @vitest-environment node
import type { Context } from "@@/server/trpc/context";

import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { roomRoles, rooms, RoomType, usersToRoomRoles, usersToRooms } from "@esposter/db-schema";
import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

import { isManageable } from "./isManageable";

describe(isManageable, () => {
  let mockContext: Context;
  let roomId: string;
  let ownerId: string;

  beforeAll(async () => {
    mockContext = await createMockContext();
  });

  beforeEach(async () => {
    await mockContext.db.delete(rooms);
    const { user: owner } = await mockSessionOnce(mockContext.db);
    ownerId = owner.id;
    const room = (
      await mockContext.db.insert(rooms).values({ name: "", type: RoomType.Room, userId: ownerId }).returning()
    )[0]!;
    roomId = room.id;
    await mockContext.db.delete(roomRoles).where(eq(roomRoles.roomId, roomId));
  });

  test("owner can manage any target position", async () => {
    expect.hasAssertions();

    const result = await isManageable(mockContext.db, ownerId, roomId, 9999);

    expect(result).toBe(true);
  });

  test("returns false for non-existent room", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    const result = await isManageable(mockContext.db, user.id, crypto.randomUUID(), 0);

    expect(result).toBe(false);
  });

  test("user with higher top can manage lower position", async () => {
    expect.hasAssertions();

    const [role] = await mockContext.db
      .insert(roomRoles)
      .values({ name: "Mod", permissions: 0n, position: 5, roomId })
      .returning();
    const { user } = await mockSessionOnce(mockContext.db);
    await mockContext.db.insert(usersToRooms).values({ roomId, userId: user.id });
    await mockContext.db.insert(usersToRoomRoles).values({ roleId: role!.id, roomId, userId: user.id });

    const result = await isManageable(mockContext.db, user.id, roomId, 4);

    expect(result).toBe(true);
  });

  test("user cannot manage equal or higher position", async () => {
    expect.hasAssertions();

    const [role] = await mockContext.db
      .insert(roomRoles)
      .values({ name: "Mod", permissions: 0n, position: 5, roomId })
      .returning();
    const { user } = await mockSessionOnce(mockContext.db);
    await mockContext.db.insert(usersToRooms).values({ roomId, userId: user.id });
    await mockContext.db.insert(usersToRoomRoles).values({ roleId: role!.id, roomId, userId: user.id });

    const [equalPos, higherPos] = await Promise.all([
      isManageable(mockContext.db, user.id, roomId, 5),
      isManageable(mockContext.db, user.id, roomId, 6),
    ]);

    expect(equalPos).toBe(false);
    expect(higherPos).toBe(false);
  });
});
