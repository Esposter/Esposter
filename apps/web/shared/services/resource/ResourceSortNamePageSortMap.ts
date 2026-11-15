import type { ResourceListColumnKey } from "#shared/models/resource/ResourceListColumnKey";
import type { PageSort } from "@esposter/db-schema";

import { ResourceSortName } from "#shared/models/resource/ResourceSortName";
import { SortOrder } from "@esposter/db-schema";

// Every order a resource list can take, each ending in the unique id so ties never fall across a page boundary. The
// Server binds each key to its column, and an index on that column serves the order. A search ranks its matches first
// By whether the name holds a word, then by bm25 (negated, so the closer match is the larger), then by the id
export const ResourceSortNamePageSortMap = {
  [ResourceSortName.CreatedAtAsc]: { keys: ["createdAt", "id"], order: SortOrder.Asc },
  [ResourceSortName.CreatedAtDesc]: { keys: ["createdAt", "id"], order: SortOrder.Desc },
  [ResourceSortName.DeletedAtAsc]: { keys: ["deletedAt", "id"], order: SortOrder.Asc },
  [ResourceSortName.DeletedAtDesc]: { keys: ["deletedAt", "id"], order: SortOrder.Desc },
  [ResourceSortName.LastAccessedAtAsc]: { keys: ["lastAccessedAt", "id"], order: SortOrder.Asc },
  [ResourceSortName.LastAccessedAtDesc]: { keys: ["lastAccessedAt", "id"], order: SortOrder.Desc },
  [ResourceSortName.NameAsc]: { keys: ["name", "id"], order: SortOrder.Asc },
  [ResourceSortName.NameDesc]: { keys: ["name", "id"], order: SortOrder.Desc },
  [ResourceSortName.Relevance]: { keys: ["nameMatch", "negRank", "id"], order: SortOrder.Desc },
  [ResourceSortName.TypeAsc]: { keys: ["type", "id"], order: SortOrder.Asc },
  [ResourceSortName.TypeDesc]: { keys: ["type", "id"], order: SortOrder.Desc },
  [ResourceSortName.UpdatedAtAsc]: { keys: ["updatedAt", "id"], order: SortOrder.Asc },
  [ResourceSortName.UpdatedAtDesc]: { keys: ["updatedAt", "id"], order: SortOrder.Desc },
} as const satisfies Record<ResourceSortName, PageSort<ResourceListColumnKey>>;
