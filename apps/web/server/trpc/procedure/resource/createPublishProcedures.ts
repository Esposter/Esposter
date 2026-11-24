import type { PublishableResourceProcedureOptions } from "#server/models/resource/PublishableResourceProcedureOptions";
import type { PublishProcedureNames } from "#server/models/resource/PublishProcedureNames";
import type { Context } from "#server/trpc/context";
import type { PublishedResourceContent } from "#shared/models/resource/PublishedResourceContent";
import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { ResourceInResource, ResourcePublicationInResource, ResourceType } from "@esposter/db-schema";

import { epochMsSql } from "#server/services/db/epochMsSql";
import { publishResourceOperation } from "#server/services/notification/publishResourceOperation";
import { findOwnedResource } from "#server/services/resource/findOwnedResource";
import { getOwnedLiveResourceWhere } from "#server/services/resource/getOwnedLiveResourceWhere";
import { incrementResourceViewCount } from "#server/services/resource/incrementResourceViewCount";
import { readResourceContent } from "#server/services/resource/readResourceContent";
import { readResourceViewCount } from "#server/services/resource/readResourceViewCount";
import { reapplyLiveResourceContent } from "#server/services/resource/reapplyLiveResourceContent";
import { chargeSnapshotVersion } from "#server/services/resource/snapshot/chargeSnapshotVersion";
import { collectSnapshotObjects } from "#server/services/resource/snapshot/collectSnapshotObjects";
import { getSnapshotVersionDeletes } from "#server/services/resource/snapshot/getSnapshotVersionDeletes";
import { getSnapshotVersionWrites } from "#server/services/resource/snapshot/getSnapshotVersionWrites";
import { prepareSnapshotVersion } from "#server/services/resource/snapshot/prepareSnapshotVersion";
import { readSnapshotVersionContent } from "#server/services/resource/snapshot/readSnapshotVersionContent";
import { releaseResourceAssets } from "#server/services/resource/snapshot/releaseResourceAssets";
import { withResourceObjectLock } from "#server/services/resource/snapshot/withResourceObjectLock";
import { writeResourceActivity } from "#server/services/resource/writeResourceActivity";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { getOwnerProcedure } from "#server/trpc/procedure/resource/getOwnerProcedure";
import { standardRateLimitedProcedure } from "#server/trpc/procedure/standardRateLimitedProcedure";
import { readPublishedVersionContentInputSchema } from "#shared/models/db/resource/ReadPublishedVersionContentInput";
import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { ResourceOperationTitleMap } from "#shared/services/notification/ResourceOperationTitleMap";
import { getResourceContentSchema } from "#shared/services/resource/getResourceContentSchema";
import { getLivePublicationWhere } from "@esposter/db";
import {
  DatabaseEntityType,
  ResourceActivityType,
  resourcePublicationsInResource,
  resourcesInResource,
  resourceVersionsInResource,
  selectResourceInResourceSchema,
  SnapshotChannel,
} from "@esposter/db-schema";
import { getResultAsync, getSynchronizedFunction, noop, Operation, RoutePath } from "@esposter/shared";
import { and, eq, exists, sql } from "drizzle-orm";

