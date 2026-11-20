// @vitest-environment nuxt
import type { InviteInMessage } from "@esposter/db-schema";

import { useReadMyInvite } from "#src/composables/message/room/useReadMyInvite";
import { setupSession } from "#src/services/auth/setupSession.test";
import { inviteTable } from "#src/services/message/room/overlay/constants";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useInviteStore } from "#src/store/message/room/invite";
import { useOverlayStore } from "#src/store/overlay";
import { SECRET_TOKEN_LENGTH } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useReadMyInvite, () => {
  const { trpcMsw } = setupMswTrpc();
  const userId = v7();
  const roomId = v7();
  setupSession(userId);
  const createInvite = (overrides: Partial<InviteInMessage>): InviteInMessage => ({
    createdAt: new Date(0),
    deletedAt: null,
    expiresAt: null,
    id: "a".repeat(SECRET_TOKEN_LENGTH),
    maxUses: 0,
    roomId,
    updatedAt: new Date(0),
    userId,
    uses: 0,
    version: 0,
    ...overrides,
  });
  const heldInvite = createInvite({});

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

  // A read's answer is an arrival, so the tombstone the server answers for a link it lapsed removes the link held
  // Beneath it, which the manager would otherwise go on offering
  test("removes the held link the server answers with its tombstone", async () => {
    expect.hasAssertions();

    const tombstone = { ...heldInvite, deletedAt: new Date(0), version: 1 };
    trpcMsw.invite.readMyInvite.query(() => tombstone);
    const overlayStore = useOverlayStore();
    const { arrive } = overlayStore;
    arrive(inviteTable, heldInvite);
    const inviteStore = useInviteStore();
    const { invites } = storeToRefs(inviteStore);
    await mountRead();
    await flushPromises();

    expect(invites.value.get(roomId)).toBeUndefined();
  });

  // Absence never removes: a read that answers no link says nothing about the one held
  test("keeps the held link when the server answers with no link", async () => {
    expect.hasAssertions();

    trpcMsw.invite.readMyInvite.query(() => undefined);
    const overlayStore = useOverlayStore();
    const { arrive } = overlayStore;
    arrive(inviteTable, heldInvite);
    const inviteStore = useInviteStore();
    const { invites } = storeToRefs(inviteStore);
    await mountRead();
    await flushPromises();

    expect(invites.value.get(roomId)).toStrictEqual(heldInvite);
  });
});
