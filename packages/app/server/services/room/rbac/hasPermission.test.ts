import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";
import type { User } from "better-auth";

import { hasPermission } from "@@/server/services/room/rbac/hasPermission";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { roleRouter } from "@@/server/trpc/routers/role";
import { roomRouter } from "@@/server/trpc/routers/room";
import { RoomPermission, rooms } from "@esposter/db-schema";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(hasPermission, () => {
  let mockContext: Context;
  let roleCaller: DecorateRouterRecord<TRPCRouter["role"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let roomId: string;
  let owner: User;
  const name = "name";

  beforeAll(async () => {
    mockContext = await createMockContext();
    roleCaller = createCallerFactory(roleRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  beforeEach(async () => {
    owner = getMockSession().user;
    const room = await roomCaller.createRoom({ name });
    roomId = room.id;
  });

  afterEach(async () => {
    await mockContext.db.delete(rooms);
  });

  test("owner always has permission", async () => {
    expect.hasAssertions();

    const result = await hasPermission(mockContext.db, owner.id, roomId, RoomPermission.ManageRoom);

    expect(result).toBe(true);
  });

  test("returns false for non-existent room", async () => {
    expect.hasAssertions();

    const result = await hasPermission(mockContext.db, owner.id, crypto.randomUUID(), RoomPermission.ReadMessages);

    expect(result).toBe(false);
  });

  test("administrator bit grants all permissions", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await mockSessionOnce(mockContext.db, owner);
    const adminRole = await roleCaller.createRole({
      name: "Admin",
      permissions: RoomPermission.Administrator,
      position: 1,
      roomId,
    });
    await mockSessionOnce(mockContext.db, owner);
    await roomCaller.createMembers({ roomId, userIds: [userId] });
    await mockSessionOnce(mockContext.db, owner);
    await roleCaller.assignRole({ roleId: adminRole.id, roomId, userId });

    const result = await hasPermission(mockContext.db, userId, roomId, RoomPermission.ManageMessages);

    expect(result).toBe(true);
  });

  test("specific permission check works", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    await roomCaller.createMembers({ roomId, userIds: [userId] });

    await mockSessionOnce(mockContext.db, owner);
    const roles = await roleCaller.readRoles({ roomId });
    const everyoneRole = roles.find(({ isEveryone }) => isEveryone);
    assert.exists(everyoneRole);

    await mockSessionOnce(mockContext.db, owner);
    await roleCaller.updateRole({ id: everyoneRole.id, permissions: RoomPermission.ReadMessages, roomId });

    const [canRead, canManage] = await Promise.all([
      hasPermission(mockContext.db, userId, roomId, RoomPermission.ReadMessages),
      hasPermission(mockContext.db, userId, roomId, RoomPermission.ManageRoom),
    ]);

    expect(canRead).toBe(true);
    expect(canManage).toBe(false);
  });
});
