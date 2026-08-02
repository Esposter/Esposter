// @vitest-environment nuxt
import type { WebhookInMessage } from "@esposter/db-schema";

import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useWebhookStore } from "@/store/message/room/webhook";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe("dbg", () => {
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

  test("dbg", async () => {
    expect.hasAssertions();
    const log: string[] = [];
    server.use(
      trpcMsw.webhook.readWebhooks.query(() => [webhook]),
      trpcMsw.webhook.updateWebhook.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }),
    );
    const webhookStore = useWebhookStore();
    const { readWebhooks, updateWebhook } = webhookStore;
    const { items } = storeToRefs(webhookStore);
    await readWebhooks(roomId);
    await updateWebhook(roomId, { id: webhook.id, name: "name" });
    log.push(`AFTER_SINGLE_FAIL:${JSON.stringify(items.value)}`);
    expect(log).toStrictEqual([]);
  });
});
