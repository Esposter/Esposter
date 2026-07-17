import type { ResourceFilterValues } from "@/models/resource/list/ResourceFilterValues";

import { ResourceStatusFilter } from "@/models/resource/list/ResourceStatusFilter";
import { getResourceUpdatedRange } from "@/services/resource/list/getResourceUpdatedRange";

// Maps the client filter refs' sentinel values onto the procedure's optional filter input
export const getResourceFilterInput = ({
  searchQuery,
  status,
  tagName,
  tagValue,
  types,
  updatedAfter,
  updatedBefore,
  updatedFilter,
}: ResourceFilterValues) => ({
  ...(searchQuery ? { searchQuery } : {}),
  ...(types.length > 0 ? { types } : {}),
  ...(status ? { isPublished: status === ResourceStatusFilter.Published } : {}),
  // A value pins the tag to it (containment); without one the filter is just "has this tag"
  ...(tagName ? (tagValue ? { tags: { [tagName]: tagValue } } : { tagName }) : {}),
  ...getResourceUpdatedRange(updatedFilter, updatedAfter, updatedBefore),
});
