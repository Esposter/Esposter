import type { StorageUsage } from "#shared/models/storage/StorageUsage";

// One target, so every read of it supersedes the one before — the primitive's latest-wins, not a flag here
const STORAGE_USAGE_KEY = "storageUsage";

// The usage meter mounts on every resource page, and the layout it sits in is declared per page — so it is
// Remounted on every navigation within the explorer. The number lives here rather than in the component so
// That remount renders the value it already has instead of blanking the bar and re-reading it.
// See /docs/platform/storage-quotas
export const useStorageStore = defineStore("storage", () => {
  const { $trpc } = useNuxtApp();
  const { executeQuery } = useMutation();
  const storageUsage = ref<StorageUsage>();
  // Read-once-per-session, which single-flight cannot cover: a settled read is no longer in flight to join.
  // A failed read leaves this false so the next mount retries instead of caching the failure
  let isLoaded = false;
  // The counter only moves when storage's own BlobCreated lands seconds after a PUT, so there is no moment an
  // Upload could invalidate this and read a different number — the read is per session, not per navigation
  const readStorageUsage = async () => {
    if (isLoaded) return;

    await executeQuery(() => $trpc.storage.getUsage.query(), {
      isExclusive: true,
      key: STORAGE_USAGE_KEY,
      onSuccess: (newStorageUsage) => {
        storageUsage.value = newStorageUsage;
        isLoaded = true;
      },
    });
  };
  return { readStorageUsage, storageUsage };
});
