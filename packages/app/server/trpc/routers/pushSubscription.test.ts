import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { PushNotificationEventGridData } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { messageRouter } from "@@/server/trpc/routers/message";
import { pushSubscriptionRouter } from "@@/server/trpc/routers/pushSubscription";
import { roomRouter } from "@@/server/trpc/routers/room";
import { userToRoomRouter } from "@@/server/trpc/routers/userToRoom";
import { NotificationType, pushSubscriptions, rooms } from "@esposter/db-schema";
import { MENTION_ID_ATTRIBUTE, MENTION_TYPE, MENTION_TYPE_ATTRIBUTE } from "@esposter/shared";
import { MockEventGridDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

describe("pushSubscription", () => {
  let pushSubscriptionCaller: DecorateRouterRecord<TRPCRouter["pushSubscription"]>;
  let messageCaller: DecorateRouterRecord<TRPCRouter["message"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let userToRoomCaller: DecorateRouterRecord<TRPCRouter["userToRoom"]>;
  let mockContext: Context;
  const name = "name";
  const message = "message";
  const getMessage = (userId: string) =>
    `<span ${MENTION_TYPE_ATTRIBUTE}="${MENTION_TYPE}" ${MENTION_ID_ATTRIBUTE}="${userId}" />`;
  const endpoint = "https://.";
  const auth = "auth";
  const updatedAuth = "updatedAuth";
  const p256dh = "p256dh";
  const updatedP256dh = "updatedP256dh";

  beforeAll(async () => {
    const createPushSubscriptionCaller = createCallerFactory(pushSubscriptionRouter);
    const createMessageCaller = createCallerFactory(messageRouter);
    const createRoomCaller = createCallerFactory(roomRouter);
    const createUserToRoomCaller = createCallerFactory(userToRoomRouter);
    mockContext = await createMockContext();
    pushSubscriptionCaller = createPushSubscriptionCaller(mockContext);
    messageCaller = createMessageCaller(mockContext);
    roomCaller = createRoomCaller(mockContext);
    userToRoomCaller = createUserToRoomCaller(mockContext);
  });

  afterEach(async () => {
    MockEventGridDatabase.clear();
    MockTableDatabase.clear();
    await mockContext.db.delete(rooms);
    await mockContext.db.delete(pushSubscriptions);
  });

  test("subscribes", async () => {
    expect.hasAssertions();

    const newPushSubscription = await pushSubscriptionCaller.subscribe({
      endpoint,
      expirationTime: null,
      keys: { auth, p256dh },
    });

    expect(newPushSubscription.endpoint).toBe(endpoint);
    expect(newPushSubscription.auth).toBe(auth);
    expect(newPushSubscription.p256dh).toBe(p256dh);
    expect(newPushSubscription.userId).toBe(getMockSession().user.id);
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
    const readPushSubscriptions = await mockContext.db.select().from(pushSubscriptions);

    expect(deletedPushSubscription.id).toBe(pushSubscription.id);
    expect(deletedPushSubscription.endpoint).toBe(endpoint);
    expect(readPushSubscriptions).toHaveLength(0);
  });

  test(`createMessage notifies ${NotificationType.All} member (excludes sender)`, async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await pushSubscriptionCaller.subscribe({ endpoint, keys: { auth, p256dh } });
    await userToRoomCaller.updateUserToRoom({ notificationType: NotificationType.All, roomId: newRoom.id });

    const newInvite = await roomCaller.createInvite({ roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInvite);

    await mockSessionOnce(mockContext.db, user);
    await pushSubscriptionCaller.subscribe({ endpoint, keys: { auth, p256dh } });
    await mockSessionOnce(mockContext.db, user);
    await userToRoomCaller.updateUserToRoom({ notificationType: NotificationType.All, roomId: newRoom.id });

    const newMessage = await messageCaller.createMessage({ message, roomId: newRoom.id });

    const processPushNotificationEvents = MockEventGridDatabase.get("");
    assert(processPushNotificationEvents);

    const mockUser = getMockSession().user;

    expect(processPushNotificationEvents).toHaveLength(1);
    expect(takeOne(processPushNotificationEvents).data as PushNotificationEventGridData).toStrictEqual({
      message: {
        message,
        partitionKey: newRoom.id,
        rowKey: newMessage.rowKey,
        userId: mockUser.id,
      },
      notificationOptions: { icon: mockUser.image, title: mockUser.name },
    });
  });

  test(`createMessage notifies ${NotificationType.DirectMessage} member when mentioned`, async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await pushSubscriptionCaller.subscribe({ endpoint, keys: { auth, p256dh } });

    const newInvite = await roomCaller.createInvite({ roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInvite);

    await mockSessionOnce(mockContext.db, user);
    await pushSubscriptionCaller.subscribe({ endpoint, keys: { auth, p256dh } });

    const message = getMessage(user.id);
    const newMessage = await messageCaller.createMessage({
      message,
      roomId: newRoom.id,
    });

    const processPushNotificationEvents = MockEventGridDatabase.get("");
    assert(processPushNotificationEvents);

    const mockUser = getMockSession().user;

    expect(processPushNotificationEvents).toHaveLength(1);
    expect(takeOne(processPushNotificationEvents).data as PushNotificationEventGridData).toStrictEqual({
      message: {
        message,
        partitionKey: newRoom.id,
        rowKey: newMessage.rowKey,
        userId: mockUser.id,
      },
      notificationOptions: { icon: mockUser.image, title: mockUser.name },
    });
  });

  test(`createMessage does not notify ${NotificationType.DirectMessage} member when not mentioned`, async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await pushSubscriptionCaller.subscribe({ endpoint, keys: { auth, p256dh } });

    const newInvite = await roomCaller.createInvite({ roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInvite);

    await mockSessionOnce(mockContext.db, user);
    await pushSubscriptionCaller.subscribe({ endpoint, keys: { auth, p256dh } });

    await messageCaller.createMessage({ message, roomId: newRoom.id });

    const processPushNotificationEvents = MockEventGridDatabase.get("");

    expect(processPushNotificationEvents).toBeUndefined();
  });

  test(`createMessage does not notify ${NotificationType.Never} member`, async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await pushSubscriptionCaller.subscribe({ endpoint, keys: { auth, p256dh } });

    const newInvite = await roomCaller.createInvite({ roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInvite);

    await mockSessionOnce(mockContext.db, user);
    await pushSubscriptionCaller.subscribe({ endpoint, keys: { auth, p256dh } });
    await mockSessionOnce(mockContext.db, user);
    await userToRoomCaller.updateUserToRoom({ notificationType: NotificationType.Never, roomId: newRoom.id });

    await messageCaller.createMessage({ message: getMessage(user.id), roomId: newRoom.id });

    const processPushNotificationEvents = MockEventGridDatabase.get("");

    expect(processPushNotificationEvents).toBeUndefined();
  });
});
