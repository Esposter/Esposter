import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { ResourceStatusFilter } from "@/models/resource/list/ResourceStatusFilter";

export const ResourceStatusFilterItems: SelectItemCategoryDefinition<"" | ResourceStatusFilter>[] = [
  { title: "All", value: "" },
  { title: ResourceStatusFilter.Published, value: ResourceStatusFilter.Published },
  { title: ResourceStatusFilter.Draft, value: ResourceStatusFilter.Draft },
];
