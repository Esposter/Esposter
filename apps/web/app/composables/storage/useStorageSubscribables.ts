import { useConnectionStore } from "#src/store/realtime/connection";
import { useStorageStore } from "#src/store/storage";
import { checkIsServer } from "@esposter/shared";

export const useStorageSubscribables = () => {
  if (checkIsServer()) return;

  const storageStore = useStorageStore();
  const { storeUpdateStorageUsage } = storageStore;
  const connectionStore = useConnectionStore();
  const { onUserEvent } = connectionStore;
  // Every change to the counter, whichever process made it, arrives as the owner's user row at the version it was
  // Written At, so the meter moves without a re-read and a row that lands out of order loses to the newer one already
  // Held
  const unregister = onUserEvent("updateUsage", (user) => {
    storeUpdateStorageUsage(user);
  });
  onScopeDispose(unregister);
};
