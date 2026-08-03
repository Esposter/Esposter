import type { ResourceListFilters } from "@/models/resource/list/ResourceListFilters";
import type { ResourceStatusFilter } from "@/models/resource/list/ResourceStatusFilter";
import type { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import type { ResourceType } from "@esposter/db-schema";

import { useReadResourcesPage } from "@/composables/resource/list/useReadResourcesPage";
import { getResourceFilterInput } from "@/services/resource/list/getResourceFilterInput";

export const useReadResources = ({
  searchQuery = ref(""),
  status = ref<"" | ResourceStatusFilter>(""),
  tagName = ref(""),
  tagValue = ref(""),
  types = ref<ResourceType[]>([]),
  updatedAfter = ref<Date>(),
  updatedBefore = ref<Date>(),
  updatedFilter = ref<"" | ResourceUpdatedFilter>(""),
}: Partial<ResourceListFilters> = {}) => {
  const { $trpc } = useNuxtApp();
  const getFilterInput = () =>
    getResourceFilterInput({
      searchQuery: searchQuery.value,
      status: status.value,
      tagName: tagName.value,
      tagValue: tagValue.value,
      types: types.value,
      updatedAfter: updatedAfter.value,
      updatedBefore: updatedBefore.value,
      updatedFilter: updatedFilter.value,
    });
  const { count, error, getLastSortBy, isLoading, items, read, refresh } = useReadResourcesPage({
    // The count depends on the filter alone, so the serialized filter input is exactly what it is keyed by
    getFilterKey: () => JSON.stringify(getFilterInput()),
    readCount: () => $trpc.resource.count.query(getFilterInput()),
    readPage: async ({ itemsPerPage, page, sortBy }) =>
      (
        await $trpc.resource.readResources.query({
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage,
          sortBy,
          ...getFilterInput(),
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
  return { count, createResourcesPageReader, error, isLoading, items, readResources: read, refresh };
};
