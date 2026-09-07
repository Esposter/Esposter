import type { StorageUsage } from "#shared/models/storage/StorageUsage";

// The usage meter mounts on every resource page, and the layout it sits in is declared per page — so it is
// Remounted on every navigation within the explorer. The number lives here rather than in the component so
// That remount renders the value it already has instead of blanking the bar and re-reading it.
// See /docs/platform/storage-quotas
export const useStorageStore = defineStore("storage", () => {
  const { $trpc } = useNuxtApp();
  const storageUsage = ref<StorageUsage>();
  const {
    read: readStorageUsage,
    refetch: refetchStorageUsage,
    supersede,
  } = useCachedRead(() => $trpc.storage.readUsage.query(), {
    onSuccess: (newStorageUsage) => {
      storageUsage.value = newStorageUsage;
    },
  });
  // The subscription is established before the first read is issued, so a charge can land between the two. The
  // Pushed value is the newer of the pair — it reports a total committed after the read's snapshot was taken —
  // So it supersedes the read rather than being overwritten by the older number already on its way
  const storeUpdateStorageUsage = (newStorageUsage: StorageUsage) => {
    supersede();
    storageUsage.value = newStorageUsage;
  };
  return { readStorageUsage, refetchStorageUsage, storageUsage, storeUpdateStorageUsage };
});
