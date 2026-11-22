import type { PublishableResourceProcedureOptions } from "#server/models/resource/PublishableResourceProcedureOptions";
import type { Context } from "#server/trpc/context";
import type { FileAssetsResourceType } from "#shared/models/resource/FileAssetsResourceType";
import type { PublishableResourceType } from "#shared/models/resource/PublishableResourceType";
import type { PublishedResourceContent } from "#shared/models/resource/PublishedResourceContent";
import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { ResourceFile } from "#shared/models/resource/ResourceFile";
import type { ResourceFilePresignedUrlEntity } from "#shared/models/resource/ResourceFilePresignedUrlEntity";
import type { ResourceListPage } from "#shared/models/resource/ResourceListPage";
import type { ResourceInResource, ResourcePublicationInResource, ResourceType } from "@esposter/db-schema";

import { epochMsSql } from "#server/services/db/epochMsSql";
import { publishResourceOperation } from "#server/services/notification/publishResourceOperation";
import { RESOURCE_ASSET_PRESIGNED_URL_DURATION_MS } from "#server/services/resource/constants";
import { createResourceRow } from "#server/services/resource/createResourceRow";
import { deleteStagingContentBlob } from "#server/services/resource/deleteStagingContentBlob";
import { findOwnedResource } from "#server/services/resource/findOwnedResource";
import { generateReservedResourceAssetPresignedUrlEntities } from "#server/services/resource/generateReservedResourceAssetPresignedUrlEntities";
import { getOwnedLiveResourceWhere } from "#server/services/resource/getOwnedLiveResourceWhere";
import { getResourcesWhere } from "#server/services/resource/getResourcesWhere";
import { getStagingContentBlobName } from "#server/services/resource/getStagingContentBlobName";
import { incrementResourceViewCount } from "#server/services/resource/incrementResourceViewCount";
import { readResourceContent } from "#server/services/resource/readResourceContent";
import { readResourceContentDelta } from "#server/services/resource/readResourceContentDelta";
import { readResourceFiles } from "#server/services/resource/readResourceFiles";
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
import { generateReservedWritePresignedUrl } from "#server/services/storage/generateReservedWritePresignedUrl";
import { getBucket } from "#server/services/storage/getBucket";
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
import { generateUploadContentPresignedUrlInputSchema } from "#shared/models/db/resource/GenerateUploadContentPresignedUrlInput";
import { generateUploadFilePresignedUrlEntitiesInputSchema } from "#shared/models/db/resource/GenerateUploadFilePresignedUrlEntitiesInput";
import { readPublishedVersionContentInputSchema } from "#shared/models/db/resource/ReadPublishedVersionContentInput";
import { readResourcesInputSchema } from "#shared/models/db/resource/ReadResourcesInput";
import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { saveResourceContentDeltaInputSchema } from "#shared/models/db/resource/SaveResourceContentDeltaInput";
import { createSaveResourceContentInputSchema } from "#shared/models/db/resource/SaveResourceContentInput";
import { saveStagedResourceContentInputSchema } from "#shared/models/db/resource/SaveStagedResourceContentInput";
import { updateResourceInputSchema } from "#shared/models/db/resource/UpdateResourceInput";
import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { ResourceSortName } from "#shared/models/resource/ResourceSortName";
import { ResourceOperationTitleMap } from "#shared/services/notification/ResourceOperationTitleMap";
import { checkHasCapability } from "#shared/services/resource/checkHasCapability";
import { ResourceContentSchemaMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceFileMimeTypeMap } from "#shared/services/resource/ResourceFileMimeTypeMap";
import { ResourceSortNamePageSortMap } from "#shared/services/resource/ResourceSortNamePageSortMap";
import { createPresignedGetUrl, getContentBlobName, getLivePublicationWhere, readResourceListPage } from "@esposter/db";
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
import { and, eq, exists, sql } from "drizzle-orm";

// The procedure names each group adds, exported for the router tests to read rather than restate. Each group's object is
// Typed to exactly its names, so a procedure added to or dropped from one side fails the build, not the test. The base
// Group rides on every resource router, since every type stores content and is renamable and deletable
export const BASE_PROCEDURE_NAMES = [
  "createResource",
  "deleteResource",
  "generateReadContentPresignedUrl",
  "generateUploadContentPresignedUrl",
  "readResourceContent",
  "readResources",
  "saveResourceContent",
  "saveResourceContentDelta",
  "saveStagedResourceContent",
  "updateResource",
] as const;
export const FILE_PROCEDURE_NAMES = [
  "deleteFile",
  "generateUploadFilePresignedUrlEntities",
  "readResourceFiles",
] as const;
export const PUBLISH_PROCEDURE_NAMES = [
  "publishResource",
  "readPublishedResourceContent",
  "readPublishedVersionContent",
  "readResourcePublication",
  "readResourceViewCount",
  "unpublishResource",
] as const;