// The publish group, built for a publishable type from that type's own content schema, with the publish hooks the type
// Declares
export const createPublishProcedures = <TType extends ResourceType>(
  type: TType,
  options?: PublishableResourceProcedureOptions<ResourceContent<TType>>,
) => {
  const contentSchema = getResourceContentSchema(type);
  const transformPublishedContent = options?.transformPublishedContent;
  // A version whose row an unpublish removed between the listing and the click reads as no content, and must
  // Reach the visitor as the 404 page rather than as an internal error
  const readPublishedContent = async (
    db: Context["db"],
    resource: ResourceInResource,
    publishVersion: ResourcePublicationInResource["publishVersion"],
  ): Promise<ResourceContent<TType>> => {
    const content = await readSnapshotVersionContent(
      db,
      { id: resource.id, type },
      { channel: SnapshotChannel.Published, version: publishVersion },
    );
    if (content === undefined) throw getNotFoundError(DatabaseEntityType.Resource, resource.id);
    // Reconstitution, not a plain read: a snapshot's frozen copy of what the type declares live is replaced
    // Here, so the public read and the owner's version preview answer the same content — and so does the
    // Restore, which reconstitutes through the same declaration
    return reapplyLiveResourceContent(type, resource, content);
  };
  return {
    publishResource: getOwnerProcedure(type, resourceIdInputSchema, "id").mutation<ResourcePublicationInResource>(
      async ({ ctx, input: { id } }) => {
        const content = await readResourceContent(contentSchema, id);
        if (content === undefined)
          throw getInvalidOperationError(Operation.Update, DatabaseEntityType.Resource, JSON.stringify({ id }));
        // Transformed before the transaction opens: a hook may read through `ctx.db` (Dashboard resolves every
        // Bound dataset), and issuing that read while this connection holds a transaction deadlocks
        const publishedContent = transformPublishedContent
          ? await transformPublishedContent(ctx, ctx.resource, content)
          : content;
        // The draft version this publish is taken from, written on both the insert and the conflict update: a
        // Row left carrying the column's default reports a draft that has moved since it was published,
        // Whatever the owner has or has not edited since
        const { contentVersion: publishedContentVersion } = ctx.resource;
        const now = Date.now();
        // The object and the claim naming it are written under the lease, so a collection cannot free the object
        // Between them
        const published = await withResourceObjectLock(ctx.db, id, async () => {
          // The content is stored before anything is claimed, so a failed store claims nothing and the publication
          // Never names A version that was never stored (openspec/specs/resource/resource-version-store/design.md)
          const prepared = await prepareSnapshotVersion(
            ctx.db,
            ctx.resource,
            SnapshotChannel.Published,
            JSON.stringify(publishedContent),
          );
          // The claim and the version it names are one batch. The version reads the publication counter the claim has
          // Just Bumped, so the row and the publication cannot disagree — and a claim that fails takes the version rows
          // With it. A Version's number is claimed fresh here, so no row of the channel holds it yet and no replaced
          // Object is released
          const publishVersion = sql<number>`(SELECT ${resourcePublicationsInResource.publishVersion} FROM ${resourcePublicationsInResource} WHERE ${resourcePublicationsInResource.resourceId} = ${id})`;
          const [publicationRows] = await getResultAsync(() =>
            ctx.db.batch([
              // Selected from the owner's live row, so a publish that lands after a delete inserts no publication: its
              // Version Names a publication that is not there, so the batch fails whole and nothing is left publicly
              // Served
              ctx.db
                .insert(resourcePublicationsInResource)
                .select(
                  ctx.db
                    .select({
                      createdAt: epochMsSql(now).as("createdAt"),
                      publishedAt: epochMsSql(now).as("publishedAt"),
                      publishedContentVersion: sql<number>`${publishedContentVersion}`.as("publishedContentVersion"),
                      resourceId: resourcesInResource.id,
                      updatedAt: epochMsSql(now).as("updatedAt"),
                    })
                    .from(resourcesInResource)
                    .where(getOwnedLiveResourceWhere(ctx.user.id, id)),
                )
                // A republish after an unpublish revives the tombstone, so the row keeps its count and its version
                // Climbs
                .onConflictDoUpdate({
                  set: {
                    deletedAt: null,
                    publishedAt: new Date(now),
                    publishedContentVersion,
                    publishVersion: sql`${resourcePublicationsInResource.publishVersion} + 1`,
                  },
                  target: resourcePublicationsInResource.resourceId,
                })
                .returning(),
              ...getSnapshotVersionWrites(
                ctx.db,
                id,
                { channel: SnapshotChannel.Published, version: publishVersion },
                prepared,
              ),
            ]),
          ).match(
            (batchRows) => batchRows,
            async (error) => {
              // The batch commits whole or not at all, so a failure claimed nothing.
              // A resource binned after the owner guard fails the version's NOT NULL.
              // So it answers the 404 that a read of a binned resource gives.
              await requireEntity(findOwnedResource(ctx.db, ctx.user.id, id, type), DatabaseEntityType.Resource, id);
              throw error;
            },
          );
          return { prepared, publicationRows };
        });
        const { prepared } = published;
        const publication = requireMutation(
          published.publicationRows[0],
          Operation.Update,
          DatabaseEntityType.ResourcePublication,
          id,
        );
        // A version is stored bytes the owner keeps, charged for what its object cost.
        // It is charged after the batch, never inside: the charge locks the ledger row and then the user's.
        // A batch held open across that would wait on locks it is itself holding.
        // See openspec/specs/resource/storage-quotas/design.md.
        await chargeSnapshotVersion(ctx.db, ctx.resource, prepared.writtenVersion);
        // Best-effort: a failed write loses one trail entry, never the publish.
        getSynchronizedFunction(writeResourceActivity)(ctx, {
          activityType: ResourceActivityType.Published,
          publishVersion: publication.publishVersion,
          resourceId: id,
        });
        await publishResourceOperation(ctx, {
          path: RoutePath.Resource(id),
          title: ResourceOperationTitleMap[ResourceOperationType.Published](
            ctx.resource.name,
            publication.publishVersion,
          ),
        });
        return publication;
      },
    ),
    readPublishedResourceContent: standardRateLimitedProcedure
      .input(selectResourceInResourceSchema.shape.id)
      .query<PublishedResourceContent<TType>>(async ({ ctx, input }) => {
        // A binned resource is no longer served, whatever publication row it still holds.
        // The two reads do not depend on each other, so they overlap.
        // A missing resource still answers its 404 once both settle.
        const [resource, [publication]] = await Promise.all([
          requireEntity(
            ctx.db.query.resourcesInResource.findFirst({
              where: { deletedAt: { isNull: true }, id: { eq: input }, type: { eq: type } },
            }),
            DatabaseEntityType.Resource,
            input,
          ),
          ctx.db
            .select()
            .from(resourcePublicationsInResource)
            .where(getLivePublicationWhere(eq(resourcePublicationsInResource.resourceId, input)))
            .limit(1),
        ]);
        if (!publication) throw getNotFoundError(DatabaseEntityType.ResourcePublication, input);

        const content = await readPublishedContent(ctx.db, resource, publication.publishVersion);
        // Counted after the read is guaranteed to succeed, so a 404 never lands in the buckets.
        // Awaited, so the write is recorded and published before the read returns.
        // A failed increment still loses only one view, never the page.
        await incrementResourceViewCount(ctx.db, input);
        return { content, name: resource.name };
      }),
    // An owner-only read of a retained snapshot, backing the view route's `version` query param.
    // Anonymous visitors never reach this, since the public read above always serves the latest publish.
    readPublishedVersionContent: getOwnerProcedure(type, readPublishedVersionContentInputSchema, "id").query<
      PublishedResourceContent<TType>
    >(async ({ ctx, input: { version } }) => ({
      content: await readPublishedContent(ctx.db, ctx.resource, version),
      name: ctx.resource.name,
    })),
    readResourcePublication: getOwnerProcedure(type, resourceIdInputSchema, "id").query<
      ResourcePublicationInResource | undefined
    >(({ ctx }) =>
      ctx.db.query.resourcePublicationsInResource.findFirst({ where: { resourceId: { eq: ctx.resource.id } } }),
    ),
    readResourceViewCount: getOwnerProcedure(type, resourceIdInputSchema, "id").query<number>(({ ctx }) =>
      readResourceViewCount(ctx.db, ctx.resource.id),
    ),
    unpublishResource: getOwnerProcedure(type, resourceIdInputSchema, "id").mutation<
      ResourcePublicationInResource | undefined
    >(async ({ ctx }) => {
      const { id } = ctx.resource;
      // The publication's tombstone and the published channel's versions go in one batch, and the versions are selected
      // Only While the publication is live, so a publish landing between them cannot have its new version deleted by
      // This unpublish
      const [referenceRows, unpublishedVersions, tombstonedPublications] = await ctx.db.batch([
        ...getSnapshotVersionDeletes(
          ctx.db,
          and(
            eq(resourceVersionsInResource.resourceId, id),
            eq(resourceVersionsInResource.channel, SnapshotChannel.Published),
            exists(
              ctx.db
                .select({ one: sql`1` })
                .from(resourcePublicationsInResource)
                .where(getLivePublicationWhere(eq(resourcePublicationsInResource.resourceId, id))),
            ),
          ),
        ),
        ctx.db
          .update(resourcePublicationsInResource)
          .set({ deletedAt: new Date() })
          .where(
            getLivePublicationWhere(
              and(
                eq(resourcePublicationsInResource.resourceId, id),
                exists(
                  ctx.db
                    .select({ one: sql`1` })
                    .from(resourcesInResource)
                    .where(getOwnedLiveResourceWhere(ctx.user.id, id)),
                ),
              ),
            ),
          )
          .returning(),
      ]);
      // Only when a row was actually tombstoned: an unpublish that changes nothing was never publishing anything, so
      // Every Effect below it is a phantom, and an activity entry or a push to the owner's other devices would report a
      // State Change that never happened. The answer is the row as it stands, so a client holding a live copy takes the
      // Removal
      const [tombstone] = tombstonedPublications;
      if (!tombstone)
        return ctx.db.query.resourcePublicationsInResource.findFirst({ where: { resourceId: { eq: id } } });
      // The published channel's versions go with the publication, and the objects nothing else names go to the
      // Deletion path — the working copy's revisions may still share a keyframe with one, which collection keeps
      const assetHashes = [...new Set(referenceRows.map(({ assetHash }) => assetHash))];
      await getResultAsync(() => collectSnapshotObjects(ctx.db, id, unpublishedVersions)).match(noop, console.error);
      await getResultAsync(() => releaseResourceAssets(ctx.db, id, assetHashes)).match(noop, console.error);
      // Best-effort: a failed write loses one trail entry, never the unpublish.
      getSynchronizedFunction(writeResourceActivity)(ctx, {
        activityType: ResourceActivityType.Unpublished,
        resourceId: id,
      });
      await publishResourceOperation(ctx, {
        path: RoutePath.Resource(id),
        title: ResourceOperationTitleMap[ResourceOperationType.Unpublished](ctx.resource.name),
      });
      return tombstone;
    }),
  } satisfies Record<(typeof PublishProcedureNames)[number], unknown>;
};
