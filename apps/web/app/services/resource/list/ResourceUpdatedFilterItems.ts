import type { ResourceUpdatedFilter } from "#src/models/resource/list/ResourceUpdatedFilter";
import type { SelectItemCategoryDefinition } from "#src/models/shared/SelectItemCategoryDefinition";

import { ResourceUpdatedFilters } from "#src/models/resource/list/ResourceUpdatedFilter";

// The presets are ranked in the order the dropdown lists them, so the set is already in that order
export const ResourceUpdatedFilterItems: SelectItemCategoryDefinition<ResourceUpdatedFilter>[] = Array.from(
  ResourceUpdatedFilters,
  (value) => ({ title: value, value }),
);
