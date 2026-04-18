import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { roleRouter } from "@@/server/trpc/routers/role";
import {
  DatabaseEntityType,
  RoomPermission,
  roomRoles,
  rooms,
  RoomType,
  users,
  usersToRoomRoles,
  usersToRooms,
} from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("role", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["role"]>;

  const createMember = async (roomId: string) => {
    const createdAt = new Date();
    const member = takeOne(
      await mockContext.db
        .insert(users)
        .values({
          createdAt,
          email: crypto.randomUUID(),
          emailVerified: true,
          id: crypto.randomUUID(),
          image: null,
          name: crypto.randomUUID(),
          updatedAt: createdAt,
        })
        .returning(),
    );
    await mockContext.db.insert(usersToRooms).values({ roomId, userId: member.id });
    return member;
  };

  const setupMemberWithRole = async (roomId: string, permissions: bigint, position: number) => {
    const member = await createMember(roomId);
    const role = takeOne(
      await mockContext.db
        .insert(roomRoles)
        .values({ name: crypto.randomUUID(), permissions, position, roomId })
        .returning(),
    );
    await mockContext.db.insert(usersToRoomRoles).values({ roleId: role.id, roomId, userId: member.id });
    return { member, role };
  };

  const setupRoom = async () => {
    const createdAt = new Date();
    const owner = takeOne(
      await mockContext.db
        .insert(users)
        .values({
          createdAt,
          email: crypto.randomUUID(),
          emailVerified: true,
          id: crypto.randomUUID(),
          image: null,
          name: crypto.randomUUID(),
          updatedAt: createdAt,
        })
        .returning(),
    );
    const room = takeOne(
      await mockContext.db.insert(rooms).values({ name: "", type: RoomType.Room, userId: owner.id }).returning(),
    );
    await mockContext.db.insert(usersToRooms).values({ roomId: room.id, userId: owner.id });
    await mockContext.db.insert(roomRoles).values({
      isEveryone: true,
      name: "@everyone",
      permissions: RoomPermission.ReadMessages | RoomPermission.SendMessages,
      position: 0,
      roomId: room.id,
    });
    return { owner, roomId: room.id };
  };

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(roleRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(rooms);
  });

  test("reads empty roles (only @everyone)", async () => {
    expect.hasAssertions();

    const { owner, roomId } = await setupRoom();
    await mockSessionOnce(mockContext.db, owner);

    const roles = await caller.readRoles({ roomId });

    expect(roles.length).toBeGreaterThanOrEqual(1);
    expect(roles.some(({ isEveryone }) => isEveryone)).toBe(true);
  });

  test("creates role (owner)", async () => {
    expect.hasAssertions();

    const { owner, roomId } = await setupRoom();
    await mockSessionOnce(mockContext.db, owner);

    const role = await caller.createRole({
      name: "Mod",
      permissions: RoomPermission.ManageMessages,
      position: 0,
      roomId,
    });

    expect(role.name).toBe("Mod");
    expect(role.permissions).toBe(RoomPermission.ManageMessages);
    expect(role.roomId).toBe(roomId);
  });

  test("updates role (owner)", async () => {
    expect.hasAssertions();

    const { owner, roomId } = await setupRoom();
    await mockSessionOnce(mockContext.db, owner);
    const created = await caller.createRole({ name: "Mod", permissions: 0n, position: 0, roomId });

    await mockSessionOnce(mockContext.db, owner);
    const updated = await caller.updateRole({ id: created.id, name: "Senior Mod", roomId });

    expect(updated.name).toBe("Senior Mod");
    expect(updated.id).toBe(created.id);
  });

  test("deletes role (owner)", async () => {
    expect.hasAssertions();

    const { owner, roomId } = await setupRoom();
    await mockSessionOnce(mockContext.db, owner);
    const created = await caller.createRole({ name: "Mod", permissions: 0n, position: 0, roomId });

    await mockSessionOnce(mockContext.db, owner);
    const deleted = await caller.deleteRole({ id: created.id, roomId });

    expect(deleted.id).toBe(created.id);
  });

  test("cannot delete @everyone role", async () => {
    expect.hasAssertions();

    const { owner, roomId } = await setupRoom();
    const everyoneRole = takeOne(await mockContext.db.select().from(roomRoles).where(eq(roomRoles.roomId, roomId)));
    await mockSessionOnce(mockContext.db, owner);

    await expect(caller.deleteRole({ id: everyoneRole.id, roomId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Delete, DatabaseEntityType.RoomRole, everyoneRole.id).message}]`,
    );
  });

  test("unauthorized without ManageRoles permission", async () => {
    expect.hasAssertions();

    const { roomId } = await setupRoom();
    const { user: member } = await mockSessionOnce(mockContext.db);
    await mockContext.db.insert(usersToRooms).values({ roomId, userId: member.id });

    await expect(
      caller.createRole({ name: "Mod", permissions: 0n, position: 0, roomId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("assigns role to member", async () => {
    expect.hasAssertions();

    const { owner, roomId } = await setupRoom();
    const targetMember = await createMember(roomId);
    const role = takeOne(
      await mockContext.db.insert(roomRoles).values({ name: "Mod", permissions: 0n, position: 1, roomId }).returning(),
    );

    await mockSessionOnce(mockContext.db, owner);
    await caller.assignRole({ roleId: role.id, roomId, userId: targetMember.id });

    await mockSessionOnce(mockContext.db, owner);
    const memberRoles = await caller.readMemberRoles({ roomId, userId: targetMember.id });

    expect(memberRoles.some(({ id }) => id === role.id)).toBe(true);
  });

  test("assignRole is idempotent on duplicate", async () => {
    expect.hasAssertions();

    const { owner, roomId } = await setupRoom();
    const targetMember = await createMember(roomId);
    const role = takeOne(
      await mockContext.db.insert(roomRoles).values({ name: "Mod", permissions: 0n, position: 1, roomId }).returning(),
    );

    await mockSessionOnce(mockContext.db, owner);
    await caller.assignRole({ roleId: role.id, roomId, userId: targetMember.id });

    await mockSessionOnce(mockContext.db, owner);

    await expect(caller.assignRole({ roleId: role.id, roomId, userId: targetMember.id })).resolves.toBeUndefined();
  });

  test("cannot assign role at or above own top position", async () => {
    expect.hasAssertions();

    const { roomId } = await setupRoom();
    const { member: actor } = await setupMemberWithRole(roomId, RoomPermission.ManageRoles, 5);
    const peerRole = takeOne(
      await mockContext.db.insert(roomRoles).values({ name: "Peer", permissions: 0n, position: 5, roomId }).returning(),
    );
    const targetMember = await createMember(roomId);

    await mockSessionOnce(mockContext.db, actor);

    await expect(caller.assignRole({ roleId: peerRole.id, roomId, userId: targetMember.id })).rejects.toThrow(
      "UNAUTHORIZED",
    );
  });

  test("cannot assign role to member with equal or higher top position", async () => {
    expect.hasAssertions();

    const { roomId } = await setupRoom();
    const { member: actor } = await setupMemberWithRole(roomId, RoomPermission.ManageRoles, 5);
    const lowRole = takeOne(
      await mockContext.db.insert(roomRoles).values({ name: "Low", permissions: 0n, position: 2, roomId }).returning(),
    );
    const { member: targetMember } = await setupMemberWithRole(roomId, 0n, 5);

    await mockSessionOnce(mockContext.db, actor);

    await expect(caller.assignRole({ roleId: lowRole.id, roomId, userId: targetMember.id })).rejects.toThrow(
      "UNAUTHORIZED",
    );
  });

  test("revokes role from member", async () => {
    expect.hasAssertions();

    const { owner, roomId } = await setupRoom();
    const targetMember = await createMember(roomId);
    const role = takeOne(
      await mockContext.db.insert(roomRoles).values({ name: "Mod", permissions: 0n, position: 1, roomId }).returning(),
    );
    await mockContext.db.insert(usersToRoomRoles).values({ roleId: role.id, roomId, userId: targetMember.id });

    await mockSessionOnce(mockContext.db, owner);
    await caller.revokeRole({ roleId: role.id, roomId, userId: targetMember.id });

    await mockSessionOnce(mockContext.db, owner);
    const memberRoles = await caller.readMemberRoles({ roomId, userId: targetMember.id });

    expect(memberRoles.some(({ id }) => id === role.id)).toBe(false);
  });

  test("cannot revoke role at or above own top position", async () => {
    expect.hasAssertions();

    const { roomId } = await setupRoom();
    const { member: actor } = await setupMemberWithRole(roomId, RoomPermission.ManageRoles, 5);
    const { member: targetMember, role: peerRole } = await setupMemberWithRole(roomId, 0n, 5);

    await mockSessionOnce(mockContext.db, actor);

    await expect(caller.revokeRole({ roleId: peerRole.id, roomId, userId: targetMember.id })).rejects.toThrow(
      "UNAUTHORIZED",
    );
  });

  test("cannot update role to position at or above own top", async () => {
    expect.hasAssertions();

    const { owner, roomId } = await setupRoom();
    const { member: actor } = await setupMemberWithRole(roomId, RoomPermission.ManageRoles, 10);
    await mockSessionOnce(mockContext.db, owner);
    const lowRole = await caller.createRole({ name: "Low", permissions: 0n, position: 3, roomId });

    await mockSessionOnce(mockContext.db, actor);

    await expect(caller.updateRole({ id: lowRole.id, position: 10, roomId })).rejects.toThrow("UNAUTHORIZED");
  });

  test("cannot grant permissions not held by actor", async () => {
    expect.hasAssertions();

    const { owner, roomId } = await setupRoom();
    const { member: actor } = await setupMemberWithRole(
      roomId,
      RoomPermission.ManageRoles | RoomPermission.ReadMessages,
      10,
    );
    await mockSessionOnce(mockContext.db, owner);
    const lowRole = await caller.createRole({ name: "Low", permissions: 0n, position: 3, roomId });

    await mockSessionOnce(mockContext.db, actor);

    await expect(caller.updateRole({ id: lowRole.id, permissions: RoomPermission.ManageRoom, roomId })).rejects.toThrow(
      "UNAUTHORIZED",
    );
  });

  test("owner can update role to any position and permissions", async () => {
    expect.hasAssertions();

    const { owner, roomId } = await setupRoom();
    await mockSessionOnce(mockContext.db, owner);
    const role = await caller.createRole({ name: "Low", permissions: 0n, position: 1, roomId });

    await mockSessionOnce(mockContext.db, owner);
    const updatedRole = await caller.updateRole({
      id: role.id,
      permissions: RoomPermission.Administrator,
      position: 9999,
      roomId,
    });

    expect(updatedRole.position).toBe(9999);
    expect(updatedRole.permissions).toBe(RoomPermission.Administrator);
  });

  test("readMyPermissions returns owner status", async () => {
    expect.hasAssertions();

    const { owner, roomId } = await setupRoom();
    await mockSessionOnce(mockContext.db, owner);
    const result = await caller.readMyPermissions({ roomId });

    expect(result.isRoomOwner).toBe(true);
    expect(result.topRolePosition).toBe(-1);
  });

  test("readMyPermissions returns member permissions and top position", async () => {
    expect.hasAssertions();

    const { roomId } = await setupRoom();
    const { member } = await setupMemberWithRole(roomId, RoomPermission.ManageRoles, 5);
    await mockSessionOnce(mockContext.db, member);
    const result = await caller.readMyPermissions({ roomId });

    expect(result.isRoomOwner).toBe(false);
    expect(result.topRolePosition).toBe(5);
    expect(result.permissions & RoomPermission.ManageRoles).toBe(RoomPermission.ManageRoles);
  });
});
