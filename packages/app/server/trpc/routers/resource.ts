import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import type { PublishHistoryVersion } from "#shared/models/resource/PublishHistoryVersion";
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { ResourceTagCount } from "#shared/models/resource/ResourceTagCount";
import type { ResourceTypeCount } from "#shared/models/resource/ResourceTypeCount";
import type { ResourceWithPublication } from "#shared/models/resource/ResourceWithPublication";
import type { Context } from "@@/server/trpc/context";
import type { Clause } from "@esposter/azure";
import type { Resource } from "@esposter/db-schema";

import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { resourceListSortKeySchema } from "#shared/models/resource/ResourceListItem";
import { ResourceOperationTitleMap } from "#shared/services/notification/ResourceOperationTitleMap";
import { MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { escapeLike } from "@@/server/services/db/escapeLike";
import { publishResourceOperation } from "@@/server/services/notification/publishResourceOperation";
import { readCursorPaginationDataAzureTable } from "@@/server/services/pagination/cursor/readCursorPaginationDataAzureTable";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { cloneContentAssets } from "@@/server/services/resource/cloneContentAssets";
import { SEARCH_SIMILARITY_THRESHOLD } from "@@/server/services/resource/constants";
import { createResourceRow } from "@@/server/services/resource/createResourceRow";
import { getPublishedContentBlobName } from "@@/server/services/resource/getPublishedContentBlobName";
import { readContentBlob } from "@@/server/services/resource/readContentBlob";
import { readPublishHistory } from "@@/server/services/resource/readPublishHistory";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { reapplyLiveResourceContent } from "@@/server/services/resource/reapplyLiveResourceContent";
import { saveResourceContent } from "@@/server/services/resource/saveResourceContent";
import { softDeleteResources } from "@@/server/services/resource/softDeleteResources";
import { withResourceRollback } from "@@/server/services/resource/withResourceRollback";
import { writeResourceActivity } from "@@/server/services/resource/writeResourceActivity";
import { emitStorageUsage } from "@@/server/services/storage/emitStorageUsage";
import { router } from "@@/server/trpc";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { getOwnerProcedure } from "@@/server/trpc/procedure/resource/getOwnerProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { BinaryOperator, CompositeKeyPropertyNames } from "@esposter/azure";
import { purgeResource } from "@esposter/db";
import {
  AzureContainer,
  AzureTable,
  DatabaseEntityType,
  getResourceOwnedTableNames,
  RESOURCE_NAME_MAX_LENGTH,
  resourceAccesses,
  ResourceActivityEntity,
  resourceActivityEntitySchema,
  ResourceActivityType,
  resourceFavorites,
  resourcePublications,
  resources,
  resourceTypeSchema,
  selectResourceSchema,
} from "@esposter/db-schema";
import { createUniqueArraySchema, MAX_READ_LIMIT, Operation, RoutePath, takeOne } from "@esposter/shared";
import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  getColumns,
  gte,
  ilike,
  inArray,
  isNull,
  lte,
  notExists,
  or,
  sql,
} from "drizzle-orm";
import { z } from "zod";

const readResourceInputSchema = selectResourceSchema.pick({ id: true });

const restorePublishedVersionInputSchema = z.object({
  ...readResourceInputSchema.shape,
  version: z.int().positive(),
});

const resourceFilterInputSchema = z.object({
  // Narrows a read to an explicit set — the search dropdown resolves its own ids this way
  ids: createUniqueArraySchema(selectResourceSchema.shape.id).max(MAX_READ_LIMIT).optional(),
  // Whether the caller has ever opened it, and whether they have starred it. The Recent and Favorites list
  // Views are these two filters and nothing else, so each inherits every other filter, the row count and the
  // Summary cards rather than re-implementing the workbench against its own read
  isAccessed: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
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
  ...createOffsetPaginationParamsSchema(resourceListSortKeySchema).shape,
  ...resourceFilterInputSchema.shape,
});

