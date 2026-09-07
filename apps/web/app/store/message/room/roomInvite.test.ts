// @vitest-environment nuxt
import type { InviteInMessageWithCreator } from "@esposter/db-schema";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { inviteCreateHooks } from "@/services/message/room/invite/inviteCreateHooks";
import { createUser } from "@/services/message/user/createUser.test";
import { useRoomInviteStore } from "@/store/message/room/roomInvite";
import { INVITE_ID_LENGTH } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useRoomInviteStore, () => {
  const roomId = crypto.randomUUID();
  const unreadRoomId = crypto.randomUUID();
  const user = createUser({ id: "userId" });
  const otherUser = createUser({ id: "otherUserId" });
  const createRoomInvite = (id: string, creator = user): InviteInMessageWithCreator => ({
    createdAt: new Date(0),
    deletedAt: null,
    expiresAt: null,
    id: id.repeat(INVITE_ID_LENGTH),
    maxUses: 0,
    roomId,
    updatedAt: new Date(0),
    user: creator,
    userId: creator.id,
    uses: 0,
  });
  const ownInvite = createRoomInvite("a");
  const replacementInvite = createRoomInvite("b");
  const otherMembersInvite = createRoomInvite("c", otherUser);

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Every other member's row stays, and a room nobody has opened the panel for is left unread rather than seeded
  test("files a created link into the list that was read, replacing that member's own row", async () => {
    expect.hasAssertions();

    const roomInviteStore = useRoomInviteStore();
    const { getSlice } = roomInviteStore;
    const slice = getSlice(roomId);
    slice.initializeCursorPaginationData(
      new CursorPaginationData({ hasMore: false, items: [ownInvite, otherMembersInvite] }),
    );

    await inviteCreateHooks.run(roomId, replacementInvite);
    await inviteCreateHooks.run(unreadRoomId, replacementInvite);

    expect(slice.items.value).toStrictEqual([replacementInvite, otherMembersInvite]);
    expect(getSlice(unreadRoomId).items.value).toStrictEqual([]);
  });
});
