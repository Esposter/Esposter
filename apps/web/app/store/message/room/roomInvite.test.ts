// @vitest-environment nuxt
import type { InviteInMessageWithCreator } from "@esposter/db-schema";

import { inviteCreateHooks } from "#src/services/message/room/invite/inviteCreateHooks";
import { createUser } from "#src/services/message/user/createUser.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useRoomInviteStore } from "#src/store/message/room/roomInvite";
import { SECRET_TOKEN_LENGTH, waitForSynchronizedFunctions } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useRoomInviteStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const unreadRoomId = v7();
  const user = createUser({ id: "userId" });
  const otherUser = createUser({ id: "otherUserId" });
  const createRoomInvite = (id: string, creator = user): InviteInMessageWithCreator => ({
    createdAt: new Date(0),
    deletedAt: null,
    expiresAt: null,
    id: id.repeat(SECRET_TOKEN_LENGTH),
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

  // Every other member's row stays, and a room nobody has opened the panel for is left unread rather than seeded
  test("files a created link into the list that was read, replacing that member's own row", async () => {
    expect.hasAssertions();

    const roomInviteStore = useRoomInviteStore();
    const { getSlice } = roomInviteStore;
    const slice = getSlice(roomId);
    slice.initializeCursorPaginationData({ items: [ownInvite, otherMembersInvite], nextCursor: "" });

    await inviteCreateHooks.run(roomId, replacementInvite);
    await inviteCreateHooks.run(unreadRoomId, replacementInvite);

    expect(slice.items.value).toStrictEqual([replacementInvite, otherMembersInvite]);
    expect(getSlice(unreadRoomId).items.value).toStrictEqual([]);
  });

  // The revoke's rollback runs after a link for the same member was filed, and must not re-add a second one beside it
  test("a refused revoke does not bring back an invite that a newer one for the same member replaced", async () => {
    expect.hasAssertions();

    const { promise: isRevokeReached, resolve: onRevokeReached } = Promise.withResolvers<void>();
    const { promise: isRevokeRefused, resolve: refuseRevoke } = Promise.withResolvers<void>();
    trpcMsw.invite.revokeInvite.mutation(async () => {
      onRevokeReached();
      await isRevokeRefused;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const roomInviteStore = useRoomInviteStore();
    const { getSlice, revokeInvite } = roomInviteStore;
    const slice = getSlice(roomId);
    slice.initializeCursorPaginationData({ items: [ownInvite, otherMembersInvite], nextCursor: "" });
    revokeInvite({ id: ownInvite.id, roomId });
    await isRevokeReached;

    await inviteCreateHooks.run(roomId, replacementInvite);
    refuseRevoke();
    await waitForSynchronizedFunctions();

    expect(slice.items.value).toStrictEqual([replacementInvite, otherMembersInvite]);
  });
});
