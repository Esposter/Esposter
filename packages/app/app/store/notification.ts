import type { AppNotification } from "@/models/notification/AppNotification";
import type { Except, SetOptional } from "type-fest";

import { DatabaseEntityType, NotificationSeverity } from "@esposter/db-schema";
import { checkIsServer } from "@esposter/shared";

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
  const { executeMutation: executeStoreDeliveredNotificationsMutation } = useMutation();
  const localNotifications = ref<AppNotification[]>([]);
  // Sorted at display time rather than kept in order by every writer: the two halves arrive independently — a
  // Page appends, a local notification prepends — and only the rendered list has an opinion about their order
  const notifications = computed(() =>
    [...localNotifications.value, ...deliveredNotifications.value].toSorted(
      (first, second) => second.createdAt.getTime() - first.createdAt.getTime(),
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
  const storeUnreadCount = (count: number) => {
    unreadDeliveredCount.value = count;
  };
  // What a delivered push does to the bell, kept here because only the store can tell the two halves apart. The
  // Read replaces the whole first page, so the rows that just arrived are the ones newer than the newest row the
  // Tab already held — never `notifications[0]`, which is the combined list: a local notification created while
  // The read was in flight is newer than the pushed row, and it has already toasted once when it was created.
  // Two pushes landing inside one read both toast, oldest first, and neither row can toast twice — which is also
  // Why the calls are queued rather than run side by side: the ids below are snapshotted before the read and
  // Compared after it, so two overlapping calls would snapshot the same list and both claim the row the first
  // Read brought back, re-toasting it after it was dismissed. Queued, the second reads a list that already holds
  // It — and still reads, so a row written while the first was in flight arrives rather than being joined away
  const storeDeliveredNotifications = (readDeliveredNotifications: () => Promise<unknown>) =>
    executeStoreDeliveredNotificationsMutation(
      async () => {
        const [previousNewestNotification] = deliveredNotifications.value;
        // The watermark alone cannot separate a row that arrived from the row it ties with: postgres writes
        // Microseconds and a `Date` keeps milliseconds, so two rows written inside the same millisecond compare
        // Equal once they cross the wire, and the second to be pushed would be dropped as "not newer" and never
        // Toast. The ids the tab already held settle those ties, and the watermark still keeps a page the read
        // Grew — rows the tab never held because it held fewer than a page — from toasting a backlog nobody was pushed
        const previousNotificationIds = new Set(deliveredNotifications.value.map(({ id }) => id));
        await readDeliveredNotifications();
        for (const { id } of deliveredNotifications.value
          .filter(
            ({ createdAt, id: deliveredNotificationId }) =>
              !previousNotificationIds.has(deliveredNotificationId) &&
              (!previousNewestNotification || createdAt >= previousNewestNotification.createdAt),
          )
          .toReversed())
          createSnackbar(id);
      },
      {
        key: DatabaseEntityType.Notification,
        // Nobody asked for this read — it rides a push — so a failure is logged rather than put in front of
        // Someone who did nothing to cause it
        onError: (error) => {
          console.error(error);
        },
      },
    );
  const createNotification = (
    newNotification: SetOptional<Except<AppNotification, "createdAt" | "id" | "isRead">, "body" | "path">,
  ) => {
    if (checkIsServer()) return;

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
        const previousUnreadDeliveredCount = unreadDeliveredCount.value;
        deliveredNotifications.value = previousNotifications.filter((notification) => notification.id !== id);
        // A deleted row is one fewer unread, and the total is the server's — so it is adjusted here rather than
        // Re-read, exactly as the list itself is
        if (previousNotifications.some((notification) => notification.id === id && !notification.isRead))
          unreadDeliveredCount.value = previousUnreadDeliveredCount - 1;
        return () => {
          deliveredNotifications.value = previousNotifications;
          unreadDeliveredCount.value = previousUnreadDeliveredCount;
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
        const previousUnreadDeliveredCount = unreadDeliveredCount.value;
        deliveredNotifications.value = [];
        unreadDeliveredCount.value = 0;
        return () => {
          deliveredNotifications.value = previousNotifications;
          unreadDeliveredCount.value = previousUnreadDeliveredCount;
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
    // The statement marks every unread row read, on the loaded pages and beyond them, so the total it clears is
    // The server's one — which is also the only thing that says there is anything to clear at all
    if (unreadDeliveredCount.value === 0) return;

    await executeReadStatusMutation(() => $trpc.notification.updateNotificationsReadStatus.mutate(), {
      applyOptimistic: () => {
        const previousNotifications = deliveredNotifications.value;
        const previousUnreadDeliveredCount = unreadDeliveredCount.value;
        deliveredNotifications.value = previousNotifications.map((notification) =>
          notification.isRead ? notification : { ...notification, isRead: true },
        );
        unreadDeliveredCount.value = 0;
        return () => {
          deliveredNotifications.value = previousNotifications;
          unreadDeliveredCount.value = previousUnreadDeliveredCount;
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
    storeDeliveredNotifications,
    storeUnreadCount,
    unreadCount,
  };
});
