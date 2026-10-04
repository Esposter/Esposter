import type { Context } from "#server/trpc/context";
import type { ResourceFilterInput } from "#shared/models/db/resource/ResourceFilterInput";

import { escapeLike } from "#server/services/db/escapeLike";
import { SEARCH_SIMILARITY_THRESHOLD } from "#server/services/resource/constants";
import { getFavoriteJoin } from "#server/services/resource/getFavoriteJoin";
import { getLastAccessedJoin } from "#server/services/resource/getLastAccessedJoin";
import { getSearchSimilarity } from "#server/services/resource/getSearchSimilarity";
import {
  resourceAccessesInResource,
  resourceFavoritesInResource,
  resourcePublicationsInResource,
  resourcesInResource,
} from "@esposter/db-schema";
import { and, eq, exists, gte, ilike, inArray, isNull, lte, notExists, or, sql } from "drizzle-orm";

export const getResourcesWhere = (
  db: Context["db"],
  userId: string,
  {
    ids,
    isAccessed,
    isFavorite,
    isPublished,
    searchQuery,
    tagName,
    tags,
    types,
    updatedAfter,
    updatedBefore,
  }: ResourceFilterInput,
  isDeletedOnly = false,
) => {
  // A publication row exists iff the resource is currently published
  const publicationQuery = db
    .select()
    .from(resourcePublicationsInResource)
    .where(eq(resourcePublicationsInResource.resourceId, resourcesInResource.id));
  const accessQuery = db.select().from(resourceAccessesInResource).where(getLastAccessedJoin(userId));
  const favoriteQuery = db.select().from(resourceFavoritesInResource).where(getFavoriteJoin(userId));
  return and(
    eq(resourcesInResource.userId, userId),
    // Soft-deleted resources live on for the Recycle bin window, so every normal read excludes them
    isDeletedOnly ? sql`${resourcesInResource.deletedAt} IS NOT NULL` : isNull(resourcesInResource.deletedAt),
    // Substring keeps exact matches that trigram similarity would miss on very short queries
    searchQuery
      ? or(
          ilike(resourcesInResource.name, `%${escapeLike(searchQuery)}%`),
          sql`${getSearchSimilarity(searchQuery)} > ${SEARCH_SIMILARITY_THRESHOLD}`,
        )
      : undefined,
    ids ? inArray(resourcesInResource.id, ids) : undefined,
    tags && Object.keys(tags).length > 0
      ? sql`${resourcesInResource.tags} @> ${JSON.stringify(tags)}::jsonb`
      : undefined,
    // Both operators are backed by the resources_tags_index GIN index
    tagName ? sql`jsonb_exists(${resourcesInResource.tags}, ${tagName})` : undefined,
    types && types.length > 0 ? inArray(resourcesInResource.type, types) : undefined,
    isAccessed === undefined ? undefined : isAccessed ? exists(accessQuery) : notExists(accessQuery),
    isFavorite === undefined ? undefined : isFavorite ? exists(favoriteQuery) : notExists(favoriteQuery),
    isPublished === undefined ? undefined : isPublished ? exists(publicationQuery) : notExists(publicationQuery),
    updatedAfter ? gte(resourcesInResource.updatedAt, updatedAfter) : undefined,
    updatedBefore ? lte(resourcesInResource.updatedAt, updatedBefore) : undefined,
  );
};
