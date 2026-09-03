// @vitest-environment nuxt
import type { InviteInMessage } from "@esposter/db-schema";

import { useInviteStore } from "@/store/message/room/invite";
import { INVITE_ID_LENGTH } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useInviteStore, () => {
  const roomId = crypto.randomUUID();
  const invite: InviteInMessage = {
    createdAt: new Date("1970-01-01"),
    deletedAt: null,
    expiresAt: null,
    id: "a".repeat(INVITE_ID_LENGTH),
    maxUses: 0,
    roomId,
    updatedAt: new Date("1970-01-01"),
    userId: crypto.randomUUID(),
    uses: 0,
  };

  beforeEach(() => {
    setActivePinia(createPinia());
  });

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
});
