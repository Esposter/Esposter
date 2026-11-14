import { useStorageStore } from "@/store/storage";
import { checkIsServer } from "@esposter/shared";

export const useStorageSubscribables = async () => {
  if (checkIsServer()) return;

  const onlineSubscribableContext = getOnlineSubscribableContext();
  const { $trpc } = useNuxtApp();
  const storageStore = useStorageStore();
  const { storeUpdateStorageUsage } = storageStore;
  const { data: session } = await useAuthSession();

  // Every change to the counter, whichever process made it, arrives carrying the figure, so the meter moves
  // Without a re-read. The server derives the quota from the tier, so the figure is computed in one place
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
