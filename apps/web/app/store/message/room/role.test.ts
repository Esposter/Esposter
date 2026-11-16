// @vitest-environment nuxt
import { createRoomRole } from "#src/services/message/member/createRoomRole.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useRoleStore } from "#src/store/message/room/role";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useRoleStore, () => {
  const roomId = v7();
  const { trpcMsw } = setupMswTrpc();
  const first = createRoomRole({ name: "first", position: 1, roomId });
  const second = createRoomRole({ name: "second", position: 2, roomId });

  // Every role is its own target, so a settings panel's writes overlap and a rejected edit unwinds only its own
  test("restores only the role whose edit was rejected", async () => {
    expect.hasAssertions();

    trpcMsw.role.updateRole.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    trpcMsw.role.deleteRole.mutation(() => second);
    const roleStore = useRoleStore();
    const { deleteRole, getRoles, setRoles, updateRole } = roleStore;
    setRoles(roomId, [first, second]);
    updateRole({ id: first.id, name: "renamed", roomId });
    deleteRole({ id: second.id, roomId });
    await flushPromises();

    expect(getRoles(roomId)).toStrictEqual([first]);
  });

  test("puts back only the role whose deletion was rejected, where it stood", async () => {
    expect.hasAssertions();

    trpcMsw.role.deleteRole.mutation(({ input: { id } }) => {
      if (id === first.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
      return second;
    });
    const roleStore = useRoleStore();
    const { deleteRole, getRoles, setRoles } = roleStore;
    setRoles(roomId, [first, second]);
    deleteRole({ id: first.id, roomId });
    deleteRole({ id: second.id, roomId });
    await flushPromises();

    expect(getRoles(roomId)).toStrictEqual([first]);
  });

  // Writes that end the same role share one queue, so a rejected edit and a rejected deletion of it unwind in order:
  // The deletion puts back the role the edit left behind, not the one it found before the edit went out
  test("restores a role that a rejected edit and a rejected deletion both wrote to", async () => {
    expect.hasAssertions();

    trpcMsw.role.updateRole.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    trpcMsw.role.deleteRole.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const roleStore = useRoleStore();
    const { deleteRole, getRoles, setRoles, updateRole } = roleStore;
    setRoles(roomId, [first, second]);
    updateRole({ id: first.id, name: "renamed", roomId });
    deleteRole({ id: first.id, roomId });
    await flushPromises();

    expect(getRoles(roomId)).toStrictEqual([first, second]);
  });

  // A member's roles are one list written through per-role targets, so an assignment and a revocation for the
  // Same member run side by side — each has to unwind only the role it added or took away
  test("restores only the role whose revocation was rejected", async () => {
    expect.hasAssertions();

    const userId = v7();
    trpcMsw.role.revokeRole.mutation(({ input: { roleId } }) => {
      if (roleId === first.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const roleStore = useRoleStore();
    const { getMemberRoles, revokeRole, setMemberRoles } = roleStore;
    setMemberRoles(roomId, userId, [first, second]);
    revokeRole({ roleId: first.id, roomId, userId });
    revokeRole({ roleId: second.id, roomId, userId });
    await flushPromises();

    expect(getMemberRoles(roomId, userId)).toStrictEqual([first]);
  });

  // The same pair on one member's role: an assignment that is rejected and a revocation of that role that is rejected
  // Must leave the member without it, the state the server kept, whichever of the two unwinds first
  test("restores a member without a role that a rejected assignment and a rejected revocation both wrote to", async () => {
    expect.hasAssertions();

    const userId = v7();
    trpcMsw.role.assignRole.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    trpcMsw.role.revokeRole.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const roleStore = useRoleStore();
    const { assignRole, getMemberRoles, revokeRole, setRoles } = roleStore;
    setRoles(roomId, [first, second]);
    assignRole({ roleId: first.id, roomId, userId });
    revokeRole({ roleId: first.id, roomId, userId });
    await flushPromises();

    expect(getMemberRoles(roomId, userId)).toStrictEqual([]);
  });
});
