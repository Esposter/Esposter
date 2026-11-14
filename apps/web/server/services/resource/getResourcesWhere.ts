import type { Context } from "#server/trpc/context";
import type { ResourceFilterInput } from "#shared/models/db/resource/ResourceFilterInput";

import { getFavoriteJoin } from "#server/services/resource/getFavoriteJoin";
import { getLastAccessedJoin } from "#server/services/resource/getLastAccessedJoin";
import { getPublicationWhere } from "#server/services/resource/getPublicationWhere";
import { getResourceSearchMatch } from "#server/services/resource/getResourceSearchMatch";
import { getSearchExpression } from "#server/services/search/getSearchExpression";
import { inJsonArray } from "@esposter/db";
import { resourceAccessesInResource, resourceFavoritesInResource, resourcesInResource } from "@esposter/db-schema";
import { and, eq, exists, gte, inArray, isNotNull, isNull, lte, notExists, sql } from "drizzle-orm";

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
  const searchExpression = searchQuery ? getSearchExpression(searchQuery) : "";
  return and(
    eq(resourcesInResource.userId, userId),
    // Soft-deleted resources live on for the Recycle bin window, so every normal read excludes them
    isDeletedOnly ? isNotNull(resourcesInResource.deletedAt) : isNull(resourcesInResource.deletedAt),
    // A name or a tag holding one of the words. The tags are indexed beside the name, so a tag the owner remembers
    // finds its resource as the name does
    searchExpression ? getResourceSearchMatch(searchExpression) : undefined,
    ids ? inJsonArray(resourcesInResource.id, ids) : undefined,
    // Every tag the filter names must be on the resource with that value, each tested against the stored JSON's pairs
    ...Object.entries(tags ?? {}).map(
      ([key, value]) =>
        sql`exists (select 1 from json_each(${resourcesInResource.tags}) where json_each.key = ${key} and json_each.value = ${value})`,
    ),
    tagName
      ? sql`exists (select 1 from json_each(${resourcesInResource.tags}) where json_each.key = ${tagName})`
      : undefined,
    types && types.length > 0 ? inArray(resourcesInResource.type, types) : undefined,
    isAccessed === undefined ? undefined : isAccessed ? exists(accessQuery) : notExists(accessQuery),
    isFavorite === undefined ? undefined : isFavorite ? exists(favoriteQuery) : notExists(favoriteQuery),
    isPublished === undefined ? undefined : getPublicationWhere(db, resourcesInResource.id, isPublished),
    updatedAfter ? gte(resourcesInResource.updatedAt, updatedAfter) : undefined,
    updatedBefore ? lte(resourcesInResource.updatedAt, updatedBefore) : undefined,
  );
};
