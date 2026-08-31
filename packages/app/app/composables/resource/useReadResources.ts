import type { ResourceFilterValues } from "@/models/resource/list/ResourceFilterValues";
import type { ResourceListFilters } from "@/models/resource/list/ResourceListFilters";
import type { ResourceStatusFilter } from "@/models/resource/list/ResourceStatusFilter";
import type { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import type { ResourceType } from "@esposter/db-schema";

import { ResourceListSource } from "@/models/resource/list/ResourceListSource";
import { getResourceFilterInput } from "@/services/resource/list/getResourceFilterInput";
import { getResourceFilterKey } from "@/services/resource/list/getResourceFilterKey";

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
  source = ResourceListSource.All,
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
  const { count, error, getLastSortBy, isPending, items, read, refresh } = useReadResourcesPage({
    getFilterInput,
    // The count depends on the filter alone, so the filter the user picked is exactly what it is keyed by
    getFilterKey: () => getResourceFilterKey(getFilterValues()),
    readCount: (filterInput) => $trpc.resource.count.query(filterInput),
    readPage: async ({ itemsPerPage, page, sortBy }, filterInput) =>
      (
        await $trpc.resource.readResources.query({
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage,
          sortBy,
          ...filterInput,
        })
      ).items,
  });
  // Snapshots the filter + sort at call time so a chunked consumer (CSV export) pages one consistent query
  // Even if the filters change mid-export
  const createResourcesPageReader = () => {
    const input = { sortBy: getLastSortBy(), ...getFilterInput() };
    return ({ limit, offset }: { limit: number; offset: number }) =>
      $trpc.resource.readResources.query({ limit, offset, ...input });
  };
  return { count, createResourcesPageReader, error, isPending, items, readResources: read, refresh };
};
