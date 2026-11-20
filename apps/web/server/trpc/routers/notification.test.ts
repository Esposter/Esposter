import type { Context } from "#server/trpc/context";

import { createMockAuthSession, createMockCaller, createMockContext } from "#server/trpc/context.test";
import { notificationRouter } from "#server/trpc/routers/notification";
import { AppNotificationType, NotificationSeverity, notificationsInNotification } from "@esposter/db-schema";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

// Notifications are written by the notification job, so a test writes the rows it reads
const createNotificationRow = (id: string, userId: string, isRead = false) => ({
  id,
  isRead,
  severity: NotificationSeverity.Info,
  title: "title",
  type: AppNotificationType.Message,
  userId,
});

describe("notificationRouter", () => {
  let mockContext: Context;
  const firstId = "00000000-0000-7000-8000-000000000001";
  const secondId = "00000000-0000-7000-8000-000000000002";
  const thirdId = "00000000-0000-7000-8000-000000000003";

  beforeAll(async () => {
    mockContext = await createMockContext();
  });

  afterEach(async () => {
    await mockContext.db.delete(notificationsInNotification);
  });

  test("reads the list to its end newest first, with the unread total on the first page only", async () => {
    expect.hasAssertions();

    const authSession = await createMockAuthSession(mockContext.db);
    const caller = await createMockCaller(notificationRouter, authSession);
    await mockContext.db
      .insert(notificationsInNotification)
      .values([
        createNotificationRow(firstId, authSession.user.id),
        createNotificationRow(secondId, authSession.user.id, true),
        createNotificationRow(thirdId, authSession.user.id),
      ]);
    const firstPage = await caller.readNotifications({ limit: 2 });
    const secondPage = await caller.readNotifications({ cursor: firstPage.nextCursor, limit: 2 });

    expect(firstPage.items.map(({ id }) => id)).toStrictEqual([thirdId, secondId]);
    expect(firstPage.unreadCount).toBe(2);
    expect(secondPage.items.map(({ id }) => id)).toStrictEqual([firstId]);
    expect(secondPage.nextCursor).toBe("");
    expect(secondPage).not.toHaveProperty("unreadCount");
  });

  test("answers the unread count the delete leaves", async () => {
    expect.hasAssertions();

    const authSession = await createMockAuthSession(mockContext.db);
    const caller = await createMockCaller(notificationRouter, authSession);
    await mockContext.db
      .insert(notificationsInNotification)
      .values([
        createNotificationRow(firstId, authSession.user.id),
        createNotificationRow(secondId, authSession.user.id),
      ]);

    const { unreadCount } = await caller.deleteNotification(firstId);

    expect(unreadCount).toBe(1);
  });

  // A dismissal leaves the row as a tombstone the read returns, so a read that lands later cannot bring it back, and the
  // Answer names the row it left
  test("keeps a dismissed notification as a tombstone the read returns, and answers the row with the unread count", async () => {
    expect.hasAssertions();

    const authSession = await createMockAuthSession(mockContext.db);
    const caller = await createMockCaller(notificationRouter, authSession);
    await mockContext.db
      .insert(notificationsInNotification)
      .values([
        createNotificationRow(firstId, authSession.user.id),
        createNotificationRow(secondId, authSession.user.id),
      ]);
    const { notification, unreadCount } = await caller.deleteNotification(firstId);
    const { items } = await caller.readNotifications({});

    expect(notification.deletedAt).toStrictEqual(expect.any(Date));
    expect(unreadCount).toBe(1);
    expect(items.map(({ deletedAt, id }) => ({ id, isDismissed: deletedAt instanceof Date }))).toStrictEqual([
      { id: secondId, isDismissed: false },
      { id: firstId, isDismissed: true },
    ]);
  });

  test("dismisses every notification as a tombstone the read returns, and answers a count of zero", async () => {
    expect.hasAssertions();

    const authSession = await createMockAuthSession(mockContext.db);
    const caller = await createMockCaller(notificationRouter, authSession);
    await mockContext.db
      .insert(notificationsInNotification)
      .values([
        createNotificationRow(firstId, authSession.user.id),
        createNotificationRow(secondId, authSession.user.id, true),
      ]);

    await expect(caller.deleteNotifications()).resolves.toBe(0);
    const { items } = await caller.readNotifications({});

    expect(items.map(({ deletedAt }) => deletedAt instanceof Date)).toStrictEqual([true, true]);
  });

  test("marks every unread notification read and answers the unread count the update leaves", async () => {
    expect.hasAssertions();

    const authSession = await createMockAuthSession(mockContext.db);
    const caller = await createMockCaller(notificationRouter, authSession);
    await mockContext.db
      .insert(notificationsInNotification)
      .values([
        createNotificationRow(firstId, authSession.user.id),
        createNotificationRow(secondId, authSession.user.id),
      ]);

    await expect(caller.updateNotificationsReadStatus()).resolves.toBe(0);
    expect((await caller.readNotifications({})).unreadCount).toBe(0);
  });
});
