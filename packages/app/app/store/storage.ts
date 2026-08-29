import type { StorageUsage } from "#shared/models/storage/StorageUsage";

// The usage meter mounts on every resource page, and the layout it sits in is declared per page — so it is
// Remounted on every navigation within the explorer. The number lives here rather than in the component so
// That remount renders the value it already has instead of blanking the bar and re-reading it.
// See /docs/platform/storage-quotas
export const useStorageStore = defineStore("storage", () => {
  const { $trpc } = useNuxtApp();
  const storageUsage = ref<StorageUsage>();
  // The subscription is established before the first read is issued, so a charge can land between the two and
  // Be overwritten by a read that was already in flight when it did. A pushed value is by construction the
  // Newer of the two — it reports a total committed after the read's snapshot was taken — so the read is
  // Dropped rather than the push, and the counter this arbitrates is which of them wrote last
  let updateCount = 0;
  let readUpdateCount = 0;
  const { read: readStorageUsage } = useCachedRead(
    () => {
      readUpdateCount = updateCount;
      return $trpc.storage.readUsage.query();
    },
    {
      onSuccess: (newStorageUsage) => {
        if (readUpdateCount !== updateCount) return;

        storageUsage.value = newStorageUsage;
      },
    },
  );
  const storeUpdateStorageUsage = (newStorageUsage: StorageUsage) => {
    updateCount += 1;
    storageUsage.value = newStorageUsage;
  };
  return { readStorageUsage, storageUsage, storeUpdateStorageUsage };
});
