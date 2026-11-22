// @vitest-environment nuxt
import type { PublicWebhookInMessage } from "@esposter/db-schema";

import { createRoom } from "#src/services/message/room/createRoom.test";
import { createWebhook } from "#src/services/message/room/createWebhook.test";
import { createUser } from "#src/services/message/user/createUser.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useWebhookStore } from "#src/store/message/room/webhook";
import { setRouteId } from "#src/util/router/setRouteId.test";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";

describe(useWebhookStore, () => {
  const roomId = v7();
  const otherRoomId = v7();
  const { trpcMsw } = setupMswTrpc();
  const first = createWebhook({ roomId });
  const second = createWebhook({ roomId });
  const trpcError = new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
  const deletedFirst: PublicWebhookInMessage = { ...first, deletedAt: new Date(0), version: first.version + 1 };
  // The read hands back each row with the room and the webhook's creator attached, the way the server answers it
  const room = createRoom("name");
  const creator = createUser();
  const toWebhookInMessageWithRelations = (webhook: PublicWebhookInMessage) => ({ ...webhook, creator, room });

  beforeEach(() => {
    setRouteId(roomId);
  });

  test("files a read's rows under the room it was issued for, not the room scoped when it lands", async () => {
    expect.hasAssertions();

    const { promise: isRoomSwitched, resolve: onRoomSwitched } = Promise.withResolvers<void>();
    trpcMsw.webhook.readWebhooks.query(async () => {
      await isRoomSwitched;
      return [toWebhookInMessageWithRelations(first), toWebhookInMessageWithRelations(second)];
    });
    const webhookStore = useWebhookStore();
    const { readWebhooks } = webhookStore;
    const { items } = storeToRefs(webhookStore);
    const pendingRead = readWebhooks(roomId);
    setRouteId(otherRoomId);
    onRoomSwitched();
    await pendingRead;

    expect(items.value).toStrictEqual([]);

    setRouteId(roomId);

    expect(items.value).toStrictEqual([
      toWebhookInMessageWithRelations(second),
      toWebhookInMessageWithRelations(first),
    ]);
  });

  // The list is the room's live webhooks, newest first, and a deleted one is held as a tombstone that the list leaves out
  test("lists the room's live webhooks newest first, and leaves out a tombstone", async () => {
    expect.hasAssertions();

    trpcMsw.webhook.readWebhooks.query(() =>
      [first, second, deletedFirst].map((webhook) => toWebhookInMessageWithRelations(webhook)),
    );
    const webhookStore = useWebhookStore();
    const { readWebhooks } = webhookStore;
    const { items } = storeToRefs(webhookStore);
    await readWebhooks(roomId);

    expect(items.value).toStrictEqual([toWebhookInMessageWithRelations(second)]);
  });

  // The deletion leaves the list at once, as the tombstone its answer confirms
  test("a deletion leaves the webhook out of the list at once, and its answer is the tombstone", async () => {
    expect.hasAssertions();

    trpcMsw.webhook.readWebhooks.query(() =>
      [first, second].map((webhook) => toWebhookInMessageWithRelations(webhook)),
    );
    trpcMsw.webhook.deleteWebhook.mutation(() => deletedFirst);
    const webhookStore = useWebhookStore();
    const { items } = storeToRefs(webhookStore);
    const { deleteWebhook, readWebhooks } = webhookStore;
    await readWebhooks(roomId);
    deleteWebhook({ id: first.id, roomId });

    expect(items.value).toStrictEqual([toWebhookInMessageWithRelations(second)]);

    await flushPromises();

    expect(items.value).toStrictEqual([toWebhookInMessageWithRelations(second)]);
  });

  // A refused deletion changes nothing held, so the webhook is listed again where it stood
  test("a refused deletion lists the webhook where it stood", async () => {
    expect.hasAssertions();

    trpcMsw.webhook.readWebhooks.query(() =>
      [first, second].map((webhook) => toWebhookInMessageWithRelations(webhook)),
    );
    trpcMsw.webhook.deleteWebhook.mutation(() => {
      throw trpcError;
    });
    const webhookStore = useWebhookStore();
    const { items } = storeToRefs(webhookStore);
    const { deleteWebhook, readWebhooks } = webhookStore;
    await readWebhooks(roomId);
    deleteWebhook({ id: first.id, roomId });
    await flushPromises();

    expect(items.value).toStrictEqual([
      toWebhookInMessageWithRelations(second),
      toWebhookInMessageWithRelations(first),
    ]);
  });

  // A failed read is held as an error rather than an empty list, until a read lands and clears it
  test("holds a failed read as an error until a read lands", async () => {
    expect.hasAssertions();

    let isReadFailing = true;
    trpcMsw.webhook.readWebhooks.query(() => {
      if (isReadFailing) throw trpcError;

      return [toWebhookInMessageWithRelations(first)];
    });
    const webhookStore = useWebhookStore();
    const { isReadError } = storeToRefs(webhookStore);
    const { readWebhooks } = webhookStore;
    await readWebhooks(roomId);

    expect(isReadError.value).toBe(true);

    isReadFailing = false;
    await readWebhooks(roomId);

    expect(isReadError.value).toBe(false);
  });

  // An update names only the fields it changes, so the active switch leaves the name the row shows where it is while
  // Its own write is in flight
  test("an update changes only the fields it names while its write is in flight", async () => {
    expect.hasAssertions();

    const { promise: isUpdateAnswered, resolve: answerUpdate } = Promise.withResolvers<void>();
    trpcMsw.webhook.readWebhooks.query(() => [toWebhookInMessageWithRelations(first)]);
    trpcMsw.webhook.updateWebhook.mutation(async () => {
      await isUpdateAnswered;
      return { ...first, isActive: false, version: first.version + 1 };
    });
    const webhookStore = useWebhookStore();
    const { items } = storeToRefs(webhookStore);
    const { readWebhooks, updateWebhook } = webhookStore;
    await readWebhooks(roomId);
    updateWebhook({ id: first.id, isActive: false, roomId });

    expect(items.value).toStrictEqual([{ ...toWebhookInMessageWithRelations(first), isActive: false }]);

    answerUpdate();
    await flushPromises();
  });
});
