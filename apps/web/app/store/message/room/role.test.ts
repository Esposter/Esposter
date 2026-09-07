// @vitest-environment nuxt
import { createRoomRole } from "@/services/message/member/createRoomRole.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useRoleStore } from "@/store/message/room/role";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useRoleStore, () => {
  const roomId = crypto.randomUUID();

  const server = setupMswTrpc();
  const first = createRoomRole({ name: "first", position: 1, roomId });
  const second = createRoomRole({ name: "second", position: 2, roomId });

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Every role is its own target, so a settings panel's writes overlap and a rejected edit unwinds only its own
  test("restores only the role whose edit was rejected", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.role.updateRole.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
      trpcMsw.role.deleteRole.mutation(() => second),
    );
    const roleStore = useRoleStore();
    const { deleteRole, getRoles, setRoles, updateRole } = roleStore;
    setRoles(roomId, [first, second]);
    await Promise.all([updateRole({ id: first.id, name: "renamed", roomId }), deleteRole({ id: second.id, roomId })]);

    expect(getRoles(roomId)).toStrictEqual([first]);
  });

  test("puts back only the role whose deletion was rejected, where it stood", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.role.deleteRole.mutation(({ input: { id } }) => {
        if (id === first.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
        return second;
      }),
    );
    const roleStore = useRoleStore();
    const { deleteRole, getRoles, setRoles } = roleStore;
    setRoles(roomId, [first, second]);
    await Promise.all([deleteRole({ id: first.id, roomId }), deleteRole({ id: second.id, roomId })]);

    expect(getRoles(roomId)).toStrictEqual([first]);
  });

  // A member's roles are one list written through per-role targets, so an assignment and a revocation for the
  // Same member run side by side — each has to unwind only the role it added or took away
  test("restores only the role whose revocation was rejected", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    server.use(
      trpcMsw.role.revokeRole.mutation(({ input: { roleId } }) => {
        if (roleId === first.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const roleStore = useRoleStore();
    const { getMemberRoles, revokeRole, setMemberRoles } = roleStore;
    setMemberRoles(roomId, userId, [first, second]);
    await Promise.all([
      revokeRole({ roleId: first.id, roomId, userId }),
      revokeRole({ roleId: second.id, roomId, userId }),
    ]);

    expect(getMemberRoles(roomId, userId)).toStrictEqual([first]);
  });
});
