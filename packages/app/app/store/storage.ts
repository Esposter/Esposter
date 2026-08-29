import type { StorageUsage } from "#shared/models/storage/StorageUsage";

// The usage meter mounts on every resource page, and the layout it sits in is declared per page — so it is
// Remounted on every navigation within the explorer. The number lives here rather than in the component so
// That remount renders the value it already has instead of blanking the bar and re-reading it.
// See /docs/platform/storage-quotas
export const useStorageStore = defineStore("storage", () => {
  const { $trpc } = useNuxtApp();
  const storageUsage = ref<StorageUsage>();
  const { read: readStorageUsage } = useCachedRead(() => $trpc.storage.readUsage.query(), {
    onSuccess: (newStorageUsage) => {
      storageUsage.value = newStorageUsage;
    },
  });
  const storeUpdateStorageUsage = (newStorageUsage: StorageUsage) => {
    storageUsage.value = newStorageUsage;
  };
  return { readStorageUsage, storageUsage, storeUpdateStorageUsage };
});
