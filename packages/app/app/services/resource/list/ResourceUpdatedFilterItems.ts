import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
// The enum declares presets chronologically with Custom last, so its order is the dropdown order
export const ResourceUpdatedFilterItems: SelectItemCategoryDefinition<ResourceUpdatedFilter>[] = Object.values(
  ResourceUpdatedFilter,
).map((value) => ({ title: value, value }));
