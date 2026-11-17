// @vitest-environment nuxt
import type { AppNotification } from "#src/models/notification/AppNotification";

import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useNotificationStore } from "#src/store/notification";
import { NotificationSeverity } from "@esposter/db-schema";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { assert, beforeEach, describe, expect, test } from "vitest";

describe(useNotificationStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const title = "title";
  const epoch = new Date(0);
  const nextDay = new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds"));
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

  test("deletes a notification and its queued snackbar", () => {
    expect.hasAssertions();

    const { createNotification, dismissNotification } = notificationStore;
    createNotification({ severity: NotificationSeverity.Info, title });
    const notification = notifications.value.find(({ title: notificationTitle }) => notificationTitle === title);
    assert.exists(notification);
    dismissNotification(notification.id);

    expect(notifications.value).toStrictEqual([]);
    expect(snackbarNotification.value).toBeUndefined();
  });

  test("dismisses a snackbar without deleting the notification", () => {
    expect.hasAssertions();

    const { createNotification, dismissSnackbar } = notificationStore;
    createNotification({ severity: NotificationSeverity.Warning, title });
    const notification = notifications.value.find(({ title: notificationTitle }) => notificationTitle === title);
    assert.exists(notification);
    dismissSnackbar(notification.id);

    expect(snackbarNotification.value).toBeUndefined();
    expect(notifications.value).toHaveLength(1);
  });

  test("deletes all notifications", async () => {
    expect.hasAssertions();

    trpcMsw.notification.deleteNotifications.mutation(() => 0);
    const { createNotification, dismissNotifications } = notificationStore;
    createNotification({ severity: NotificationSeverity.Success, title });
    createNotification({ severity: NotificationSeverity.Error, title });
    dismissNotifications();
    await flushPromises();

    expect(notifications.value).toStrictEqual([]);
    expect(unreadCount.value).toBe(0);
    expect(snackbarNotification.value).toBeUndefined();
  });

  // The delivered half is paginated, so a badge counting loaded rows reads low for every unread row still on a
  // Page the panel has not scrolled to
  test("counts the unread total the server stated, not the rows a page holds", () => {
    expect.hasAssertions();

    const { createNotification, setUnreadDeliveredCount } = notificationStore;
    setUnreadDeliveredCount(1);
    createNotification({ severity: NotificationSeverity.Info, title });

    expect(unreadCount.value).toBe(2);
  });

  // A push re-reads the whole first page, so the rows that just arrived are the ones newer than the newest row the
  // Tab already held — never the newest row overall, which is the local notification created while it is in
  // Flight, and which toasts when it is created. The stored timestamps keep milliseconds, as a `Date` does,
  // So a row can tie with the watermark and still be one that just arrived: the ids the tab already held are what
  // Settle those ties, and `held` staying silent is that exclusion
  test("toasts every delivered row a push brought back, oldest first", async () => {
    expect.hasAssertions();

    const { createNotification, dismissSnackbar, readItems, storeDeliveredNotifications } = notificationStore;
    const heldNotification = createDeliveredNotification(v7(), epoch);
    const tiedNotification = createDeliveredNotification(v7(), epoch);
    const newestNotification = createDeliveredNotification(v7(), nextDay);
    await readItems(() => Promise.resolve({ items: [heldNotification], nextCursor: "" }));
    createNotification({ severity: NotificationSeverity.Info, title });
    const [localNotification] = notifications.value;
    assert.exists(localNotification);
    dismissSnackbar(localNotification.id);

    storeDeliveredNotifications(() =>
      readItems(() =>
        Promise.resolve({ items: [newestNotification, tiedNotification, heldNotification], nextCursor: "" }),
      ),
    );
    await flushPromises();

    expect(snackbarNotification.value?.id).toBe(tiedNotification.id);

    dismissSnackbar(tiedNotification.id);

    expect(snackbarNotification.value?.id).toBe(newestNotification.id);
  });

  // Two pushes landing together each snapshot the list before their read and compare against it after, so
  // Unqueued the second claims the row the first already brought back — and toasts it again, after the user has
  // Dismissed it. Queued, the second reads a list that already holds the row and stays silent
  test("does not re-toast a dismissed row when two pushes overlap", async () => {
    expect.hasAssertions();

    const { dismissSnackbar, readItems, storeDeliveredNotifications } = notificationStore;
    const heldNotification = createDeliveredNotification(v7(), epoch);
    await readItems(() => Promise.resolve({ items: [heldNotification], nextCursor: "" }));
    const pushedNotification = createDeliveredNotification(v7(), nextDay);
    const storePushedPage = () =>
      readItems(() => Promise.resolve({ items: [pushedNotification, heldNotification], nextCursor: "" }));
    // Both reads are held open, and each stores its page only once its own response lands — the shape a network
    // Read has, and the one that lets the second call snapshot the list before the first has grown it. The second
    // Response is released after the dismissal below, which is the only interleaving where a duplicate enqueue is
    // Visible: two toasts for one row otherwise collapse when either is dismissed
    const { promise: firstResponse, resolve: completeFirstRead } = Promise.withResolvers<void>();
    const { promise: secondResponse, resolve: completeSecondRead } = Promise.withResolvers<void>();
    storeDeliveredNotifications(async () => {
      await firstResponse;
      await storePushedPage();
    });
    storeDeliveredNotifications(async () => {
      await secondResponse;
      await storePushedPage();
    });
    completeFirstRead();
    await flushPromises();

    expect(snackbarNotification.value?.id).toBe(pushedNotification.id);

    dismissSnackbar(pushedNotification.id);
    completeSecondRead();
    // Nothing the second read waits on is I/O once released, so one flush runs it to its end before the check
    await flushPromises();

    expect(snackbarNotification.value).toBeUndefined();
  });

  // The total moves for display as the row leaves, and the count the delete answers is the one the bell keeps
  test("settles the unread total on the count the server answers for a delete", async () => {
    expect.hasAssertions();

    const notification = createDeliveredNotification(v7(), epoch);
    trpcMsw.notification.deleteNotification.mutation(() => 5);
    const { readItems, setUnreadDeliveredCount } = notificationStore;
    await readItems(() => Promise.resolve({ items: [notification], nextCursor: "" }));
    setUnreadDeliveredCount(1);
    notificationStore.dismissNotification(notification.id);
    await flushPromises();

    expect(unreadCount.value).toBe(5);
  });

  test("marks all notifications as read", () => {
    expect.hasAssertions();

    const { createNotification, markAllAsRead } = notificationStore;
    createNotification({ severity: NotificationSeverity.Success, title });
    createNotification({ severity: NotificationSeverity.Info, title });
    markAllAsRead();

    expect(unreadCount.value).toBe(0);
    expect(notifications.value.every(({ isRead }) => isRead)).toBe(true);
  });
});
