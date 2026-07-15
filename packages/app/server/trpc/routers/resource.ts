import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Context } from "@@/server/trpc/context";
import type { Clause, Resource } from "@esposter/db-schema";

import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { escapeLike } from "@@/server/services/db/escapeLike";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhereAzureTable } from "@@/server/services/pagination/cursor/getCursorWhereAzureTable";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { getContentBlobName } from "@@/server/services/resource/getContentBlobName";
import { SEARCH_SIMILARITY_THRESHOLD } from "@@/server/services/resource/constants";
import { writeResourceActivity } from "@@/server/services/resource/writeResourceActivity";
import { router } from "@@/server/trpc";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { getOwnerProcedure } from "@@/server/trpc/procedure/resource/getOwnerProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { RestError } from "@azure/storage-blob";
import { getTopNEntities, purgeResource, serializeClauses } from "@esposter/db";
import {
  AzureContainer,
  AzureTable,
  BinaryOperator,
  CompositeKeyPropertyNames,
  DatabaseEntityType,
  resourceActivityEntitySchema,
  ResourceActivityEntity,
  ResourceActivityType,
  resourceFavorites,
  resourcePublications,
  resources,
  resourceTagsSchema,
  resourceTypeSchema,
  selectResourceSchema,
} from "@esposter/db-schema";
import {
  createUniqueArraySchema,
  getResultAsync,
  MAX_READ_LIMIT,
  noop,
  Operation,
  streamToText,
  takeOne,
} from "@esposter/shared";
import { and, count, desc, eq, exists, gte, ilike, inArray, isNull, lte, notExists, or, sql } from "drizzle-orm";
import { z } from "zod";

const readResourceInputSchema = selectResourceSchema.pick({ id: true });

const resourceFilterInputSchema = z.object({
  // Hydrates the Home Recent tab from the per-device localStorage view list
  ids: createUniqueArraySchema(selectResourceSchema.shape.id).max(MAX_READ_LIMIT).optional(),
  isPublished: z.boolean().optional(),
  searchQuery: z.string().optional(),
  tags: resourceTagsSchema.optional(),
  types: z.array(resourceTypeSchema).optional(),
  updatedAfter: z.date().optional(),
  updatedBefore: z.date().optional(),
});

type ResourceFilterInput = z.infer<typeof resourceFilterInputSchema>;

const readResourcesInputSchema = z.object({
  ...createOffsetPaginationParamsSchema(selectResourceSchema.keyof()).shape,
  ...resourceFilterInputSchema.shape,
});

const readDeletedResourcesInputSchema = createOffsetPaginationParamsSchema(selectResourceSchema.keyof()).prefault({});

const readActivitiesInputSchema = z.object({
  ...readResourceInputSchema.shape,
  ...createCursorPaginationParamsSchema(resourceActivityEntitySchema.keyof(), [MESSAGE_ROWKEY_SORT_ITEM]).omit({
    sortBy: true,
  }).shape,
});

const deleteResourcesInputSchema = z.object({
  ids: createUniqueArraySchema(selectResourceSchema.shape.id).min(1).max(MAX_READ_LIMIT),
});
// Backed by the resources_name_trgm_index GIN index; shared so the filter and the ranking
// Can never disagree about what "similar" means
const createSearchSimilarity = (searchQuery: string) => sql`similarity(${resources.name}, ${searchQuery})`;
// Shared filter so count and readResources stay in lockstep as filters evolve
const createResourcesWhere = (
  db: Context["db"],
  userId: string,
  { ids, isPublished, searchQuery, tags, types, updatedAfter, updatedBefore }: ResourceFilterInput,
  isDeletedOnly = false,
) => {
  // A publication row exists iff the resource is currently published
  const publicationExists = db
    .select()
    .from(resourcePublications)
    .where(eq(resourcePublications.resourceId, resources.id));
  return and(
    eq(resources.userId, userId),
    // Soft-deleted resources live on for the Recycle bin window, so every normal read excludes them
    isDeletedOnly ? sql`${resources.deletedAt} IS NOT NULL` : isNull(resources.deletedAt),
    // Substring keeps exact matches that trigram similarity would miss on very short queries
    searchQuery
      ? or(
          ilike(resources.name, `%${escapeLike(searchQuery)}%`),
          sql`${createSearchSimilarity(searchQuery)} > ${SEARCH_SIMILARITY_THRESHOLD}`,
        )
      : undefined,
    ids ? inArray(resources.id, ids) : undefined,
    tags && Object.keys(tags).length > 0 ? sql`${resources.tags} @> ${JSON.stringify(tags)}::jsonb` : undefined,
    types && types.length > 0 ? inArray(resources.type, types) : undefined,
    isPublished === undefined ? undefined : isPublished ? exists(publicationExists) : notExists(publicationExists),
    updatedAfter ? gte(resources.updatedAt, updatedAfter) : undefined,
    updatedBefore ? lte(resources.updatedAt, updatedBefore) : undefined,
  );
};

