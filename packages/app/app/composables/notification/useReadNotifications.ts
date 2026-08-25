import { AsyncDataKey } from "@/services/shared/AsyncDataKey";
import { useNotificationStore } from "@/store/notification";

export const useReadNotifications = () => {
  const { $trpc } = useNuxtApp();
  const notificationStore = useNotificationStore();
  const { readItems, readMoreItems, storeUnreadCount } = notificationStore;
  // The unread total rides the page read rather than a query of its own: it is the same row set counted, and the
  // Badge is on screen the moment the panel's first page is. It is stored rather than returned because a keyed
  // Read adopts the payload on the hydrating render and never calls this closure there — store state is what
  // Survives that, so the total goes to the store and nowhere else
  const readNotificationsPage = async (cursor?: string) => {
    const { paginationData, unreadCount } = await $trpc.notification.readNotifications.query({ cursor });
    storeUnreadCount(unreadCount);
    return paginationData;
  };
  // The bell rides the app bar, so it renders on server-rendered routes too and the first page has to come off
  // The payload rather than being read again on hydration
  const readNotifications = () => readItems(() => readNotificationsPage(), { key: AsyncDataKey.ReadNotifications });
  const readMoreNotifications = (onComplete: () => void) =>
    readMoreItems((cursor) => readNotificationsPage(cursor), onComplete);
  return { readMoreNotifications, readNotifications };
};
