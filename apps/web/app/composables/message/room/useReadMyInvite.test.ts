// @vitest-environment nuxt
import type { InviteInMessage } from "@esposter/db-schema";

import { useReadMyInvite } from "#src/composables/message/room/useReadMyInvite";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useInviteStore } from "#src/store/message/room/invite";
import { SECRET_TOKEN_LENGTH } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useReadMyInvite, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const createInvite = (overrides: Partial<InviteInMessage>): InviteInMessage => ({
    createdAt: new Date(0),
    deletedAt: null,
    expiresAt: null,
    id: "a".repeat(SECRET_TOKEN_LENGTH),
    maxUses: 0,
    roomId,
    updatedAt: new Date(0),
    userId: v7(),
    uses: 0,
    version: 0,
    ...overrides,
  });
  const lapsedInvite = createInvite({ expiresAt: new Date(0) });
  const liveInvite = createInvite({ id: "b".repeat(SECRET_TOKEN_LENGTH) });

  const mountRead = async () => {
    await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          useReadMyInvite(roomId);
        },
      }),
    );
  };

  // The map holds a link that has lapsed, and the server answers with the live one that replaced it. A read seeds only
  // An empty slot, so keeping the lapsed link here would leave the manager offering a token nobody can join with
  test("replaces a lapsed stored link with the live one the server answers with", async () => {
    expect.hasAssertions();

    trpcMsw.invite.readMyInvite.query(() => liveInvite);
    const inviteStore = useInviteStore();
    const { invites } = storeToRefs(inviteStore);
    inviteStore.setInvite(roomId, lapsedInvite);
    await mountRead();
    await flushPromises();

    expect(invites.value.get(roomId)).toStrictEqual(liveInvite);
  });

  // The server holds no link for the member, so a lapsed one in the map is cleared rather than kept
  test("clears a lapsed stored link when the server answers with no link", async () => {
    expect.hasAssertions();

    trpcMsw.invite.readMyInvite.query(() => undefined);
    const inviteStore = useInviteStore();
    const { invites } = storeToRefs(inviteStore);
    inviteStore.setInvite(roomId, lapsedInvite);
    await mountRead();
    await flushPromises();

    expect(invites.value.get(roomId)).toBeUndefined();
  });
});
