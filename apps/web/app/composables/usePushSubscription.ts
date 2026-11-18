import { pushSubscriptionInputSchema } from "#shared/models/db/pushSubscription/PushSubscriptionInput";
import { noop } from "@esposter/shared";

// Keeps this device's push subscription in step with the notification permission. The permission is read live, so a
// Grant from the app's own ask (`MessageContentPushPermissionAlert`) or from the browser's site settings subscribes the
// Device as it happens, and a revoke unsubscribes it
export const usePushSubscription = () => {
  const { $trpc } = useNuxtApp();
  const runtimeConfig = useRuntimeConfig();
  const notificationPermission = usePermission("notifications");
  const { executeMutation } = useMutation();
  const removeSubscription = async (subscription: PushSubscription) => {
    await $trpc.pushSubscription.unsubscribe.mutate(subscription.endpoint);
    await subscription.unsubscribe();
  };
  // Unset until the browser answers the query, and on the server, where there is no device to subscribe
  watch(notificationPermission, (newNotificationPermission) => {
    if (!newNotificationPermission) return;

    executeMutation(
      async () => {
        const { pushManager } = await window.navigator.serviceWorker.ready;
        const subscription = await pushManager.getSubscription();
        if (newNotificationPermission !== "granted") {
          if (subscription) await removeSubscription(subscription);
          return;
        }
        // A subscription is bound to the VAPID key it was made under, and a push signed with any other is refused, so
        // One made before the key changed is replaced rather than registered again
        const applicationServerKey = runtimeConfig.public.vapid.publicKey;
        const subscribedKey = subscription?.options.applicationServerKey;
        const isCurrentKey = subscribedKey
          ? new Uint8Array(subscribedKey).toBase64({ alphabet: "base64url", omitPadding: true }) ===
            applicationServerKey
          : false;
        if (subscription && !isCurrentKey) await removeSubscription(subscription);
        const currentSubscription =
          subscription && isCurrentKey
            ? subscription
            : await pushManager.subscribe({ applicationServerKey, userVisibleOnly: true });
        // The browser's `toJSON` is what the wire carries — endpoint plus the p256dh/auth keys — but the DOM declares
        // Every field of it optional, so the payload is parsed through the procedure's own input schema rather than
        // Asserted into it
        await $trpc.pushSubscription.subscribe.mutate(pushSubscriptionInputSchema.parse(currentSubscription.toJSON()));
      },
      // Queued per key, so a revoke that lands while a grant's subscribe is still awaiting runs after it and finds that
      // Subscription and removes it. Nothing is drawn ahead of it, being a connection rather than a value on screen
      { applyOptimistic: () => noop, key: "pushSubscription", onError: console.error },
    );
  });
};
