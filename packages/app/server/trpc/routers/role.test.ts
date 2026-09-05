import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createMockUser, mockSessionOnce } from "@@/server/trpc/context.test";
import { getFirstEmit } from "@@/server/trpc/routers/getFirstEmit.test";
import { setupRoomSuite } from "@@/server/trpc/routers/setupRoomSuite.test";
import { DatabaseEntityType, RoomPermission } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation, takeOne } from "@esposter/shared";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

describe("role", () => {
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

  test("reads empty roles (only @everyone)", async () => {
    expect.hasAssertions();

    const roles = await roleCaller.readRoles({ roomIds: [roomId] });

    expect(roles).toHaveLength(1);
    expect(takeOne(roles).isEveryone).toBe(true);
  });

  test("readRoles throws UNAUTHORIZED if not a member", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);

    await expect(roleCaller.readRoles({ roomIds: [roomId] })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
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

    const everyoneRole = await getEveryoneRole();

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

    expect(memberRoles.some(({ roleId }) => roleId === role.id)).toBe(true);
  });

  test("assignRole throws NOT_FOUND if target is not a room member", async () => {
    expect.hasAssertions();

    const role = await roleCaller.createRole({ name, permissions: 0n, position: 1, roomId });
    const user = await createMockUser(mockContext.db);

    await expect(
      roleCaller.assignRole({ roleId: role.id, roomId, userId: user.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.UserToRoom, user.id).message}]`,
    );
  });

  test("assignRole is idempotent on duplicate", async () => {
    expect.hasAssertions();

    const targetMember = await createMember();
    const role = await roleCaller.createRole({ name, permissions: 0n, position: 1, roomId });
    await roleCaller.assignRole({ roleId: role.id, roomId, userId: targetMember.id });

    const assignedRole = await roleCaller.assignRole({ roleId: role.id, roomId, userId: targetMember.id });

    expect(assignedRole).toStrictEqual(role);
  });

  test("cannot assign @everyone role explicitly", async () => {
    expect.hasAssertions();

    const everyoneRole = await getEveryoneRole();
    const targetMember = await createMember();

    await expect(
      roleCaller.assignRole({ roleId: everyoneRole.id, roomId, userId: targetMember.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.UserToRoomRole, everyoneRole.id).message}]`,
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

    expect(memberRoles.some(({ roleId }) => roleId === role.id)).toBe(false);
  });

  test("revokes a role the member never held", async () => {
    expect.hasAssertions();

    const targetMember = await createMember();
    const role = await roleCaller.createRole({ name, permissions: 0n, position: 1, roomId });

    await expect(roleCaller.revokeRole({ roleId: role.id, roomId, userId: targetMember.id })).resolves.toBeUndefined();
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
    const data = await getFirstEmit(
      () => onCreateRole,
      () => roleCaller.createRole({ name, permissions: 0n, position: 1, roomId }),
    );

    expect(data.name).toBe(name);
    expect(data.roomId).toBe(roomId);
  });
});
