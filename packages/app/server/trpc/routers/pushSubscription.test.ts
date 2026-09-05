import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { MessageNotificationData } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession } from "@@/server/trpc/context.test";
import { messageRouter } from "@@/server/trpc/routers/message";
import { pushSubscriptionRouter } from "@@/server/trpc/routers/pushSubscription";
import { roomRouter } from "@@/server/trpc/routers/room";
import { AppNotificationType, AzureFunction, pushSubscriptions, roomsInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockEventGridDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

// What the Azure Function receives: the message as stored, and the thread root when the send was a reply.
// Recipients are resolved at delivery from these fields alone, against the rules getMessageRecipientUserIds owns
const createMessageNotificationData = (
  messageText: string,
  partitionKey: string,
  rowKey: string,
  threadRootRowKey?: string,
): MessageNotificationData => ({
  message: { message: messageText, partitionKey, rowKey, userId: getMockSession().user.id },
  threadRootRowKey,
  type: AppNotificationType.Message,
});

describe("pushSubscription", () => {
  let mockContext: Context;
  let pushSubscriptionCaller: DecorateRouterRecord<TRPCRouter["pushSubscription"]>;
  let messageCaller: DecorateRouterRecord<TRPCRouter["message"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  const name = "name";
  const message = "message";
  const endpoint = "https://.";
  const auth = "auth";
  const updatedAuth = "updatedAuth";
  const p256dh = "p256dh";
  const updatedP256dh = "updatedP256dh";

  beforeAll(async () => {
    mockContext = await createMockContext();
    pushSubscriptionCaller = createCallerFactory(pushSubscriptionRouter)(mockContext);
    messageCaller = createCallerFactory(messageRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  afterEach(async () => {
    MockEventGridDatabase.clear();
    MockTableDatabase.clear();
    await mockContext.db.delete(roomsInMessage);
    await mockContext.db.delete(pushSubscriptions);
  });

  test("subscribes", async () => {
    expect.hasAssertions();

    const newPushSubscription = await pushSubscriptionCaller.subscribe({
      endpoint,
      expirationTime: null,
      keys: { auth, p256dh },
    });
    const userId = getMockSession().user.id;

    expect(newPushSubscription.endpoint).toBe(endpoint);
    expect(newPushSubscription.auth).toBe(auth);
    expect(newPushSubscription.p256dh).toBe(p256dh);
    expect(newPushSubscription.userId).toBe(userId);
  });

  test("subscribes updates existing endpoint", async () => {
    expect.hasAssertions();
    const newPushSubscription = await pushSubscriptionCaller.subscribe({ endpoint, keys: { auth, p256dh } });
    const updatedPushSubscription = await pushSubscriptionCaller.subscribe({
      endpoint,
      keys: { auth: updatedAuth, p256dh: updatedP256dh },
    });

    expect(updatedPushSubscription.id).toBe(newPushSubscription.id);
    expect(updatedPushSubscription.auth).toBe(updatedAuth);
    expect(updatedPushSubscription.p256dh).toBe(updatedP256dh);
  });

  test("unsubscribes", async () => {
    expect.hasAssertions();
    const newPushSubscription = await pushSubscriptionCaller.subscribe({ endpoint, keys: { auth, p256dh } });
    const deletedPushSubscription = await pushSubscriptionCaller.unsubscribe(endpoint);

    expect(deletedPushSubscription.id).toBe(newPushSubscription.id);
    expect(deletedPushSubscription.endpoint).toBe(endpoint);
  });

  test("createMessage publishes one notification", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    const events = MockEventGridDatabase.get("");
    assert(events);

    // Published unconditionally: whether anyone is subscribed is not a question the request path asks
    expect(events).toHaveLength(1);
    expect(takeOne(events).eventType).toBe(AzureFunction.ProcessNotification);
    expect(takeOne(events).data).toStrictEqual(createMessageNotificationData(message, newRoom.id, newMessage.rowKey));
  });

  test("createMessage reply publishes one notification carrying the thread root", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newRootMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });
    // Ignore the root message's notification; assert only on the reply
    MockEventGridDatabase.clear();

    const newReplyMessage = await messageCaller.createMessage({
      message,
      replyRowKey: newRootMessage.rowKey,
      roomId: newRoom.id,
    });
    const events = MockEventGridDatabase.get("");
    assert(events);

    // One event rather than two: a thread's followers widen the reply's recipient set instead of raising a
    // Second notification that the first has to be de-duplicated against
    expect(events).toHaveLength(1);
    expect(takeOne(events).data).toStrictEqual(
      createMessageNotificationData(message, newRoom.id, newReplyMessage.rowKey, newRootMessage.rowKey),
    );
  });
});
