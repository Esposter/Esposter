/* oxlint-disable @typescript-eslint/no-unnecessary-type-assertion */
// @TODO: remove when we switch to vue-tsgo — slight difference between ts6 and tsgo (ts7) behaviour
import type { PushSubscription as WebPushSubscription } from "web-push";

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
    // GetSubscription() returns the existing subscription if one exists, avoiding a new
    // Endpoint being created (and a redundant network call to the push service)
    pushSubscription.value =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        applicationServerKey: runtimeConfig.public.vapid.publicKey,
        userVisibleOnly: true,
      }));
    await $trpc.pushSubscription.subscribe.mutate(pushSubscription.value as unknown as WebPushSubscription);
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
