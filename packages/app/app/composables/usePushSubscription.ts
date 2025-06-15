import type { WebNotificationOptions } from "@vueuse/core";
import type { SetRequired } from "type-fest";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { usePushSubscriptionStore } from "@/store/pushSubscription";

export const usePushSubscription = () => {
  const runtimeConfig = useRuntimeConfig();
  const pushSubscriptionStore = usePushSubscriptionStore();
  const { pushSubscription } = storeToRefs(pushSubscriptionStore);
  const messageListener = ref<(this: ServiceWorkerContainer, ev: ServiceWorkerContainerEventMap["message"]) => void>();
  const { permissionGranted } = useWebNotification();

  const unsubscribe = async () => {
    await pushSubscription.value?.unsubscribe();
    pushSubscription.value = undefined;
    if (messageListener.value) {
      window.navigator.serviceWorker.removeEventListener("message", messageListener.value);
      messageListener.value = undefined;
    }
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
    messageListener.value = getSynchronizedFunction(
      ({ data: { title, ...rest } }: MessageEvent<SetRequired<WebNotificationOptions, "title">>) =>
        registration.showNotification(title, rest),
    );
    window.navigator.serviceWorker.addEventListener("message", messageListener.value);
  });

  onMounted(async () => {
    await trigger();
  });

  onUnmounted(async () => {
    await unsubscribe();
  });
};
