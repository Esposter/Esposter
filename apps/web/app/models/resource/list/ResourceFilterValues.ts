import type { ResourceListSource } from "#src/models/resource/list/ResourceListSource";
import type { ResourceStatusFilter } from "#src/models/resource/list/ResourceStatusFilter";
import type { ResourceUpdatedFilter } from "#src/models/resource/list/ResourceUpdatedFilter";
import type { ResourceType } from "@esposter/db-schema";

// The client filter refs' plain values, with `""` sentinels for unset selects
export interface ResourceFilterValues {
  searchQuery: string;
  // Which set the list is over. It rides with the filters rather than beside them so the row count, the
  // Summary cards and the page reader are all keyed by it without any of them being told about routes
  source: ResourceListSource;
  status: "" | ResourceStatusFilter;
  // Name and value are separate filters — a name alone means "has this tag, any value"
  tagName: string;
  tagValue: string;
  types: ResourceType[];
  updatedAfter?: Date;
  updatedBefore?: Date;
  updatedFilter: "" | ResourceUpdatedFilter;
}
