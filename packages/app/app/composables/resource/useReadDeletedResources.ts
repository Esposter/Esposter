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
  // Remembered so Refresh, a restore, or a purge can re-run the exact query the table last asked for
  let lastOptions: ReadResourcesOptions | undefined;
  const readDeletedResources = async (options: ReadResourcesOptions) => {
    lastOptions = options;
    const { itemsPerPage, page, sortBy } = options;
    isLoading.value = true;
    error.value = "";
    await getResultAsync(async () => {
      const [newCount, { items: newItems }] = await Promise.all([
        $trpc.resource.countDeletedResources.query(),
        $trpc.resource.readDeletedResources.query({
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage,
          sortBy,
        }),
      ]);
      count.value = newCount;
      items.value = newItems;
    }).match(noop, (readError) => {
      error.value = readError.message;
    });
    isLoading.value = false;
  };
  const refresh = () => (lastOptions ? readDeletedResources(lastOptions) : Promise.resolve());
  return { count, error, isLoading, items, readDeletedResources, refresh };
};
