import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { getPermissions } from "@@/server/services/room/rbac/getPermissions";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { roleRouter } from "@@/server/trpc/routers/role";
import { roomRouter } from "@@/server/trpc/routers/room";
import { RoomPermission, roomsInMessage } from "@esposter/db-schema";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(getPermissions, () => {
  let mockContext: Context;
  let roleCaller: DecorateRouterRecord<TRPCRouter["role"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let roomId: string;
  const name = "name";
  const updatedPermissions = RoomPermission.ReadMessages | RoomPermission.SendMessages;

  beforeAll(async () => {
    mockContext = await createMockContext();
    roleCaller = createCallerFactory(roleRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  beforeEach(async () => {
    const room = await roomCaller.createRoom({ name });
    roomId = room.id;
  });

  afterEach(async () => {
    await mockContext.db.delete(roomsInMessage);
  });

  test("returns 0n with no roles", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);
    const { user: nonMember } = getMockSession();
    const permissions = await getPermissions(mockContext.db, nonMember.id, roomId);

    expect(permissions).toBe(0n);
  });

  test("updates @everyone permissions for all members", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);
    const { user } = getMockSession();
    await roomCaller.createMembers({ roomId, userIds: [user.id] });

    const roles = await roleCaller.readRoles({ roomIds: [roomId] });
    const everyoneRole = roles.find(({ isEveryone }) => isEveryone);
    assert.exists(everyoneRole);
    await roleCaller.updateRole({ id: everyoneRole.id, permissions: updatedPermissions, roomId });
    const permissions = await getPermissions(mockContext.db, user.id, roomId);

    expect(permissions).toBe(updatedPermissions);
  });

  test("ors @everyone + assigned role permissions", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);
    const { user } = getMockSession();
    await roomCaller.createMembers({ roomId, userIds: [user.id] });

    const roles = await roleCaller.readRoles({ roomIds: [roomId] });
    const everyoneRole = roles.find(({ isEveryone }) => isEveryone);
    assert.exists(everyoneRole);
    await roleCaller.updateRole({ id: everyoneRole.id, permissions: RoomPermission.ReadMessages, roomId });
    const adminRole = await roleCaller.createRole({
      name,
      permissions: RoomPermission.ManageRoom,
      position: 1,
      roomId,
    });
    await roleCaller.assignRole({ roleId: adminRole.id, roomId, userId: user.id });
    const permissions = await getPermissions(mockContext.db, user.id, roomId);

    expect(permissions).toBe(RoomPermission.ReadMessages | RoomPermission.ManageRoom);
  });
});
