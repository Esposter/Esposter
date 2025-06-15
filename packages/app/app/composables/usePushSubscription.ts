import { usePushSubscriptionStore } from "@/store/pushSubscription";

export const usePushSubscription = () => {
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
      return;
    }

    const registration = await window.navigator.serviceWorker.ready;
    pushSubscription.value = await registration.pushManager.subscribe({
      applicationServerKey: runtimeConfig.public.vapid.publicKey,
      userVisibleOnly: true,
    });
  });

  onMounted(async () => {
    await trigger();
  });

  onUnmounted(async () => {
    await unsubscribe();
  });
};
