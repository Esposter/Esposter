import { AsyncDataKey } from "@/services/shared/AsyncDataKey";
import { useNotificationStore } from "@/store/notification";

export const useReadNotifications = () => {
  const { $trpc } = useNuxtApp();
  const notificationStore = useNotificationStore();
  const { readItems, readMoreItems } = notificationStore;
  // The bell rides the app bar, so it renders on server-rendered routes too and the first page has to come off
  // The payload rather than being read again on hydration
  const readNotifications = () =>
    readItems(() => $trpc.notification.readNotifications.query({}), { key: AsyncDataKey.ReadNotifications });
  const readMoreNotifications = (onComplete: () => void) =>
    readMoreItems((cursor) => $trpc.notification.readNotifications.query({ cursor }), onComplete);
  return { readMoreNotifications, readNotifications };
};
