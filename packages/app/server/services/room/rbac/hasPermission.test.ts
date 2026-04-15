import type { Context } from "@@/server/trpc/context";

import { hasPermission } from "@@/server/services/room/rbac/hasPermission";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { roomRoles, rooms, RoomType, usersToRoomRoles, usersToRooms } from "@esposter/db-schema";
import { RoomPermission, takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(hasPermission, () => {
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
    const room = takeOne(
      await mockContext.db.insert(rooms).values({ name: "", type: RoomType.Room, userId: ownerId }).returning(),
    );
    roomId = room.id;
    await mockContext.db.delete(roomRoles).where(eq(roomRoles.roomId, roomId));
  });

  test("owner always has permission", async () => {
    expect.hasAssertions();

    const result = await hasPermission(mockContext.db, ownerId, roomId, RoomPermission.ManageRoom);

    expect(result).toBe(true);
  });

  test("returns false for non-existent room", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    const result = await hasPermission(mockContext.db, user.id, crypto.randomUUID(), RoomPermission.ReadMessages);

    expect(result).toBe(false);
  });

  test("administrator bit grants all permissions", async () => {
    expect.hasAssertions();

    await mockContext.db
      .insert(roomRoles)
      .values({ name: "Admin", permissions: RoomPermission.Administrator, position: 1, roomId });
    const adminRole = takeOne(await mockContext.db.select().from(roomRoles).where(eq(roomRoles.roomId, roomId)));
    const { user } = await mockSessionOnce(mockContext.db);
    await mockContext.db.insert(usersToRooms).values({ roomId, userId: user.id });
    await mockContext.db.insert(usersToRoomRoles).values({ roleId: adminRole.id, roomId, userId: user.id });

    const result = await hasPermission(mockContext.db, user.id, roomId, RoomPermission.ManageMessages);

    expect(result).toBe(true);
  });

  test("specific permission check works", async () => {
    expect.hasAssertions();

    await mockContext.db
      .insert(roomRoles)
      .values({ isEveryone: true, name: "@everyone", permissions: RoomPermission.ReadMessages, position: 0, roomId });
    const { user } = await mockSessionOnce(mockContext.db);
    await mockContext.db.insert(usersToRooms).values({ roomId, userId: user.id });

    const [canRead, canManage] = await Promise.all([
      hasPermission(mockContext.db, user.id, roomId, RoomPermission.ReadMessages),
      hasPermission(mockContext.db, user.id, roomId, RoomPermission.ManageRoom),
    ]);

    expect(canRead).toBe(true);
    expect(canManage).toBe(false);
  });
});
