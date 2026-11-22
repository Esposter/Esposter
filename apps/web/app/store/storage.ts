import type { UserInAuth } from "@esposter/db-schema";

import { userTable } from "#src/services/user/overlay/constants";
import { useOverlayStore } from "#src/store/overlay";
import { StorageTierQuotaMap } from "@esposter/db-schema";

// The usage meter mounts on every resource page, and the layout it sits in is declared per page — so it is
// Remounted on every navigation within the explorer. The number lives here rather than in the component so
// That remount renders the value it already has instead of blanking the bar and re-reading it.
// See openspec/specs/resource/storage-quotas/design.md
export const useStorageStore = defineStore("storage", () => {
  const { $trpc } = useNuxtApp();
  const userId = useSessionUserId();
  const overlayStore = useOverlayStore();
  const { arrive, view } = overlayStore;
  // The table may hold other users' rows, so the meter reads the row its session owns
  const storageUserRows = view(userTable);
  const storageUser = computed(() => storageUserRows.value.find(({ id }) => id === userId.value));
  // The bar's figures, read off the row. The quota is the tier's, from the map the server gates on
  const storageUsage = computed(() => {
    const user = storageUser.value;
    return user
      ? { bytesUsed: user.storageBytesUsed, quotaBytes: StorageTierQuotaMap[user.storageTier], tier: user.storageTier }
      : undefined;
  });
  const { read: readStorageUsage } = useCachedRead(() => $trpc.storage.readUsage.query(), {
    onSuccess: (user) => {
      arrive(userTable, user);
    },
  });
  // The subscription is established before the first read is issued, so a charge can land between the two. The pushed
  // Row is the newer of the pair when its version is, and the overlay's arrival gate keeps it whichever order they land in
  const storeUpdateStorageUsage = (user: UserInAuth) => {
    arrive(userTable, user);
  };
  return { readStorageUsage, storageUsage, storeUpdateStorageUsage };
});
