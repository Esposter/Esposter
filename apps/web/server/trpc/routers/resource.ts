import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { ResourceTagCount } from "#shared/models/resource/ResourceTagCount";
import type { ResourceTypeCount } from "#shared/models/resource/ResourceTypeCount";
import type { ResourceWithPublication } from "#shared/models/resource/ResourceWithPublication";
import type { SnapshotRestoration } from "#shared/models/resource/SnapshotRestoration";
import type { SnapshotVersion } from "#shared/models/resource/SnapshotVersion";
import type { Clause } from "@esposter/azure";
import type { Resource } from "@esposter/db-schema";

import { deleteResourcesInputSchema } from "#shared/models/db/resource/DeleteResourcesInput";
import { readActivitiesInputSchema } from "#shared/models/db/resource/ReadActivitiesInput";
import { readDeletedResourcesInputSchema } from "#shared/models/db/resource/ReadDeletedResourcesInput";
import { readResourceListInputSchema } from "#shared/models/db/resource/ReadResourceListInput";
import { resourceFilterInputSchema } from "#shared/models/db/resource/ResourceFilterInput";
import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { restoreSnapshotVersionInputSchema } from "#shared/models/db/resource/RestoreSnapshotVersionInput";
import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { SnapshotKind } from "#shared/models/resource/SnapshotKind";
import { ResourceOperationTitleMap } from "#shared/services/notification/ResourceOperationTitleMap";
import { MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { SnapshotChannelDefinitionMap } from "#shared/services/resource/SnapshotChannelDefinitionMap";
import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { escapeLike } from "@@/server/services/db/escapeLike";
import { publishResourceOperation } from "@@/server/services/notification/publishResourceOperation";
import { readCursorPaginationDataAzureTable } from "@@/server/services/pagination/cursor/readCursorPaginationDataAzureTable";
import { getBasePaginationData } from "@@/server/services/pagination/getBasePaginationData";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { cloneContentAssets } from "@@/server/services/resource/cloneContentAssets";
import { DUPLICATE_NAME_SUFFIX } from "@@/server/services/resource/constants";
import { createResourceRow } from "@@/server/services/resource/createResourceRow";
import { getFavoriteJoin } from "@@/server/services/resource/getFavoriteJoin";
import { getLastAccessedJoin } from "@@/server/services/resource/getLastAccessedJoin";
import { getResourcesWhere } from "@@/server/services/resource/getResourcesWhere";
import { getSearchSimilarity } from "@@/server/services/resource/getSearchSimilarity";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { reapplyLiveResourceContent } from "@@/server/services/resource/reapplyLiveResourceContent";
import { resourceListSelection } from "@@/server/services/resource/resourceListSelection";
import { saveResourceContent } from "@@/server/services/resource/saveResourceContent";
import { readSnapshotHistory } from "@@/server/services/resource/snapshot/readSnapshotHistory";
import { readSnapshotVersionContent } from "@@/server/services/resource/snapshot/readSnapshotVersionContent";
import { takeResourceRevision } from "@@/server/services/resource/snapshot/takeResourceRevision";
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
  ResourceActivityType,
  resourceFavorites,
  resources,
  SnapshotChannel,
  SnapshotReason,
} from "@esposter/db-schema";
import { MAX_READ_LIMIT, Operation, RoutePath, takeOne } from "@esposter/shared";
import { and, asc, count, desc, eq, ilike, inArray, isNull, sql } from "drizzle-orm";

