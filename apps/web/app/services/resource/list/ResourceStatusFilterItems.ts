import type { SelectItemCategoryDefinition } from "#src/models/shared/SelectItemCategoryDefinition";

import { ResourceStatusFilter } from "#src/models/resource/list/ResourceStatusFilter";

export const ResourceStatusFilterItems: SelectItemCategoryDefinition<"" | ResourceStatusFilter>[] = [
  { title: "All", value: "" },
  { title: ResourceStatusFilter.Published, value: ResourceStatusFilter.Published },
  { title: ResourceStatusFilter.Draft, value: ResourceStatusFilter.Draft },
];
