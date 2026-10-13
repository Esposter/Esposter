// @vitest-environment nuxt
import type { InviteInMessage } from "@esposter/db-schema";

import { getInviteLink } from "@/services/message/room/invite/getInviteLink";
import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useInviteStore } from "@/store/message/room/invite";
import { INVITE_ID_LENGTH } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(useInviteStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const creator = createUser({ name: "creator" });
  const roomId = crypto.randomUUID();
  const invite: InviteInMessage = {
    createdAt: new Date(0),
    deletedAt: null,
    expiresAt: null,
    id: "a".repeat(INVITE_ID_LENGTH),
    maxUses: 0,
    roomId,
    updatedAt: new Date(0),
    userId: crypto.randomUUID(),
    uses: 0,
  };

  test("seeds", () => {
    expect.hasAssertions();

    const inviteStore = useInviteStore();
    const { seedInvite } = inviteStore;
    const { invites } = storeToRefs(inviteStore);
    seedInvite(roomId, invite);

    expect(invites.value.get(roomId)).toStrictEqual(invite);
  });

  test("keeps stored invite when a late read seeds", () => {
    expect.hasAssertions();

    const inviteStore = useInviteStore();
    const { seedInvite, setInvite } = inviteStore;
    const { invites } = storeToRefs(inviteStore);
    setInvite(roomId, invite);
    seedInvite(roomId, undefined);

    expect(invites.value.get(roomId)).toStrictEqual(invite);
  });

  const room = { id: roomId, isInvitePaused: false };

  test("hands out the link the member holds without minting one", async () => {
    expect.hasAssertions();

    let isCreateCalled = false;
    trpcMsw.invite.readMyInvite.query(() => invite);
    trpcMsw.invite.createInvite.mutation(() => {
      isCreateCalled = true;
      return { ...invite, user: creator };
    });
    const inviteStore = useInviteStore();
    const { getUsableInviteLink } = inviteStore;
    const inviteLink = await getUsableInviteLink(room);

    expect(inviteLink).toBe(getInviteLink(useRuntimeConfig().public.baseUrl, invite.id));
    expect(isCreateCalled).toBe(false);
  });

  test("mints a fresh link in place of one that has lapsed", async () => {
    expect.hasAssertions();

    const lapsedInvite: InviteInMessage = { ...invite, expiresAt: new Date(0), id: "b".repeat(INVITE_ID_LENGTH) };
    const freshInvite: InviteInMessage = { ...invite, id: "c".repeat(INVITE_ID_LENGTH) };
    trpcMsw.invite.readMyInvite.query(() => lapsedInvite);
    trpcMsw.invite.createInvite.mutation(() => ({ ...freshInvite, user: creator }));
    const inviteStore = useInviteStore();
    const { getUsableInviteLink } = inviteStore;
    const inviteLink = await getUsableInviteLink(room);

    expect(inviteLink).toBe(getInviteLink(useRuntimeConfig().public.baseUrl, freshInvite.id));
  });
});
