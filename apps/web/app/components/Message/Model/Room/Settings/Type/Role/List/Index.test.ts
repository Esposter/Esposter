// @vitest-environment nuxt
import type { RoomRoleInMessage } from "@esposter/db-schema";

import MessageModelRoomSettingsTypeRoleDeleteButton from "@/components/Message/Model/Room/Settings/Type/Role/DeleteButton.vue";
import MessageModelRoomSettingsTypeRoleListIndex from "@/components/Message/Model/Room/Settings/Type/Role/List/Index.vue";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useRoleStore } from "@/store/message/room/role";
import { RoomPermission } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("messageModelRoomSettingsTypeRoleListIndex", () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const createRole = (position: number): RoomRoleInMessage => ({
    color: "",
    createdAt: new Date(0),
    deletedAt: null,
    id: crypto.randomUUID(),
    isEveryone: false,
    name: `position ${position}`,
    permissions: 0n,
    position,
    roomId,
    updatedAt: new Date(0),
  });

  // `deleteRole` refuses a role at or above the reader's top role, so a row above it is listed without its Delete
  test("offers Delete only for a role the reader's top role outranks", async () => {
    expect.hasAssertions();

    trpcMsw.role.readMyPermissions.query(() => [
      { isRoomOwner: false, permissions: RoomPermission.ManageRoles, roomId, topRolePosition: 2 },
    ]);
    const roleStore = useRoleStore();
    const { readMyPermissions } = roleStore;
    await readMyPermissions({ roomIds: [roomId] });
    const component = await mountSuspended(MessageModelRoomSettingsTypeRoleListIndex, {
      props: { roles: [createRole(1), createRole(5)], roomId },
    });

    expect(component.findAllComponents(MessageModelRoomSettingsTypeRoleDeleteButton)).toHaveLength(1);
  });
});
