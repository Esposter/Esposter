import type { WebNotificationOptions } from "@vueuse/core";
import type { SetRequired } from "type-fest";

import { usePushSubscriptionStore } from "@/store/pushSubscription";

export const usePushSubscription = () => {
  const runtimeConfig = useRuntimeConfig();
  const pushSubscriptionStore = usePushSubscriptionStore();
  const { pushSubscription } = storeToRefs(pushSubscriptionStore);
  const messageListener = ref<(this: ServiceWorkerContainer, ev: ServiceWorkerContainerEventMap["message"]) => void>();
  const { permissionGranted } = useWebNotification();
  watch(
    permissionGranted,
    async (newPermissionGranted) => {
      if (!newPermissionGranted) {
        await pushSubscription.value?.unsubscribe();
        pushSubscription.value = undefined;
        if (messageListener.value) {
          navigator.serviceWorker.removeEventListener("message", messageListener.value);
          messageListener.value = undefined;
        }
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      pushSubscription.value = await registration.pushManager.subscribe({
        applicationServerKey: runtimeConfig.public.vapid.publicKey,
        userVisibleOnly: true,
      });
      messageListener.value = ({
        data: { title, ...rest },
      }: MessageEvent<SetRequired<WebNotificationOptions, "title">>) => {};
      navigator.serviceWorker.addEventListener("message", messageListener.value);
    },
    { immediate: true },
  );
};
