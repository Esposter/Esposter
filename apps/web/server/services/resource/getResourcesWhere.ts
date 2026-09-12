import type { ResourceFilterInput } from "#shared/models/db/resource/ResourceFilterInput";
import type { Context } from "@@/server/trpc/context";

import { escapeLike } from "@@/server/services/db/escapeLike";
import { SEARCH_SIMILARITY_THRESHOLD } from "@@/server/services/resource/constants";
import { getFavoriteJoin } from "@@/server/services/resource/getFavoriteJoin";
import { getLastAccessedJoin } from "@@/server/services/resource/getLastAccessedJoin";
import { getSearchSimilarity } from "@@/server/services/resource/getSearchSimilarity";
import { resourceAccesses, resourceFavorites, resourcePublications, resources } from "@esposter/db-schema";
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
    .from(resourcePublications)
    .where(eq(resourcePublications.resourceId, resources.id));
  const accessQuery = db.select().from(resourceAccesses).where(getLastAccessedJoin(userId));
  const favoriteQuery = db.select().from(resourceFavorites).where(getFavoriteJoin(userId));
  return and(
    eq(resources.userId, userId),
    // Soft-deleted resources live on for the Recycle bin window, so every normal read excludes them
    isDeletedOnly ? sql`${resources.deletedAt} IS NOT NULL` : isNull(resources.deletedAt),
    // Substring keeps exact matches that trigram similarity would miss on very short queries
    searchQuery
      ? or(
          ilike(resources.name, `%${escapeLike(searchQuery)}%`),
          sql`${getSearchSimilarity(searchQuery)} > ${SEARCH_SIMILARITY_THRESHOLD}`,
        )
      : undefined,
    ids ? inArray(resources.id, ids) : undefined,
    tags && Object.keys(tags).length > 0 ? sql`${resources.tags} @> ${JSON.stringify(tags)}::jsonb` : undefined,
    // Both operators are backed by the resources_tags_index GIN index
    tagName ? sql`jsonb_exists(${resources.tags}, ${tagName})` : undefined,
    types && types.length > 0 ? inArray(resources.type, types) : undefined,
    isAccessed === undefined ? undefined : isAccessed ? exists(accessQuery) : notExists(accessQuery),
    isFavorite === undefined ? undefined : isFavorite ? exists(favoriteQuery) : notExists(favoriteQuery),
    isPublished === undefined ? undefined : isPublished ? exists(publicationQuery) : notExists(publicationQuery),
    updatedAfter ? gte(resources.updatedAt, updatedAfter) : undefined,
    updatedBefore ? lte(resources.updatedAt, updatedBefore) : undefined,
  );
};
