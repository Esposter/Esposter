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

    await expect(caller.deleteNotification(firstId)).resolves.toBe(1);
  });
});
