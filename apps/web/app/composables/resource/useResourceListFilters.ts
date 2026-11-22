import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { ResourceStatusFilter } from "#src/models/resource/list/ResourceStatusFilter";
import type { ResourceUpdatedFilter } from "#src/models/resource/list/ResourceUpdatedFilter";
import type { ResourceType } from "@esposter/db-schema";

import { ResourceStatusFilters } from "#src/models/resource/list/ResourceStatusFilter";
import { ResourceUpdatedFilters } from "#src/models/resource/list/ResourceUpdatedFilter";
import { createUpdatedBound } from "#src/services/resource/list/createUpdatedBound";
import { deserializeResourceColumnKeyWidthMap } from "#src/services/resource/list/deserializeResourceColumnKeyWidthMap";
import { deserializeResourceSortBy } from "#src/services/resource/list/deserializeResourceSortBy";
import { serializeResourceColumnKeyWidthMap } from "#src/services/resource/list/serializeResourceColumnKeyWidthMap";
import { serializeResourceSortBy } from "#src/services/resource/list/serializeResourceSortBy";
import { parsePositiveInteger } from "#src/services/shared/parsePositiveInteger";
import { resourceTypeSchema } from "@esposter/db-schema";

// The list workbench's filter state, mirrored to query params so the list is deep-linkable, refresh-safe and
// Back-button-safe. useRouteQuery drops a param again when set back to its default, and the default order is
// The view's own — Recent's newest-open-first leaves the url as clean as All's newest-updated-first.
export const useResourceListFilters = (defaultSortBy: readonly SortItem<keyof ResourceListItem>[]) => {
  const defaultSerializedSortBy = serializeResourceSortBy([...defaultSortBy]);
  const searchQuery = useRouteQuery("search", "", { transform: String });
  const types = useRouteQuery<null | string | string[], ResourceType[]>("types", [], {
    transform: (value) =>
      (Array.isArray(value) ? value : [value]).flatMap((typeValue) => {
        const parsedType = resourceTypeSchema.safeParse(typeValue);
        return parsedType.success ? [parsedType.data] : [];
      }),
  });
  const status = useEnumRouteQuery<"" | ResourceStatusFilter>("status", ResourceStatusFilters, "");
  const page = useRouteQuery<null | number | string | string[], number>("page", 1, {
    transform: (value) => parsePositiveInteger(String(value)) ?? 1,
  });
  // Objects can't round-trip through a query param directly, so sortBy serializes to "key:order,..."
  const sortByQuery = useRouteQuery("sortBy", "", { transform: String });
  const sortBy = computed<SortItem<keyof ResourceListItem>[]>({
    get: () => (sortByQuery.value ? deserializeResourceSortBy(sortByQuery.value) : [...defaultSortBy]),
    set: (value) => {
      const serializedSortBy = serializeResourceSortBy(value);
      sortByQuery.value = serializedSortBy === defaultSerializedSortBy ? "" : serializedSortBy;
    },
  });
  // Name and value are separate params so a name-only tag filter stays deep-linkable
  const tagName = useRouteQuery("tagName", "", { transform: String });
  const tagValue = useRouteQuery("tagValue", "", { transform: String });
  const updatedFilter = useEnumRouteQuery<"" | ResourceUpdatedFilter>("updated", ResourceUpdatedFilters, "");
  const updatedAfter = createUpdatedBound("updatedAfter");
  const updatedBefore = createUpdatedBound("updatedBefore");
  // The widths the reader dragged the columns to are the address's too, as "key:width,...", so a reload or a shared link
  // Lays the list out the same
  const columnWidthsQuery = useRouteQuery("columnWidths", "", { transform: String });
  const columnKeyWidthMap = computed({
    get: () => deserializeResourceColumnKeyWidthMap(columnWidthsQuery.value),
    set: (newColumnKeyWidthMap) => {
      columnWidthsQuery.value = serializeResourceColumnKeyWidthMap(newColumnKeyWidthMap);
    },
  });
  const hasActiveFilters = computed(() =>
    Boolean(searchQuery.value || types.value.length > 0 || status.value || updatedFilter.value || tagName.value),
  );
  const clearFilters = () => {
    searchQuery.value = "";
    types.value = [];
    status.value = "";
    tagName.value = "";
    tagValue.value = "";
    updatedFilter.value = "";
    updatedAfter.value = undefined;
    updatedBefore.value = undefined;
  };
  return {
    clearFilters,
    columnKeyWidthMap,
    hasActiveFilters,
    page,
    searchQuery,
    sortBy,
    status,
    tagName,
    tagValue,
    types,
    updatedAfter,
    updatedBefore,
    updatedFilter,
  };
};
