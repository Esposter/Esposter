import type { ResourceStatusFilter } from "@/models/resource/list/ResourceStatusFilter";
import type { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import type { ResourceType } from "@esposter/db-schema";

// The client filter refs' plain values, with `""` sentinels for unset selects
export interface ResourceFilterValues {
  searchQuery: string;
  status: "" | ResourceStatusFilter;
  types: ResourceType[];
  updatedAfter?: Date;
  updatedBefore?: Date;
  updatedFilter: "" | ResourceUpdatedFilter;
}
