import type { Context } from "#server/trpc/context";
import type { ResourceFilterInput } from "#shared/models/db/resource/ResourceFilterInput";

import { getFavoriteJoin } from "#server/services/resource/getFavoriteJoin";
import { getLastAccessedJoin } from "#server/services/resource/getLastAccessedJoin";
import { getPublicationWhere } from "#server/services/resource/getPublicationWhere";
import { getSearchNameMatch } from "#server/services/resource/getSearchNameMatch";
import { getSearchTagMatch } from "#server/services/resource/getSearchTagMatch";
import { resourceAccessesInResource, resourceFavoritesInResource, resourcesInResource } from "@esposter/db-schema";
import { and, eq, exists, gte, inArray, isNotNull, isNull, lte, notExists, or, sql } from "drizzle-orm";

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
  const accessQuery = db.select().from(resourceAccessesInResource).where(getLastAccessedJoin(userId));
  const favoriteQuery = db.select().from(resourceFavoritesInResource).where(getFavoriteJoin(userId));
  return and(
    eq(resourcesInResource.userId, userId),
    // Soft-deleted resources live on for the Recycle bin window, so every normal read excludes them
    isDeletedOnly ? isNotNull(resourcesInResource.deletedAt) : isNull(resourcesInResource.deletedAt),
    // The name arm keeps exact substrings that trigram similarity would miss on very short queries; the tag arm finds a
    // Resource by a label the owner remembers rather than its name
    searchQuery ? or(getSearchNameMatch(searchQuery), getSearchTagMatch(searchQuery)) : undefined,
    ids ? inArray(resourcesInResource.id, ids) : undefined,
    tags && Object.keys(tags).length > 0
      ? sql`${resourcesInResource.tags} @> ${JSON.stringify(tags)}::jsonb`
      : undefined,
    // Both operators are backed by the resources_tags_index GIN index
    tagName ? sql`jsonb_exists(${resourcesInResource.tags}, ${tagName})` : undefined,
    types && types.length > 0 ? inArray(resourcesInResource.type, types) : undefined,
    isAccessed === undefined ? undefined : isAccessed ? exists(accessQuery) : notExists(accessQuery),
    isFavorite === undefined ? undefined : isFavorite ? exists(favoriteQuery) : notExists(favoriteQuery),
    isPublished === undefined ? undefined : getPublicationWhere(db, resourcesInResource.id, isPublished),
    updatedAfter ? gte(resourcesInResource.updatedAt, updatedAfter) : undefined,
    updatedBefore ? lte(resourcesInResource.updatedAt, updatedBefore) : undefined,
  );
};
