// @vitest-environment nuxt
import { createRoomRole } from "#src/services/message/member/createRoomRole.test";
import { serveMemberRoles } from "#src/services/message/member/serveMemberRoles.test";
import { createUser } from "#src/services/message/user/createUser.test";
import { appendRowVersions } from "#src/services/trpc/appendRowVersions.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useRoleStore } from "#src/store/message/room/role";
import { useUserStore } from "#src/store/message/user/index";
import { usersToRoomRolesInMessage } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { getTableName } from "drizzle-orm";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

// The server's answer to a deletion or a revocation is the row it tombstoned, at the version the removal left it
const removed = <TRow extends { deletedAt: Date | null; version: number }>(row: TRow): TRow => ({
  ...row,
  deletedAt: new Date(0),
  version: row.version + 1,
});

describe(useRoleStore, () => {
  const roomId = v7();
  const { trpcMsw } = setupMswTrpc();
  const first = createRoomRole({ name: "first", position: 1, roomId });
  const second = createRoomRole({ name: "second", position: 2, roomId });
  const trpcError = new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

  // Every role is its own target, so a settings panel's writes overlap and a rejected edit leaves only its own role as it was
  test("keeps the role whose edit was rejected as the server holds it", async () => {
    expect.hasAssertions();

    trpcMsw.role.updateRole.mutation(() => {
      throw trpcError;
    });
    trpcMsw.role.deleteRole.mutation(() => removed(second));
    const roleStore = useRoleStore();
    const { arriveRoomRoles, deleteRole, getRoles, updateRole } = roleStore;
    arriveRoomRoles([first, second]);
    updateRole({ id: first.id, name: "renamed", roomId });
    deleteRole({ id: second.id, roomId });
    await flushPromises();

    expect(getRoles(roomId)).toStrictEqual([first]);
  });

  // A deletion that is rejected leaves its role listed, where the server still holds it
  test("keeps only the role whose deletion was rejected", async () => {
    expect.hasAssertions();

    trpcMsw.role.deleteRole.mutation(({ input: { id } }) => {
      if (id === first.id) throw trpcError;

      return removed(second);
    });
    const roleStore = useRoleStore();
    const { arriveRoomRoles, deleteRole, getRoles } = roleStore;
    arriveRoomRoles([first, second]);
    deleteRole({ id: first.id, roomId });
    deleteRole({ id: second.id, roomId });
    await flushPromises();

    expect(getRoles(roomId)).toStrictEqual([first]);
  });

  // An edit and a deletion of one role share its target, and both are rejected, so the role is listed as the server holds it
  test("keeps a role listed when a rejected edit and a rejected deletion both wrote to it", async () => {
    expect.hasAssertions();

    trpcMsw.role.updateRole.mutation(() => {
      throw trpcError;
    });
    trpcMsw.role.deleteRole.mutation(() => {
      throw trpcError;
    });
    const roleStore = useRoleStore();
    const { arriveRoomRoles, deleteRole, getRoles, updateRole } = roleStore;
    arriveRoomRoles([first, second]);
    updateRole({ id: first.id, name: "renamed", roomId });
    deleteRole({ id: first.id, roomId });
    await flushPromises();

    expect(getRoles(roomId)).toStrictEqual([second, first]);
  });

  // A member's roles are written through per-role targets, so an assignment and a revocation for the same member run side by
  // Side, and each one's rejection leaves only the role it wrote to as the server holds it
  test("keeps the member's role whose revocation was rejected, and drops the one revoked", async () => {
    expect.hasAssertions();

    const userId = v7();
    trpcMsw.role.revokeRole.mutation(({ ctx, input: { roleId }, path }) => {
      if (roleId === first.id) throw trpcError;

      appendRowVersions(ctx.responseHeaders, path, [
        { key: { roleId, roomId, userId }, table: getTableName(usersToRoomRolesInMessage), version: 1 },
      ]);
      return [
        { createdAt: new Date(0), deletedAt: new Date(0), roleId, roomId, updatedAt: new Date(0), userId, version: 1 },
      ];
    });
    const roleStore = useRoleStore();
    const { getMemberRoles, revokeRole } = roleStore;
    serveMemberRoles(trpcMsw, roomId, userId, [first, second]);
    await useReadMemberRoles()({ roomId, userIds: [userId] });
    revokeRole({ roleId: first.id, roomId, userId });
    revokeRole({ roleId: second.id, roomId, userId });
    await flushPromises();

    expect(getMemberRoles(roomId, userId)).toStrictEqual([first]);
  });

  // The same pair on one member's role: an assignment that is rejected and a revocation of that role that is rejected
  // Must leave the member without it, the state the server kept, whichever of the two unwinds first
  test("keeps a member without a role that a rejected assignment and a rejected revocation both wrote to", async () => {
    expect.hasAssertions();

    const userId = v7();
    trpcMsw.role.assignRole.mutation(() => {
      throw trpcError;
    });
    trpcMsw.role.revokeRole.mutation(() => {
      throw trpcError;
    });
    const roleStore = useRoleStore();
    const { arriveRoomRoles, assignRole, getMemberRoles, revokeRole } = roleStore;
    arriveRoomRoles([first, second]);
    assignRole({ roleId: first.id, roomId, userId });
    revokeRole({ roleId: first.id, roomId, userId });
    await flushPromises();

    expect(getMemberRoles(roomId, userId)).toStrictEqual([]);
  });

  // A read answered before a revocation still holds the member's role. The revocation's answer lands first at a higher
  // Version, so the read's older copy is discarded and the revoked role stays off the member
  test("a read answered before a revocation does not bring the revoked role back", async () => {
    expect.hasAssertions();

    const userId = v7();
    const memberRole = (isRevoked: boolean) => ({
      createdAt: new Date(0),
      deletedAt: isRevoked ? new Date(0) : null,
      role: first,
      roleId: first.id,
      roomId,
      updatedAt: new Date(0),
      userId,
      version: isRevoked ? 1 : 0,
    });
    const { promise: readAnswered, resolve: releaseRead } = Promise.withResolvers<void>();
    trpcMsw.role.readMemberRoles.query(async () => {
      await readAnswered;
      return [memberRole(false)];
    });
    trpcMsw.role.revokeRole.mutation(({ ctx, path }) => {
      appendRowVersions(ctx.responseHeaders, path, [
        { key: { roleId: first.id, roomId, userId }, table: getTableName(usersToRoomRolesInMessage), version: 1 },
      ]);
      return [memberRole(true)];
    });
    const roleStore = useRoleStore();
    const { getMemberRoles, revokeRole } = roleStore;
    const read = useReadMemberRoles()({ roomId, userIds: [userId] });
    revokeRole({ roleId: first.id, roomId, userId });
    await flushPromises();
    releaseRead();
    await read;

    expect(getMemberRoles(roomId, userId)).toStrictEqual([]);
  });

  // An override names the members it changes, and the read takes their rows alongside it. A user who has left the room
  // Is read with their row but is not one of its members, so the read must not make them one
  test("does not make a user who has left the room one of its members", async () => {
    expect.hasAssertions();

    const leftUser = createUser();
    trpcMsw.role.readMemberPermissionOverrides.query(() => [
      {
        allow: 0n,
        createdAt: new Date(0),
        deletedAt: null,
        deny: 0n,
        roomId,
        updatedAt: new Date(0),
        userId: leftUser.id,
        version: 0,
      },
    ]);
    trpcMsw.room.readUsersByIds.query(() => [{ ...leftUser, displayName: leftUser.name, isMember: false }]);
    const roleStore = useRoleStore();
    const userStore = useUserStore();
    await roleStore.readMemberPermissionOverrides({ roomId });
    await flushPromises();

    expect(userStore.getRoomMemberMap(roomId)?.get(leftUser.id)).toBeUndefined();
  });
});
