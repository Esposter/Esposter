import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";
import type { User } from "better-auth";

import { getPermissions } from "@@/server/services/room/rbac/getPermissions";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { roleRouter } from "@@/server/trpc/routers/role";
import { roomRouter } from "@@/server/trpc/routers/room";
import { RoomPermission, rooms } from "@esposter/db-schema";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(getPermissions, () => {
  let mockContext: Context;
  let roleCaller: DecorateRouterRecord<TRPCRouter["role"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let roomId: string;
  let owner: User;
  const name = "name";
  const updatedPermissions = RoomPermission.ReadMessages | RoomPermission.SendMessages;

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

  test("returns 0n with no roles", async () => {
    expect.hasAssertions();

    const result = await getPermissions(mockContext.db, owner.id, roomId);

    expect(result).toBe(0n);
  });

  test("updates @everyone permissions for all members", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);
    const { user } = getMockSession();
    await roomCaller.createMembers({ roomId, userIds: [user.id] });

    const roles = await roleCaller.readRoles({ roomId });
    const everyoneRole = roles.find(({ isEveryone }) => isEveryone);
    assert.exists(everyoneRole);
    await roleCaller.updateRole({ id: everyoneRole.id, permissions: updatedPermissions, roomId });
    const result = await getPermissions(mockContext.db, user.id, roomId);

    expect(result).toBe(updatedPermissions);
  });

  test("oRs @everyone + assigned role permissions", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);
    const { user } = getMockSession();
    await roomCaller.createMembers({ roomId, userIds: [user.id] });

    const roles = await roleCaller.readRoles({ roomId });
    const everyoneRole = roles.find(({ isEveryone }) => isEveryone);
    assert.exists(everyoneRole);
    await roleCaller.updateRole({ id: everyoneRole.id, permissions: RoomPermission.ReadMessages, roomId });
    const adminRole = await roleCaller.createRole({
      name: "Admin",
      permissions: RoomPermission.ManageRoom,
      position: 1,
      roomId,
    });
    await roleCaller.assignRole({ roleId: adminRole.id, roomId, userId: user.id });

    const result = await getPermissions(mockContext.db, user.id, roomId);

    expect(result).toBe(RoomPermission.ReadMessages | RoomPermission.ManageRoom);
  });
});
