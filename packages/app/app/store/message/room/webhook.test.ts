// @vitest-environment nuxt
import type { WebhookInMessage } from "@esposter/db-schema";

import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useWebhookStore } from "@/store/message/room/webhook";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useWebhookStore, () => {
  const server = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const webhook: WebhookInMessage = {
    creatorId: crypto.randomUUID(),
    id: crypto.randomUUID(),
    isActive: true,
    name: "",
    roomId,
    token: "",
    userId: crypto.randomUUID(),
  };

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // A row's name field and its active switch write different fields of one webhook through one target, so a
  // Rejected switch must roll back to the name the blur already stored, not to the row it found on mount
  test("rolls a rejected row change back to what the write ahead of it stored", async () => {
    expect.hasAssertions();

    const name = "name";
    server.use(
      trpcMsw.webhook.readWebhooks.query(() => [webhook]),
      trpcMsw.webhook.updateWebhook.mutation(({ input }) => {
        if (input.isActive !== undefined) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        return { ...webhook, name: input.name ?? webhook.name };
      }),
    );
    const webhookStore = useWebhookStore();
    const { readWebhooks, updateWebhook } = webhookStore;
    const { items } = storeToRefs(webhookStore);
    await readWebhooks(roomId);
    await Promise.all([
      updateWebhook(roomId, { id: webhook.id, name }),
      updateWebhook(roomId, { id: webhook.id, isActive: false }),
    ]);

    expect(items.value).toStrictEqual([{ ...webhook, name }]);
  });
});
