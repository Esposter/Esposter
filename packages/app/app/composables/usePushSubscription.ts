import type { PushSubscription } from "web-push";

import { usePushSubscriptionStore } from "@/store/pushSubscription";

export const usePushSubscription = () => {
  const { $trpc } = useNuxtApp();
  const runtimeConfig = useRuntimeConfig();
  const pushSubscriptionStore = usePushSubscriptionStore();
  const { pushSubscription } = storeToRefs(pushSubscriptionStore);
  const { permissionGranted } = useWebNotification();

  const unsubscribe = async () => {
    await pushSubscription.value?.unsubscribe();
    pushSubscription.value = undefined;
  };

  const { trigger } = watchTriggerable(permissionGranted, async (newPermissionGranted) => {
    if (!newPermissionGranted) {
      await unsubscribe();
      if (pushSubscription.value) await $trpc.pushSubscription.unsubscribe.mutate(pushSubscription.value.endpoint);
      return;
    }

    const registration = await window.navigator.serviceWorker.ready;
    pushSubscription.value = await registration.pushManager.subscribe({
      applicationServerKey: runtimeConfig.public.vapid.publicKey,
      userVisibleOnly: true,
    });
    await $trpc.pushSubscription.subscribe.mutate(pushSubscription.value as unknown as PushSubscription);
  });

  onMounted(async () => {
    await trigger();
  });

  onUnmounted(async () => {
    await unsubscribe();
  });
};
