import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";

// Portal preset order: relative presets narrowest-first, Custom last
export const ResourceUpdatedFilterItems: SelectItemCategoryDefinition<ResourceUpdatedFilter>[] = [
  { title: ResourceUpdatedFilter.Last24Hours, value: ResourceUpdatedFilter.Last24Hours },
  { title: ResourceUpdatedFilter.Last7Days, value: ResourceUpdatedFilter.Last7Days },
  { title: ResourceUpdatedFilter.Last30Days, value: ResourceUpdatedFilter.Last30Days },
  { title: ResourceUpdatedFilter.Custom, value: ResourceUpdatedFilter.Custom },
];
