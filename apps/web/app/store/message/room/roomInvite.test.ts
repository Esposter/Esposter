// @vitest-environment nuxt
import type { InviteInMessageWithCreator } from "@esposter/db-schema";

import { inviteCreateHooks } from "#src/services/message/room/invite/inviteCreateHooks";
import { inviteTable } from "#src/services/message/room/overlay/constants";
import { createUser } from "#src/services/message/user/createUser.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useRoomInviteStore } from "#src/store/message/room/roomInvite";
import { useOverlayStore } from "#src/store/overlay";
import { SECRET_TOKEN_LENGTH } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useRoomInviteStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const unreadRoomId = v7();
  const user = createUser({ id: v7() });
  const otherUser = createUser({ id: v7() });
  const trpcError = new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
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
    version: 0,
  });
  const ownInvite = createRoomInvite("a");
  const replacementInvite = createRoomInvite("b");
  const otherMembersInvite = createRoomInvite("c", otherUser);

  // A page's rows arrive on the overlay, and the list shows the live usable ones: a tombstone the page returns and a
  // Link That has lapsed stay held, and are left out
  test("lists a page's live usable invites, and leaves out a tombstone and a lapsed link", async () => {
    expect.hasAssertions();

    const roomInviteStore = useRoomInviteStore();
    const { getInviteItems, getSliceOperationData, readInvitePage } = roomInviteStore;
    const items = getInviteItems(roomId);
    const { readItems } = getSliceOperationData(roomId);
    const tombstone = { ...ownInvite, deletedAt: new Date(0), id: "d".repeat(SECRET_TOKEN_LENGTH), version: 1 };
    const lapsed = { ...ownInvite, expiresAt: new Date(0), id: "e".repeat(SECRET_TOKEN_LENGTH) };
    await readItems(() => Promise.resolve(readInvitePage({ items: [ownInvite, tombstone, lapsed], nextCursor: "" })));

    expect(items.value).toStrictEqual([ownInvite]);
  });

  // The create's answer tombstones the member's own link, and the link it names is listed in that link's place. A room
  // Nobody has opened the panel for is left unread rather than seeded
  test("files a created link into the list that was read, in place of that member's own replaced link", async () => {
    expect.hasAssertions();

    const overlayStore = useOverlayStore();
    const { arrive } = overlayStore;
    const roomInviteStore = useRoomInviteStore();
    const { getInviteItems, getSliceOperationData, readInvitePage } = roomInviteStore;
    const items = getInviteItems(roomId);
    const { readItems } = getSliceOperationData(roomId);
    await readItems(() => Promise.resolve(readInvitePage({ items: [ownInvite, otherMembersInvite], nextCursor: "" })));
    arrive(inviteTable, replacementInvite);
    arrive(inviteTable, { ...ownInvite, deletedAt: new Date(0), version: 1 });
    await inviteCreateHooks.run(roomId, replacementInvite);
    await inviteCreateHooks.run(unreadRoomId, replacementInvite);

    expect(items.value).toStrictEqual([replacementInvite, otherMembersInvite]);
    expect(getInviteItems(unreadRoomId).value).toStrictEqual([]);
  });

  // An answered revoke takes the invite off the list at once, and its answer is the tombstone the list keeps out
  test("an answered revoke removes the invite from the list", async () => {
    expect.hasAssertions();

    trpcMsw.invite.revokeInvite.mutation(() => ({ ...ownInvite, deletedAt: new Date(0), version: 1 }));
    const roomInviteStore = useRoomInviteStore();
    const { getInviteItems, getSliceOperationData, readInvitePage, revokeInvite } = roomInviteStore;
    const items = getInviteItems(roomId);
    const { readItems } = getSliceOperationData(roomId);
    await readItems(() => Promise.resolve(readInvitePage({ items: [ownInvite], nextCursor: "" })));
    revokeInvite({ id: ownInvite.id, roomId });
    await flushPromises();

    expect(items.value).toStrictEqual([]);
  });

  // A refused revoke changes nothing held, so the invite is listed where it stood
  test("a refused revoke lists the invite where it stood", async () => {
    expect.hasAssertions();

    trpcMsw.invite.revokeInvite.mutation(() => {
      throw trpcError;
    });
    const roomInviteStore = useRoomInviteStore();
    const { getInviteItems, getSliceOperationData, readInvitePage, revokeInvite } = roomInviteStore;
    const items = getInviteItems(roomId);
    const { readItems } = getSliceOperationData(roomId);
    await readItems(() => Promise.resolve(readInvitePage({ items: [ownInvite], nextCursor: "" })));
    revokeInvite({ id: ownInvite.id, roomId });
    await flushPromises();

    expect(items.value).toStrictEqual([ownInvite]);
  });
});
