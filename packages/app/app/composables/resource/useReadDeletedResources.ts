import { useReadResourcesPage } from "@/composables/resource/list/useReadResourcesPage";

// The caller's own Recycle bin: soft-deleted resources awaiting restore or purge
export const useReadDeletedResources = () => {
  const { $trpc } = useNuxtApp();
  const { count, error, isLoading, items, read, refresh } = useReadResourcesPage({
    // Nothing filters the bin, so the total is counted on the table's first read and reused from then on —
    // A page or sort change never re-counts the whole partition, only a restore or a purge does
    getFilterKey: () => "",
    readCount: () => $trpc.resource.countDeletedResources.query(),
    readPage: async ({ itemsPerPage, page, sortBy }) =>
      (
        await $trpc.resource.readDeletedResources.query({
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage,
          sortBy,
        })
      ).items,
  });
  return { count, error, isLoading, items, readDeletedResources: read, refresh };
};
