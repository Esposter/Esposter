// The caller's own Recycle bin: soft-deleted resources awaiting restore or purge
export const useReadDeletedResources = () => {
  const { $trpc } = useNuxtApp();
  const { count, error, isPending, items, read, refresh } = useReadResourcesPage({
    // Nothing filters the bin, so neither query takes an input and the total is counted on the table's first
    // Read and reused from then on — a page or sort change never re-counts the whole partition, only a
    // Restore or a purge does
    getFilterInput: () => undefined,
    getFilterKey: () => "",
    readCount: () => $trpc.resource.readDeletedResourcesCount.query(),
    readPage: async ({ itemsPerPage, page, sortBy }) =>
      (
        await $trpc.resource.readDeletedResources.query({
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage,
          sortBy,
        })
      ).items,
  });
  return { count, error, isPending, items, readDeletedResources: read, refresh };
};
