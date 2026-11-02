// @vitest-environment nuxt
import type { InviteInMessageWithCreator } from "@esposter/db-schema";

import MessageModelRoomInviteEditButton from "@/components/Message/Model/Room/Invite/EditButton.vue";
import MessageModelRoomInviteRow from "@/components/Message/Model/Room/Invite/Row.vue";
import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useRoleStore } from "@/store/message/room/role";
import { INVITE_ID_LENGTH, RoomPermission } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("messageModelRoomInviteRow", () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const user = createUser();
  const invite: InviteInMessageWithCreator = {
    createdAt: new Date(0),
    deletedAt: null,
    expiresAt: null,
    id: "a".repeat(INVITE_ID_LENGTH),
    maxUses: 0,
    roomId,
    updatedAt: new Date(0),
    user,
    userId: user.id,
    uses: 0,
  };

  // Editing regenerates the reader's own link, which is minted under ManageInvites, so the Edit is offered to the creator
  // Only while the reader holds it
  test.each([
    [RoomPermission.ManageRoom, false],
    [RoomPermission.ManageRoom | RoomPermission.ManageInvites, true],
  ])(
    "offers the edit to the creator only while holding ManageInvites, with permissions %s",
    async (permissions, isOffered) => {
      expect.hasAssertions();

      trpcMsw.role.readMyPermissions.query(() => [{ isRoomOwner: false, permissions, roomId, topRolePosition: 0 }]);
      await useRoleStore().readMyPermissions({ roomIds: [roomId] });
      const component = await mountSuspended(MessageModelRoomInviteRow, { props: { invite, isCreator: true, roomId } });

      expect(component.findComponent(MessageModelRoomInviteEditButton).exists()).toBe(isOffered);
    },
  );
});
