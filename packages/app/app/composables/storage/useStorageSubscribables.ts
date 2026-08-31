import { authClient } from "@/services/auth/authClient";
import { useStorageStore } from "@/store/storage";
import { checkIsServer } from "@esposter/shared";

export const useStorageSubscribables = async () => {
  if (checkIsServer()) return;

  const onlineSubscribableContext = getOnlineSubscribableContext();
  const { $trpc } = useNuxtApp();
  const storageStore = useStorageStore();
  const { storeUpdateStorageUsage } = storageStore;
  const { data: session } = await authClient.useSession(useFetch);

  useOnlineSubscribable(
    () => session.value?.user.id,
    (userId) => {
      if (!userId) return undefined;

      const updateUsageUnsubscribable = $trpc.storage.onUpdateUsage.subscribe(undefined, {
        onData: (newStorageUsage) => {
          storeUpdateStorageUsage(newStorageUsage);
        },
      });
      return () => {
        updateUsageUnsubscribable.unsubscribe();
      };
    },
    onlineSubscribableContext,
  );
};
