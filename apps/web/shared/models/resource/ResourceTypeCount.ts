import type { ResourceType } from "@esposter/db-schema";

// One summary card's worth of the grouped count — the type and how many of it the current filter matches
export interface ResourceTypeCount {
  count: number;
  type: ResourceType;
}
