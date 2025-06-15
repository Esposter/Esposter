export const usePushSubscription = () => {
  const runtimeConfig = useRuntimeConfig();
  const subscription = ref<PushSubscription>();
  const { permissionGranted } = useWebNotification();
  watch(permissionGranted, async (newPermissionGranted) => {
    if (!newPermissionGranted) {
      await subscription.value?.unsubscribe();
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    subscription.value = await registration.pushManager.subscribe({
      applicationServerKey: runtimeConfig.public.vapid.publicKey,
      userVisibleOnly: true,
    });
  });
};
