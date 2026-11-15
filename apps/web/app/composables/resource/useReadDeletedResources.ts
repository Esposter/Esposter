import { getResourceBinSortName } from "@/services/resource/list/getResourceBinSortName";

// The caller's own Recycle bin: soft-deleted resources awaiting restore or purge
export const useReadDeletedResources = () => {
  const { $trpc } = useNuxtApp();
  const { count, error, isPending, items, read, refresh } = useReadResourcesPage({
    // Nothing filters the bin, so the total is counted on the table's first read and reused from then on: a page or
    // Sort change never re-counts the whole partition, only a Restore or a purge does
    getFilterInput: () => undefined,
    getFilterKey: () => "",
    readPage: (cursor, _filterInput, { itemsPerPage, sortBy }) =>
      $trpc.resource.readDeletedResources.query({
        cursor,
        limit: itemsPerPage,
        sortName: getResourceBinSortName(sortBy),
      }),
  });
  return { count, error, isPending, items, readDeletedResources: read, refresh };
};
