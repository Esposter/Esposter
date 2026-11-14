/* eslint-disable no-restricted-syntax -- an unresolved generic's conditional tuple, which no single `as` narrows; the union zod infers from a generic map key overlaps no one type's schema */
import type { PublishableResourceProcedureOptions } from "#server/models/resource/PublishableResourceProcedureOptions";
import type { Context } from "#server/trpc/context";
import type { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import type { FileAssetsResourceType } from "#shared/models/resource/FileAssetsResourceType";
import type { PublishableResourceType } from "#shared/models/resource/PublishableResourceType";
import type { PublishedResourceContent } from "#shared/models/resource/PublishedResourceContent";
import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { ResourceFileSasEntity } from "#shared/models/resource/ResourceFileSasEntity";
import type { ResourceWithPublication } from "#shared/models/resource/ResourceWithPublication";
import type { ResourceInResource, ResourcePublicationInResource, ResourceType } from "@esposter/db-schema";
import type { z } from "zod";

import { publishResourceOperation } from "#server/services/notification/publishResourceOperation";
import { getBasePaginationData } from "#server/services/pagination/getBasePaginationData";
import { parseSortByToSql } from "#server/services/pagination/sorting/parseSortByToSql";
import { RESOURCE_ASSET_SAS_DURATION_MS } from "#server/services/resource/constants";
import { createResourceRow } from "#server/services/resource/createResourceRow";
import { deleteStagingContentBlob } from "#server/services/resource/deleteStagingContentBlob";
import { generateReservedResourceAssetSasEntities } from "#server/services/resource/generateReservedResourceAssetSasEntities";
import { getPublicationWhere } from "#server/services/resource/getPublicationWhere";
import { getStagingContentBlobName } from "#server/services/resource/getStagingContentBlobName";
import { incrementResourceViewCount } from "#server/services/resource/incrementResourceViewCount";
import { readResourceContent } from "#server/services/resource/readResourceContent";
import { readResourceContentDelta } from "#server/services/resource/readResourceContentDelta";
import { readResourceViewCount } from "#server/services/resource/readResourceViewCount";
import { readStagedResourceContent } from "#server/services/resource/readStagedResourceContent";
import { reapplyLiveResourceContent } from "#server/services/resource/reapplyLiveResourceContent";
import { saveResourceContent } from "#server/services/resource/saveResourceContent";
import { chargeSnapshotVersion } from "#server/services/resource/snapshot/chargeSnapshotVersion";
import { collectSnapshotObjects } from "#server/services/resource/snapshot/collectSnapshotObjects";
import { getSnapshotVersionDeletes } from "#server/services/resource/snapshot/getSnapshotVersionDeletes";
import { getSnapshotVersionWrites } from "#server/services/resource/snapshot/getSnapshotVersionWrites";
import { prepareSnapshotVersion } from "#server/services/resource/snapshot/prepareSnapshotVersion";
import { readSnapshotVersionContent } from "#server/services/resource/snapshot/readSnapshotVersionContent";
import { releaseResourceAssets } from "#server/services/resource/snapshot/releaseResourceAssets";
import { withResourceObjectLock } from "#server/services/resource/snapshot/withResourceObjectLock";
import { softDeleteResources } from "#server/services/resource/softDeleteResources";
import { updateResourceRow } from "#server/services/resource/updateResourceRow";
import { writeResourceActivity } from "#server/services/resource/writeResourceActivity";
import { generateReservedWriteSasUrl } from "#server/services/storage/generateReservedWriteSasUrl";
import { getStorageCredentials } from "#server/services/storage/getStorageCredentials";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { getOwnerProcedure } from "#server/trpc/procedure/resource/getOwnerProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { standardRateLimitedProcedure } from "#server/trpc/procedure/standardRateLimitedProcedure";
import { createResourceInputSchema } from "#shared/models/db/resource/CreateResourceInput";
import { deleteFileInputSchema } from "#shared/models/db/resource/DeleteFileInput";
import { generateUploadContentSasUrlInputSchema } from "#shared/models/db/resource/GenerateUploadContentSasUrlInput";
import { generateUploadFileSasEntitiesInputSchema } from "#shared/models/db/resource/GenerateUploadFileSasEntitiesInput";
import { readPublishedVersionContentInputSchema } from "#shared/models/db/resource/ReadPublishedVersionContentInput";
import { readResourcesInputSchema } from "#shared/models/db/resource/ReadResourcesInput";
import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { saveResourceContentDeltaInputSchema } from "#shared/models/db/resource/SaveResourceContentDeltaInput";
import { createSaveResourceContentInputSchema } from "#shared/models/db/resource/SaveResourceContentInput";
import { saveStagedResourceContentInputSchema } from "#shared/models/db/resource/SaveStagedResourceContentInput";
import { updateResourceInputSchema } from "#shared/models/db/resource/UpdateResourceInput";
import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { ResourceOperationTitleMap } from "#shared/services/notification/ResourceOperationTitleMap";
import { checkHasCapability } from "#shared/services/resource/checkHasCapability";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { createPresignedGetUrl, getContentBlobName } from "@esposter/db";
import {
  DatabaseEntityType,
  ResourceActivityType,
  resourcePublicationsInResource,
  resourcesInResource,
  resourceVersionsInResource,
  selectResourceInResourceSchema,
  SnapshotChannel,
  StorageBucket,
} from "@esposter/db-schema";
import { getResultAsync, getSynchronizedFunction, noop, Operation, RoutePath } from "@esposter/shared";
import { and, EmptyFilter, eq, exists, sql } from "drizzle-orm";

export const createResourceProcedures = <TType extends ResourceType>(
  type: TType,
  ...args: TType extends PublishableResourceType
    ? [options?: PublishableResourceProcedureOptions<ResourceContent<TType>>]
    : []
) => {
  const { contentSchema } = ResourceDefinitionMap[type];
  // `args` comes from an unresolved-generic conditional tuple, so the hook params collapse to the
  // Intersection of every content type; pin them back to this TType's concrete content shape.
  const { transformPublishedContent } = (args[0] ?? {}) as unknown as PublishableResourceProcedureOptions<
    ResourceContent<TType>
  >;
  // Annotated so the generic content schema resolves to a concrete type for destructuring: `contentSchema` is
  // Read off the map by a generic key, so zod infers the union of every type's content, and the procedure's
  // Input then reaches the stores as a union none of them can index. Both the output and input sides are
  // Declared — leaving the input side defaulted to unknown would erase the procedure's input type for
  // Consumers like achievement condition paths.
  const saveResourceContentInputSchema = createSaveResourceContentInputSchema(contentSchema) as unknown as z.ZodType<
    {
      content: ResourceContent<TType>;
      contentVersion: ResourceInResource["contentVersion"];
      id: ResourceInResource["id"];
    },
    {
      content: z.input<(typeof ResourceDefinitionMap)[TType]["contentSchema"]>;
      contentVersion: ResourceInResource["contentVersion"];
      id: ResourceInResource["id"];
    }
  >;
  const readContent = async (id: ResourceInResource["id"]): Promise<ResourceContent<TType> | undefined> =>
    (await readResourceContent(contentSchema, id)) as ResourceContent<TType> | undefined;
  // A version whose row an unpublish removed between the listing and the click reads as no content, and must
  // Reach the visitor as the 404 page rather than as an internal error. The generic contentSchema parses to the
  // Union of all content types, which the concrete caller's TType pins back down to its own content shape
  const readPublishedContent = async (
    db: Context["db"],
    resource: ResourceInResource,
    publishVersion: ResourcePublicationInResource["publishVersion"],
  ): Promise<ResourceContent<TType>> => {
    const content = (await readSnapshotVersionContent(db, resource, {
      channel: SnapshotChannel.Published,
      version: publishVersion,
    })) as ResourceContent<TType> | undefined;
    if (content === undefined) throw getNotFoundError(DatabaseEntityType.Resource, resource.id);
    // Reconstitution, not a plain read: a snapshot's frozen copy of what the type declares live is replaced
    // Here, so the public read and the owner's version preview answer the same content — and so does the
    // Restore, which reconstitutes through the same declaration
    return (await reapplyLiveResourceContent(resource, content)) as ResourceContent<TType>;
  };
  const baseProcedures = {
    createResource: standardAuthedProcedure
      .input(createResourceInputSchema)
      .mutation<ResourceInResource>(({ ctx, input }) => createResourceRow(ctx, { ...input, type })),
    // The blobs and the type's table partitions survive until purge — destroying them here would
    // Make restore hand back an empty resource
    deleteResource: getOwnerProcedure(type, resourceIdInputSchema, "id").mutation<ResourceInResource>(
      async ({ ctx, input: { id } }) => {
        const deletedResource = requireMutation(
          (await softDeleteResources(ctx.db, eq(resourcesInResource.id, id)))[0],
          Operation.Delete,
          DatabaseEntityType.Resource,
          id,
        );
        await publishResourceOperation(ctx.getSessionPayload, {
          path: RoutePath.ResourceExplorerRecycleBin,
          title: ResourceOperationTitleMap[ResourceOperationType.Deleted](deletedResource.name, 1),
        });
        return deletedResource;
      },
    ),
    // A document larger than one request body is read straight from Blob Storage, so the server signs the read
    // And never holds the bytes. Used the moment it is issued, so it lives minutes rather than the attachment default
    generateReadContentSasUrl: getOwnerProcedure(type, resourceIdInputSchema, "id").query<string>(
      ({ input: { id } }) => {
        const contentBlobName = getContentBlobName(id);
        return createPresignedGetUrl(getStorageCredentials(), StorageBucket.ResourceAssets, contentBlobName, {
          expiresInMs: RESOURCE_ASSET_SAS_DURATION_MS,
        });
      },
    ),
    // The write target of a staged save, held against the owner's quota for the gzip's size like any upload
    generateUploadContentSasUrl: getOwnerProcedure(type, generateUploadContentSasUrlInputSchema, "id").query<string>(
      ({ ctx, input: { id, size } }) =>
        generateReservedWriteSasUrl(
          ctx.db,
          ctx.getSessionPayload.user.id,
          StorageBucket.ResourceAssets,
          getStagingContentBlobName(id),
          size,
        ),
    ),
    // Every content write funnels through saveResourceContent, so this one stream keeps every other device's
    readResourceContent: getOwnerProcedure(type, resourceIdInputSchema, "id").query<ResourceContent<TType> | undefined>(
      ({ input: { id } }) => readContent(id),
    ),
    readResources: standardAuthedProcedure
      .input(readResourcesInputSchema)
      .query<OffsetPaginationData<ResourceWithPublication>>(
        async ({ ctx, input: { isPublished, limit, offset, sortBy } }) => {
          const resultResources = await ctx.db.query.resourcesInResource.findMany({
            limit: limit + 1,
            offset,
            orderBy: (resource, { desc }) =>
              sortBy.length > 0 ? parseSortByToSql(resource, sortBy) : desc(resource.updatedAt),
            where: {
              // Soft-deleted resources belong to the Recycle bin, never to a type's own listing
              deletedAt: { isNull: true },
              // The filter runs in the query, so the page and its hasMore are over the matching resources alone
              RAW:
                isPublished === undefined
                  ? EmptyFilter
                  : (resource) => getPublicationWhere(ctx.db, resource.id, isPublished),
              type: { eq: type },
              userId: { eq: ctx.getSessionPayload.user.id },
            },
            with: { publication: true },
          });
          return getBasePaginationData(resultResources, limit);
        },
      ),
    saveResourceContent: getOwnerProcedure(type, saveResourceContentInputSchema, "id").mutation<ResourceInResource>(
      ({ ctx, input: { content, contentVersion } }) =>
        saveResourceContent(ctx, {
          activityType: ResourceActivityType.ContentSaved,
          content,
          contentVersion,
          resource: ctx.resource,
        }),
    ),
    // A large document edited since its last save crosses as a zstd delta against the stored bytes, reaching the
    // Same door with the same version check (openspec/specs/resource/resource-version-store/design.md)
    saveResourceContentDelta: getOwnerProcedure(
      type,
      saveResourceContentDeltaInputSchema,
      "id",
    ).mutation<ResourceInResource>(async ({ ctx, input: { baselineHash, contentVersion, delta } }) => {
      const content = await readResourceContentDelta(ctx.resource, baselineHash, delta);
      return saveResourceContent(ctx, {
        activityType: ResourceActivityType.ContentSaved,
        content,
        contentVersion,
        resource: ctx.resource,
      });
    }),
    // A document too large for one request body is uploaded straight to Blob Storage first and committed here by
    // Reference, reaching the same door with the same version check (openspec/specs/architecture/file-uploads/design.md)
    saveStagedResourceContent: getOwnerProcedure(
      type,
      saveStagedResourceContentInputSchema,
      "id",
    ).mutation<ResourceInResource>(async ({ ctx, input: { contentVersion, hash, id } }) => {
      const content = await readStagedResourceContent(id, hash);
      const savedResource = await saveResourceContent(ctx, {
        activityType: ResourceActivityType.ContentSaved,
        content,
        contentVersion,
        resource: ctx.resource,
      });
      await deleteStagingContentBlob(ctx.db, id);
      return savedResource;
    }),
    updateResource: getOwnerProcedure(type, updateResourceInputSchema, "id").mutation<ResourceInResource>(
      ({ ctx, input: { name, tags } }) => updateResourceRow(ctx, ctx.resource, { name, tags }),
    ),
  };
  // Binary assets live under {id}/files/{hash} — the owner uploads through short-lived SAS urls and reads resolve
  // Through the /api/resource-assets endpoint (content embeds only stable urls, never a signature). An asset is never
  // Deleted here: the file's hash is handed to the release path, which deletes it only once no stored version names it
  const fileAssetsProcedures = {
    deleteFile: getOwnerProcedure(type, deleteFileInputSchema, "id").mutation<void>(
      async ({ ctx, input: { blobPath, id } }) => {
        // The path is the file's hash (ASSET_HASH_REGEX), so the release sees exactly the address that was removed
        await releaseResourceAssets(ctx.db, id, [blobPath]);
      },
    ),
    generateUploadFileSasEntities: getOwnerProcedure(type, generateUploadFileSasEntitiesInputSchema, "id").query<
      ResourceFileSasEntity[]
    >(({ ctx, input: { files, id } }) =>
      generateReservedResourceAssetSasEntities(ctx.db, ctx.getSessionPayload.user.id, id, files),
    ),
  };
  const publishProcedures = {
    publishResource: getOwnerProcedure(type, resourceIdInputSchema, "id").mutation<ResourcePublicationInResource>(
      async ({ ctx, input: { id } }) => {
        const content = await readContent(id);
        if (content === undefined)
          throw getInvalidOperationError(
            Operation.Update,
            DatabaseEntityType.Resource,
            "cannot publish resource without content",
          );
        // Transformed before the transaction opens: a hook may read through `ctx.db` (Dashboard resolves every
        // Bound dataset), and issuing that read while this connection holds a transaction deadlocks
        const publishedContent = transformPublishedContent
          ? await transformPublishedContent(ctx, ctx.resource, content)
          : content;
        // The draft version this publish is taken from, written on both the insert and the conflict update: a
        // Row left carrying the column's default reports a draft that has moved since it was published,
        // Whatever the owner has or has not edited since
        const { contentVersion: publishedContentVersion } = ctx.resource;
        // The object and the claim naming it are written under the lease, so a collection cannot free the object between them
        const published = await withResourceObjectLock(ctx.db, id, async () => {
          // The content is stored before anything is claimed, so a failed store claims nothing and the publication never names
          // A version that was never stored (openspec/specs/resource/resource-version-store/design.md)
          const prepared = await prepareSnapshotVersion(
            ctx.db,
            ctx.resource,
            SnapshotChannel.Published,
            JSON.stringify(publishedContent),
          );
          // The claim and the version it names are one batch. The version reads the publication counter the claim has just
          // Bumped, so the row and the publication cannot disagree — and a claim that fails takes the version rows with it. A
          // Version's number is claimed fresh here, so no row of the channel holds it yet and no replaced object is released
          const publishVersion = sql<number>`(SELECT ${resourcePublicationsInResource.publishVersion} FROM ${resourcePublicationsInResource} WHERE ${resourcePublicationsInResource.resourceId} = ${id})`;
          const [publicationRows] = await ctx.db.batch([
            ctx.db
              .insert(resourcePublicationsInResource)
              .values({ publishedContentVersion, resourceId: id })
              .onConflictDoUpdate({
                set: {
                  publishedAt: new Date(),
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
          ]);
          return { prepared, publicationRows };
        });
        const { prepared } = published;
        const publication = requireMutation(
          published.publicationRows[0],
          Operation.Update,
          DatabaseEntityType.ResourcePublication,
          id,
        );
        // A version is stored bytes the owner keeps, charged for what its object cost. After the batch, never inside: the
        // Charge locks the ledger row and then the user's, and a batch held open across that waits on locks it is itself holding.
        // See openspec/specs/resource/storage-quotas/design.md
        await chargeSnapshotVersion(ctx.db, ctx.resource, prepared.writtenVersion);
        // Best-effort: a failed write loses one trail entry, never the publish.
        getSynchronizedFunction(writeResourceActivity)(ctx, {
          activityType: ResourceActivityType.Published,
          publishVersion: publication.publishVersion,
          resourceId: id,
        });
        await publishResourceOperation(ctx.getSessionPayload, {
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
        const resource = await requireEntity(
          ctx.db.query.resourcesInResource.findFirst({
            where: { id: { eq: input }, type: { eq: type } },
            with: { publication: true },
          }),
          DatabaseEntityType.Resource,
          input,
        );
        if (!resource.publication) throw getNotFoundError(DatabaseEntityType.ResourcePublication, input);

        const content = await readPublishedContent(ctx.db, resource, resource.publication.publishVersion);
        // Counted after the read is guaranteed to succeed, so a 404 never lands in the buckets.
        // Best-effort: a failed increment loses one view, never the page.
        getSynchronizedFunction(incrementResourceViewCount)(ctx.db, input);
        return { content, name: resource.name };
      }),
    // An owner-only read of a retained snapshot, backing the view route's `version` query param. Anonymous
    // Visitors never reach this — the public read above always serves the latest publish
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
    unpublishResource: getOwnerProcedure(type, resourceIdInputSchema, "id").mutation<ResourceInResource>(
      async ({ ctx }) => {
        const { id } = ctx.resource;
        // The publication row and the published channel's versions go in one batch, and the versions are selected only while
        // The publication exists, so a publish landing between them cannot have its new version deleted by this unpublish
        // While its publication row survives
        const [referenceRows, unpublishedVersions, deletedPublications] = await ctx.db.batch([
          ...getSnapshotVersionDeletes(
            ctx.db,
            and(
              eq(resourceVersionsInResource.resourceId, id),
              eq(resourceVersionsInResource.channel, SnapshotChannel.Published),
              exists(
                ctx.db
                  .select({ one: sql`1` })
                  .from(resourcePublicationsInResource)
                  .where(eq(resourcePublicationsInResource.resourceId, id)),
              ),
            ),
          ),
          ctx.db
            .delete(resourcePublicationsInResource)
            .where(eq(resourcePublicationsInResource.resourceId, id))
            .returning(),
        ]);
        // Only when a row was actually removed: an unpublish that deletes nothing was never publishing anything, so every
        // Effect below it is a phantom, and an activity entry or a push to the owner's other devices would report a state
        // Change that never happened
        if (deletedPublications.length === 0) return ctx.resource;
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
        await publishResourceOperation(ctx.getSessionPayload, {
          path: RoutePath.Resource(id),
          title: ResourceOperationTitleMap[ResourceOperationType.Unpublished](ctx.resource.name),
        });
        return ctx.resource;
      },
    ),
  };
  return {
    ...baseProcedures,
    ...(checkHasCapability(type, "fileAssets") ? fileAssetsProcedures : {}),
    ...(checkHasCapability(type, "publishable") ? publishProcedures : {}),
  } as (TType extends FileAssetsResourceType ? typeof fileAssetsProcedures : unknown) &
    (TType extends PublishableResourceType ? typeof publishProcedures : unknown) &
    typeof baseProcedures;
};