export const resourceRouter = router({
  count: standardAuthedProcedure.input(resourceFilterInputSchema.prefault({})).query(
    async ({ ctx, input }) =>
      takeOne(
        await ctx.db
          .select({ count: count() })
          .from(resources)
          .where(createResourcesWhere(ctx.db, ctx.getSessionPayload.user.id, input)),
      ).count,
  ),
  countDeletedResources: standardAuthedProcedure.query(
    async ({ ctx }) =>
      takeOne(
        await ctx.db
          .select({ count: count() })
          .from(resources)
          .where(createResourcesWhere(ctx.db, ctx.getSessionPayload.user.id, {}, true)),
      ).count,
  ),
  deleteResources: standardAuthedProcedure
    .input(deleteResourcesInputSchema)
    .mutation<Resource[]>(async ({ ctx, input: { ids } }) => {
      // Owner-scoped where so callers can only ever soft-delete their own rows.
      // The blob and the {id}/ directory survive until purge — that is what makes restore possible.
      const deletedResources = await ctx.db
        .update(resources)
        .set({ deletedAt: new Date() })
        .where(
          and(
            eq(resources.userId, ctx.getSessionPayload.user.id),
            inArray(resources.id, ids),
            isNull(resources.deletedAt),
          ),
        )
        .returning();
      // A deleted resource must not stay publicly served, so restore deliberately returns a Draft
      if (deletedResources.length > 0)
        await ctx.db.delete(resourcePublications).where(
          inArray(
            resourcePublications.resourceId,
            deletedResources.map(({ id }) => id),
          ),
        );
      return deletedResources;
    }),
  duplicateResource: getOwnerProcedure(undefined, readResourceInputSchema, "id").mutation<Resource>(async ({ ctx }) => {
    const { name, type, userId } = ctx.resource;
    // A copy starts as Draft, so only the draft content blob is copied — never the publication.
    // The blob is written on first save, so a missing blob just means there is no content to copy yet.
    // Read before inserting so a failed download never strands a half-created copy.
    const content = await getResultAsync(() =>
      useDownload(AzureContainer.ResourceAssets, getContentBlobName(ctx.resource.id)),
    ).match(
      ({ readableStreamBody }) => (readableStreamBody ? streamToText(readableStreamBody) : undefined),
      (error) => {
        if (error instanceof RestError && error.statusCode === 404) return undefined;
        throw error;
      },
    );
    const newResource = requireMutation(
      (
        await ctx.db
          .insert(resources)
          .values({ name: `${name} (copy)`, type, userId })
          .returning()
      )[0],
      Operation.Create,
      DatabaseEntityType.Resource,
      ctx.resource.id,
    );
    if (content !== undefined)
      await getResultAsync(() =>
        useUpload(AzureContainer.ResourceAssets, getContentBlobName(newResource.id), content),
      ).match(noop, async (error) => {
        // Never leave a content-less orphan copy behind when the blob write fails
        await ctx.db.delete(resources).where(eq(resources.id, newResource.id));
        throw error;
      });
    await writeResourceActivity({
      activityType: ResourceActivityType.Duplicated,
      resourceId: newResource.id,
      userId,
    });
    return newResource;
  }),
  purgeResource: getOwnerProcedure(undefined, readResourceInputSchema, "id", true).mutation<Resource>(
    async ({ ctx, input: { id } }) => {
      const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
      const resourceActivityClient = await useTableClient(AzureTable.ResourceActivity);
      await purgeResource(ctx.db, containerClient, resourceActivityClient, id);
      return ctx.resource;
    },
  ),
  readActivities: getOwnerProcedure(undefined, readActivitiesInputSchema, "id").query(
    async ({ input: { cursor, id, limit } }) => {
      const sortBy: SortItem<keyof ResourceActivityEntity>[] = [MESSAGE_ROWKEY_SORT_ITEM];
      const clauses: Clause<ResourceActivityEntity>[] = [
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: id },
      ];
      if (cursor) clauses.push(...getCursorWhereAzureTable(cursor, sortBy));

      const resourceActivityClient = await useTableClient(AzureTable.ResourceActivity);
      const entries = await getTopNEntities(resourceActivityClient, limit + 1, ResourceActivityEntity, {
        filter: serializeClauses(clauses),
      });
      return getCursorPaginationData(entries, limit, sortBy);
    },
  ),
  readDeletedResources: standardAuthedProcedure
    .input(readDeletedResourcesInputSchema)
    .query(async ({ ctx, input: { limit, offset, sortBy } }) => {
      const resultResources = await ctx.db
        .select()
        .from(resources)
        .where(createResourcesWhere(ctx.db, ctx.getSessionPayload.user.id, {}, true))
        .orderBy(...(sortBy.length > 0 ? parseSortByToSql(resources, sortBy) : [desc(resources.deletedAt)]))
        .limit(limit + 1)
        .offset(offset);
      return getOffsetPaginationData(resultResources, limit);
    }),
  readFavorites: standardAuthedProcedure.query<Resource[]>(async ({ ctx }) =>
    (
      await ctx.db
        .select({ resource: resources })
        .from(resourceFavorites)
        .innerJoin(resources, eq(resourceFavorites.resourceId, resources.id))
        .where(and(eq(resourceFavorites.userId, ctx.getSessionPayload.user.id), isNull(resources.deletedAt)))
        .orderBy(desc(resourceFavorites.createdAt))
        .limit(MAX_READ_LIMIT)
    ).map(({ resource }) => resource),
  ),
  readResource: getOwnerProcedure(undefined, readResourceInputSchema, "id").query(({ ctx }) => ctx.resource),
  readResources: standardAuthedProcedure
    .input(readResourcesInputSchema.prefault({}))
    .query(async ({ ctx, input: { limit, offset, sortBy, ...filter } }) => {
      const resultResources = await ctx.db
        .select()
        .from(resources)
        .where(createResourcesWhere(ctx.db, ctx.getSessionPayload.user.id, filter))
        .orderBy(
          // Relevance ladder: closest trigram match first so a typo still ranks its resource top, then
          // Prefix matches above the remaining substring matches (true sorts before false under desc),
          // Then newest-first within each tier; every search value is bound through the query builder
          ...(filter.searchQuery
            ? [
                desc(createSearchSimilarity(filter.searchQuery)),
                desc(ilike(resources.name, `${escapeLike(filter.searchQuery)}%`)),
              ]
            : []),
          ...(sortBy.length > 0 ? parseSortByToSql(resources, sortBy) : [desc(resources.updatedAt)]),
        )
        .limit(limit + 1)
        .offset(offset);
      return getOffsetPaginationData(resultResources, limit);
    }),
  restoreResource: getOwnerProcedure(undefined, readResourceInputSchema, "id", true).mutation<Resource>(
    async ({ ctx, input: { id } }) => {
      // Names are not unique, so a restore can never conflict
      const restoredResource = requireMutation(
        (await ctx.db.update(resources).set({ deletedAt: null }).where(eq(resources.id, id)).returning())[0],
        Operation.Update,
        DatabaseEntityType.Resource,
        id,
      );
      await writeResourceActivity({
        activityType: ResourceActivityType.Restored,
        resourceId: id,
        userId: ctx.getSessionPayload.user.id,
      });
      return restoredResource;
    },
  ),
  toggleFavorite: getOwnerProcedure(undefined, readResourceInputSchema, "id").mutation<boolean>(
    async ({ ctx, input: { id } }) => {
      const userId = ctx.getSessionPayload.user.id;
      // Delete-then-insert rather than a read-then-branch: the delete's own returning() reports
      // Whether the star was set, so the toggle can never race with itself
      const deletedFavorites = await ctx.db
        .delete(resourceFavorites)
        .where(and(eq(resourceFavorites.resourceId, id), eq(resourceFavorites.userId, userId)))
        .returning();
      if (deletedFavorites.length > 0) return false;

      await ctx.db.insert(resourceFavorites).values({ resourceId: id, userId }).onConflictDoNothing();
      return true;
    },
  ),
});
