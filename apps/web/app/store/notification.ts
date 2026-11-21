import type { ReadNotificationsResult } from "#shared/models/db/notification/ReadNotificationsResult";
import type { AppNotification } from "#src/models/notification/AppNotification";
import type { Entry } from "#src/models/shared/overlay/Entry";
import type { NotificationInNotification } from "@esposter/db-schema";
import type { Except, SetOptional } from "type-fest";

import { compareCreatedAt } from "#shared/util/date/compareCreatedAt";
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { getToastedNotificationIds } from "#src/services/notification/getToastedNotificationIds";
import { AsyncDataKey } from "#src/services/shared/AsyncDataKey";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createTable } from "#src/services/shared/overlay/createTable";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useOverlayStore } from "#src/store/overlay";
import { createEmptyPage, NotificationSeverity, notificationsInNotification } from "@esposter/db-schema";
import { checkIsServer, getResultAsync, getSynchronizedFunction } from "@esposter/shared";
import { v7 } from "uuid";

// A notification row, held by its id
const notificationTable = createTable(notificationsInNotification);
// A read row is the row itself; an unread one is copied with it marked read, so each row a read changes is a new row
const markRead = <T extends { isRead: boolean }>(notification: T): T =>
  notification.isRead ? notification : { ...notification, isRead: true };
// A dismissal leaves the row at once, as the tombstone its answer confirms
const getDismissNotificationEntry = (id: string, deletedAt: Date): Entry =>
  getHeldRowEntry(notificationTable, [id], (notification) => ({ ...notification, deletedAt }));
