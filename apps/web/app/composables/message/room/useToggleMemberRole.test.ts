// @vitest-environment nuxt
import type { RoomRoleInMessage } from "@esposter/db-schema";

import { useToggleMemberRole } from "#src/composables/message/room/useToggleMemberRole";
import { createRoomRole } from "#src/services/message/member/createRoomRole.test";
import { createRoom } from "#src/services/message/room/createRoom.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useRoomStore } from "#src/store/message/room/index";
import { useRoleStore } from "#src/store/message/room/role";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

describe(useToggleMemberRole, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const userId = v7();
  const toggledRole = createRoomRole({ name: "toggled", position: 3, roomId });
  const higherRole = createRoomRole({ name: "higher", position: 7, roomId });
  const lowerRole = createRoomRole({ name: "lower", position: 2, roomId });
  // A member's role as the read answers it: the assignment, with the role it names
  const assignmentOf = (role: RoomRoleInMessage) => ({
    createdAt: new Date(0),
    deletedAt: null,
    role,
    roleId: role.id,
    roomId,
    updatedAt: new Date(0),
    userId,
    version: 0,
  });

  // The actor's standing is read the way the app reads it, and the room's owner is someone other than the member
  const readActor = async (topRolePosition: number) => {
    trpcMsw.role.readMyPermissions.query(() => [{ isRoomOwner: false, permissions: 0n, roomId, topRolePosition }]);
    const roomStore = useRoomStore();
    roomStore.pushRooms({ ...createRoom(""), id: roomId, userId: v7() });
    const roleStore = useRoleStore();
    await roleStore.readMyPermissions({ roomIds: [roomId] });
  };

  // The member's top role is above the actor's, so the server refuses an assign and a revoke alike. The switch must
  // Not offer the toggle, and the composable must not send it either, whichever way the toggle would go
  test.each([
    { memberRoles: [higherRole], path: "an assignment" },
    { memberRoles: [higherRole, toggledRole], path: "a revocation" },
  ])("does not offer or send a $path on a member whose top role is above the actor's", async ({ memberRoles }) => {
    expect.hasAssertions();

    await readActor(5);
    const assignRole = vi.fn<() => never>(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const revokeRole = vi.fn<() => never>(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    trpcMsw.role.assignRole.mutation(assignRole);
    trpcMsw.role.revokeRole.mutation(revokeRole);
    const roleStore = useRoleStore();
    roleStore.arriveMemberRoles(memberRoles.map((memberRole) => assignmentOf(memberRole)));
    const { isManageable, toggleRole } = useToggleMemberRole(roomId, userId, toggledRole);

    expect(isManageable.value).toBe(false);

    toggleRole();
    await flushPromises();

    expect(assignRole).not.toHaveBeenCalled();
    expect(revokeRole).not.toHaveBeenCalled();
  });

  // The member is below the actor, so the toggle stays on: the target check must not refuse everyone
  test("still offers the toggle on a member whose top role is below the actor's", async () => {
    expect.hasAssertions();

    await readActor(5);
    const roleStore = useRoleStore();
    roleStore.arriveMemberRoles([assignmentOf(lowerRole)]);
    const { isManageable } = useToggleMemberRole(roomId, userId, toggledRole);

    expect(isManageable.value).toBe(true);
  });
});
