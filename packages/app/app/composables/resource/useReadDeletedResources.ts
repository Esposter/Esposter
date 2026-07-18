import type { ReadResourcesOptions } from "@/models/resource/list/ReadResourcesOptions";
import type { Resource } from "@esposter/db-schema";

import { getResultAsync, noop } from "@esposter/shared";

// The caller's own Recycle bin: soft-deleted resources awaiting restore or purge
export const useReadDeletedResources = () => {
  const { $trpc } = useNuxtApp();
  const items = ref<Resource[]>([]);
  const count = ref(0);
  const isLoading = ref(false);
  const error = ref("");
  // Remembered so Refresh, a restore, or a purge can re-run the exact page the table last asked for
  let lastOptions: ReadResourcesOptions | undefined;
  // The total is independent of paging, so it loads once up front and again only when a restore or purge
  // Changes it — a page or sort change reuses the same total instead of re-counting the whole partition
  const readCount = () =>
    getResultAsync(async () => {
      count.value = await $trpc.resource.countDeletedResources.query();
    }).match(noop, (readError) => {
      error.value = readError.message;
    });
  const readDeletedResources = async (options: ReadResourcesOptions) => {
    lastOptions = options;
    const { itemsPerPage, page, sortBy } = options;
    isLoading.value = true;
    error.value = "";
    await getResultAsync(async () => {
      const { items: newItems } = await $trpc.resource.readDeletedResources.query({
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        sortBy,
      });
      items.value = newItems;
    }).match(noop, (readError) => {
      error.value = readError.message;
    });
    isLoading.value = false;
  };
  // A restore or purge changes both the current page and the total, so Refresh re-reads both
  const refresh = async () => {
    if (lastOptions) await Promise.all([readCount(), readDeletedResources(lastOptions)]);
  };
  return { count, error, isLoading, items, readCount, readDeletedResources, refresh };
};