// The procedures of one resource type, each group built from that type's own content schema, so their content, input
// And read types are the type's rather than the union of every type's
const createProcedureGroups = <TType extends ResourceType>(
  type: TType,
  options?: PublishableResourceProcedureOptions<ResourceContent<TType>>,
) => {
  const { contentSchema } = ResourceContentSchemaMap[type];
  const transformPublishedContent = options?.transformPublishedContent;
  // The input side is the accessor's declared input rather than zod's default, since defaulting it to unknown would erase
  // The procedure's input type for consumers like achievement condition paths
  const saveResourceContentInputSchema = createSaveResourceContentInputSchema(contentSchema);
  const readContent = (id: ResourceInResource["id"]): Promise<ResourceContent<TType> | undefined> =>
    readResourceContent(contentSchema, id);
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
  const baseProcedures = {
    createResource: standardAuthedProcedure
      .input(createResourceInputSchema)
      .mutation<ResourceInResource>(({ ctx, input }) => createResourceRow(ctx, { ...input, type })),
    // The blobs and the type's table partitions survive until purge — destroying them here would
    // Make restore hand back an empty resource
    deleteResource: getOwnerProcedure(type, resourceIdInputSchema, "id").mutation<ResourceInResource>(
      async ({ ctx, input: { id } }) => {
        const deletedResource = requireMutation(
          (await softDeleteResources(ctx.db, getOwnedLiveResourceWhere(ctx.user.id, id)))[0],
          Operation.Delete,
          DatabaseEntityType.Resource,
          id,
        );
        await publishResourceOperation(ctx, {
          path: RoutePath.ResourceExplorerRecycleBin,
          title: ResourceOperationTitleMap[ResourceOperationType.Deleted](deletedResource.name, 1),
        });
        return deletedResource;
      },
    ),
    // A document larger than one request body is read straight from R2, so the server signs the read
    // And never holds the bytes. Used the moment it is issued, so it lives minutes rather than the attachment default
    generateReadContentPresignedUrl: getOwnerProcedure(type, resourceIdInputSchema, "id")
      .meta({ staticReason: "The presigned address the content is read through, which names no state a reader shows" })
      .query<string>(({ input: { id } }) => {
        const contentBlobName = getContentBlobName(id);
        return createPresignedGetUrl(getStorageCredentials(), StorageBucket.ResourceAssets, contentBlobName, {
          expiresInMs: RESOURCE_ASSET_PRESIGNED_URL_DURATION_MS,
        });
      }),
    // The write target of a staged save, held against the owner's quota for the gzip's size like any upload
    generateUploadContentPresignedUrl: getOwnerProcedure(type, generateUploadContentPresignedUrlInputSchema, "id")
      .meta({ staticReason: "The write target of a staged save, which no reader shows until the save lands" })
      .query<string>(({ ctx, input: { id, size } }) =>
        generateReservedWritePresignedUrl(
          ctx.db,
          ctx.user.id,
          StorageBucket.ResourceAssets,
          getStagingContentBlobName(id),
          size,
        ),
      ),
    // Every content write funnels through saveResourceContent, so this one stream keeps every other device's
    readResourceContent: getOwnerProcedure(type, resourceIdInputSchema, "id").query<ResourceContent<TType> | undefined>(
      ({ input: { id } }) => readContent(id),
    ),
    // The type's own listing, which a picker reads a page at a time. Soft-deleted resources belong to the Recycle bin
    readResources: standardAuthedProcedure
      .input(readResourcesInputSchema)
      .query<ResourceListPage>(({ ctx, input: { cursor, isPublished, limit } }) =>
        readResourceListPage(ctx.db, {
          cursor,
          limit,
          sort: ResourceSortNamePageSortMap[ResourceSortName.UpdatedAtDesc],
          userId: ctx.user.id,
          where: getResourcesWhere(ctx.db, ctx.user.id, { isPublished, types: [type] }),
        }),
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
    // A document too large for one request body is uploaded straight to R2 first and committed here by
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
  } satisfies Record<(typeof BASE_PROCEDURE_NAMES)[number], unknown>;
  // Binary assets live under {id}/files/{hash} — the owner uploads through short-lived presigned urls and reads resolve
  // Through the /api/resource-assets endpoint (content embeds only stable urls, never a signature). An asset is never
  // Deleted here: the file's hash is handed to the release path, which deletes it only once no stored version names it
  const fileAssetsProcedures = {
    // Deleting a file publishes the resource's topics, as does the save that writes an uploaded file's address, so an open
    // Listing of the files reads the set again
    deleteFile: getOwnerProcedure(type, deleteFileInputSchema, "id").mutation<void>(
      async ({ ctx, input: { blobPath, id } }) => {
        // The path is the file's hash (ASSET_HASH_REGEX), so the release sees exactly the address that was removed
        await releaseResourceAssets(ctx.db, id, [blobPath]);
      },
    ),
    generateUploadFilePresignedUrlEntities: getOwnerProcedure(
      type,
      generateUploadFilePresignedUrlEntitiesInputSchema,
      "id",
    )
      .meta({ staticReason: "The upload addresses of a file, which no reader shows until the file is saved" })
      .query<ResourceFilePresignedUrlEntity[]>(({ ctx, input: { files, id } }) => {
        // A file the type's picker does not offer is refused before a write url is signed for it
        const acceptedMimeTypes: readonly string[] = ResourceFileMimeTypeMap[type];
        const refusedFile = files.find(({ mimetype }) => !acceptedMimeTypes.includes(mimetype));
        if (refusedFile)
          throw getInvalidOperationError(Operation.Read, type, JSON.stringify({ mimetype: refusedFile.mimetype }));

        return generateReservedResourceAssetPresignedUrlEntities(ctx.db, ctx.user.id, id, files);
      }),
    readResourceFiles: getOwnerProcedure(type, resourceIdInputSchema, "id").query<ResourceFile[]>(({ input: { id } }) =>
      readResourceFiles(getBucket(StorageBucket.ResourceAssets), id),
    ),
  } satisfies Record<(typeof FILE_PROCEDURE_NAMES)[number], unknown>;
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
        const now = Date.now();
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
          const [publicationRows] = await getResultAsync(() =>
            ctx.db.batch([
              // Selected from the owner's live row, so a publish that lands after a delete inserts no publication: its version
              // Names a publication that is not there, so the batch fails whole and nothing is left publicly served
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
                // A republish after an unpublish revives the tombstone, so the row keeps its count and its version climbs
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
              // The batch commits whole or not at all, so a failure claimed nothing. A resource binned after the owner guard
              // Fails the version's NOT NULL, so it answers the 404 that a read of a binned resource gives
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
        // A binned resource is no longer served, whatever publication row it still holds
        const resource = await requireEntity(
          ctx.db.query.resourcesInResource.findFirst({
            where: { deletedAt: { isNull: true }, id: { eq: input }, type: { eq: type } },
          }),
          DatabaseEntityType.Resource,
          input,
        );
        const [publication] = await ctx.db
          .select()
          .from(resourcePublicationsInResource)
          .where(getLivePublicationWhere(eq(resourcePublicationsInResource.resourceId, input)))
          .limit(1);
        if (!publication) throw getNotFoundError(DatabaseEntityType.ResourcePublication, input);

        const content = await readPublishedContent(ctx.db, resource, publication.publishVersion);
        // Counted after the read is guaranteed to succeed, so a 404 never lands in the buckets. Awaited, so the write is recorded
        // And published before the read returns; a failed increment still loses only one view, never the page.
        await incrementResourceViewCount(ctx.db, input);
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
    unpublishResource: getOwnerProcedure(type, resourceIdInputSchema, "id").mutation<
      ResourcePublicationInResource | undefined
    >(async ({ ctx }) => {
      const { id } = ctx.resource;
      // The publication's tombstone and the published channel's versions go in one batch, and the versions are selected only
      // While the publication is live, so a publish landing between them cannot have its new version deleted by this unpublish
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
      // Only when a row was actually tombstoned: an unpublish that changes nothing was never publishing anything, so every
      // Effect below it is a phantom, and an activity entry or a push to the owner's other devices would report a state
      // Change that never happened. The answer is the row as it stands, so a client holding a live copy takes the removal
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
  } satisfies Record<(typeof PUBLISH_PROCEDURE_NAMES)[number], unknown>;
  return { baseProcedures, fileAssetsProcedures, publishProcedures };
};
type ProcedureGroups<TType extends ResourceType> = ReturnType<typeof createProcedureGroups<TType>>;
// The base group rides on every type, and each capability group rides only on the types that declare its capability
type ResourceProcedures<TType extends ResourceType> = ProcedureGroups<TType>["baseProcedures"] &
  (TType extends FileAssetsResourceType ? ProcedureGroups<TType>["fileAssetsProcedures"] : unknown) &
  (TType extends PublishableResourceType ? ProcedureGroups<TType>["publishProcedures"] : unknown);

// The publish hooks are keyed by the type: a publishable type takes its options, and every other type takes none. The
// Check is not distributive, so the options stay this type's own rather than the union of every publishable type's
export const createResourceProcedures = <TType extends ResourceType>(
  type: TType,
  options?: [TType] extends [PublishableResourceType]
    ? PublishableResourceProcedureOptions<ResourceContent<TType>>
    : never,
): ResourceProcedures<TType> => {
  const { baseProcedures, fileAssetsProcedures, publishProcedures } = createProcedureGroups(type, options);
  // The groups are gated on the same runtime checks the conditional states at the type level, which is why the object is
  // Right for every type, and why the cast is the one the compiler leaves: TS2322 refuses a concrete object as a value of
  // `ResourceProcedures<TType>`, a conditional over the generic `TType`
  const procedures = {
    ...baseProcedures,
    ...(checkHasCapability(type, "fileAssets") ? fileAssetsProcedures : {}),
    ...(checkHasCapability(type, "publishable") ? publishProcedures : {}),
  };
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- a conditional over the generic TType, which no concrete object is assignable to (TS2322); each group is gated on checkHasCapability above
  return procedures as ResourceProcedures<TType>;
};
