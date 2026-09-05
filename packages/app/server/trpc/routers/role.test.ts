import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createMockUser, mockSessionOnce } from "@@/server/trpc/context.test";
import { getFirstEmit } from "@@/server/trpc/routers/getFirstEmit.test";
import { setupRoomSuite } from "@@/server/trpc/routers/setupRoomSuite.test";
import { DatabaseEntityType, RoomPermission } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

describe("roleRouter", () => {
  const { createMember, getEveryoneRole, getMockContext, getRoleCaller, getRoomId, setupMemberWithRole } =
    setupRoomSuite();
  let mockContext: Context;
  let roleCaller: DecorateRouterRecord<TRPCRouter["role"]>;
  let roomId: string;
  const name = "name";
  const updatedName = "updatedName";
  const position = 5;

  beforeAll(() => {
    mockContext = getMockContext();
    roleCaller = getRoleCaller();
  });

  beforeEach(() => {
    roomId = getRoomId();
  });

  test("reads only the @everyone role", async () => {
    expect.hasAssertions();

    const roles = await roleCaller.readRoles({ roomIds: [roomId] });

    expect(roles).toHaveLength(1);
    expect(takeOne(roles).isEveryone).toBe(true);
  });

  test("fails readRoles for a non-member", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);

    await expect(roleCaller.readRoles({ roomIds: [roomId] })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("creates", async () => {
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

  test("updates", async () => {
    expect.hasAssertions();

    const createdRole = await roleCaller.createRole({ name, permissions: 0n, position: 0, roomId });
    const updatedRole = await roleCaller.updateRole({ id: createdRole.id, name: updatedName, roomId });

    expect(updatedRole.name).toBe(updatedName);
    expect(updatedRole.id).toBe(createdRole.id);
    expect(updatedRole.permissions).toBe(createdRole.permissions);
    expect(updatedRole.position).toBe(createdRole.position);
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const createdRole = await roleCaller.createRole({ name, permissions: 0n, position: 0, roomId });
    const deletedRole = await roleCaller.deleteRole({ id: createdRole.id, roomId });

    expect(deletedRole.id).toBe(createdRole.id);
  });

  test("fails delete with the @everyone role", async () => {
    expect.hasAssertions();

    const everyoneRole = await getEveryoneRole();

    await expect(roleCaller.deleteRole({ id: everyoneRole.id, roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.RoomRole, everyoneRole.id).message}]`,
    );
  });

  test("fails create for a member without ManageRoles permission", async () => {
    expect.hasAssertions();

    const member = await createMember();
    await mockSessionOnce(mockContext.db, member);

    await expect(
      roleCaller.createRole({ name, permissions: 0n, position: 0, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("assigns a role to a member", async () => {
    expect.hasAssertions();

    const targetMember = await createMember();
    const role = await roleCaller.createRole({ name, permissions: 0n, position: 1, roomId });
    await roleCaller.assignRole({ roleId: role.id, roomId, userId: targetMember.id });
    const memberRoles = await roleCaller.readMemberRoles({ roomId, userIds: [targetMember.id] });

    expect(memberRoles.map(({ roleId }) => roleId)).toStrictEqual([role.id]);
  });

  test("fails assignRole with a target who is not a room member", async () => {
    expect.hasAssertions();

    const role = await roleCaller.createRole({ name, permissions: 0n, position: 1, roomId });
    const user = await createMockUser(mockContext.db);

    await expect(
      roleCaller.assignRole({ roleId: role.id, roomId, userId: user.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.UserToRoom, user.id).message}]`,
    );
  });

  test("assignRole is idempotent on a duplicate", async () => {
    expect.hasAssertions();

    const targetMember = await createMember();
    const role = await roleCaller.createRole({ name, permissions: 0n, position: 1, roomId });
    await roleCaller.assignRole({ roleId: role.id, roomId, userId: targetMember.id });

    const assignedRole = await roleCaller.assignRole({ roleId: role.id, roomId, userId: targetMember.id });

    expect(assignedRole).toStrictEqual(role);
  });

  test("fails assignRole with the @everyone role", async () => {
    expect.hasAssertions();

    const everyoneRole = await getEveryoneRole();
    const targetMember = await createMember();

    await expect(
      roleCaller.assignRole({ roleId: everyoneRole.id, roomId, userId: targetMember.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoomRole, everyoneRole.id).message}]`,
    );
  });

  test("fails assignRole with a role at or above the actor top position", async () => {
    expect.hasAssertions();

    const { member: actor } = await setupMemberWithRole(RoomPermission.ManageRoles, position);
    const peerRole = await roleCaller.createRole({ name, permissions: 0n, position, roomId });
    const targetMember = await createMember();
    await mockSessionOnce(mockContext.db, actor);

    await expect(
      roleCaller.assignRole({ roleId: peerRole.id, roomId, userId: targetMember.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails assignRole with a target whose top position is equal or higher", async () => {
    expect.hasAssertions();

    const { member: actor } = await setupMemberWithRole(RoomPermission.ManageRoles, position);
    const lowRole = await roleCaller.createRole({ name, permissions: 0n, position: 2, roomId });
    const { member: targetMember } = await setupMemberWithRole(0n, position);
    await mockSessionOnce(mockContext.db, actor);

    await expect(
      roleCaller.assignRole({ roleId: lowRole.id, roomId, userId: targetMember.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("revokes a role from a member", async () => {
    expect.hasAssertions();

    const targetMember = await createMember();
    const role = await roleCaller.createRole({ name, permissions: 0n, position: 1, roomId });
    await roleCaller.assignRole({ roleId: role.id, roomId, userId: targetMember.id });
    await roleCaller.revokeRole({ roleId: role.id, roomId, userId: targetMember.id });
    const memberRoles = await roleCaller.readMemberRoles({ roomId, userIds: [targetMember.id] });

    expect(memberRoles).toStrictEqual([]);
  });

  test("revokes a role the member never held", async () => {
    expect.hasAssertions();

    const targetMember = await createMember();
    const role = await roleCaller.createRole({ name, permissions: 0n, position: 1, roomId });

    await expect(roleCaller.revokeRole({ roleId: role.id, roomId, userId: targetMember.id })).resolves.toBeUndefined();
  });

  test("fails revokeRole with a role at or above the actor top position", async () => {
    expect.hasAssertions();

    const { member: actor } = await setupMemberWithRole(RoomPermission.ManageRoles, position);
    const { member: targetMember, role: peerRole } = await setupMemberWithRole(0n, position);
    await mockSessionOnce(mockContext.db, actor);

    await expect(
      roleCaller.revokeRole({ roleId: peerRole.id, roomId, userId: targetMember.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails updateRole with a position at or above the actor top", async () => {
    expect.hasAssertions();

    const { member: actor } = await setupMemberWithRole(RoomPermission.ManageRoles, 10);
    const lowRole = await roleCaller.createRole({ name, permissions: 0n, position: 3, roomId });
    await mockSessionOnce(mockContext.db, actor);

    await expect(
      roleCaller.updateRole({ id: lowRole.id, position: 10, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails createRole with permissions the actor does not hold", async () => {
    expect.hasAssertions();

    const { member: actor } = await setupMemberWithRole(RoomPermission.ManageRoles | RoomPermission.ReadMessages, 10);
    await mockSessionOnce(mockContext.db, actor);

    await expect(
      roleCaller.createRole({ name, permissions: RoomPermission.ManageRoom, position: 3, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("fails updateRole with permissions the actor does not hold", async () => {
    expect.hasAssertions();

    const { member: actor } = await setupMemberWithRole(RoomPermission.ManageRoles | RoomPermission.ReadMessages, 10);
    const lowRole = await roleCaller.createRole({ name, permissions: 0n, position: 3, roomId });
    await mockSessionOnce(mockContext.db, actor);

    await expect(
      roleCaller.updateRole({ id: lowRole.id, permissions: RoomPermission.ManageRoom, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("the owner updates a role to any position and permissions", async () => {
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

  test("readMyPermissions reports owner status", async () => {
    expect.hasAssertions();

    const myPermissions = await roleCaller.readMyPermissions({ roomIds: [roomId] });
    const ownPermissions = takeOne(myPermissions);

    expect(myPermissions).toHaveLength(1);
    expect(ownPermissions.isRoomOwner).toBe(true);
    expect(ownPermissions.topRolePosition).toBe(-1);
  });

  test("readMyPermissions reports member permissions and top position", async () => {
    expect.hasAssertions();

    const { member } = await setupMemberWithRole(RoomPermission.ManageRoles, position);
    await mockSessionOnce(mockContext.db, member);
    const myPermissions = await roleCaller.readMyPermissions({ roomIds: [roomId] });
    const memberPermissions = takeOne(myPermissions);

    expect(myPermissions).toHaveLength(1);
    expect(memberPermissions.isRoomOwner).toBe(false);
    expect(memberPermissions.topRolePosition).toBe(position);
    expect(memberPermissions.permissions & RoomPermission.ManageRoles).toBe(RoomPermission.ManageRoles);
  });

  test("onCreateRole emits the created role", async () => {
    expect.hasAssertions();

    const onCreateRole = await roleCaller.onCreateRole({ roomId });
    const data = await getFirstEmit(
      () => onCreateRole,
      () => roleCaller.createRole({ name, permissions: 0n, position: 1, roomId }),
    );

    expect(data.name).toBe(name);
    expect(data.roomId).toBe(roomId);
  });
});
