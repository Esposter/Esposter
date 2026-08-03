// @vitest-environment nuxt
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useAlertStore } from "@/store/alert";
import { useWebhookStore } from "@/store/message/room/webhook";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useWebhookStore, () => {
  const server = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const id = crypto.randomUUID();

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // A row's name field and its active switch write different fields of one webhook through one target, so an
  // Earlier change superseded by the other control's would skip its rollback and its alert, leaving a rejected
  // Value on the row as though it had saved
  test("surfaces a rejected row change even when the other control saves straight after", async () => {
    expect.hasAssertions();

    let updateCount = 0;
    server.use(
      trpcMsw.webhook.updateWebhook.mutation(() => {
        updateCount += 1;
        // A distinct message per call, so the alert store keeps both instead of refreshing one
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(updateCount) });
      }),
    );
    const webhookStore = useWebhookStore();
    const { updateWebhook } = webhookStore;
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    await Promise.all([updateWebhook(roomId, { id, name: "name" }), updateWebhook(roomId, { id, isActive: false })]);

    expect(alerts.value.map(({ text }) => text)).toStrictEqual(["1", "2"]);
  });
});
