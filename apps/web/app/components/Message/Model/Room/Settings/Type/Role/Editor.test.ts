// @vitest-environment nuxt
import type { RoomRoleInMessage } from "@esposter/db-schema";

import MessageModelRoomSettingsTypeRoleEditor from "@/components/Message/Model/Room/Settings/Type/Role/Editor.vue";
import MessageModelRoomSettingsTypeRolePermissionList from "@/components/Message/Model/Room/Settings/Type/Role/Permission/List.vue";
import { RoomPermission } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("messageModelRoomSettingsTypeRoleEditor", () => {
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
});
