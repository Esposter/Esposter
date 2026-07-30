import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { PublishHistoryVersion } from "#shared/models/resource/PublishHistoryVersion";
import type { ResourceTypeCount } from "#shared/models/resource/ResourceTypeCount";
import type { Context } from "@@/server/trpc/context";
import type { Clause, Resource } from "@esposter/db-schema";

import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { escapeLike } from "@@/server/services/db/escapeLike";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhereAzureTable } from "@@/server/services/pagination/cursor/getCursorWhereAzureTable";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { cloneContentAssets } from "@@/server/services/resource/cloneContentAssets";
import { SEARCH_SIMILARITY_THRESHOLD } from "@@/server/services/resource/constants";
import { createResourceRow } from "@@/server/services/resource/createResourceRow";
import { deleteCreatedResources } from "@@/server/services/resource/deleteCreatedResources";
import { getContentBlobName } from "@@/server/services/resource/getContentBlobName";
import { getPublishedContentBlobName } from "@@/server/services/resource/getPublishedContentBlobName";
import { readContentBlob } from "@@/server/services/resource/readContentBlob";
import { readPublishHistory } from "@@/server/services/resource/readPublishHistory";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { softDeleteResources } from "@@/server/services/resource/softDeleteResources";
import { storeSelfContainedContent } from "@@/server/services/resource/storeSelfContainedContent";
import { writeResourceActivity } from "@@/server/services/resource/writeResourceActivity";
import { router } from "@@/server/trpc";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { getOwnerProcedure } from "@@/server/trpc/procedure/resource/getOwnerProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { getTopNEntities, purgeResource, serializeClauses } from "@esposter/db";
import {
  AzureContainer,
  AzureTable,
  BinaryOperator,
  CompositeKeyPropertyNames,
  DatabaseEntityType,
  getResourceOwnedTableNames,
  RESOURCE_NAME_MAX_LENGTH,
  ResourceActivityEntity,
  resourceActivityEntitySchema,
  ResourceActivityType,
  resourceFavorites,
  resourcePublications,
  resources,
  resourceTypeSchema,
  selectResourceSchema,
} from "@esposter/db-schema";
import {
  createUniqueArraySchema,
  getResultAsync,
  MAX_READ_LIMIT,
  noop,
  NotFoundError,
  Operation,
  takeOne,
} from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, exists, gte, ilike, inArray, isNull, lte, notExists, or, sql } from "drizzle-orm";
import { z } from "zod";

const readResourceInputSchema = selectResourceSchema.pick({ id: true });

const restorePublishedVersionInputSchema = z.object({
  ...readResourceInputSchema.shape,
  version: z.int().positive(),
});