export const resourceRouter = router({
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
  duplicateResource: getOwnerProcedure(undefined, resourceIdInputSchema, "id").mutation<Resource>(async ({ ctx }) => {
    const { name, tags, type } = ctx.resource;
    const newResource = await createResourceRow(
      ctx,
      {
        name: `${name.slice(0, RESOURCE_NAME_MAX_LENGTH - DUPLICATE_NAME_SUFFIX.length)}${DUPLICATE_NAME_SUFFIX}`,
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
  purgeResource: getOwnerProcedure(undefined, resourceIdInputSchema, "id", true).mutation<Resource>(
    async ({ ctx, input: { id } }) => {
      const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
      // Purge is the only place these partitions are destroyed, since delete is soft
      const tableClients = await Promise.all(
        getResourceOwnedTableNames(ctx.resource.type).map((tableName) => useTableClient(tableName)),
      );
      await purgeResource(ctx.db, containerClient, tableClients, id);
      // The other half of the counter: a purge is the one delete that gives bytes back from this process, so
      // It is the one delete whose owner is here to be told. See /docs/resource/storage-quotas
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
      const resultResources = await ctx.db
        .select(resourceListSelection)
        .from(resources)
        .leftJoin(resourceAccesses, getLastAccessedJoin(userId))
        .where(getResourcesWhere(ctx.db, userId, {}, true))
        .orderBy(...(sortBy.length > 0 ? parseSortByToSql(resourceListSelection, sortBy) : [desc(resources.deletedAt)]))
        .limit(limit + 1)
        .offset(offset);
      return getBasePaginationData(resultResources, limit);
    }),
  readDeletedResourcesCount: standardAuthedProcedure.query<number>(
    async ({ ctx }) =>
      takeOne(
        await ctx.db
          .select({ count: count() })
          .from(resources)
          .where(getResourcesWhere(ctx.db, ctx.getSessionPayload.user.id, {}, true)),
      ).count,
  ),
  // Starred-first rather than updated-first, which is the one thing the Favorites list route cannot do: the
  // Star's own timestamp is not a column any list shows
  readFavorites: standardAuthedProcedure.query<ResourceListItem[]>(({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    return ctx.db
      .select(resourceListSelection)
      .from(resources)
      .innerJoin(resourceFavorites, getFavoriteJoin(userId))
      .leftJoin(resourceAccesses, getLastAccessedJoin(userId))
      .where(getResourcesWhere(ctx.db, userId, {}))
      .orderBy(desc(resourceFavorites.createdAt))
      .limit(MAX_READ_LIMIT);
  }),
  // Publish state rides the row rather than answering a second request: `resourcePublications` is one table
  // For every type, so this cross-type read resolves it whatever the resource turns out to be
  readResource: getOwnerProcedure(undefined, resourceIdInputSchema, "id").query<ResourceWithPublication>(
    async ({ ctx }) => ({
      ...ctx.resource,
      publication:
        (await ctx.db.query.resourcePublications.findFirst({ where: { resourceId: { eq: ctx.resource.id } } })) ?? null,
    }),
  ),
  readResources: standardAuthedProcedure
    .input(readResourceListInputSchema.prefault({}))
    .query<OffsetPaginationData<ResourceListItem>>(async ({ ctx, input: { limit, offset, sortBy, ...filter } }) => {
      const userId = ctx.getSessionPayload.user.id;
      const resultResources = await ctx.db
        .select(resourceListSelection)
        .from(resources)
        .leftJoin(resourceAccesses, getLastAccessedJoin(userId))
        .where(getResourcesWhere(ctx.db, userId, filter))
        .orderBy(
          // Relevance ladder: closest trigram match first so a typo still ranks its resource top, then
          // Prefix matches above the remaining substring matches (true sorts before false under desc),
          // Then newest-first within each tier; every search value is bound through the query builder
          ...(filter.searchQuery
            ? [
                desc(getSearchSimilarity(filter.searchQuery)),
                desc(ilike(resources.name, `${escapeLike(filter.searchQuery)}%`)),
              ]
            : []),
          ...(sortBy.length > 0 ? parseSortByToSql(resourceListSelection, sortBy) : [desc(resources.updatedAt)]),
        )
        .limit(limit + 1)
        .offset(offset);
      return getBasePaginationData(resultResources, limit);
    }),
  readResourcesCount: standardAuthedProcedure.input(resourceFilterInputSchema.prefault({})).query<number>(
    async ({ ctx, input }) =>
      takeOne(
        await ctx.db
          .select({ count: count() })
          .from(resources)
          .where(getResourcesWhere(ctx.db, ctx.getSessionPayload.user.id, input)),
      ).count,
  ),
  // The Tags list. Tag names live inside one jsonb column rather than their own table, so the breakdown is a
  // Grouped count over the expanded keys — the expansion is a subquery because a set-returning function
  // Cannot sit beside an aggregate in one select list. Values are deliberately not part of the grouping: the
  // Tags entry answers "which tags do I use", and the /all Tag pill is where a value narrows it further
  readResourceTagCounts: standardAuthedProcedure.query<ResourceTagCount[]>(({ ctx }) => {
    const tagNames = ctx.db
      .select({ name: sql<string>`jsonb_object_keys(${resources.tags})`.as("name") })
      .from(resources)
      .where(getResourcesWhere(ctx.db, ctx.getSessionPayload.user.id, {}))
      .as("tag_names");
    return ctx.db
      .select({ count: count(), name: tagNames.name })
      .from(tagNames)
      .groupBy(tagNames.name)
      .orderBy(desc(count()), asc(tagNames.name));
  }),
  // The summary cards own the type breakdown, so `types` is the one filter they cannot pass — a card is
  // The affordance for setting it
  readResourceTypeCounts: standardAuthedProcedure
    .input(resourceFilterInputSchema.omit({ types: true }).prefault({}))
    .query<ResourceTypeCount[]>(({ ctx, input }) =>
      ctx.db
        .select({ count: count(), type: resources.type })
        .from(resources)
        .where(getResourcesWhere(ctx.db, ctx.getSessionPayload.user.id, input))
        .groupBy(resources.type)
        .orderBy(desc(count())),
    ),
  // Which versions exist comes from the version rows. Which published one is LIVE comes from the publication
  // Row instead, because a row answers what is live and the listing answers what can be returned to.
  //
  // Both channels in one time-ordered list, because the owner has one question — where can I go back to — and
  // The channels are an address space rather than two things to make them choose between. Every type is asked
  // For both: a non-publishable one simply has no published prefix to enumerate
  readSnapshotHistory: getOwnerProcedure(undefined, resourceIdInputSchema, "id").query<SnapshotVersion[]>(
    async ({ ctx }) => {
      const publication = await ctx.db.query.resourcePublications.findFirst({
        where: { resourceId: { eq: ctx.resource.id } },
      });
      const channelHistories = await Promise.all([
        readSnapshotHistory(ctx.db, ctx.resource.id, SnapshotChannel.Revisions),
        readSnapshotHistory(ctx.db, ctx.resource.id, SnapshotChannel.Published, publication?.publishVersion),
      ]);
      // Newest first, and by time rather than by version: the two channels number independently, so an
      // Ordinal says nothing about where a row belongs once they share a list
      return channelHistories.flat().toSorted((first, second) => second.takenAt.getTime() - first.takenAt.getTime());
    },
  ),
  // An upsert rather than an insert: the open that just happened is always the newest, so there is nothing to
  // Compare. Owner-scoped, like every other resource write
  recordAccess: getOwnerProcedure(undefined, resourceIdInputSchema, "id").mutation<void>(
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
  restoreResource: getOwnerProcedure(undefined, resourceIdInputSchema, "id", true).mutation<Resource>(
    async ({ ctx, input: { id } }) => {
      // Names are not unique, so a restore can never conflict
      const restoredResource = requireMutation(
        (await ctx.db.update(resources).set({ deletedAt: null }).where(eq(resources.id, id)).returning())[0],
        Operation.Update,
        DatabaseEntityType.Resource,
        id,
      );
      // Best-effort: a failed write loses one trail entry, never the restore.
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
  // Restore copies a snapshot's content into the working copy through saveResourceContent semantics
  // (contentVersion++). The publication is never re-pointed — a restore produces a Draft to review and
  // Re-publish, mirroring the recycle bin's restore-returns-a-Draft rule.
  // The channel rides with the version because the two number independently: `v1` names one snapshot per
  // Channel, so a version alone restores whichever of them the caller did not mean.
  // An immutable snapshot's assets are cloned back into the working copy's own files directory rather than
  // Referenced where they sit, exactly as the duplicate path does: a published url lives under {id}/published,
  // Which unpublish wipes wholesale, so a verbatim copy would hand the draft urls a later unpublish deletes —
  // And re-publishing that draft would ship the same dead urls, with re-uploading every asset the only recovery
  restoreSnapshotVersion: getOwnerProcedure(
    undefined,
    restoreSnapshotVersionInputSchema,
    "id",
  ).mutation<SnapshotRestoration>(async ({ ctx, input: { channel, id, version } }) => {
    const snapshotContent = await requireEntity(
      readSnapshotVersionContent(ctx.db, ctx.resource, { channel, version }),
      DatabaseEntityType.Resource,
      `${id}/${channel}/${version}`,
    );
    // The undo, taken before a single byte of the working copy is written and allowed to fail the whole
    // Restore: a restore is the one operation that destroys draft work on purpose, and one whose undo silently
    // Did not happen is the defect this mechanism exists to close. Taken after the snapshot is known to exist,
    // So a restore that was never going to land does not spend a ring-buffer slot and evict the oldest
    // Recovery point on its way to failing
    const undoRevisionVersion = await takeResourceRevision(ctx, ctx.resource, SnapshotReason.BeforeRestore);
    // Reconstitution, not a raw copy: a snapshot froze whatever the type declares live, and writing that back
    // Over the working copy would silently reopen a closed survey or flip its response mode — a setting the
    // Write boundary makes authorization decisions on, with nothing in the restore or its confirmation saying
    // It would happen. The declaration is `ResourceLiveContentMap`, and it is the same one the public read and
    // The version preview reconstitute through
    const reappliedContent = await reapplyLiveResourceContent(ctx.resource, snapshotContent);
    // Cloned before the transaction opens, exactly as `publishResource` does it: the clone is one storage
    // Round trip per referenced asset, and running it inside would hold a pooled connection — not just the
    // `resources` row lock — for that whole time, so a handful of concurrent restores of asset-heavy
    // Resources would starve the pool for requests that have nothing to do with them.
    // Blobs a partial clone already wrote stay under this resource's own `{id}/files`, unreferenced by any
    // Content until the next restore overwrites them or `purgeResource` takes the directory wholesale — the
    // Deliberate trade, unlike `duplicateResource`, whose compensating `deleteDirectory` is only safe because
    // The resource it clears was created moments earlier; the target here is a live working copy whose
    // Existing files a directory-wide cleanup would destroy.
    // Only the immutable kind, which is the one whose urls point into its own frozen clone directory. A
    // Reference snapshot's urls already name the live `{id}/files/…` the working copy is pointing at, so
    // Cloning them would mint a second copy of every asset the resource already holds and charge the owner
    // For it, on every restore
    const restoredContent =
      SnapshotChannelDefinitionMap[channel].kind === SnapshotKind.Immutable
        ? await cloneContentAssets(ctx.db, ctx.getSessionPayload.user.id, reappliedContent, id)
        : reappliedContent;
    // The one content-write path, so a restore is a content write like any other: the version bump and the blob
    // Write land in one transaction, the type's after-save hook re-derives what the restored content declares,
    // And the trail records the restore the way the recycle bin's does. Nothing adopts the save event it emits:
    // The subscription filters the emitting device out, and no publishable type subscribes to it client-side, so
    // An editor left open on this resource keeps the pre-restore draft and the version it cached, and its next
    // Autosave is rejected as stale until it reloads
    const restoredResource = await saveResourceContent(ctx, {
      activityType: ResourceActivityType.Restored,
      content: restoredContent,
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
    return { resource: restoredResource, undoRevisionVersion };
  }),
  // The safety net an import takes before it replaces a draft wholesale. Returns the version it wrote, or
  // Undefined when the resource has no content blob to take one from — a resource created and never saved has
  // No state worth keeping, which is an answer rather than a failure
  saveResourceRevision: getOwnerProcedure(undefined, resourceIdInputSchema, "id").mutation<number | undefined>(
    ({ ctx }) => takeResourceRevision(ctx, ctx.resource, SnapshotReason.BeforeImport),
  ),
  toggleFavorite: getOwnerProcedure(undefined, resourceIdInputSchema, "id").mutation<boolean>(
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
