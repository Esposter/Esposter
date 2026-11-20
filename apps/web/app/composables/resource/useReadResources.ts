import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { ResourceFilterValues } from "#src/models/resource/list/ResourceFilterValues";
import type { ResourceListFilters } from "#src/models/resource/list/ResourceListFilters";
import type { ResourceStatusFilter } from "#src/models/resource/list/ResourceStatusFilter";
import type { ResourceUpdatedFilter } from "#src/models/resource/list/ResourceUpdatedFilter";
import type { ResourceType } from "@esposter/db-schema";

import { ResourceListSource } from "#src/models/resource/list/ResourceListSource";
import { getResourceFilterInput } from "#src/services/resource/list/getResourceFilterInput";
import { getResourceFilterKey } from "#src/services/resource/list/getResourceFilterKey";
import { getResourceListSortName } from "#src/services/resource/list/getResourceListSortName";
import { resourceTable } from "#src/services/resource/overlay/constants";
import { getHeldResource } from "#src/services/resource/overlay/getHeldResource";
import { useOverlayStore } from "#src/store/overlay";
import { MAX_READ_LIMIT } from "@esposter/shared";

export const useReadResources = (
  {
    searchQuery = ref(""),
    status = ref<"" | ResourceStatusFilter>(""),
    tagName = ref(""),
    tagValue = ref(""),
    types = ref<ResourceType[]>([]),
    updatedAfter = ref<Date>(),
    updatedBefore = ref<Date>(),
    updatedFilter = ref<"" | ResourceUpdatedFilter>(""),
  }: Partial<ResourceListFilters> = {},
  // The route decides the set, so it is a value rather than a ref — a list never changes source in place
  source: ResourceListSource = ResourceListSource.All,
) => {
  const { $trpc } = useNuxtApp();
  const getFilterValues = (): ResourceFilterValues => ({
    searchQuery: searchQuery.value,
    source,
    status: status.value,
    tagName: tagName.value,
    tagValue: tagValue.value,
    types: types.value,
    updatedAfter: updatedAfter.value,
    updatedBefore: updatedBefore.value,
    updatedFilter: updatedFilter.value,
  });
  const getFilterInput = () => getResourceFilterInput(getFilterValues());
  // One read of the owner's list: a page from its cursor, in the order the table names (or relevance, for a search)
  const readListPage = (
    { cursor, limit, sortBy }: { cursor: string; limit: number; sortBy: readonly SortItem<keyof ResourceListItem>[] },
    filterInput: ReturnType<typeof getFilterInput>,
  ) =>
    $trpc.resource.readResources.query({
      cursor,
      limit,
      sortName: getResourceListSortName(sortBy, filterInput),
      ...filterInput,
    });
  const overlayStore = useOverlayStore();
  const { arrive, view } = overlayStore;
  const resourceRows = view(resourceTable);
  const {
    count,
    error,
    getLastSortBy,
    isPending,
    items: pageItems,
    read,
    refresh,
  } = useReadResourcesPage({
    getFilterInput,
    // The total depends on the filter alone, so the filter the user picked is exactly what it is keyed by
    getFilterKey: () => getResourceFilterKey(getFilterValues()),
    // Each row a page answers is held on the overlay as it arrives, so an edit or a removal of the row, by this list or
    // Any other surface, reaches the list without a patch of its own. The last access is the read's, not the row's, so
    // It is left off the held row and kept on the page beside it
    readPage: async (cursor, filterInput, { itemsPerPage, sortBy }) => {
      const page = await readListPage({ cursor, limit: itemsPerPage, sortBy }, filterInput);
      for (const { lastAccessedAt: _lastAccessedAt, ...row } of page.items) arrive(resourceTable, row);
      return page;
    },
  });
  // The page's rows in the order the page named them, each as the overlay holds it. A row the overlay holds as removed
  // Is not held live, so it leaves the page at once
  const items = computed(() =>
    pageItems.value.flatMap(({ id, lastAccessedAt }) => {
      const row = getHeldResource(resourceRows.value, id);
      return row ? [{ ...row, lastAccessedAt }] : [];
    }),
  );
  // Snapshots the filter + sort at call time so a chunked consumer (CSV export) pages one consistent query
  // Even if the filters change mid-export
  const createResourcesPageReader = () => {
    const filterInput = getFilterInput();
    const sortBy = getLastSortBy();
    return (cursor: string) => readListPage({ cursor, limit: MAX_READ_LIMIT, sortBy }, filterInput);
  };
  return { count, createResourcesPageReader, error, isPending, items, readResources: read, refresh };
};
