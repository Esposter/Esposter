// @vitest-environment nuxt
import type { RoomRoleInMessage } from "@esposter/db-schema";

import MessageModelRoomSettingsTypeRoleEditor from "@/components/Message/Model/Room/Settings/Type/Role/Editor.vue";
import MessageModelRoomSettingsTypeRolePermissionList from "@/components/Message/Model/Room/Settings/Type/Role/Permission/List.vue";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useRoleStore } from "@/store/message/room/role";
import { RoomPermission } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("messageModelRoomSettingsTypeRoleEditor", () => {
  const { trpcMsw } = setupMswTrpc();
  const role: RoomRoleInMessage = {
    color: "",
    createdAt: new Date(0),
    deletedAt: null,
    id: crypto.randomUUID(),
    isEveryone: false,
    name: "name",
    permissions: RoomPermission.ReadMessages,
    position: 1,
    roomId: crypto.randomUUID(),
    updatedAt: new Date(0),
  };

  // Another moderator's change to the role reaches an editor the reader has not touched: the switches show the stored
  // Permissions, and no save bar offers to write back the copy the editor was opened on
  test("shows a permission change another client made to a role the reader has not edited", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(MessageModelRoomSettingsTypeRoleEditor, {
      props: { role, roomId: role.roomId },
    });
    const permissions = RoomPermission.ReadMessages | RoomPermission.SendMessages;
    await component.setProps({ role: { ...role, permissions } });

    expect(component.findComponent(MessageModelRoomSettingsTypeRolePermissionList).props("modelValue")).toBe(
      permissions,
    );
    expect(component.find('[role="status"]').exists()).toBe(false);
  });

  // `UpdateRole` refuses a role at or above the reader's top role, so the switches are held for a reader who does not
  // Outrank the role, and left to their own holds for one who does
  test.each([
    ["holds every switch of a role the reader's top role does not outrank", role.position, true],
    ["leaves the switches to their own holds for a role the reader's top role outranks", role.position + 1, undefined],
  ])("%s", async (_title, topRolePosition, isDisabled) => {
    expect.hasAssertions();

    trpcMsw.role.readMyPermissions.query(() => [
      { isRoomOwner: false, permissions: 0n, roomId: role.roomId, topRolePosition },
    ]);
    const roleStore = useRoleStore();
    const { readMyPermissions } = roleStore;
    await readMyPermissions({ roomIds: [role.roomId] });
    const component = await mountSuspended(MessageModelRoomSettingsTypeRoleEditor, {
      props: { role, roomId: role.roomId },
    });

    expect(component.findComponent(MessageModelRoomSettingsTypeRolePermissionList).props("isDisabled")).toBe(
      isDisabled,
    );
  });
});
