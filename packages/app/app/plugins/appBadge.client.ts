import { useNotificationStore } from "@/store/notification";
import { getResultAsync, noop } from "@esposter/shared";

// The installed app's icon badge mirrors the bell's unread count, so an install that is not in the foreground
// Still shows what is waiting. Only the count the running tab knows about: a push that arrives while the app is
// Closed is the service worker's own notification, and nothing here is running to count it.
//
// Best-effort by contract — the badge is decoration, and a platform that exposes the API but refuses the write
// (an uninstalled tab on some browsers) must never surface as an error to the visitor
export default defineNuxtPlugin(() => {
  if (!("setAppBadge" in window.navigator)) return;

  const notificationStore = useNotificationStore();
  const { unreadCount } = storeToRefs(notificationStore);
  // Immediate because the store is session-scoped, so a launch starts at zero — which is exactly the badge a
  // Previous session left behind and never got to clear
  watchImmediate(unreadCount, async (newUnreadCount) => {
    await getResultAsync(() =>
      // Clearing rather than badging zero: the two are equivalent per spec, but only one of them says so
      newUnreadCount > 0 ? window.navigator.setAppBadge(newUnreadCount) : window.navigator.clearAppBadge(),
    ).match(noop, console.error);
  });
});
