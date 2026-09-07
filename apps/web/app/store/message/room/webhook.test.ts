// @vitest-environment nuxt
import type { WebhookInMessage } from "@esposter/db-schema";

import { createRoom } from "@/services/message/room/createRoom.test";
import { createWebhook } from "@/services/message/room/createWebhook.test";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useAlertStore } from "@/store/alert";
import { useWebhookStore } from "@/store/message/room/webhook";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useWebhookStore, () => {
  const roomId = crypto.randomUUID();
  const otherRoomId = crypto.randomUUID();

  const server = setupMswTrpc();
  const first = createWebhook({ name: "first", roomId });
  const second = createWebhook({ name: "second", roomId });
  // The read hands back each row with the room and the webhook's own user attached, the way the panel renders it
  const room = createRoom("room");
  const user = createUser();
  const readWebhook = (webhook: WebhookInMessage) => ({ ...webhook, roomInMessage: room, user });

  beforeEach(() => {
    setActivePinia(createPinia());
    setCurrentRoomId(roomId);
  });

  // `items` is the reading view, so it follows whichever room is scoped — a read names its room when it is issued
  // And stores its rows there whatever the reader has opened since, which is what makes the newly scoped room's
  // List its own and the previous room's list still correct when it is opened again
  test("files a read's rows under the room it was issued for, not the room scoped when it lands", async () => {
    expect.hasAssertions();

    const { promise: isRoomSwitched, resolve: onRoomSwitched } = Promise.withResolvers<void>();
    server.use(
      trpcMsw.webhook.readWebhooks.query(async () => {
        await isRoomSwitched;
        return [readWebhook(first), readWebhook(second)];
      }),
    );
    const webhookStore = useWebhookStore();
    const { readWebhooks } = webhookStore;
    const { items } = storeToRefs(webhookStore);
    const pendingRead = readWebhooks(roomId);
    setCurrentRoomId(otherRoomId);
    onRoomSwitched();
    await pendingRead;

    expect(items.value).toStrictEqual([]);

    setCurrentRoomId(roomId);

    expect(items.value).toStrictEqual([readWebhook(first), readWebhook(second)]);
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

  // Each row is its own target, so its writes never queue behind another row's and a rejected edit unwinds
  // Only the row it touched
  test("restores only the row whose edit was rejected", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.webhook.updateWebhook.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
      trpcMsw.webhook.deleteWebhook.mutation(() => second),
    );
    const webhookStore = useWebhookStore();
    const { deleteWebhook, getSlice, updateWebhook } = webhookStore;
    const { items } = storeToRefs(webhookStore);
    // Copies, since an optimistic update assigns onto the stored row in place
    getSlice(roomId).items.value = [{ ...first }, { ...second }];
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
    const { deleteWebhook, getSlice } = webhookStore;
    const { items } = storeToRefs(webhookStore);
    getSlice(roomId).items.value = [{ ...first }, { ...second }];
    await Promise.all([deleteWebhook(roomId, { id: first.id }), deleteWebhook(roomId, { id: second.id })]);

    expect(items.value).toStrictEqual([first]);
  });
});
