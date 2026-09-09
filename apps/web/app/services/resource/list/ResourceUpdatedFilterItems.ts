import type { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { ResourceUpdatedFilters } from "@/models/resource/list/ResourceUpdatedFilter";
// The enum declares presets chronologically with Custom last, so its order is the dropdown order
export const ResourceUpdatedFilterItems: SelectItemCategoryDefinition<ResourceUpdatedFilter>[] = Array.from(
  ResourceUpdatedFilters,
  (value) => ({ title: value, value }),
);
