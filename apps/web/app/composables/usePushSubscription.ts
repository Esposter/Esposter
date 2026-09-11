import { pushSubscriptionInputSchema } from "#shared/models/db/pushSubscription/PushSubscriptionInput";

export const usePushSubscription = () => {
  const { $trpc } = useNuxtApp();
  const runtimeConfig = useRuntimeConfig();
  const pushSubscription = ref<PushSubscription>();
  const { permissionGranted } = useWebNotification();
  const { trigger } = watchTriggerable(permissionGranted, async (newPermissionGranted) => {
    const registration = await window.navigator.serviceWorker.ready;
    if (!newPermissionGranted) {
      // Fall back to getSubscription() in case permission was revoked before onMounted completed
      const subscription = pushSubscription.value ?? (await registration.pushManager.getSubscription());
      if (subscription) {
        await $trpc.pushSubscription.unsubscribe.mutate(subscription.endpoint);
        await subscription.unsubscribe();
      }
      pushSubscription.value = undefined;
      return;
    }
    // `getSubscription()` returns the existing subscription if one exists, avoiding a new
    // Endpoint being created (and a redundant network call to the push service)
    pushSubscription.value =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        applicationServerKey: runtimeConfig.public.vapid.publicKey,
        userVisibleOnly: true,
      }));
    // The browser's `toJSON` is what the wire carries — endpoint plus the p256dh/auth keys — but the DOM declares
    // Every field of it optional, so the payload is parsed through the procedure's own input schema rather than
    // Asserted into it
    await $trpc.pushSubscription.subscribe.mutate(pushSubscriptionInputSchema.parse(pushSubscription.value.toJSON()));
  });

  onMounted(async () => {
    await trigger();
  });

  onUnmounted(() => {
    // Clear local ref only — push subscriptions are tied to the service worker, not this component.
    // Full cleanup (browser + DB) only happens when permissionGranted becomes false.
    pushSubscription.value = undefined;
  });
};
