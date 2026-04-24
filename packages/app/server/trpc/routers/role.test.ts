import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { roleRouter } from "@@/server/trpc/routers/role";
import { roomRouter } from "@@/server/trpc/routers/room";
import { withAsyncIterator } from "@@/server/trpc/routers/withAsyncIterator.test";
import { DatabaseEntityType, RoomPermission, rooms } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test } from "vitest";

describe("role", () => {
  let mockContext: Context;
  let roleCaller: DecorateRouterRecord<TRPCRouter["role"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let roomId: string;
  const name = "name";
  const updatedName = "updatedName";
  const position = 5;

  const createMember = async () => {
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();
    await roomCaller.createMembers({ roomId, userIds: [user.id] });
    return user;
  };

  const setupMemberWithRole = async (permissions: bigint, position: number) => {
    const member = await createMember();
    const role = await roleCaller.createRole({ name, permissions, position, roomId });
    await roleCaller.assignRole({ roleId: role.id, roomId, userId: member.id });
    return { member, role };
  };

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
    await mockContext.db.delete(rooms);
  });

  test("reads empty roles (only @everyone)", async () => {
    expect.hasAssertions();

    const roles = await roleCaller.readRoles({ roomId });

    expect(roles.length).toBeGreaterThanOrEqual(1);
    expect(roles.some(({ isEveryone }) => isEveryone)).toBe(true);
  });

  test("creates role (owner)", async () => {
    expect.hasAssertions();

    const role = await roleCaller.createRole({
      name,
      permissions: RoomPermission.ManageMessages,
      position: 0,
      roomId,
    });

    expect(role.name).toBe(name);
    expect(role.permissions).toBe(RoomPermission.ManageMessages);
    expect(role.roomId).toBe(roomId);
  });

  test("updates role (owner)", async () => {
    expect.hasAssertions();

    const createdRole = await roleCaller.createRole({ name, permissions: 0n, position: 0, roomId });
    const updatedRole = await roleCaller.updateRole({ id: createdRole.id, name: updatedName, roomId });

    expect(updatedRole.name).toBe(updatedName);
    expect(updatedRole.id).toBe(createdRole.id);
    expect(updatedRole.permissions).toBe(createdRole.permissions);
    expect(updatedRole.position).toBe(createdRole.position);
  });

  test("deletes role (owner)", async () => {
    expect.hasAssertions();

    const createdRole = await roleCaller.createRole({ name, permissions: 0n, position: 0, roomId });
    const deletedRole = await roleCaller.deleteRole({ id: createdRole.id, roomId });

    expect(deletedRole.id).toBe(createdRole.id);
  });

  test("cannot delete @everyone role", async () => {
    expect.hasAssertions();

    const roles = await roleCaller.readRoles({ roomId });
    const everyoneRole = roles.find(({ isEveryone }) => isEveryone);
    assert.exists(everyoneRole);

    await expect(roleCaller.deleteRole({ id: everyoneRole.id, roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.RoomRole, everyoneRole.id).message}]`,
    );
  });

  test("unauthorized without ManageRoles permission", async () => {
    expect.hasAssertions();

    const member = await createMember();
    await mockSessionOnce(mockContext.db, member);

    await expect(
      roleCaller.createRole({ name, permissions: 0n, position: 0, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("assigns role to member", async () => {
    expect.hasAssertions();

    const targetMember = await createMember();
    const role = await roleCaller.createRole({ name, permissions: 0n, position: 1, roomId });
    await roleCaller.assignRole({ roleId: role.id, roomId, userId: targetMember.id });
    const memberRoles = await roleCaller.readMemberRoles({ roomId, userIds: [targetMember.id] });

    expect(memberRoles.some(({ id }) => id === role.id)).toBe(true);
  });

  test("assignRole is idempotent on duplicate", async () => {
    expect.hasAssertions();

    const targetMember = await createMember();
    const role = await roleCaller.createRole({ name, permissions: 0n, position: 1, roomId });
    await roleCaller.assignRole({ roleId: role.id, roomId, userId: targetMember.id });

    await expect(roleCaller.assignRole({ roleId: role.id, roomId, userId: targetMember.id })).resolves.toStrictEqual(
      role,
    );
  });

  test("cannot assign @everyone role explicitly", async () => {
    expect.hasAssertions();

    const roles = await roleCaller.readRoles({ roomId });
    const everyoneRole = roles.find(({ isEveryone }) => isEveryone);
    assert.exists(everyoneRole);
    const targetMember = await createMember();

    await expect(
      roleCaller.assignRole({ roleId: everyoneRole.id, roomId, userId: targetMember.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoomRole, everyoneRole.id).message}]`,
    );
  });

  test("cannot assign role to non-member", async () => {
    expect.hasAssertions();

    const role = await roleCaller.createRole({ name, permissions: 0n, position: 1, roomId });
    const { user } = await mockSessionOnce(mockContext.db);
    getMockSession();

    await expect(
      roleCaller.assignRole({ roleId: role.id, roomId, userId: user.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.UserToRoom, user.id).message}]`,
    );
  });

  test("cannot assign role at or above own top position", async () => {
    expect.hasAssertions();

    const { member: actor } = await setupMemberWithRole(RoomPermission.ManageRoles, position);
    const peerRole = await roleCaller.createRole({ name, permissions: 0n, position, roomId });
    const targetMember = await createMember();
    await mockSessionOnce(mockContext.db, actor);

    await expect(
      roleCaller.assignRole({ roleId: peerRole.id, roomId, userId: targetMember.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("cannot assign role to member with equal or higher top position", async () => {
    expect.hasAssertions();

    const { member: actor } = await setupMemberWithRole(RoomPermission.ManageRoles, position);
    const lowRole = await roleCaller.createRole({ name, permissions: 0n, position: 2, roomId });
    const { member: targetMember } = await setupMemberWithRole(0n, position);
    await mockSessionOnce(mockContext.db, actor);

    await expect(
      roleCaller.assignRole({ roleId: lowRole.id, roomId, userId: targetMember.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("revokes role from member", async () => {
    expect.hasAssertions();

    const targetMember = await createMember();
    const role = await roleCaller.createRole({ name, permissions: 0n, position: 1, roomId });
    await roleCaller.assignRole({ roleId: role.id, roomId, userId: targetMember.id });
    await roleCaller.revokeRole({ roleId: role.id, roomId, userId: targetMember.id });
    const memberRoles = await roleCaller.readMemberRoles({ roomId, userIds: [targetMember.id] });

    expect(memberRoles.some(({ id }) => id === role.id)).toBe(false);
  });

  test("cannot revoke role at or above own top position", async () => {
    expect.hasAssertions();

    const { member: actor } = await setupMemberWithRole(RoomPermission.ManageRoles, position);
    const { member: targetMember, role: peerRole } = await setupMemberWithRole(0n, position);
    await mockSessionOnce(mockContext.db, actor);

    await expect(
      roleCaller.revokeRole({ roleId: peerRole.id, roomId, userId: targetMember.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("cannot update role to position at or above own top", async () => {
    expect.hasAssertions();

    const { member: actor } = await setupMemberWithRole(RoomPermission.ManageRoles, 10);
    const lowRole = await roleCaller.createRole({ name, permissions: 0n, position: 3, roomId });
    await mockSessionOnce(mockContext.db, actor);

    await expect(
      roleCaller.updateRole({ id: lowRole.id, position: 10, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("cannot create role with permissions not held by actor", async () => {
    expect.hasAssertions();

    const { member: actor } = await setupMemberWithRole(RoomPermission.ManageRoles | RoomPermission.ReadMessages, 10);
    await mockSessionOnce(mockContext.db, actor);

    await expect(
      roleCaller.createRole({ name, permissions: RoomPermission.ManageRoom, position: 3, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("cannot grant permissions not held by actor", async () => {
    expect.hasAssertions();

    const { member: actor } = await setupMemberWithRole(RoomPermission.ManageRoles | RoomPermission.ReadMessages, 10);
    const lowRole = await roleCaller.createRole({ name, permissions: 0n, position: 3, roomId });
    await mockSessionOnce(mockContext.db, actor);

    await expect(
      roleCaller.updateRole({ id: lowRole.id, permissions: RoomPermission.ManageRoom, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("owner can update role to any position and permissions", async () => {
    expect.hasAssertions();

    const createdRole = await roleCaller.createRole({ name, permissions: 0n, position: 1, roomId });
    const updatedRole = await roleCaller.updateRole({
      id: createdRole.id,
      permissions: RoomPermission.Administrator,
      position: 9999,
      roomId,
    });

    expect(updatedRole.position).toBe(9999);
    expect(updatedRole.permissions).toBe(RoomPermission.Administrator);
  });

  test("readMyPermissions returns owner status", async () => {
    expect.hasAssertions();

    const result = await roleCaller.readMyPermissions({ roomIds: [roomId] });

    expect(result).toHaveLength(1);
    expect(takeOne(result).isRoomOwner).toBe(true);
    expect(takeOne(result).topRolePosition).toBe(-1);
  });

  test("readMyPermissions returns member permissions and top position", async () => {
    expect.hasAssertions();

    const { member } = await setupMemberWithRole(RoomPermission.ManageRoles, position);
    await mockSessionOnce(mockContext.db, member);
    const result = await roleCaller.readMyPermissions({ roomIds: [roomId] });

    expect(result).toHaveLength(1);
    expect(takeOne(result).isRoomOwner).toBe(false);
    expect(takeOne(result).topRolePosition).toBe(position);
    expect(takeOne(result).permissions & RoomPermission.ManageRoles).toBe(RoomPermission.ManageRoles);
  });

  test("on creates role", async () => {
    expect.hasAssertions();

    const onCreateRole = await roleCaller.onCreateRole({ roomId });
    const data = await withAsyncIterator(
      () => onCreateRole,
      async (iterator) => {
        const [result] = await Promise.all([
          iterator.next(),
          roleCaller.createRole({ name, permissions: 0n, position: 1, roomId }),
        ]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value.name).toBe(name);
    expect(data.value.roomId).toBe(roomId);
  });

  test("on updates role", async () => {
    expect.hasAssertions();

    const role = await roleCaller.createRole({ name, permissions: 0n, position: 1, roomId });
    const onUpdateRole = await roleCaller.onUpdateRole({ roomId });
    const data = await withAsyncIterator(
      () => onUpdateRole,
      async (iterator) => {
        const [result] = await Promise.all([
          iterator.next(),
          roleCaller.updateRole({ id: role.id, name: updatedName, roomId }),
        ]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value.id).toBe(role.id);
    expect(data.value.name).toBe(updatedName);
  });

  test("on deletes role", async () => {
    expect.hasAssertions();

    const role = await roleCaller.createRole({ name, permissions: 0n, position: 1, roomId });
    const onDeleteRole = await roleCaller.onDeleteRole({ roomId });
    const data = await withAsyncIterator(
      () => onDeleteRole,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), roleCaller.deleteRole({ id: role.id, roomId })]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value.id).toBe(role.id);
    expect(data.value.roomId).toBe(roomId);
  });

  test("on assigns role", async () => {
    expect.hasAssertions();

    const targetMember = await createMember();
    const role = await roleCaller.createRole({ name, permissions: 0n, position: 1, roomId });
    const onAssignRole = await roleCaller.onAssignRole({ roomId });
    const data = await withAsyncIterator(
      () => onAssignRole,
      async (iterator) => {
        const [result] = await Promise.all([
          iterator.next(),
          roleCaller.assignRole({ roleId: role.id, roomId, userId: targetMember.id }),
        ]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value.id).toBe(role.id);
    expect(data.value.userId).toBe(targetMember.id);
    expect(data.value.roomId).toBe(roomId);
  });

  test("on revokes role", async () => {
    expect.hasAssertions();

    const targetMember = await createMember();
    const role = await roleCaller.createRole({ name, permissions: 0n, position: 1, roomId });
    await roleCaller.assignRole({ roleId: role.id, roomId, userId: targetMember.id });
    const onRevokeRole = await roleCaller.onRevokeRole({ roomId });
    const data = await withAsyncIterator(
      () => onRevokeRole,
      async (iterator) => {
        const [result] = await Promise.all([
          iterator.next(),
          roleCaller.revokeRole({ roleId: role.id, roomId, userId: targetMember.id }),
        ]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value.roleId).toBe(role.id);
    expect(data.value.userId).toBe(targetMember.id);
    expect(data.value.roomId).toBe(roomId);
  });
});
