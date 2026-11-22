// @vitest-environment nuxt
import MessageModelRoomSettingsTypeRoleDeleteButton from "#src/components/Message/Model/Room/Settings/Type/Role/DeleteButton.vue";
import MessageModelRoomSettingsTypeRoleListIndex from "#src/components/Message/Model/Room/Settings/Type/Role/List/Index.vue";
import { createRoomRole } from "#src/services/message/room/createRoomRole.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useRoleStore } from "#src/store/message/room/role";
import { RoomPermission } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("messageModelRoomSettingsTypeRoleListIndex", () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();

  test("offers Delete only for a role the reader's top role outranks", async () => {
    expect.hasAssertions();

    trpcMsw.role.readMyPermissions.query(() => [
      { isRoomOwner: false, permissions: RoomPermission.ManageRoles, roomId, topRolePosition: 2 },
    ]);
    const roleStore = useRoleStore();
    const { readMyPermissions } = roleStore;
    await readMyPermissions({ roomIds: [roomId] });
    const outrankedRole = createRoomRole({ position: 1, roomId });
    const component = await mountSuspended(MessageModelRoomSettingsTypeRoleListIndex, {
      props: { roles: [outrankedRole, createRoomRole({ position: 5, roomId })], roomId },
    });

    expect(
      component.findAllComponents(MessageModelRoomSettingsTypeRoleDeleteButton).map((button) => button.props("roleId")),
    ).toStrictEqual([outrankedRole.id]);
  });
});
