import type { ReadResourcesOptions } from "@/models/resource/list/ReadResourcesOptions";
import type { ResourceListFilters } from "@/models/resource/list/ResourceListFilters";
import type { ResourceStatusFilter } from "@/models/resource/list/ResourceStatusFilter";
import type { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import type { Resource, ResourceType } from "@esposter/db-schema";

import { getConcurrentFunction } from "#shared/util/function/getConcurrentFunction";
import { getResourceFilterInput } from "@/services/resource/list/getResourceFilterInput";
import { getResultAsync, noop } from "@esposter/shared";

export const useReadResources = ({
  searchQuery = ref(""),
  status = ref<"" | ResourceStatusFilter>(""),
  types = ref<ResourceType[]>([]),
  updatedAfter = ref<Date>(),
  updatedBefore = ref<Date>(),
  updatedFilter = ref<"" | ResourceUpdatedFilter>(""),
}: Partial<ResourceListFilters> = {}) => {
  const { $trpc } = useNuxtApp();
  const items = ref<Resource[]>([]);
  const count = ref(0);
  const isLoading = ref(false);
  const error = ref("");
  // Remembered so Refresh / error Retry can re-run the exact query the table last asked for
  let lastOptions: ReadResourcesOptions | undefined;
  const getFilterInput = () =>
    getResourceFilterInput({
      searchQuery: searchQuery.value,
      status: status.value,
      types: types.value,
      updatedAfter: updatedAfter.value,
      updatedBefore: updatedBefore.value,
      updatedFilter: updatedFilter.value,
    });
  // Debounced search, filter pills, Refresh and Retry can all fire overlapping reads, so a stale response
  // Must neither overwrite fresher data nor flip loading state early
  const readResources = getConcurrentFunction(async (checkIsStale, options: ReadResourcesOptions) => {
    lastOptions = options;
    const { itemsPerPage, page, sortBy } = options;
    const filterInput = getFilterInput();
    isLoading.value = true;
    error.value = "";
    await getResultAsync(async () => {
      const [newCount, { items: newItems }] = await Promise.all([
        $trpc.resource.count.query(filterInput),
        $trpc.resource.readResources.query({
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage,
          sortBy,
          ...filterInput,
        }),
      ]);
      if (checkIsStale()) return;
      count.value = newCount;
      items.value = newItems;
    }).match(noop, (readError) => {
      if (!checkIsStale()) error.value = readError.message;
    });
    if (!checkIsStale()) isLoading.value = false;
  });
  // Snapshots the filter + sort at call time so a chunked consumer (CSV export) pages one consistent query
  // Even if the filters change mid-export
  const createResourcesPageReader = () => {
    const input = { sortBy: lastOptions?.sortBy ?? [], ...getFilterInput() };
    return ({ limit, offset }: { limit: number; offset: number }) =>
      $trpc.resource.readResources.query({ limit, offset, ...input });
  };
  const refresh = () => (lastOptions ? readResources(lastOptions) : Promise.resolve());
  return { count, createResourcesPageReader, error, isLoading, items, readResources, refresh };
};
