import { resourceFavoritesInResource, resourcesInResource } from "@esposter/db-schema";
import { and, eq, isNull } from "drizzle-orm";

// Caller-scoped: the row is the relationship, not a property of the resource, so one user's Favorites can never
// Reflect another's. A removed star stays as a tombstone, so only a live one counts
export const getFavoriteJoin = (userId: string) =>
  and(
    eq(resourceFavoritesInResource.resourceId, resourcesInResource.id),
    eq(resourceFavoritesInResource.userId, userId),
    isNull(resourceFavoritesInResource.deletedAt),
  );
