import type { PushSubscription as WebPushSubscription } from "web-push";

export const usePushSubscription = () => {
  const { $trpc } = useNuxtApp();
  const runtimeConfig = useRuntimeConfig();
  const pushSubscription = ref<PushSubscription>();
  const { permissionGranted } = useWebNotification();

  const unsubscribe = async () => {
    await pushSubscription.value?.unsubscribe();
    pushSubscription.value = undefined;
  };

  const { trigger } = watchTriggerable(permissionGranted, async (newPermissionGranted) => {
    if (!newPermissionGranted) {
      if (pushSubscription.value) await $trpc.pushSubscription.unsubscribe.mutate(pushSubscription.value.endpoint);
      await unsubscribe();
      return;
    }

    const registration = await window.navigator.serviceWorker.ready;
    pushSubscription.value = await registration.pushManager.subscribe({
      applicationServerKey: runtimeConfig.public.vapid.publicKey,
      userVisibleOnly: true,
    });
    await $trpc.pushSubscription.subscribe.mutate(pushSubscription.value as unknown as WebPushSubscription);
  });

  onMounted(async () => {
    await trigger();
  });

  onUnmounted(async () => {
    await unsubscribe();
  });
};
