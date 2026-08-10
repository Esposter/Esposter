// @vitest-environment nuxt
import type { WebhookInMessage } from "@esposter/db-schema";

import MessageModelRoomSettingsTypeWebhookConfirmDeleteDialog from "@/components/Message/Model/Room/Settings/Type/Webhook/ConfirmDeleteDialog.vue";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { useWebhookStore } from "@/store/message/room/webhook";
import { useWebhookDialogStore } from "@/store/message/room/webhookDialog";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("messageModelRoomSettingsTypeWebhookConfirmDeleteDialog", () => {
  const createdAt = new Date(0);
  const id = crypto.randomUUID();
  const roomId = crypto.randomUUID();
  const creatorId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const name = "name";
  const token = "token";
  const createWebhook = (): WebhookInMessage => ({
    createdAt,
    creatorId,
    deletedAt: null,
    id,
    isActive: true,
    name,
    roomId,
    token,
    updatedAt: createdAt,
    userId,
  });

  // The behaviour matrix for a singleton dialog whose item leaves its list lives in useSingletonDialog's own
  // Test; here only that this dialog resolves through the primitive rather than a computed of its own
  test("drops the target when its webhook leaves the list", async () => {
    expect.hasAssertions();

    // Shallow because the reconciliation under test lives in setup — the overlay DOM has no bearing on it
    await mountSuspended(MessageModelRoomSettingsTypeWebhookConfirmDeleteDialog, {
      props: { roomId },
      shallow: true,
    });
    setCurrentRoomId(roomId);
    const webhookStore = useWebhookStore();
    const { items } = storeToRefs(webhookStore);
    const webhookDialogStore = useWebhookDialogStore();
    const { deletingId } = storeToRefs(webhookDialogStore);
    items.value = [createWebhook()];
    deletingId.value = id;
    await flushPromises();
    items.value = [];
    await flushPromises();

    expect(deletingId.value).toBe("");
  });
});
