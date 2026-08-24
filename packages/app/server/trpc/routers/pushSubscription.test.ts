import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { PushNotificationEventGridData } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { createMentionMessage } from "@@/server/trpc/routers/createMentionMessage.test";
import { messageRouter } from "@@/server/trpc/routers/message";
import { pushSubscriptionRouter } from "@@/server/trpc/routers/pushSubscription";
import { roomRouter } from "@@/server/trpc/routers/room";
import { userToRoomRouter } from "@@/server/trpc/routers/userToRoom";
import { AzureFunction, NotificationType, pushSubscriptionsInMessage, roomsInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockEventGridDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

// What the Azure Function receives: the message as stored plus the sender rendered as the notification's title
// And icon, which is the whole contract between the two
const createPushNotificationData = (
  messageText: string,
  partitionKey: string,
  rowKey: string,
): PushNotificationEventGridData => {
  const sender = getMockSession().user;
  return {
    message: { message: messageText, partitionKey, rowKey, userId: sender.id },
    notificationOptions: { icon: sender.image, title: sender.name },
  };
};

describe("pushSubscription", () => {
  let mockContext: Context;
  let pushSubscriptionCaller: DecorateRouterRecord<TRPCRouter["pushSubscription"]>;
  let messageCaller: DecorateRouterRecord<TRPCRouter["message"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let userToRoomCaller: DecorateRouterRecord<TRPCRouter["userToRoom"]>;
  const name = "name";
  const message = "message";
  const endpoint = "https://.";
  const auth = "auth";
  const updatedAuth = "updatedAuth";
  const p256dh = "p256dh";
  const updatedP256dh = "updatedP256dh";

  // A second member of the room, subscribed to push and opted into what the test is about, with the session
  // Left back on the owner — the sender every notification test posts as
  const joinSubscribedMember = async (roomId: string, notificationType?: NotificationType) => {
    const newInvite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInvite.id);
    await mockSessionOnce(mockContext.db, user);
    await pushSubscriptionCaller.subscribe({ endpoint, keys: { auth, p256dh } });
    if (notificationType) {
      await mockSessionOnce(mockContext.db, user);
      await userToRoomCaller.updateUserToRoom({ notificationType, roomId });
    }
    return user;
  };

  beforeAll(async () => {
    mockContext = await createMockContext();
    pushSubscriptionCaller = createCallerFactory(pushSubscriptionRouter)(mockContext);
    messageCaller = createCallerFactory(messageRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
    userToRoomCaller = createCallerFactory(userToRoomRouter)(mockContext);
  });

  afterEach(async () => {
    MockEventGridDatabase.clear();
    MockTableDatabase.clear();
    await mockContext.db.delete(roomsInMessage);
    await mockContext.db.delete(pushSubscriptionsInMessage);
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
    const pushSubscription = await pushSubscriptionCaller.subscribe({ endpoint, keys: { auth, p256dh } });
    const deletedPushSubscription = await pushSubscriptionCaller.unsubscribe(endpoint);

    expect(deletedPushSubscription.id).toBe(pushSubscription.id);
    expect(deletedPushSubscription.endpoint).toBe(endpoint);
  });

  test(`createMessage notifies ${NotificationType.All} member (excludes sender)`, async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await pushSubscriptionCaller.subscribe({ endpoint, keys: { auth, p256dh } });
    await userToRoomCaller.updateUserToRoom({ notificationType: NotificationType.All, roomId: newRoom.id });

    await joinSubscribedMember(newRoom.id, NotificationType.All);

    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });

    const processPushNotificationEvents = MockEventGridDatabase.get("");
    assert(processPushNotificationEvents);

    expect(processPushNotificationEvents).toHaveLength(1);
    expect(takeOne(processPushNotificationEvents).data).toStrictEqual(
      createPushNotificationData(message, newRoom.id, newMessage.rowKey),
    );
  });

  test(`createMessage notifies ${NotificationType.DirectMessage} member when mentioned`, async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await pushSubscriptionCaller.subscribe({ endpoint, keys: { auth, p256dh } });

    const user = await joinSubscribedMember(newRoom.id);

    const messageText = createMentionMessage(user.id);
    const newMessage = await messageCaller.createMessage({
      message: messageText,
      roomId: newRoom.id,
    });

    const processPushNotificationEvents = MockEventGridDatabase.get("");
    assert(processPushNotificationEvents);

    expect(processPushNotificationEvents).toHaveLength(1);
    expect(takeOne(processPushNotificationEvents).data).toStrictEqual(
      createPushNotificationData(messageText, newRoom.id, newMessage.rowKey),
    );
  });

  test(`createMessage does not notify ${NotificationType.DirectMessage} member when not mentioned`, async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await pushSubscriptionCaller.subscribe({ endpoint, keys: { auth, p256dh } });

    await joinSubscribedMember(newRoom.id);

    await messageCaller.createMessage({ message, roomId: newRoom.id });

    const processPushNotificationEvents = MockEventGridDatabase.get("");

    expect(processPushNotificationEvents).toBeUndefined();
  });

  test(`createMessage does not notify ${NotificationType.Never} member`, async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await pushSubscriptionCaller.subscribe({ endpoint, keys: { auth, p256dh } });

    const user = await joinSubscribedMember(newRoom.id, NotificationType.Never);

    await messageCaller.createMessage({ message: createMentionMessage(user.id), roomId: newRoom.id });

    const processPushNotificationEvents = MockEventGridDatabase.get("");

    expect(processPushNotificationEvents).toBeUndefined();
  });

  test(`createMessage reply notifies a thread follower who is also a ${NotificationType.All} member only once`, async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const user = await joinSubscribedMember(newRoom.id, NotificationType.All);

    // The owner posts a thread root the follower follows.
    const root = await messageCaller.createMessage({ message, roomId: newRoom.id });
    await mockSessionOnce(mockContext.db, user);
    await messageCaller.followThread({ roomId: newRoom.id, threadRootRowKey: root.rowKey });

    // Ignore the root message's push; assert only on the reply.
    MockEventGridDatabase.clear();

    const reply = await messageCaller.createMessage({ message, replyRowKey: root.rowKey, roomId: newRoom.id });

    const events = MockEventGridDatabase.get("");
    assert(events);

    // Reached once — by the generic message push; the thread-reply push excludes them, so no second event fires.
    expect(events).toHaveLength(1);
    expect(takeOne(events).eventType).toBe(AzureFunction.ProcessPushNotification);
    expect(takeOne(events).data).toStrictEqual(createPushNotificationData(message, newRoom.id, reply.rowKey));
  });
});
