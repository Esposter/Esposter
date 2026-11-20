// @vitest-environment nuxt
import type { InviteInMessage } from "@esposter/db-schema";

import { setupSession } from "#src/services/auth/setupSession.test";
import { getInviteLink } from "#src/services/message/room/invite/getInviteLink";
import { inviteTable } from "#src/services/message/room/overlay/constants";
import { createUser } from "#src/services/message/user/createUser.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useInviteStore } from "#src/store/message/room/invite";
import { useOverlayStore } from "#src/store/overlay";
import { SECRET_TOKEN_LENGTH } from "@esposter/shared";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useInviteStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const creator = createUser({ name: "creator" });
  const roomId = v7();
  setupSession(creator.id);
  const createInviteRow = (overrides: Partial<InviteInMessage>): InviteInMessage => ({
    createdAt: new Date(0),
    deletedAt: null,
    expiresAt: null,
    id: "a".repeat(SECRET_TOKEN_LENGTH),
    maxUses: 0,
    roomId,
    updatedAt: new Date(0),
    userId: creator.id,
    uses: 0,
    version: 0,
    ...overrides,
  });
  const invite = createInviteRow({});
  const room = { id: roomId, isInvitePaused: false };

  // The link is the server's to mint, so it is held once the server issues it, and not before
  test("a create whose link only the server mints waits for the server", async () => {
    expect.hasAssertions();

    const { promise, resolve } = Promise.withResolvers<void>();
    trpcMsw.invite.createInvite.mutation(async () => {
      await promise;
      return { invite: { ...invite, user: creator }, replacedInvites: [] };
    });
    const inviteStore = useInviteStore();
    const { checkIsCreateInvitePending, createInvite } = inviteStore;
    const { invites } = storeToRefs(inviteStore);
    const inviteCreation = createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId });
    await flushPromises();

    expect(invites.value.get(roomId)).toBeUndefined();
    expect(checkIsCreateInvitePending(roomId)).toBe(true);

    resolve();
    await inviteCreation;

    expect(invites.value.get(roomId)).toStrictEqual({ ...invite, user: creator });
    expect(checkIsCreateInvitePending(roomId)).toBe(false);
  });

  // The link a create replaces is answered as its tombstone, so the link held before it stops being offered on the same answer
  test("a create answers the link it replaces as a tombstone, which removes the link held before", async () => {
    expect.hasAssertions();

    const freshInvite = createInviteRow({ id: "b".repeat(SECRET_TOKEN_LENGTH) });
    const replacedInvite = { ...invite, deletedAt: new Date(0), version: 1 };
    trpcMsw.invite.createInvite.mutation(() => ({
      invite: { ...freshInvite, user: creator },
      replacedInvites: [replacedInvite],
    }));
    const overlayStore = useOverlayStore();
    const { arrive } = overlayStore;
    arrive(inviteTable, invite);
    const inviteStore = useInviteStore();
    const { createInvite } = inviteStore;
    const { invites } = storeToRefs(inviteStore);
    await createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId });

    expect(invites.value.get(roomId)).toStrictEqual({ ...freshInvite, user: creator });
  });

  test("hands out the link the member holds without minting one", async () => {
    expect.hasAssertions();

    let isCreateCalled = false;
    trpcMsw.invite.readMyInvite.query(() => invite);
    trpcMsw.invite.createInvite.mutation(() => {
      isCreateCalled = true;
      return { invite: { ...invite, user: creator }, replacedInvites: [] };
    });
    const inviteStore = useInviteStore();
    const { getUsableInviteLink } = inviteStore;
    const inviteLink = await getUsableInviteLink(room);

    expect(inviteLink).toBe(getInviteLink(useRuntimeConfig().public.baseUrl, invite.id));
    expect(isCreateCalled).toBe(false);
  });

  // The server answers a lapsed link as its tombstone, so the reader holds nothing usable and mints a fresh link
  test("mints a fresh link in place of one that has lapsed", async () => {
    expect.hasAssertions();

    const lapsedInvite = createInviteRow({ expiresAt: new Date(0), id: "b".repeat(SECRET_TOKEN_LENGTH) });
    const freshInvite = createInviteRow({ id: "c".repeat(SECRET_TOKEN_LENGTH) });
    trpcMsw.invite.readMyInvite.query(() => ({ ...lapsedInvite, deletedAt: new Date(0), version: 1 }));
    trpcMsw.invite.createInvite.mutation(() => ({ invite: { ...freshInvite, user: creator }, replacedInvites: [] }));
    const inviteStore = useInviteStore();
    const { getUsableInviteLink } = inviteStore;
    const inviteLink = await getUsableInviteLink(room);

    expect(inviteLink).toBe(getInviteLink(useRuntimeConfig().public.baseUrl, freshInvite.id));
  });
});
