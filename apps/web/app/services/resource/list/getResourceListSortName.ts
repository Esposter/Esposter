import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { ResourceListSortName } from "#shared/models/resource/ResourceListSortName";

import { resourceListSortNameSchema } from "#shared/models/resource/ResourceListSortName";
import { ResourceSortName } from "#shared/models/resource/ResourceSortName";
import { checkIsSortNameAvailable } from "#shared/services/resource/checkIsSortNameAvailable";
import { getResourceSortName } from "#src/services/resource/list/getResourceSortName";

// The order a list's read takes. A search takes none, because it is ordered by relevance alone, and only a search is ordered that way
export const getResourceListSortName = (
  sortBy: readonly SortItem<keyof ResourceListItem>[],
  { isAccessed, searchQuery }: { isAccessed?: boolean; searchQuery?: string },
): ResourceListSortName | undefined => {
  if (searchQuery) return undefined;
  return getResourceSortName(
    sortBy,
    resourceListSortNameSchema.options.filter((sortName) => checkIsSortNameAvailable(sortName, isAccessed)),
    ResourceSortName.UpdatedAtDesc,
  );
};
