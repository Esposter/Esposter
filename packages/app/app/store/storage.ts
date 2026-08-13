import type { StorageUsage } from "#shared/models/storage/StorageUsage";

// The usage meter mounts on every resource page, and the layout it sits in is declared per page — so it is
// Remounted on every navigation within the explorer. The number lives here rather than in the component so
// That remount renders the value it already has instead of blanking the bar and re-reading it.
// See /docs/platform/storage-quotas
export const useStorageStore = defineStore("storage", () => {
  const { $trpc } = useNuxtApp();
  const storageUsage = ref<StorageUsage>();
  const { read: readStorageUsage } = useCachedRead(() => $trpc.storage.getUsage.query(), {
    // Deliberately untagged. The counter only moves when storage's own BlobCreated event lands seconds after
    // The PUT, so there is no moment a write here could invalidate this and read a different number — the
    // Read is per session, not per navigation, and no tag would make it truer
    onSuccess: (newStorageUsage) => {
      storageUsage.value = newStorageUsage;
    },
  });
  return { readStorageUsage, storageUsage };
});
