import type { UserInAuth } from "@esposter/db-schema";

import { authClient } from "#src/services/auth/authClient";
import { createTable } from "#src/services/shared/overlay/createTable";
import { useOverlayStore } from "#src/store/overlay";
import { StorageTierQuotaMap, usersInAuth } from "@esposter/db-schema";

// The owner's user row, whose total the meter shows. The row is the table's own, so a total arrives with the version it
// Was written at, and an older row cannot replace a newer one
const storageUserTable = createTable(usersInAuth);

// The usage meter mounts on every resource page, and the layout it sits in is declared per page — so it is
// Remounted on every navigation within the explorer. The number lives here rather than in the component so
// That remount renders the value it already has instead of blanking the bar and re-reading it.
// See openspec/specs/resource/storage-quotas/design.md
export const useStorageStore = defineStore("storage", () => {
  const { $trpc } = useNuxtApp();
  const session = authClient.useSession();
  const userId = computed(() => session.value.data?.user.id ?? "");
  const overlayStore = useOverlayStore();
  const { arrive, view } = overlayStore;
  // The table may hold other users' rows, so the meter reads the row its session owns
  const storageUserRows = view(storageUserTable);
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
      arrive(storageUserTable, user);
    },
  });
  // The subscription is established before the first read is issued, so a charge can land between the two. The pushed
  // Row is the newer of the pair when its version is, and the overlay's arrival gate keeps it whichever order they land in
  const storeUpdateStorageUsage = (user: UserInAuth) => {
    arrive(storageUserTable, user);
  };
  return { readStorageUsage, storageUsage, storeUpdateStorageUsage };
});
