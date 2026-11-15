import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { ResourceFilterValues } from "@/models/resource/list/ResourceFilterValues";
import type { ResourceListFilters } from "@/models/resource/list/ResourceListFilters";
import type { ResourceStatusFilter } from "@/models/resource/list/ResourceStatusFilter";
import type { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import type { ResourceType } from "@esposter/db-schema";

import { ResourceListSource } from "@/models/resource/list/ResourceListSource";
import { getResourceFilterInput } from "@/services/resource/list/getResourceFilterInput";
import { getResourceFilterKey } from "@/services/resource/list/getResourceFilterKey";
import { getResourceListSortName } from "@/services/resource/list/getResourceListSortName";
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
  const { count, error, getLastSortBy, isPending, items, read, refresh } = useReadResourcesPage({
    getFilterInput,
    // The total depends on the filter alone, so the filter the user picked is exactly what it is keyed by
    getFilterKey: () => getResourceFilterKey(getFilterValues()),
    readPage: (cursor, filterInput, { itemsPerPage, sortBy }) =>
      readListPage({ cursor, limit: itemsPerPage, sortBy }, filterInput),
  });
  // Snapshots the filter + sort at call time so a chunked consumer (CSV export) pages one consistent query
  // Even if the filters change mid-export
  const createResourcesPageReader = () => {
    const filterInput = getFilterInput();
    const sortBy = getLastSortBy();
    return (cursor: string) => readListPage({ cursor, limit: MAX_READ_LIMIT, sortBy }, filterInput);
  };
  return { count, createResourcesPageReader, error, isPending, items, readResources: read, refresh };
};