const readDeletedResourcesInputSchema = createOffsetPaginationParamsSchema(resourceListSortKeySchema).prefault({});

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
// Every resource list — the workbench, the recycle bin and the favorites read alike — projects one row shape,
// Reused as the sort space so a column the list can show is a column it can sort by
const resourceListSelection = { ...getColumns(resources), lastAccessedAt: resourceAccesses.accessedAt };
// Caller-scoped relationship predicates, shared by the joins that project them and the EXISTS subqueries that
// Filter on them, so one user's Recent or Favorites can never reflect another's
const createLastAccessedJoin = (userId: string) =>
  and(eq(resourceAccesses.resourceId, resources.id), eq(resourceAccesses.userId, userId));
const createFavoriteJoin = (userId: string) =>
  and(eq(resourceFavorites.resourceId, resources.id), eq(resourceFavorites.userId, userId));
// Shared filter so count and readResources stay in lockstep as filters evolve
const createResourcesWhere = (
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
  const publicationExists = db
    .select()
    .from(resourcePublications)
    .where(eq(resourcePublications.resourceId, resources.id));
  // Both are scoped to the caller as well as the resource, so one user's Recent or Favorites can never
  // Reflect another's — the row is the relationship, not a property of the resource
  const accessExists = db.select().from(resourceAccesses).where(createLastAccessedJoin(userId));
  const favoriteExists = db.select().from(resourceFavorites).where(createFavoriteJoin(userId));
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
    isAccessed === undefined ? undefined : isAccessed ? exists(accessExists) : notExists(accessExists),
    isFavorite === undefined ? undefined : isFavorite ? exists(favoriteExists) : notExists(favoriteExists),
    isPublished === undefined ? undefined : isPublished ? exists(publicationExists) : notExists(publicationExists),
    updatedAfter ? gte(resources.updatedAt, updatedAfter) : undefined,
    updatedBefore ? lte(resources.updatedAt, updatedBefore) : undefined,
  );
};

