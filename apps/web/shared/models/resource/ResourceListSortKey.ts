import { ResourceListItemPropertyNames } from "#shared/models/resource/ResourceListItem";
import { z } from "zod";

// The columns a resource list is ordered by. The server binds each to a column an index serves, so a sort on any other
// Column is refused at the boundary
export const resourceListSortKeySchema = z.enum([
  ResourceListItemPropertyNames.createdAt,
  ResourceListItemPropertyNames.deletedAt,
  ResourceListItemPropertyNames.lastAccessedAt,
  ResourceListItemPropertyNames.name,
  ResourceListItemPropertyNames.type,
  ResourceListItemPropertyNames.updatedAt,
]);
export type ResourceListSortKey = z.infer<typeof resourceListSortKeySchema>;
