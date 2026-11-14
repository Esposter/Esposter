import { useConnectionStore } from "@/store/realtime/connection";
import { useStorageStore } from "@/store/storage";
import { checkIsServer } from "@esposter/shared";

export const useStorageSubscribables = () => {
  if (checkIsServer()) return;

  const storageStore = useStorageStore();
  const { storeUpdateStorageUsage } = storageStore;
  const connectionStore = useConnectionStore();
  const { onUserEvent } = connectionStore;
  // Every change to the counter, whichever process made it, arrives carrying the figure, so the meter moves
  // Without a re-read. The server derives the quota from the tier, so the figure is computed in one place
  const unregister = onUserEvent("updateUsage", (newStorageUsage) => {
    storeUpdateStorageUsage(newStorageUsage);
  });
  onScopeDispose(unregister);
};