// The bell renders two kinds of notification and owns the difference between them. A **delivered** one is a row
// The server wrote for this user — it reached every device that was subscribed, it survives the reload, and it is
// Paged in like any other list. A **local** one is feedback about what this tab just did: a mutation error, a save
// Conflict, an export that finished here. Nothing on another device could act on it and nothing needs it after the
// Reload, so it is never written down — which is also why only the delivered half is paginated.
export const useNotificationStore = defineStore("notification", () => {
  const { $trpc } = useNuxtApp();
  const overlayStore = useOverlayStore();
  const { arrive, view, writeAwaited, writeOptimistic } = overlayStore;
  const notificationRows = view(notificationTable);
  const {
    getSlice,
    hasMore,
    isLoaded,
    items: deliveredItems,
    readItems,
    readMoreItems,
  } = useCursorPaginationData<NotificationInNotification>();
  const localNotifications = ref<AppNotification[]>([]);
  // The delivered half is the page's rows, read for their ids: a row is drawn from the overlay, so a dismissal that the
  // Overlay holds as a tombstone leaves the list whichever page named it
  const deliveredNotifications = computed(() => {
    const idRowMap = new Map(notificationRows.value.map((row) => [row.id, row]));
    return deliveredItems.value.flatMap(({ id }) => {
      const row = idRowMap.get(id);
      return row && !row.deletedAt ? [row] : [];
    });
  });
  // Sorted at display time rather than kept in order by every writer: the two halves arrive independently — a
  // Page appends, a local notification prepends — and only the rendered list has an opinion about their order
  const notifications = computed<AppNotification[]>(() =>
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
  // Lands the rows of a read in the overlay. A row a read answers at a version the tab holds applies nothing, so a read
  // That was issued before a dismissal cannot bring the row back
  const arriveDeliveredRows = (rows: NotificationInNotification[]) => {
    for (const row of rows) arrive(notificationTable, row);
  };
  // One page of the bell, read from the server: the page's rows arrive, and its unread total is restated
  const readDeliveredPage = async (cursor: string): Promise<ReadNotificationsResult> => {
    const {
      items,
      nextCursor,
      unreadCount: deliveredUnreadCount,
    } = await $trpc.notification.readNotifications.query({ cursor });
    if (deliveredUnreadCount !== undefined) setUnreadDeliveredCount(deliveredUnreadCount);
    arriveDeliveredRows(items);
    return { items, nextCursor };
  };
  // What a delivered push does to the bell, kept here because only the store can tell the two halves apart. The read
  // Lands the rows the push wrote, and the tab toasts the ones it did not hold. The bell's topic-driven read calls this,
  // And so does the push's own read on a page with no live bell read, so a push is read once where the bell is on screen.
  // Each id toasts once: two reads that overlap both compare against the list they began with, so each would claim the
  // Row the other brought back, and the ids already toasted are what keep that row to one toast
  const toastedNotificationIds = new Set<string>();
  const storeDeliveredNotifications = getSynchronizedFunction(
    async (readDeliveredNotifications: () => Promise<unknown>) => {
      const heldNotifications = [...deliveredNotifications.value];
      await getResultAsync(readDeliveredNotifications).match(() => {
        for (const id of getToastedNotificationIds(heldNotifications, deliveredNotifications.value)) {
          if (toastedNotificationIds.has(id)) continue;

          toastedNotificationIds.add(id);
          createSnackbar(id);
        }
      }, console.error);
    },
  );
  const readNotifications = () =>
    readItems(() => readDeliveredPage(""), {
      key: AsyncDataKey.ReadNotifications,
      // A page the server render handed over is adopted without a read, so its rows reach the overlay here
      onComplete: ({ items }) => {
        arriveDeliveredRows(items);
      },
      onTopicChange: storeDeliveredNotifications,
    });
  const readMoreNotifications = (onComplete: () => void) => readMoreItems(readDeliveredPage, onComplete);
  // Hands back the notification's id, so the caller can dismiss the notification it raised
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
  const dismissNotification = (id: string) => {
    dismissSnackbar(id);
    const localNotification = localNotifications.value.find((notification) => notification.id === id);
    // A local notification has no row to delete, so dismissing it is the whole operation
    if (localNotification) {
      localNotifications.value = localNotifications.value.filter((notification) => notification.id !== id);
      return;
    }

    writeOptimistic(
      async () => {
        const { notification, unreadCount: deliveredUnreadCount } =
          await $trpc.notification.deleteNotification.mutate(id);
        setUnreadDeliveredCount(deliveredUnreadCount);
        return { arrivals: [createArrival(notificationTable, notification)], confirmed: [] };
      },
      { entry: getDismissNotificationEntry(id, new Date()), onError: createErrorAlert },
    );
  };
  const dismissNotifications = () => {
    localNotifications.value = [];
    snackbarIds.value = [];
    return writeAwaited(
      async () => {
        setUnreadDeliveredCount(await $trpc.notification.deleteNotifications.mutate());
        // Every row is a tombstone now, so the loaded page is emptied on the answer. A read would page through the
        // Tombstones, and a topic refetch refreshes only the first page. The reset retires the page a read still in flight
        // Was issued against, so that read lands nothing; the initialize then restores the loaded list with its empty page
        const slice = getSlice();
        slice.resetCursorPaginationData();
        slice.initializeCursorPaginationData(createEmptyPage<NotificationInNotification>());
        return [];
      },
      { awaitedBecause: AwaitedReason.ServerDecidedOutcome, onError: createErrorAlert },
    );
  };
  const markAllAsRead = () => {
    // Copy-on-write is the point: the array and every changed row are replaced so the computed re-evaluates
    localNotifications.value = localNotifications.value.map((notification) => markRead(notification));
    // The statement marks every unread row read, on the loaded pages and beyond them, so the total it clears is
    // The server's one — which is also the only thing that says there is anything to clear at all
    if (unreadDeliveredCount.value === 0) return Promise.resolve();

    return writeAwaited(
      async () => {
        setUnreadDeliveredCount(await $trpc.notification.updateNotificationsReadStatus.mutate());
        // A loaded later page would keep its rows unread, so the first page is read again and replaces the loaded pages
        await readNotifications();
        return [];
      },
      { awaitedBecause: AwaitedReason.ServerDecidedOutcome, onError: createErrorAlert },
    );
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
    readMoreNotifications,
    readNotifications,
    setUnreadDeliveredCount,
    snackbarNotification,
    storeDeliveredNotifications,
    unreadCount,
  };
});
