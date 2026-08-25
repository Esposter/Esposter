// @vitest-environment nuxt
import type { AppNotification } from "@/models/notification/AppNotification";
import type { ComputedRef, Ref } from "vue";

import { useNotificationStore } from "@/store/notification";
import { NotificationSeverity } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { assert, beforeEach, describe, expect, test } from "vitest";

describe(useNotificationStore, () => {
  const title = "title";
  const createDeliveredNotification = (id: string, createdAt: Date): AppNotification => ({
    body: "",
    createdAt,
    id,
    isRead: false,
    path: "",
    severity: NotificationSeverity.Info,
    title,
  });
  let notificationStore: ReturnType<typeof useNotificationStore>;
  let notifications: Ref<AppNotification[]>;
  let snackbarNotification: ComputedRef<AppNotification | undefined>;
  let unreadCount: ComputedRef<number>;

  beforeEach(() => {
    setActivePinia(createPinia());
    notificationStore = useNotificationStore();
    ({ notifications, snackbarNotification, unreadCount } = storeToRefs(notificationStore));
  });

  test("creates notifications newest first with a queued snackbar", () => {
    expect.hasAssertions();

    const { createNotification } = notificationStore;
    createNotification({ severity: NotificationSeverity.Success, title });
    createNotification({ severity: NotificationSeverity.Error, title: " " });

    expect(notifications.value.map(({ title: notificationTitle }) => notificationTitle)).toStrictEqual([" ", title]);
    expect(unreadCount.value).toBe(2);
    // The snackbar queue is FIFO, so the first created notification toasts first
    expect(snackbarNotification.value?.title).toBe(title);
  });

  test("deletes a notification and its queued snackbar", async () => {
    expect.hasAssertions();

    const { createNotification, deleteNotification } = notificationStore;
    createNotification({ severity: NotificationSeverity.Info, title });
    const notification = notifications.value.find(({ title: notificationTitle }) => notificationTitle === title);
    assert.exists(notification);
    await deleteNotification(notification.id);

    expect(notifications.value).toStrictEqual([]);
    expect(snackbarNotification.value).toBeUndefined();
  });

  test("dismisses a snackbar without deleting the notification", () => {
    expect.hasAssertions();

    const { createNotification, deleteSnackbar } = notificationStore;
    createNotification({ severity: NotificationSeverity.Warning, title });
    const notification = notifications.value.find(({ title: notificationTitle }) => notificationTitle === title);
    assert.exists(notification);
    deleteSnackbar(notification.id);

    expect(snackbarNotification.value).toBeUndefined();
    expect(notifications.value).toHaveLength(1);
  });

  test("deletes all notifications", async () => {
    expect.hasAssertions();

    const { createNotification, deleteNotifications } = notificationStore;
    createNotification({ severity: NotificationSeverity.Success, title });
    createNotification({ severity: NotificationSeverity.Error, title });
    await deleteNotifications();

    expect(notifications.value).toStrictEqual([]);
    expect(unreadCount.value).toBe(0);
    expect(snackbarNotification.value).toBeUndefined();
  });

  // The delivered half is paginated, so a badge counting loaded rows reads low for every unread row still on a
  // Page the panel has not scrolled to
  test("counts the unread total the server stated, not the rows a page holds", () => {
    expect.hasAssertions();

    const { createNotification, storeUnreadCount } = notificationStore;
    storeUnreadCount(3);
    createNotification({ severity: NotificationSeverity.Info, title });

    expect(unreadCount.value).toBe(4);
  });

  // A push re-reads the whole first page, so the rows that just arrived are the ones newer than the newest row the
  // Tab already held — never the newest row overall, which is the local notification created while it was in
  // Flight, and which toasted when it was created. Postgres writes microseconds and a `Date` keeps milliseconds,
  // So a row can tie with the watermark and still be one that just arrived: the ids the tab already held are what
  // Settle those ties, and `held` staying silent is that exclusion
  test("toasts every delivered row a push brought back, oldest first", async () => {
    expect.hasAssertions();

    const { createNotification, deleteSnackbar, initializeCursorPaginationData, storeDeliveredNotifications } =
      notificationStore;
    const heldNotification = createDeliveredNotification("held", new Date(1));
    initializeCursorPaginationData({ hasMore: false, items: [heldNotification], nextCursor: "" });
    createNotification({ severity: NotificationSeverity.Info, title });
    const [localNotification] = notifications.value;
    assert.exists(localNotification);
    deleteSnackbar(localNotification.id);

    await storeDeliveredNotifications(() => {
      initializeCursorPaginationData({
        hasMore: false,
        items: [
          createDeliveredNotification("newest", new Date(3)),
          createDeliveredNotification("tied", new Date(1)),
          heldNotification,
        ],
        nextCursor: "",
      });
      return Promise.resolve();
    });

    expect(snackbarNotification.value?.id).toBe("tied");
    deleteSnackbar("tied");

    expect(snackbarNotification.value?.id).toBe("newest");
  });

  // Two pushes landing together each snapshot the list before their read and compare against it after, so
  // Unqueued the second claims the row the first already brought back — and toasts it again, after the user has
  // Dismissed it. Queued, the second reads a list that already holds the row and stays silent
  test("does not re-toast a dismissed row when two pushes overlap", async () => {
    expect.hasAssertions();

    const { deleteSnackbar, initializeCursorPaginationData, storeDeliveredNotifications } = notificationStore;
    const heldNotification = createDeliveredNotification("held", new Date(1));
    initializeCursorPaginationData({ hasMore: false, items: [heldNotification], nextCursor: "" });
    const pushedNotification = createDeliveredNotification("pushed", new Date(2));
    const storePushedPage = () => {
      initializeCursorPaginationData({ hasMore: false, items: [pushedNotification, heldNotification], nextCursor: "" });
    };
    // Both reads are held open, and each stores its page only once its own response lands — the shape a network
    // Read has, and the one that lets the second call snapshot the list before the first has grown it. The second
    // Response is released after the dismissal below, which is the only interleaving where a duplicate enqueue is
    // Visible: two toasts for one row otherwise collapse when either is dismissed
    const { promise: firstResponse, resolve: completeFirstRead } = Promise.withResolvers<void>();
    const { promise: secondResponse, resolve: completeSecondRead } = Promise.withResolvers<void>();
    const firstStore = storeDeliveredNotifications(async () => {
      await firstResponse;
      storePushedPage();
    });
    const secondStore = storeDeliveredNotifications(async () => {
      await secondResponse;
      storePushedPage();
    });
    completeFirstRead();
    await firstStore;

    expect(snackbarNotification.value?.id).toBe(pushedNotification.id);

    deleteSnackbar(pushedNotification.id);
    completeSecondRead();
    await secondStore;

    expect(snackbarNotification.value).toBeUndefined();
  });

  test("marks all notifications as read", async () => {
    expect.hasAssertions();

    const { createNotification, markAllAsRead } = notificationStore;
    createNotification({ severity: NotificationSeverity.Success, title });
    createNotification({ severity: NotificationSeverity.Info, title });
    await markAllAsRead();

    expect(unreadCount.value).toBe(0);
    expect(notifications.value.every(({ isRead }) => isRead)).toBe(true);
  });
});
