import type { ResourceUpdatedFilter } from "#src/models/resource/list/ResourceUpdatedFilter";
import type { SelectItemCategoryDefinition } from "#src/models/shared/SelectItemCategoryDefinition";

import { ResourceUpdatedFilters } from "#src/models/resource/list/ResourceUpdatedFilter";

// The enum declares presets chronologically with Custom last, so its order is the dropdown order
export const ResourceUpdatedFilterItems: SelectItemCategoryDefinition<ResourceUpdatedFilter>[] = Array.from(
  ResourceUpdatedFilters,
  (value) => ({ title: value, value }),
);
