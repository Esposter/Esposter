import type { AppNotification } from "@/models/notification/AppNotification";
import type { Except } from "type-fest";

import { getIsServer } from "@esposter/shared";
// Session-scoped by design — never persisted; durable history is the activity log's job
export const useNotificationStore = defineStore("notification", () => {
  const notifications = ref<AppNotification[]>([]);
  const isPanelOpen = ref(false);
  const unreadCount = computed(() => notifications.value.filter(({ isRead }) => !isRead).length);
  // One snackbar queue: every pushed notification also toasts, newer ones wait behind the current head
  const snackbarIds = ref<string[]>([]);
  const snackbarNotification = computed(() => notifications.value.find(({ id }) => id === snackbarIds.value[0]));
  const createNotification = (newNotification: Except<AppNotification, "createdAt" | "id" | "isRead">) => {
    if (getIsServer()) return;

    const notification: AppNotification = {
      ...newNotification,
      createdAt: new Date(),
      id: crypto.randomUUID(),
      isRead: false,
    };
    notifications.value = [notification, ...notifications.value];
    snackbarIds.value = [...snackbarIds.value, notification.id];
  };
  // The one shape every mutation error surfaces as, so call sites don't restate it
  const createErrorNotification = (error: Error) => {
    createNotification({ severity: "error", title: error.message });
  };
  const deleteSnackbar = (id: string) => {
    snackbarIds.value = snackbarIds.value.filter((snackbarId) => snackbarId !== id);
  };
  const deleteNotification = (id: string) => {
    notifications.value = notifications.value.filter((notification) => notification.id !== id);
    deleteSnackbar(id);
  };
  const deleteNotifications = () => {
    notifications.value = [];
    snackbarIds.value = [];
  };
  const markAllAsRead = () => {
    notifications.value = notifications.value.map((notification) =>
      notification.isRead ? notification : { ...notification, isRead: true },
    );
  };
  return {
    createErrorNotification,
    createNotification,
    deleteNotification,
    deleteNotifications,
    deleteSnackbar,
    isPanelOpen,
    markAllAsRead,
    notifications,
    snackbarNotification,
    unreadCount,
  };
});