const resourceFilterInputSchema = z.object({
  // Hydrates the Home Recent tab from the per-device localStorage view list
  ids: createUniqueArraySchema(selectResourceSchema.shape.id).max(MAX_READ_LIMIT).optional(),
  isPublished: z.boolean().optional(),
  searchQuery: z.string().optional(),
  // The Tag pill's value is optional, and containment cannot express "has this tag, any value" —
  // That is key-existence, so the two filters are separate inputs rather than one nullable record
  tagName: z.string().optional(),
  // Filters are lookups, not writes: an unsaveable tag (over-length, blank name) can simply never
  // Match, so reusing the write-time resourceTagsSchema here would only turn "no results" into a
  // Rejected query that errors the whole list
  tags: z.record(z.string(), z.string()).optional(),
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
// Appended to a duplicated resource's name; the base name is truncated so the whole stays within the length check
const duplicateNameSuffix = " (copy)";
// Backed by the resources_name_trgm_index GIN index; shared so the filter and the ranking
// Can never disagree about what "similar" means
const createSearchSimilarity = (searchQuery: string) => sql`similarity(${resources.name}, ${searchQuery})`;
// Shared filter so count and readResources stay in lockstep as filters evolve
const createResourcesWhere = (
  db: Context["db"],
  userId: string,
  { ids, isPublished, searchQuery, tagName, tags, types, updatedAfter, updatedBefore }: ResourceFilterInput,
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
    // Both operators are backed by the resources_tags_index GIN index
    tagName ? sql`jsonb_exists(${resources.tags}, ${tagName})` : undefined,
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
  // The summary cards own the type breakdown, so `types` is the one filter they cannot pass — a card is
  // The affordance for setting it. Behind the same createResourcesWhere, so the cards can never disagree
  // With the list they navigate into
  countsByType: standardAuthedProcedure
    .input(resourceFilterInputSchema.omit({ types: true }).prefault({}))
    .query<ResourceTypeCount[]>(({ ctx, input }) =>
      ctx.db
        .select({ count: count(), type: resources.type })
        .from(resources)
        .where(createResourcesWhere(ctx.db, ctx.getSessionPayload.user.id, input))
        .groupBy(resources.type)
        .orderBy(desc(count())),
    ),
  deleteResources: standardAuthedProcedure
    .input(deleteResourcesInputSchema)
    // Owner-scoped where so callers can only ever soft-delete their own rows
    .mutation<Resource[]>(({ ctx, input: { ids } }) =>
      softDeleteResources(
        ctx.db,
        and(
          eq(resources.userId, ctx.getSessionPayload.user.id),
          inArray(resources.id, ids),
          isNull(resources.deletedAt),
        ),
      ),
    ),
  duplicateResource: getOwnerProcedure(undefined, readResourceInputSchema, "id").mutation<Resource>(async ({ ctx }) => {
    const { name, tags, type } = ctx.resource;
    const newResource = await createResourceRow(
      ctx,
      {
        name: `${name.slice(0, RESOURCE_NAME_MAX_LENGTH - duplicateNameSuffix.length)}${duplicateNameSuffix}`,
        tags,
        type,
      },
      ResourceActivityType.Duplicated,
    );
    // A copy starts as Draft, so only the draft content is copied — never the publication. The clone gives
    // The copy its own blobs for every referenced asset — working-copy and published — under {newId}/ with
    // The source-relative path preserved, and rewrites the embedded urls, so the copy is fully self-contained:
    // Its editor can delete its files, and deleting or unpublishing the original never strands it
    await getResultAsync(async () => {
      const content = await readResourceContent(ResourceDefinitionMap[type].contentSchema, ctx.resource.id);
      // The blob is written on first save, so missing content just means there is nothing to copy yet
      if (content === undefined) return;
      await storeSelfContainedContent(ctx.db, ctx.getSessionPayload.user.id, newResource.id, content);
    }).match(noop, async (error) => {
      // Never leave a content-less orphan copy behind when the content clone fails
      await deleteCreatedResources(ctx, [newResource.id]);
      throw error;
    });
    return newResource;
  }),
  purgeResource: getOwnerProcedure(undefined, readResourceInputSchema, "id", true).mutation<Resource>(
    async ({ ctx, input: { id } }) => {
      const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
      // Purge is the only place these partitions are destroyed, since delete is soft
      const tableClients = await Promise.all(
        getResourceOwnedTableNames(ctx.resource.type).map((tableName) => useTableClient(tableName)),
      );
      await purgeResource(ctx.db, containerClient, tableClients, id);
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
  // Which snapshots exist comes from a blob prefix listing — no history table, since the {id}/published/{n}
  // Blobs are already the source of truth for that. Which one is LIVE comes from the publication row instead,
  // Because the two can disagree: the unpublish sweep is a best-effort event, so a republish can land while
  // Retired snapshots are still present, with publishVersion restarted at 1
  readPublishHistory: getOwnerProcedure(undefined, readResourceInputSchema, "id").query<PublishHistoryVersion[]>(
    async ({ ctx }) => {
      const publication = await ctx.db.query.resourcePublications.findFirst({
        where: { resourceId: { eq: ctx.resource.id } },
      });
      return readPublishHistory(ctx.resource.id, publication?.publishVersion);
    },
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
  // Restore copies a snapshot's content into the working copy through saveResourceContent semantics
  // (contentVersion++). The publication is never re-pointed — a restore produces a Draft to review and
  // Re-publish, mirroring the recycle bin's restore-returns-a-Draft rule.
  // The snapshot's assets are cloned back into the working copy's own files directory rather than referenced
  // Where they sit, exactly as the duplicate path does: a published url lives under {id}/published, which
  // Unpublish wipes wholesale, so a verbatim copy would hand the draft urls a later unpublish deletes — and
  // Re-publishing that draft would ship the same dead urls, with re-uploading every asset the only recovery
  restorePublishedVersion: getOwnerProcedure(undefined, restorePublishedVersionInputSchema, "id").mutation<Resource>(
    async ({ ctx, input: { id, version } }) => {
      const publishedContent = await readContentBlob(
        ResourceDefinitionMap[ctx.resource.type].contentSchema,
        getPublishedContentBlobName(id, version),
      );
      if (publishedContent === undefined)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.Resource, `${id}/${version}`).message,
        });
      // Cloned before the transaction opens, exactly as `publishResource` does it: the clone is one storage
      // Round trip per referenced asset, and running it inside would hold a pooled connection — not just the
      // `resources` row lock — for that whole time, so a handful of concurrent restores of asset-heavy
      // Resources would starve the pool for requests that have nothing to do with them.
      // Blobs a partial clone already wrote stay under this resource's own `{id}/files`, unreferenced by any
      // Content until the next restore overwrites them or `purgeResource` takes the directory wholesale — the
      // Deliberate trade, unlike `duplicateResource`, whose compensating `deleteDirectory` is only safe because
      // The resource it clears was created moments earlier; the target here is a live working copy whose
      // Existing files a directory-wide cleanup would destroy.
      const clonedContent = await cloneContentAssets(ctx.db, ctx.getSessionPayload.user.id, publishedContent, id);
      // The bump and the content write stay in one transaction so a failed write rolls the contentVersion back —
      // A restore that did not land must never advance the version every client caches against.
      return ctx.db.transaction(async (tx) => {
        const restoredResource = requireMutation(
          (
            await tx
              .update(resources)
              .set({ contentVersion: sql`${resources.contentVersion} + 1` })
              .where(eq(resources.id, id))
              .returning()
          )[0],
          Operation.Update,
          DatabaseEntityType.Resource,
          id,
        );
        await useUpload(AzureContainer.ResourceAssets, getContentBlobName(id), JSON.stringify(clonedContent));
        return restoredResource;
      });
    },
  ),
  restoreResource: getOwnerProcedure(undefined, readResourceInputSchema, "id", true).mutation<Resource>(
    async ({ ctx, input: { id } }) => {
      // Names are not unique, so a restore can never conflict
      const restoredResource = requireMutation(
        (await ctx.db.update(resources).set({ deletedAt: null }).where(eq(resources.id, id)).returning())[0],
        Operation.Update,
        DatabaseEntityType.Resource,
        id,
      );
      // Fire-and-forget: the activity trail is best-effort and the restore must not wait on telemetry
      getSynchronizedFunction(writeResourceActivity)({
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
