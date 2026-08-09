// @vitest-environment nuxt
import type { WebhookInMessage } from "@esposter/db-schema";

import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useAlertStore } from "@/store/alert";
import { useWebhookStore } from "@/store/message/room/webhook";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

const roomId = crypto.randomUUID();

const createWebhook = (name: string): WebhookInMessage => ({
  createdAt: new Date("1970-01-01"),
  creatorId: crypto.randomUUID(),
  deletedAt: null,
  id: crypto.randomUUID(),
  isActive: true,
  name,
  roomId,
  token: "",
  updatedAt: new Date("1970-01-01"),
  userId: crypto.randomUUID(),
});

describe(useWebhookStore, () => {
  const server = setupMswTrpc();
  const first = createWebhook("first");
  const second = createWebhook("second");

  beforeEach(() => {
    setActivePinia(createPinia());
    // The webhook list is keyed by the room in the route, so a list only exists once one is current — and
    // Through triggerRef, because currentRoute is a shallowRef
    const router = useRouter();
    router.currentRoute.value.params.id = roomId;
    triggerRef(router.currentRoute);
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
    await Promise.all([
      updateWebhook(roomId, { id: first.id, name: "name" }),
      updateWebhook(roomId, { id: first.id, isActive: false }),
    ]);

    expect(alerts.value.map(({ text }) => text)).toStrictEqual(["1", "2"]);
  });

  // Each row is its own target, so its writes never queue behind another row's: a rejected edit must unwind only
  // The row it touched, or it reinstates a row a concurrent deletion has already taken off the list
  test("restores only the row whose edit was rejected", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.webhook.updateWebhook.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
      trpcMsw.webhook.deleteWebhook.mutation(() => second),
    );
    const webhookStore = useWebhookStore();
    const { deleteWebhook, updateWebhook } = webhookStore;
    const { items } = storeToRefs(webhookStore);
    // Copies, since an optimistic update assigns onto the stored row in place
    items.value = [{ ...first }, { ...second }];
    await Promise.all([
      updateWebhook(roomId, { id: first.id, name: "renamed" }),
      deleteWebhook(roomId, { id: second.id }),
    ]);

    expect(items.value).toStrictEqual([first]);
  });

  test("puts back only the row whose deletion was rejected, where it stood", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.webhook.deleteWebhook.mutation(({ input: { id } }) => {
        if (id === first.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
        return second;
      }),
    );
    const webhookStore = useWebhookStore();
    const { deleteWebhook } = webhookStore;
    const { items } = storeToRefs(webhookStore);
    items.value = [{ ...first }, { ...second }];
    await Promise.all([deleteWebhook(roomId, { id: first.id }), deleteWebhook(roomId, { id: second.id })]);

    expect(items.value).toStrictEqual([first]);
  });
});