export const resourceRouter = router({
  count: standardAuthedProcedure.input(resourceFilterInputSchema.prefault({})).query<number>(
    async ({ ctx, input }) =>
      takeOne(
        await ctx.db
          .select({ count: count() })
          .from(resources)
          .where(createResourcesWhere(ctx.db, ctx.getSessionPayload.user.id, input)),
      ).count,
  ),
  countDeletedResources: standardAuthedProcedure.query<number>(
    async ({ ctx }) =>
      takeOne(
        await ctx.db
          .select({ count: count() })
          .from(resources)
          .where(createResourcesWhere(ctx.db, ctx.getSessionPayload.user.id, {}, true)),
      ).count,
  ),
  // The Tags list. Tag names live inside one jsonb column rather than their own table, so the breakdown is a
  // Grouped count over the expanded keys — the expansion is a subquery because a set-returning function
  // Cannot sit beside an aggregate in one select list. Values are deliberately not part of the grouping: the
  // Tags entry answers "which tags do I use", and the /all Tag pill is where a value narrows it further
  countsByTag: standardAuthedProcedure.query<ResourceTagCount[]>(({ ctx }) => {
    const tagNames = ctx.db
      .select({ name: sql<string>`jsonb_object_keys(${resources.tags})`.as("name") })
      .from(resources)
      .where(createResourcesWhere(ctx.db, ctx.getSessionPayload.user.id, {}))
      .as("tag_names");
    return ctx.db
      .select({ count: count(), name: tagNames.name })
      .from(tagNames)
      .groupBy(tagNames.name)
      .orderBy(desc(count()), asc(tagNames.name));
  }),
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
    .mutation<Resource[]>(async ({ ctx, input: { ids } }) => {
      const deletedResources = await softDeleteResources(
        ctx.db,
        and(
          eq(resources.userId, ctx.getSessionPayload.user.id),
          inArray(resources.id, ids),
          isNull(resources.deletedAt),
        ),
      );
      if (deletedResources.length > 0)
        await publishResourceOperation(ctx.getSessionPayload, {
          path: RoutePath.ResourceExplorerRecycleBin,
          title: ResourceOperationTitleMap[ResourceOperationType.Deleted](
            takeOne(deletedResources).name,
            deletedResources.length,
          ),
        });
      return deletedResources;
    }),
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
    // Its editor can delete its files, and deleting or unpublishing the original never strands it. Content
    // Taken from somewhere else is never written without that clone — a copy that kept the source's urls is
    // Broken by anything the source does later, and only surfaces once a reader opens a page whose images 404
    // Never leave a content-less orphan copy behind when the content clone fails
    await withResourceRollback(ctx, [newResource.id], async () => {
      const content = await readResourceContent(ResourceDefinitionMap[type].contentSchema, ctx.resource.id);
      // The blob is written on first save, so missing content just means there is nothing to copy yet
      if (content === undefined) return;

      const clonedContent = await cloneContentAssets(ctx.db, ctx.getSessionPayload.user.id, content, newResource.id);
      // The one content-write path, so the copy fires the same after-save hook the editor's save does — a
      // Duplicated TodoList's future due dates get their reminders scheduled rather than silently lost.
      // No activityType: createResourceRow has already opened the copy's trail with its Duplicated entry, and
      // A ContentSaved beside it would claim the owner edited a copy they have not opened yet
      await saveResourceContent(ctx, { content: clonedContent, resource: newResource });
    });
    await publishResourceOperation(ctx.getSessionPayload, {
      path: RoutePath.Resource(newResource.id),
      title: ResourceOperationTitleMap[ResourceOperationType.Duplicated](newResource.name),
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
      // The other half of the counter: a purge is the one delete that gives bytes back from this process, so
      // It is the one delete whose owner is here to be told. See /docs/platform/storage-quotas
      await emitStorageUsage(ctx.db, ctx.resource.userId);
      await publishResourceOperation(ctx.getSessionPayload, {
        path: RoutePath.ResourceExplorerRecycleBin,
        title: ResourceOperationTitleMap[ResourceOperationType.Purged](ctx.resource.name),
      });
      return ctx.resource;
    },
  ),
  readActivities: getOwnerProcedure(undefined, readActivitiesInputSchema, "id").query<
    CursorPaginationData<ResourceActivityEntity>
  >(async ({ input: { cursor, id, limit } }) => {
    const clauses: Clause<ResourceActivityEntity>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: id },
    ];
    const resourceActivityClient = await useTableClient(AzureTable.ResourceActivity);
    return readCursorPaginationDataAzureTable(resourceActivityClient, ResourceActivityEntity, {
      clauses,
      cursor,
      limit,
      sortBy: [MESSAGE_ROWKEY_SORT_ITEM],
    });
  }),
  readDeletedResources: standardAuthedProcedure
    .input(readDeletedResourcesInputSchema)
    .query<OffsetPaginationData<ResourceListItem>>(async ({ ctx, input: { limit, offset, sortBy } }) => {
      const userId = ctx.getSessionPayload.user.id;
      // The bin reads the same row shape as the workbench, so one sort space serves both and neither list can
      // Be handed a key its query cannot order by
      const resultResources = await ctx.db
        .select(resourceListSelection)
        .from(resources)
        .leftJoin(resourceAccesses, createLastAccessedJoin(userId))
        .where(createResourcesWhere(ctx.db, userId, {}, true))
        .orderBy(...(sortBy.length > 0 ? parseSortByToSql(resourceListSelection, sortBy) : [desc(resources.deletedAt)]))
        .limit(limit + 1)
        .offset(offset);
      return getOffsetPaginationData(resultResources, limit);
    }),
  // Starred-first rather than updated-first, which is the one thing the Favorites list route cannot do: the
  // Star's own timestamp is not a column any list shows. Otherwise it is the same predicate the `isFavorite`
  // Filter expresses, taken from createResourcesWhere so a rule added there reaches both
  readFavorites: standardAuthedProcedure.query<ResourceListItem[]>(({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    return ctx.db
      .select(resourceListSelection)
      .from(resources)
      .innerJoin(resourceFavorites, createFavoriteJoin(userId))
      .leftJoin(resourceAccesses, createLastAccessedJoin(userId))
      .where(createResourcesWhere(ctx.db, userId, {}))
      .orderBy(desc(resourceFavorites.createdAt))
      .limit(MAX_READ_LIMIT);
  }),
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
  // Publish state rides the row rather than answering a second request: `resourcePublications` is one table
  // For every type, so this cross-type read resolves it whatever the resource turns out to be, and the
  // Ownership that second request would re-resolve is the ownership this one already resolved
  readResource: getOwnerProcedure(undefined, readResourceInputSchema, "id").query<ResourceWithPublication>(
    async ({ ctx }) => ({
      ...ctx.resource,
      publication:
        (await ctx.db.query.resourcePublications.findFirst({ where: { resourceId: { eq: ctx.resource.id } } })) ?? null,
    }),
  ),
  readResources: standardAuthedProcedure
    .input(readResourcesInputSchema.prefault({}))
    .query<OffsetPaginationData<ResourceListItem>>(async ({ ctx, input: { limit, offset, sortBy, ...filter } }) => {
      const userId = ctx.getSessionPayload.user.id;
      const resultResources = await ctx.db
        .select(resourceListSelection)
        .from(resources)
        .leftJoin(resourceAccesses, createLastAccessedJoin(userId))
        .where(createResourcesWhere(ctx.db, userId, filter))
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
          ...(sortBy.length > 0 ? parseSortByToSql(resourceListSelection, sortBy) : [desc(resources.updatedAt)]),
        )
        .limit(limit + 1)
        .offset(offset);
      return getOffsetPaginationData(resultResources, limit);
    }),
  // An upsert rather than an insert: the open that just happened is always the newest, so there is nothing to
  // Compare. Owner-scoped, like every other resource write
  recordAccess: getOwnerProcedure(undefined, readResourceInputSchema, "id").mutation<void>(
    async ({ ctx, input: { id } }) => {
      const userId = ctx.getSessionPayload.user.id;
      await ctx.db
        .insert(resourceAccesses)
        .values({ resourceId: id, userId })
        .onConflictDoUpdate({
          set: { accessedAt: new Date() },
          target: [resourceAccesses.userId, resourceAccesses.resourceId],
        });
    },
  ),
  // Restore copies a snapshot's content into the working copy through saveResourceContent semantics
  // (contentVersion++). The publication is never re-pointed — a restore produces a Draft to review and
  // Re-publish, mirroring the recycle bin's restore-returns-a-Draft rule.
  // The snapshot's assets are cloned back into the working copy's own files directory rather than referenced
  // Where they sit, exactly as the duplicate path does: a published url lives under {id}/published, which
  // Unpublish wipes wholesale, so a verbatim copy would hand the draft urls a later unpublish deletes — and
  // Re-publishing that draft would ship the same dead urls, with re-uploading every asset the only recovery
  restorePublishedVersion: getOwnerProcedure(undefined, restorePublishedVersionInputSchema, "id").mutation<Resource>(
    async ({ ctx, input: { id, version } }) => {
      const snapshotContent = await requireEntity(
        readContentBlob(
          ResourceDefinitionMap[ctx.resource.type].contentSchema,
          getPublishedContentBlobName(id, version),
        ),
        DatabaseEntityType.Resource,
        `${id}/${version}`,
      );
      // Reconstitution, not a raw copy: a snapshot froze whatever the type declares live, and writing that
      // Back over the working copy is how a restore silently reopened a closed survey or flipped its response
      // Mode — a setting the write boundary makes authorization decisions on, with nothing in the restore or
      // Its confirmation saying it would happen. The declaration is `ResourceLiveContentMap`, and it is the
      // Same one the public read and the version preview reconstitute through
      const publishedContent = await reapplyLiveResourceContent(ctx.resource, snapshotContent);
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
      // The one content-write path, so a restore is a content write like any other: the version bump and the blob
      // Write land in one transaction, the type's after-save hook re-derives what the restored content declares,
      // And the trail records the restore the way the recycle bin's does. Nothing adopts the save event it emits:
      // The subscription filters the emitting device out, and no publishable type subscribes to it client-side, so
      // An editor left open on this resource keeps the pre-restore draft and the version it cached, and its next
      // Autosave is rejected as stale until it reloads
      return saveResourceContent(ctx, {
        activityType: ResourceActivityType.Restored,
        content: clonedContent,
        resource: ctx.resource,
        // The bump and the write stay in one transaction so a failed write rolls the contentVersion back —
        // A restore that did not land must never advance the version every client caches against
        updateContentVersion: async (tx) =>
          requireMutation(
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
          ),
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
      await publishResourceOperation(ctx.getSessionPayload, {
        path: RoutePath.Resource(id),
        title: ResourceOperationTitleMap[ResourceOperationType.Restored](restoredResource.name),
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
