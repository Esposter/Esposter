import type { ResourceStatusFilter } from "@/models/resource/list/ResourceStatusFilter";
import type { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import type { ResourceType } from "@esposter/db-schema";

// The same filters `ResourceFilterValues` holds unwrapped, less `source`, which the route fixes. Written out
// Rather than mapped off that interface: the mapping needs `Required<ToRefs<Except<…>>>` to land back on
// These declarations, and a field added here but not there is already a typecheck failure where the two meet
export interface ResourceListFilters {
  searchQuery: Ref<string>;
  status: Ref<"" | ResourceStatusFilter>;
  tagName: Ref<string>;
  tagValue: Ref<string>;
  types: Ref<ResourceType[]>;
  updatedAfter: Ref<Date | undefined>;
  updatedBefore: Ref<Date | undefined>;
  updatedFilter: Ref<"" | ResourceUpdatedFilter>;
}
