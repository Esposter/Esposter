import type { AppNotification } from "@/models/notification/AppNotification";
import type { Except, SetOptional } from "type-fest";

import { DatabaseEntityType, NotificationSeverity } from "@esposter/db-schema";
import { getIsServer } from "@esposter/shared";

// The bell renders two kinds of notification and owns the difference between them. A **delivered** one is a row
// The server wrote for this user — it reached every device that was subscribed, it survives the reload, and it is
// Paged in like any other list. A **local** one is feedback about what this tab just did: a mutation error, a save
// Conflict, an export that finished here. Nothing on another device could act on it and nothing needs it after the
// Reload, so it is never written down — which is also why only the delivered half is paginated.
export const useNotificationStore = defineStore("notification", () => {
  const { $trpc } = useNuxtApp();
  const { items: deliveredNotifications, ...restData } = useCursorPaginationData<AppNotification>();
  const { executeMutation: executeDeleteNotificationMutation } = useMutation();
  const { executeMutation: executeDeleteNotificationsMutation } = useMutation();
  const { executeMutation: executeReadStatusMutation } = useMutation();
  const localNotifications = ref<AppNotification[]>([]);
  // Sorted at display time rather than kept in order by every writer: the two halves arrive independently — a
  // Page appends, a local notification prepends — and only the rendered list has an opinion about their order
  const notifications = computed(() =>
    [...localNotifications.value, ...deliveredNotifications.value].toSorted(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    ),
  );
  const isPanelOpen = ref(false);
  const unreadCount = computed(() => notifications.value.filter(({ isRead }) => !isRead).length);
  // One snackbar queue: every pushed notification also toasts, newer ones wait behind the current head
  const snackbarIds = ref<string[]>([]);
  const snackbarNotification = computed(() => notifications.value.find(({ id }) => id === snackbarIds.value[0]));
  const createSnackbar = (id: string) => {
    snackbarIds.value = [...snackbarIds.value, id];
  };
  const createNotification = (
    newNotification: SetOptional<Except<AppNotification, "createdAt" | "id" | "isRead">, "body" | "path">,
  ) => {
    if (getIsServer()) return;

    const notification: AppNotification = {
      body: "",
      path: "",
      ...newNotification,
      createdAt: new Date(),
      id: crypto.randomUUID(),
      isRead: false,
    };
    localNotifications.value = [notification, ...localNotifications.value];
    createSnackbar(notification.id);
  };
  // The one shape every mutation error surfaces as, so call sites don't restate it
  const createErrorNotification = (error: Error) => {
    createNotification({ severity: NotificationSeverity.Error, title: error.message });
  };
  const deleteSnackbar = (id: string) => {
    snackbarIds.value = snackbarIds.value.filter((snackbarId) => snackbarId !== id);
  };
  // A single-use action is spent once it has succeeded — the notification stays as history, but the
  // Button must not offer a second, now-invalid fire from the bell panel. No-op for repeatable actions,
  // And for a delivered notification, which carries a deep link rather than a handler
  const consumeNotificationAction = (id: string) => {
    localNotifications.value = localNotifications.value.map((notification) => {
      if (notification.id !== id || !notification.action?.isSingleUse) return notification;
      const consumedNotification = { ...notification };
      delete consumedNotification.action;
      return consumedNotification;
    });
  };
  const deleteNotification = async (id: string) => {
    deleteSnackbar(id);
    const localNotification = localNotifications.value.find((notification) => notification.id === id);
    // A local notification has no row to delete, so dismissing it is the whole operation
    if (localNotification) {
      localNotifications.value = localNotifications.value.filter((notification) => notification.id !== id);
      return;
    }

    await executeDeleteNotificationMutation(() => $trpc.notification.deleteNotification.mutate(id), {
      applyOptimistic: () => {
        const previousNotifications = deliveredNotifications.value;
        deliveredNotifications.value = previousNotifications.filter((notification) => notification.id !== id);
        return () => {
          deliveredNotifications.value = previousNotifications;
        };
      },
      key: id,
    });
  };
  const deleteNotifications = async () => {
    localNotifications.value = [];
    snackbarIds.value = [];
    await executeDeleteNotificationsMutation(() => $trpc.notification.deleteNotifications.mutate(), {
      applyOptimistic: () => {
        const previousNotifications = deliveredNotifications.value;
        deliveredNotifications.value = [];
        return () => {
          deliveredNotifications.value = previousNotifications;
        };
      },
      key: DatabaseEntityType.Notification,
    });
  };
  const markAllAsRead = async () => {
    // Copy-on-write is the point: the array and every changed row are replaced so the computed re-evaluates
    // oxlint-disable-next-line no-map-spread -- see above
    localNotifications.value = localNotifications.value.map((notification) =>
      notification.isRead ? notification : { ...notification, isRead: true },
    );
    if (deliveredNotifications.value.every(({ isRead }) => isRead)) return;

    await executeReadStatusMutation(() => $trpc.notification.updateNotificationsReadStatus.mutate(), {
      applyOptimistic: () => {
        const previousNotifications = deliveredNotifications.value;
        deliveredNotifications.value = previousNotifications.map((notification) =>
          notification.isRead ? notification : { ...notification, isRead: true },
        );
        return () => {
          deliveredNotifications.value = previousNotifications;
        };
      },
      key: DatabaseEntityType.Notification,
    });
  };
  return {
    ...restData,
    consumeNotificationAction,
    createErrorNotification,
    createNotification,
    createSnackbar,
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
