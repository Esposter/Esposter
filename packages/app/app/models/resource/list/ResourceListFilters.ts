import type { ResourceStatusFilter } from "@/models/resource/list/ResourceStatusFilter";
import type { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import type { ResourceType } from "@esposter/db-schema";

export interface ResourceListFilters {
  searchQuery: Ref<string>;
  status: Ref<"" | ResourceStatusFilter>;
  types: Ref<ResourceType[]>;
  updatedAfter: Ref<Date | undefined>;
  updatedBefore: Ref<Date | undefined>;
  updatedFilter: Ref<"" | ResourceUpdatedFilter>;
}
