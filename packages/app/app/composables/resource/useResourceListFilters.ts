import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ResourceStatusFilter } from "@/models/resource/list/ResourceStatusFilter";
import type { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import type { Resource, ResourceType } from "@esposter/db-schema";

import { resourceStatusFilterSchema } from "@/models/resource/list/ResourceStatusFilter";
import { DEFAULT_RESOURCE_SORT_BY } from "@/services/resource/constants";
import { deserializeResourceSortBy } from "@/services/resource/list/deserializeResourceSortBy";
import { serializeResourceSortBy } from "@/services/resource/list/serializeResourceSortBy";
import { resourceTypeSchema } from "@esposter/db-schema";

const defaultSerializedSortBy = serializeResourceSortBy([...DEFAULT_RESOURCE_SORT_BY]);
// The /all workbench filter state, mirrored to query params so the list is deep-linkable,
// Refresh-safe, and back-button-safe. useRouteQuery drops a param again when set back to its default.
export const useResourceListFilters = () => {
  const searchQuery = useRouteQuery("search", "", { transform: String });
  const types = useRouteQuery<null | string | string[], ResourceType[]>("types", [], {
    transform: (value) =>
      (Array.isArray(value) ? value : [value]).flatMap((typeValue) => {
        const parsedType = resourceTypeSchema.safeParse(typeValue);
        return parsedType.success ? [parsedType.data] : [];
      }),
  });
  const status = useRouteQuery<null | string | string[], "" | ResourceStatusFilter>("status", "", {
    transform: (value) => {
      const parsedStatus = resourceStatusFilterSchema.safeParse(value);
      return parsedStatus.success ? parsedStatus.data : "";
    },
  });
  const page = useRouteQuery<null | number | string | string[], number>("page", 1, {
    transform: (value) => {
      const parsedPage = Number(value);
      return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    },
  });
  // Objects can't round-trip through a query param directly, so sortBy serializes to "key:order,..."
  const sortByQuery = useRouteQuery("sortBy", "", { transform: String });
  const sortBy = computed<SortItem<keyof Resource>[]>({
    get: () => (sortByQuery.value ? deserializeResourceSortBy(sortByQuery.value) : [...DEFAULT_RESOURCE_SORT_BY]),
    set: (value) => {
      const serializedSortBy = serializeResourceSortBy(value);
      sortByQuery.value = serializedSortBy === defaultSerializedSortBy ? "" : serializedSortBy;
    },
  });
  const updatedFilter = ref<"" | ResourceUpdatedFilter>("");
  const updatedAfter = ref<Date>();
  const updatedBefore = ref<Date>();
  const hasActiveFilters = computed(() =>
    Boolean(searchQuery.value || types.value.length > 0 || status.value || updatedFilter.value),
  );
  const clearFilters = () => {
    searchQuery.value = "";
    types.value = [];
    status.value = "";
    updatedFilter.value = "";
    updatedAfter.value = undefined;
    updatedBefore.value = undefined;
  };
  return {
    clearFilters,
    hasActiveFilters,
    page,
    searchQuery,
    sortBy,
    status,
    types,
    updatedAfter,
    updatedBefore,
    updatedFilter,
  };
};
