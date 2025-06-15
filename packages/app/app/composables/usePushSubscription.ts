import { usePushSubscriptionStore } from "@/store/pushSubscription";

export const usePushSubscription = () => {
  const runtimeConfig = useRuntimeConfig();
  const pushSubscriptionStore = usePushSubscriptionStore();
  const { pushSubscription } = storeToRefs(pushSubscriptionStore);
  const { permissionGranted } = useWebNotification();
  const { trigger } = watchTriggerable(permissionGranted, async (newPermissionGranted) => {
    if (!newPermissionGranted) {
      await pushSubscription.value?.unsubscribe();
      pushSubscription.value = undefined;
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    pushSubscription.value = await registration.pushManager.subscribe({
      applicationServerKey: runtimeConfig.public.vapid.publicKey,
      userVisibleOnly: true,
    });
  });

  onMounted(async () => {
    await trigger();
  });
};
