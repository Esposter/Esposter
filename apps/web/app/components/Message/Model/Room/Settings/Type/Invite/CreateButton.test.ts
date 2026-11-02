// @vitest-environment nuxt
import MessageModelRoomSettingsTypeInviteCreateButton from "@/components/Message/Model/Room/Settings/Type/Invite/CreateButton.vue";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useRoleStore } from "@/store/message/room/role";
import { RoomPermission } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("messageModelRoomSettingsTypeInviteCreateButton", () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = crypto.randomUUID();

  // The panel is open to ManageRoom, but the invite its create opens is minted under ManageInvites alone
  test.each([
    [RoomPermission.ManageRoom, false],
    [RoomPermission.ManageRoom | RoomPermission.ManageInvites, true],
  ])(
    "offers the create only to a reader holding ManageInvites, with permissions %s",
    async (permissions, isOffered) => {
      expect.hasAssertions();

      trpcMsw.role.readMyPermissions.query(() => [{ isRoomOwner: false, permissions, roomId, topRolePosition: 0 }]);
      await useRoleStore().readMyPermissions({ roomIds: [roomId] });
      const component = await mountSuspended(MessageModelRoomSettingsTypeInviteCreateButton, { props: { roomId } });

      expect(component.text()).toBe(isOffered ? "Create invite" : "");
    },
  );
});
