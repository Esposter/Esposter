import type { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import type { ResourceType } from "@esposter/db-schema";

import { ResourceStatusFilter } from "@/models/resource/list/ResourceStatusFilter";
import { getResourceUpdatedRange } from "@/services/resource/list/getResourceUpdatedRange";

interface ResourceFilterValues {
  searchQuery: string;
  status: "" | ResourceStatusFilter;
  tagName: string;
  tagValue: string;
  types: ResourceType[];
  updatedAfter?: Date;
  updatedBefore?: Date;
  updatedFilter: "" | ResourceUpdatedFilter;
}
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
