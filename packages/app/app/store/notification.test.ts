// @vitest-environment nuxt
import type { AppNotification } from "@/models/notification/AppNotification";
import type { ComputedRef, Ref } from "vue";

import { useNotificationStore } from "@/store/notification";
import { createPinia, setActivePinia } from "pinia";
import { assert, beforeEach, describe, expect, test } from "vitest";

describe(useNotificationStore, () => {
  const title = "title";
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
    createNotification({ severity: "success", title });
    createNotification({ severity: "error", title: " " });

    expect(notifications.value.map(({ title: notificationTitle }) => notificationTitle)).toStrictEqual([" ", title]);
    expect(unreadCount.value).toBe(2);
    // The snackbar queue is FIFO, so the first created notification toasts first
    expect(snackbarNotification.value?.title).toBe(title);
  });

  test("deletes a notification and its queued snackbar", () => {
    expect.hasAssertions();

    const { createNotification, deleteNotification } = notificationStore;
    createNotification({ severity: "info", title });
    const notification = notifications.value.find(({ title: notificationTitle }) => notificationTitle === title);
    assert.exists(notification);
    deleteNotification(notification.id);

    expect(notifications.value).toStrictEqual([]);
    expect(snackbarNotification.value).toBeUndefined();
  });

  test("dismisses a snackbar without deleting the notification", () => {
    expect.hasAssertions();

    const { createNotification, deleteSnackbar } = notificationStore;
    createNotification({ severity: "warning", title });
    const notification = notifications.value.find(({ title: notificationTitle }) => notificationTitle === title);
    assert.exists(notification);
    deleteSnackbar(notification.id);

    expect(snackbarNotification.value).toBeUndefined();
    expect(notifications.value).toHaveLength(1);
  });

  test("deletes all notifications", () => {
    expect.hasAssertions();

    const { createNotification, deleteNotifications } = notificationStore;
    createNotification({ severity: "success", title });
    createNotification({ severity: "error", title });
    deleteNotifications();

    expect(notifications.value).toStrictEqual([]);
    expect(unreadCount.value).toBe(0);
    expect(snackbarNotification.value).toBeUndefined();
  });

  test("marks all notifications as read", () => {
    expect.hasAssertions();

    const { createNotification, markAllAsRead } = notificationStore;
    createNotification({ severity: "success", title });
    createNotification({ severity: "info", title });
    markAllAsRead();

    expect(unreadCount.value).toBe(0);
    expect(notifications.value.every(({ isRead }) => isRead)).toBe(true);
  });
});
