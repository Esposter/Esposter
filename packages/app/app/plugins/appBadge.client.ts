import { useNotificationStore } from "@/store/notification";
import { getResultAsync, noop } from "@esposter/shared";

// The installed app's icon badge mirrors the bell's unread count, so an install that is not in the foreground
// Still shows what is waiting. Only the count the running tab knows about: a push that arrives while the app is
// Closed is the service worker's own notification, and nothing here is running to count it.
//
// Best-effort by contract — the badge is decoration, and a platform that exposes the API but refuses the write
// (an uninstalled tab on some browsers) must never surface as an error to the visitor
export default defineNuxtPlugin(() => {
  // Both halves, because the zero branch calls the other one: a platform carrying only `setAppBadge` would
  // Pass a one-sided check and then reject every clear, leaving the last count on the icon for good
  if (typeof window.navigator.setAppBadge !== "function" || typeof window.navigator.clearAppBadge !== "function")
    return;

  const notificationStore = useNotificationStore();
  const { unreadCount } = storeToRefs(notificationStore);
  // The badge is one value, so its writes are a queue rather than a race: the API orders nothing across
  // Concurrent calls, and a dismissal that resolves after the count it replaced would leave the icon showing a
  // Number the panel no longer has. Chained, the last count written is the last count shown
  let pendingBadgeWrite: Promise<unknown> = Promise.resolve();
  // Immediate because the store is session-scoped, so a launch starts at zero — which is exactly the badge a
  // Previous session left behind and never got to clear
  watchImmediate(unreadCount, (newUnreadCount) => {
    const previousBadgeWrite = pendingBadgeWrite;
    pendingBadgeWrite = (async () => {
      await previousBadgeWrite;
      await getResultAsync(() =>
        // Clearing rather than badging zero: the two are equivalent per spec, but only one of them says so
        newUnreadCount > 0 ? window.navigator.setAppBadge(newUnreadCount) : window.navigator.clearAppBadge(),
      ).match(noop, console.error);
    })();
  });
});
