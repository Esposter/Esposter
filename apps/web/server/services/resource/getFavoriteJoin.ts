import { resourceFavorites, resources } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// Caller-scoped: the row is the relationship, not a property of the resource, so one user's Favorites can never
// Reflect another's
export const getFavoriteJoin = (userId: string) =>
  and(eq(resourceFavorites.resourceId, resources.id), eq(resourceFavorites.userId, userId));
