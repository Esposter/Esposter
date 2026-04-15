import type { Context } from "@@/server/trpc/context";

import { getPermission } from "@@/server/services/room/rbac/getPermission";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { roomRoles, rooms, RoomType, usersToRoomRoles, usersToRooms } from "@esposter/db-schema";
import { RoomPermission, takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(getPermission, () => {
  let mockContext: Context;
  let roomId: string;

  beforeAll(async () => {
    mockContext = await createMockContext();
  });

  beforeEach(async () => {
    await mockContext.db.delete(rooms);
    const { user } = await mockSessionOnce(mockContext.db);
    const room = takeOne(
      await mockContext.db.insert(rooms).values({ name: "", type: RoomType.Room, userId: user.id }).returning(),
    );
    roomId = room.id;
  });

  test("returns 0n with no roles", async () => {
    expect.hasAssertions();

    await mockContext.db.delete(roomRoles).where(eq(roomRoles.roomId, roomId));
    const { user } = await mockSessionOnce(mockContext.db);

    const result = await getPermission(mockContext.db, user.id, roomId);

    expect(result).toBe(0n);
  });

  test("returns @everyone permissions for all members", async () => {
    expect.hasAssertions();

    const everyonePerms = RoomPermission.ReadMessages | RoomPermission.SendMessages;
    await mockContext.db.delete(roomRoles).where(eq(roomRoles.roomId, roomId));
    await mockContext.db
      .insert(roomRoles)
      .values({ isEveryone: true, name: "@everyone", permissions: everyonePerms, position: 0, roomId });
    const { user } = await mockSessionOnce(mockContext.db);
    await mockContext.db.insert(usersToRooms).values({ roomId, userId: user.id });

    const result = await getPermission(mockContext.db, user.id, roomId);

    expect(result).toBe(everyonePerms);
  });

  test("oRs @everyone + assigned role permissions", async () => {
    expect.hasAssertions();

    await mockContext.db.delete(roomRoles).where(eq(roomRoles.roomId, roomId));
    await mockContext.db
      .insert(roomRoles)
      .values({ isEveryone: true, name: "@everyone", permissions: RoomPermission.ReadMessages, position: 0, roomId });
    const adminRole = takeOne(
      await mockContext.db
        .insert(roomRoles)
        .values({ name: "Admin", permissions: RoomPermission.ManageRoom, position: 1, roomId })
        .returning(),
    );
    const { user } = await mockSessionOnce(mockContext.db);
    await mockContext.db.insert(usersToRooms).values({ roomId, userId: user.id });
    await mockContext.db.insert(usersToRoomRoles).values({ roleId: adminRole.id, roomId, userId: user.id });

    const result = await getPermission(mockContext.db, user.id, roomId);

    expect(result).toBe(RoomPermission.ReadMessages | RoomPermission.ManageRoom);
  });
});
