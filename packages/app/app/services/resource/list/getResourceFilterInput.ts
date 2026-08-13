import type { ResourceFilterValues } from "@/models/resource/list/ResourceFilterValues";

import { ResourceStatusFilter } from "@/models/resource/list/ResourceStatusFilter";
import { getResourceUpdatedRange } from "@/services/resource/list/getResourceUpdatedRange";
import { ResourceListSourceDefinitionMap } from "@/services/resource/list/ResourceListSourceDefinitionMap";
import { normalizeString } from "@esposter/shared";

// Maps the client filter refs' sentinel values onto the procedure's optional filter input
export const getResourceFilterInput = ({
  searchQuery,
  source,
  status,
  tagName,
  tagValue,
  types,
  updatedAfter,
  updatedBefore,
  updatedFilter,
}: ResourceFilterValues) => {
  // Stored tag names/values are normalized at save, so the filter must match them the same way
  const normalizedTagName = normalizeString(tagName);
  const normalizedTagValue = normalizeString(tagValue);
  return {
    // The source's own predicate, applied like any other filter so a Favorites or Recent view inherits the
    // Whole workbench — pills, count, summary cards — instead of reading through a list of its own
    ...ResourceListSourceDefinitionMap[source].filter,
    ...(searchQuery ? { searchQuery } : {}),
    ...(types.length > 0 ? { types } : {}),
    ...(status ? { isPublished: status === ResourceStatusFilter.Published } : {}),
    // A value pins the tag to it (containment); without one the filter is just "has this tag"
    ...(normalizedTagName
      ? normalizedTagValue
        ? { tags: { [normalizedTagName]: normalizedTagValue } }
        : { tagName: normalizedTagName }
      : {}),
    ...getResourceUpdatedRange(updatedFilter, updatedAfter, updatedBefore),
  };
};
