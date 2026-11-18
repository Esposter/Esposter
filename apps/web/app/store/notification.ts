import type { AppNotification } from "#src/models/notification/AppNotification";
import type { Except, SetOptional } from "type-fest";

import { compareCreatedAt } from "#shared/util/date/compareCreatedAt";
import { getToastedNotificationIds } from "#src/services/notification/getToastedNotificationIds";
import { DatabaseEntityType, NotificationSeverity } from "@esposter/db-schema";
import { checkIsServer, noop } from "@esposter/shared";
import { v7 } from "uuid";

// A read row is the row itself; an unread one is copied with it marked read, so each row a read changes is a new row
const markRead = <T extends { isRead: boolean }>(notification: T): T =>
  notification.isRead ? notification : { ...notification, isRead: true };
// The bell renders two kinds of notification and owns the difference between them. A **delivered** one is a row
// The server wrote for this user — it reached every device that was subscribed, it survives the reload, and it is
// Paged in like any other list. A **local** one is feedback about what this tab just did: a mutation error, a save
// Conflict, an export that finished here. Nothing on another device could act on it and nothing needs it after the
// Reload, so it is never written down — which is also why only the delivered half is paginated.
export const useNotificationStore = defineStore("notification", () => {
  const { $trpc } = useNuxtApp();
  const {
    hasMore,
    isLoaded,
    items: deliveredNotifications,
    readItems,
    readMoreItems,
  } = useCursorPaginationData<AppNotification>();
  // Every write that answers the unread total queues on this one executor under one key, so an answer read before a
  // Later write's can never land after it
  const { executeMutation: executeNotificationMutation } = useMutation();
  const localNotifications = ref<AppNotification[]>([]);
  // Sorted at display time rather than kept in order by every writer: the two halves arrive independently — a
  // Page appends, a local notification prepends — and only the rendered list has an opinion about their order
  const notifications = computed(() =>
    [...localNotifications.value, ...deliveredNotifications.value].toSorted((firstNotification, secondNotification) =>
      compareCreatedAt(secondNotification, firstNotification),
    ),
  );
  const isPanelOpen = ref(false);
  // The server's total, not the loaded pages': unread rows sit on pages the bell has never read, and a badge that
  // Counted only what is loaded reads low until the panel is scrolled to the bottom. Every page read restates it
  const unreadDeliveredCount = ref(0);
  const unreadCount = computed(
    () => localNotifications.value.filter(({ isRead }) => !isRead).length + unreadDeliveredCount.value,
  );
  // One snackbar queue: every pushed notification also toasts, newer ones wait behind the current head
  const snackbarIds = ref<string[]>([]);
  const snackbarNotification = computed(() => notifications.value.find(({ id }) => id === snackbarIds.value[0]));
  const createSnackbar = (id: string) => {
    snackbarIds.value = [...snackbarIds.value, id];
  };
  const setUnreadDeliveredCount = (count: number) => {
    unreadDeliveredCount.value = count;
  };
  // What a delivered push does to the bell, kept here because only the store can tell the two halves apart. The read
  // Lands the rows the push wrote, and the tab toasts the ones it did not hold. The bell's topic-driven read calls this,
  // And so does the push's own read on a page with no live bell read, so a push is read once where the bell is on screen.
  // Two pushes landing inside one read both toast, oldest first, and neither row can toast twice — which is also why the
  // Calls are queued rather than run side by side: the held rows are snapshotted before the read and compared after it,
  // So two overlapping calls would snapshot the same list and both claim the row the first read brought back, re-toasting
  // It after it was dismissed. Queued, the second reads a list that already holds the row, and still reads, so a row
  // Written while the first was in flight arrives rather than being joined away
  const storeDeliveredNotifications = (readDeliveredNotifications: () => Promise<unknown>) => {
    executeNotificationMutation(
      async () => {
        const heldNotifications = [...deliveredNotifications.value];
        await readDeliveredNotifications();
        for (const id of getToastedNotificationIds(heldNotifications, deliveredNotifications.value)) createSnackbar(id);
      },
      {
        // Nothing is drawn ahead of the read, since the read itself is what puts the rows it brings back on the bell
        applyOptimistic: () => noop,
        key: DatabaseEntityType.Notification,
        // Nobody asked for this read — it rides a push — so a failure is logged rather than put in front of
        // Someone who did nothing to cause it
        onError: (error) => {
          console.error(error);
        },
      },
    );
  };
  // Hands back the notification's id, so an optimistic write that raised it can dismiss it when its rollback runs
  const createNotification = (
    newNotification: SetOptional<Except<AppNotification, "createdAt" | "id" | "isRead">, "body" | "path">,
  ) => {
    if (checkIsServer()) return "";

    const notification: AppNotification = {
      body: "",
      path: "",
      ...newNotification,
      createdAt: new Date(),
      id: v7(),
      isRead: false,
    };
    localNotifications.value = [notification, ...localNotifications.value];
    createSnackbar(notification.id);
    return notification.id;
  };
  // The one shape every mutation error surfaces as, so call sites don't restate it
  const createErrorNotification = (error: Error) => {
    createNotification({ severity: NotificationSeverity.Error, title: error.message });
  };
  // The one shape a warning surfaces as, so a warning's call sites don't restate it
  const createWarningNotification = (title: string) => {
    createNotification({ severity: NotificationSeverity.Warning, title });
  };
  const dismissSnackbar = (id: string) => {
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
  // The delivered list and its unread total move together, so an optimistic write takes both and gives both back
  const snapshotDeliveredNotifications = () => {
    const previousNotifications = deliveredNotifications.value;
    const previousUnreadDeliveredCount = unreadDeliveredCount.value;
    return {
      previousNotifications,
      previousUnreadDeliveredCount,
      restore: () => {
        deliveredNotifications.value = previousNotifications;
        unreadDeliveredCount.value = previousUnreadDeliveredCount;
      },
    };
  };
  const dismissNotification = (id: string) => {
    dismissSnackbar(id);
    const localNotification = localNotifications.value.find((notification) => notification.id === id);
    // A local notification has no row to delete, so dismissing it is the whole operation
    if (localNotification) {
      localNotifications.value = localNotifications.value.filter((notification) => notification.id !== id);
      return;
    }

    executeNotificationMutation(() => $trpc.notification.deleteNotification.mutate(id), {
      applyOptimistic: () => {
        const { previousNotifications, previousUnreadDeliveredCount, restore } = snapshotDeliveredNotifications();
        deliveredNotifications.value = previousNotifications.filter((notification) => notification.id !== id);
        // The total is the server's, so this step moves it for display only: the count the delete answers replaces it
        if (previousNotifications.some((notification) => notification.id === id && !notification.isRead))
          unreadDeliveredCount.value = previousUnreadDeliveredCount - 1;
        return restore;
      },
      key: DatabaseEntityType.Notification,
      reconcile: setUnreadDeliveredCount,
    });
  };
  const dismissNotifications = () => {
    localNotifications.value = [];
    snackbarIds.value = [];
    executeNotificationMutation(() => $trpc.notification.deleteNotifications.mutate(), {
      applyOptimistic: () => {
        const { restore } = snapshotDeliveredNotifications();
        deliveredNotifications.value = [];
        unreadDeliveredCount.value = 0;
        return restore;
      },
      key: DatabaseEntityType.Notification,
      reconcile: setUnreadDeliveredCount,
    });
  };
  const markAllAsRead = () => {
    // Copy-on-write is the point: the array and every changed row are replaced so the computed re-evaluates
    localNotifications.value = localNotifications.value.map((notification) => markRead(notification));
    // The statement marks every unread row read, on the loaded pages and beyond them, so the total it clears is
    // The server's one — which is also the only thing that says there is anything to clear at all
    if (unreadDeliveredCount.value === 0) return;

    executeNotificationMutation(() => $trpc.notification.updateNotificationsReadStatus.mutate(), {
      applyOptimistic: () => {
        const { previousNotifications, restore } = snapshotDeliveredNotifications();
        deliveredNotifications.value = previousNotifications.map((notification) => markRead(notification));
        unreadDeliveredCount.value = 0;
        return restore;
      },
      key: DatabaseEntityType.Notification,
      reconcile: setUnreadDeliveredCount,
    });
  };
  return {
    consumeNotificationAction,
    createErrorNotification,
    createNotification,
    createWarningNotification,
    dismissNotification,
    dismissNotifications,
    dismissSnackbar,
    hasMore,
    isLoaded,
    isPanelOpen,
    markAllAsRead,
    notifications,
    readItems,
    readMoreItems,
    setUnreadDeliveredCount,
    snackbarNotification,
    storeDeliveredNotifications,
    unreadCount,
  };
});
