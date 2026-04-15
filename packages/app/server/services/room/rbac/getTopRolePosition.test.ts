// @vitest-environment node
import type { Context } from "@@/server/trpc/context";

import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { roomRoles, rooms, RoomType, usersToRoomRoles, usersToRooms } from "@esposter/db-schema";
import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

import { getTopRolePosition } from "./getTopRolePosition";

describe(getTopRolePosition, () => {
  let mockContext: Context;
  let roomId: string;

  beforeAll(async () => {
    mockContext = await createMockContext();
  });

  beforeEach(async () => {
    await mockContext.db.delete(rooms);
    const { user: owner } = await mockSessionOnce(mockContext.db);
    const room = (
      await mockContext.db.insert(rooms).values({ name: "", type: RoomType.Room, userId: owner.id }).returning()
    )[0]!;
    roomId = room.id;
    await mockContext.db.delete(roomRoles).where(eq(roomRoles.roomId, roomId));
  });

  test("returns -1 with no assigned roles", async () => {
    expect.hasAssertions();

    const { user } = await mockSessionOnce(mockContext.db);
    await mockContext.db.insert(usersToRooms).values({ roomId, userId: user.id });

    const result = await getTopRolePosition(mockContext.db, user.id, roomId);

    expect(result).toBe(-1);
  });

  test("returns the assigned role position", async () => {
    expect.hasAssertions();

    const [role] = await mockContext.db
      .insert(roomRoles)
      .values({ name: "Mod", permissions: 0n, position: 5, roomId })
      .returning();
    const { user } = await mockSessionOnce(mockContext.db);
    await mockContext.db.insert(usersToRooms).values({ roomId, userId: user.id });
    await mockContext.db.insert(usersToRoomRoles).values({ roleId: role!.id, roomId, userId: user.id });

    const result = await getTopRolePosition(mockContext.db, user.id, roomId);

    expect(result).toBe(5);
  });

  test("returns max position across multiple roles", async () => {
    expect.hasAssertions();

    const [roleA, roleB] = await mockContext.db
      .insert(roomRoles)
      .values([
        { name: "Mod", permissions: 0n, position: 3, roomId },
        { name: "Senior", permissions: 0n, position: 7, roomId },
      ])
      .returning();
    const { user } = await mockSessionOnce(mockContext.db);
    await mockContext.db.insert(usersToRooms).values({ roomId, userId: user.id });
    await mockContext.db.insert(usersToRoomRoles).values([
      { roleId: roleA!.id, roomId, userId: user.id },
      { roleId: roleB!.id, roomId, userId: user.id },
    ]);

    const result = await getTopRolePosition(mockContext.db, user.id, roomId);

    expect(result).toBe(7);
  });
});
