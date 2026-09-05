import type { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import type { FileAssetsResourceType } from "#shared/models/resource/FileAssetsResourceType";
import type { PublishableResourceType } from "#shared/models/resource/PublishableResourceType";
import type { PublishedResourceContent } from "#shared/models/resource/PublishedResourceContent";
import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { ResourceWithPublication } from "#shared/models/resource/ResourceWithPublication";
import type { PublishableResourceProcedureOptions } from "@@/server/models/resource/PublishableResourceProcedureOptions";
import type { FileSasEntity, Resource, ResourcePublication, ResourceType } from "@esposter/db-schema";

import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { ResourceOperationTitleMap } from "#shared/services/notification/ResourceOperationTitleMap";
import { staleContentVersionErrorMessage } from "#shared/services/resource/constants";
import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { hasCapability } from "#shared/services/resource/hasCapability";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { MAX_UNRECONCILED_STORAGE_LEDGER_ENTRIES } from "#shared/services/storage/constants";
import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { checkIsSameDevice } from "@@/server/services/auth/checkIsSameDevice";
import { publishBlobDeletion } from "@@/server/services/azure/eventGrid/publishBlobDeletion";
import { publishBlobPrefixDeletion } from "@@/server/services/azure/eventGrid/publishBlobPrefixDeletion";
import { on } from "@@/server/services/events/on";
import { publishResourceOperation } from "@@/server/services/notification/publishResourceOperation";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { createResourceRow } from "@@/server/services/resource/createResourceRow";
import { resourceEventEmitter } from "@@/server/services/resource/events/resourceEventEmitter";
import { incrementResourceViewCount } from "@@/server/services/resource/incrementResourceViewCount";
import { readContentBlob } from "@@/server/services/resource/readContentBlob";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { readResourceViewCount } from "@@/server/services/resource/readResourceViewCount";
import { reapplyLiveResourceContent } from "@@/server/services/resource/reapplyLiveResourceContent";
import { saveResourceContent } from "@@/server/services/resource/saveResourceContent";
import { getSnapshotContentBlobName } from "@@/server/services/resource/snapshot/getSnapshotContentBlobName";
import { getSnapshotMetadata } from "@@/server/services/resource/snapshot/getSnapshotMetadata";
import { getSnapshotSummary } from "@@/server/services/resource/snapshot/getSnapshotSummary";
import { softDeleteResources } from "@@/server/services/resource/softDeleteResources";
import { writeResourceActivity } from "@@/server/services/resource/writeResourceActivity";
import { chargeAndEmitStorageLedgerEntry } from "@@/server/services/storage/chargeAndEmitStorageLedgerEntry";
import { generateReservedUploadFileSasEntities } from "@@/server/services/storage/generateReservedUploadFileSasEntities";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { getNotFoundError } from "@@/server/trpc/guards/getNotFoundError";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { getOwnerProcedure } from "@@/server/trpc/procedure/resource/getOwnerProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import {
  AzureContainer,
  BLOB_SEGMENT_MAX_LENGTH,
  BLOB_SEGMENT_REGEX,
  DatabaseEntityType,
  fileEntitySchema,
  ResourceActivityType,
  resourcePublications,
  resources,
  selectResourceSchema,
} from "@esposter/db-schema";
import { createUniqueArraySchema, getResultAsync, noop, Operation, RoutePath } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

const readResourcesInputSchema = createOffsetPaginationParamsSchema(selectResourceSchema.keyof()).prefault({});

const createResourceInputSchema = selectResourceSchema.pick({ name: true });
// Tags replace the whole record rather than merging, which is Azure's own tag update semantics.
// Both editable fields are optional so a caller writes only the field it owns: a rename and a tag edit are
// Independent writes to one row, and a tag edit that had to restate the name would put the pre-rename name
// Back whenever the two overlap
const updateResourceInputSchema = refineAtLeastOne(
  z.object({
    ...selectResourceSchema.pick({ id: true }).shape,
    ...selectResourceSchema.pick({ name: true, tags: true }).partial().shape,
  }),
  ["name", "tags"],
);

const resourceIdInputSchema = selectResourceSchema.pick({ id: true });

const generateUploadFileSasEntitiesInputSchema = z.object({
  // `size` is what the storage quota reserves against, so it is bounded at the input boundary rather than
  // Trusted: a negative or non-finite declaration would decrement the counter and bypass the quota entirely.
  // It is the client's own claim — an Azure write SAS carries no length constraint — so `BlobCreated` is what
  // Replaces it with the stored object's real size. The array is bounded by the in-flight hold cap rather than
  // The generic read limit: a batch above the cap can never pass the reserve however long the client waits.
  // See /docs/platform/storage-quotas
  files: createUniqueArraySchema(
    z.object({
      ...fileEntitySchema.pick({ filename: true, mimetype: true }).shape,
      size: fileEntitySchema.shape.size.max(MAX_FILE_REQUEST_SIZE),
    }),
    "filename",
  )
    .min(1)
    .max(MAX_UNRECONCILED_STORAGE_LEDGER_ENTRIES),
  id: selectResourceSchema.shape.id,
});

const deleteFileInputSchema = z.object({
  // The client recovers this from the stable asset url, so it is always the single `{id}|{filename}` segment
  // `getBlobName` emits — a separator or a `..` could only ever be an attempt to climb out of {id}/files/
  blobPath: z.string().min(1).max(BLOB_SEGMENT_MAX_LENGTH).regex(BLOB_SEGMENT_REGEX),
  id: selectResourceSchema.shape.id,
});

const readPublishedVersionContentInputSchema = z.object({
  ...resourceIdInputSchema.shape,
  version: z.int().positive(),
});

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
  // Annotated so the generic content schema resolves to a concrete type for destructuring.
  // Both the output and input sides are declared — leaving the input side defaulted to unknown
  // Would erase the procedure's input type for consumers like achievement condition paths.
  const saveResourceContentInputSchema = z.object({
    content: contentSchema,
    contentVersion: selectResourceSchema.shape.contentVersion,
    id: selectResourceSchema.shape.id,
  }) as unknown as z.ZodType<
    { content: ResourceContent<TType>; contentVersion: Resource["contentVersion"]; id: Resource["id"] },
    {
      content: z.input<(typeof ResourceDefinitionMap)[TType]["contentSchema"]>;
      contentVersion: Resource["contentVersion"];
      id: Resource["id"];
    }
  >;
  const readContent = async (id: Resource["id"]): Promise<ResourceContent<TType> | undefined> =>
    (await readResourceContent(contentSchema, id)) as ResourceContent<TType> | undefined;
  // Reads through `readContentBlob` because `BlobClient.download()` rejects on a missing blob rather than
  // Returning an empty body: a snapshot the unpublish prefix sweep removed between the listing and the click
  // Must reach the visitor as the 404 page, not as an internal error. The generic contentSchema parses to the
  // Union of all content types, which the concrete caller's TType pins back down to its own content shape
  const readPublishedContent = async (
    resource: Resource,
    publishVersion: ResourcePublication["publishVersion"],
  ): Promise<ResourceContent<TType>> => {
    const content = (await readContentBlob(
      contentSchema,
      getSnapshotContentBlobName(resource.id, SnapshotChannel.Published, publishVersion),
    )) as ResourceContent<TType> | undefined;
    if (content === undefined) throw getNotFoundError(DatabaseEntityType.Resource, resource.id);
    // Reconstitution, not a plain read: a snapshot's frozen copy of what the type declares live is replaced
    // Here, so the public read and the owner's version preview answer the same content — and so does the
    // Restore, which reconstitutes through the same declaration
    return (await reapplyLiveResourceContent(resource, content)) as ResourceContent<TType>;
  };
  const baseProcedures = {
    createResource: standardAuthedProcedure
      .input(createResourceInputSchema)
      .mutation<Resource>(({ ctx, input }) => createResourceRow(ctx, { ...input, type })),
    // The blobs and the type's table partitions survive until purge — destroying them here would
    // Make restore hand back an empty resource
    deleteResource: getOwnerProcedure(type, resourceIdInputSchema, "id").mutation<Resource>(
      async ({ ctx, input: { id } }) => {
        const deletedResource = requireMutation(
          (await softDeleteResources(ctx.db, eq(resources.id, id)))[0],
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
    // Every content write funnels through saveResourceContent, so this one stream keeps every other device's
    // View of this resource live
    onSaveResourceContent: getOwnerProcedure(type, resourceIdInputSchema, "id").subscription(async function* ({
      ctx,
      input: { id },
      signal,
    }): AsyncGenerator<{
      content: ResourceContent<TType>;
      contentVersion: Resource["contentVersion"];
      id: Resource["id"];
    }> {
      for await (const [[data, device]] of on(resourceEventEmitter, "saveResourceContent", { signal }))
        if (data.id === id && !checkIsSameDevice(device, ctx.getSessionPayload))
          yield { ...data, content: data.content as ResourceContent<TType> };
    }),
    readResourceContent: getOwnerProcedure(type, resourceIdInputSchema, "id").query<ResourceContent<TType> | undefined>(
      ({ input: { id } }) => readContent(id),
    ),
    readResources: standardAuthedProcedure
      .input(readResourcesInputSchema)
      .query<OffsetPaginationData<ResourceWithPublication>>(async ({ ctx, input: { limit, offset, sortBy } }) => {
        const resultResources = await ctx.db.query.resources.findMany({
          limit: limit + 1,
          offset,
          orderBy: (resource, { desc }) =>
            sortBy.length > 0 ? parseSortByToSql(resource, sortBy) : desc(resource.updatedAt),
          where: {
            // Soft-deleted resources belong to the Recycle bin, never to a type's own listing
            deletedAt: {
              isNull: true,
            },
            type: {
              eq: type,
            },
            userId: {
              eq: ctx.getSessionPayload.user.id,
            },
          },
          with: { publication: true },
        });
        return getOffsetPaginationData(resultResources, limit);
      }),
    saveResourceContent: getOwnerProcedure(type, saveResourceContentInputSchema, "id").mutation<Resource>(
      ({ ctx, input: { content, contentVersion, id } }) =>
        saveResourceContent(ctx, {
          activityType: ResourceActivityType.ContentSaved,
          content,
          resource: ctx.resource,
          updateContentVersion: async (tx) => {
            // The version check is part of the UPDATE so concurrent saves cannot both pass and silently lose one write
            const savedResource = (
              await tx
                .update(resources)
                .set({ contentVersion: contentVersion + 1 })
                .where(and(eq(resources.id, id), eq(resources.contentVersion, contentVersion)))
                .returning()
            )[0];
            if (!savedResource) throw new TRPCError({ code: "BAD_REQUEST", message: staleContentVersionErrorMessage });

            return savedResource;
          },
        }),
    ),
    updateResource: getOwnerProcedure(type, updateResourceInputSchema, "id").mutation<Resource>(
      async ({ ctx, input: { id, ...rest } }) => {
        const oldName = ctx.resource.name;
        const updatedResource = requireMutation(
          (await ctx.db.update(resources).set(rest).where(eq(resources.id, id)).returning())[0],
          Operation.Update,
          DatabaseEntityType.Resource,
          id,
        );
        // A tags-only edit is not a rename, so it leaves no Renamed entry.
        // Best-effort: a failed write loses one trail entry, never the rename.
        if (updatedResource.name !== oldName)
          getSynchronizedFunction(writeResourceActivity)({
            activityType: ResourceActivityType.Renamed,
            newName: updatedResource.name,
            oldName,
            resourceId: id,
            userId: ctx.getSessionPayload.user.id,
          });
        return updatedResource;
      },
    ),
  };
  // Binary assets live under {id}/files/… — the owner uploads through short-lived SAS urls and reads resolve
  // Through the /api/resource-assets endpoint (content embeds only stable urls, never a signature). Teardown comes
  // At purge, not at delete: a delete only stamps deletedAt, so every asset survives the Recycle bin window and a
  // Restore hands back a whole resource, and purgeResource is what takes the {id}/ directory wholesale
  const fileAssetsProcedures = {
    deleteFile: getOwnerProcedure(type, deleteFileInputSchema, "id").mutation<void>(
      async ({ input: { blobPath, id } }) => {
        // The path is a single separator-free segment (BLOB_SEGMENT_REGEX) anchored under {id}/files/, so this can
        // Only ever delete uploaded assets, never the content or published-content blobs beside the files directory
        await publishBlobDeletion(id, AzureContainer.ResourceAssets, [`${getFilesDirectoryName(id)}/${blobPath}`]);
      },
    ),
    generateUploadFileSasEntities: getOwnerProcedure(type, generateUploadFileSasEntitiesInputSchema, "id").query<
      FileSasEntity[]
    >(({ ctx, input: { files, id } }) =>
      generateReservedUploadFileSasEntities(
        ctx.db,
        ctx.getSessionPayload.user.id,
        AzureContainer.ResourceAssets,
        files,
        getFilesDirectoryName(id),
      ),
    ),
  };
  const publishProcedures = {
    publishResource: getOwnerProcedure(type, resourceIdInputSchema, "id").mutation<ResourcePublication>(
      async ({ ctx, input: { id } }) => {
        const content = await readContent(id);
        if (content === undefined)
          throw getInvalidOperationError(
            Operation.Update,
            DatabaseEntityType.Resource,
            "cannot publish resource without content",
          );
        // Read before the assets are cloned, so the claim below can be compared against it. A sweep of this
        // Resource's published prefix only ever follows a publication row delete, and that delete resets the
        // Version sequence — so a claim that is not the successor of what this attempt read is proof one landed
        const previousPublication = await ctx.db.query.resourcePublications.findFirst({
          where: { resourceId: { eq: id } },
        });
        // Transformed before the transaction opens: a hook may read through `ctx.db` (Dashboard resolves every
        // Bound dataset), and issuing that read while this connection holds a transaction deadlocks. Nothing it
        // Writes is keyed by the version claimed below — see createSnapshotAssetsDirectoryName
        const publishedContent = transformPublishedContent
          ? await transformPublishedContent(ctx, ctx.resource, content)
          : content;
        // The snapshot's own size, recorded rather than returned: the repair below rewrites the same blob at
        // The same version, and the charge after the transaction must carry whichever write was last
        let publishedContentBytes = 0;
        const uploadPublishedContent = async (
          publishVersion: ResourcePublication["publishVersion"],
          value: unknown,
        ) => {
          const serializedContent = JSON.stringify(value);
          await useUpload(
            AzureContainer.ResourceAssets,
            getSnapshotContentBlobName(id, SnapshotChannel.Published, publishVersion),
            serializedContent,
            // No reason: a published row's reason is that it was published, which its channel already says.
            // The summary is what makes it choosable beside the revisions it shares one timeline with
            getSnapshotMetadata({ summary: getSnapshotSummary(ctx.resource.type, serializedContent) }),
          );
          publishedContentBytes = Buffer.byteLength(serializedContent);
        };
        // The draft version this publish is taken from, written on both the insert and the conflict update: a
        // Row left carrying the column's default reports a draft that has moved since it was published,
        // Whatever the owner has or has not edited since
        const { contentVersion: publishedContentVersion } = ctx.resource;
        // Bump the version and write the blob in one transaction so a failed upload rolls the version bump back,
        // The publication row can never point at a publishVersion whose blob was never written.
        const publication = await ctx.db.transaction(async (tx) => {
          // The version bump is done in SQL so concurrent publishes each claim a distinct publish blob;
          // The publication row exists only while the resource is published (the Publishable capability's state)
          const newPublication = requireMutation(
            (
              await tx
                .insert(resourcePublications)
                .values({ publishedContentVersion, resourceId: id })
                .onConflictDoUpdate({
                  set: {
                    publishedAt: new Date(),
                    publishedContentVersion,
                    publishVersion: sql`${resourcePublications.publishVersion} + 1`,
                  },
                  target: resourcePublications.resourceId,
                })
                .returning()
            )[0],
            Operation.Update,
            DatabaseEntityType.ResourcePublication,
            id,
          );
          await uploadPublishedContent(newPublication.publishVersion, publishedContent);
          return newPublication;
        });
        // An unpublish that landed between the clone and this claim swept the assets it had just written, while
        // The content blob — written inside the transaction, after that sweep's bound — survived: the resource
        // Would report itself published and render every image broken, with no operation left that rebuilds
        // Them. Re-cloning now writes past the bound, and the version is already claimed, so the repair is the
        // Transform and the upload again rather than another publish. A concurrent publish trips this too and
        // Pays one redundant clone; a swept snapshot cannot slip through, because a delete restarts the
        // Sequence at 1 and any successor this attempt could expect is at least 2. An attempt that read no row
        // Expects to claim 1, so the successor is computed from the read rather than off the row alone, which
        // Would exempt every first publish (and every publish after an unpublish) from the check entirely.
        //
        // Outside the transaction on purpose, and it cannot move in — the transform deadlocks against one this
        // Same connection holds, as above. So the publication has already landed by the time the repair runs, and
        // The transaction's guarantee is unaffected: the version it claimed does point at a blob that was
        // Written. What a failed repair leaves behind is that blob still naming the swept assets, i.e. a live
        // Publication whose images 404 — so the rejection is reported rather than swallowed, because a silent
        // Success would leave the page broken with nothing to signal it. See /docs/architecture/publishing
        if (publication.publishVersion !== (previousPublication?.publishVersion ?? 0) + 1)
          await getResultAsync(async () =>
            uploadPublishedContent(
              publication.publishVersion,
              transformPublishedContent ? await transformPublishedContent(ctx, ctx.resource, content) : content,
            ),
          ).match(noop, (error) => {
            console.error(error);
            // Which of them tripped the check is not knowable from here, so the cause is carried rather than
            // Asserted: a sweep by a concurrent unpublish, the redundant re-clone a concurrent publish pays, and
            // A transform that rejects outright (a dataset deleted since the first pass) all arrive identically.
            // Naming one of them tells an owner their assets were swept when nothing was. A TRPCError already
            // States what happened in the code the client branches on, so it is rethrown as it is
            if (error instanceof TRPCError) throw error;

            throw getInvalidOperationError(
              Operation.Update,
              DatabaseEntityType.ResourcePublication,
              `published at version ${publication.publishVersion}, but its assets could not be re-cloned (${error.message}) — publish again to rebuild them`,
              "INTERNAL_SERVER_ERROR",
            );
          });
        // A snapshot is stored bytes the owner keeps, so it is charged like the working copy it was taken from —
        // Its cloned assets charge themselves as each copy lands. After the transaction, never inside: the
        // Charge locks the ledger row and then the user's, and a transaction held open across that waits on
        // Locks it is itself holding. See /docs/platform/storage-quotas
        await chargeAndEmitStorageLedgerEntry(
          ctx.db,
          ctx.getSessionPayload.user.id,
          AzureContainer.ResourceAssets,
          getSnapshotContentBlobName(id, SnapshotChannel.Published, publication.publishVersion),
          publishedContentBytes,
        );
        // Best-effort: a failed write loses one trail entry, never the publish.
        getSynchronizedFunction(writeResourceActivity)({
          activityType: ResourceActivityType.Published,
          publishVersion: publication.publishVersion,
          resourceId: id,
          userId: ctx.getSessionPayload.user.id,
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
      .input(selectResourceSchema.shape.id)
      .query<PublishedResourceContent<TType>>(async ({ ctx, input }) => {
        const resource = await requireEntity(
          ctx.db.query.resources.findFirst({
            where: { id: { eq: input }, type: { eq: type } },
            with: { publication: true },
          }),
          DatabaseEntityType.Resource,
          input,
        );
        if (!resource.publication) throw getNotFoundError(DatabaseEntityType.ResourcePublication, input);

        const content = await readPublishedContent(resource, resource.publication.publishVersion);
        // Counted after the read is guaranteed to succeed, so a 404 never lands in the buckets.
        // Best-effort: a failed increment loses one view, never the page.
        getSynchronizedFunction(incrementResourceViewCount)(input);
        return { content, name: resource.name };
      }),
    // An owner-only read of a retained snapshot, backing the view route's `version` query param. Anonymous
    // Visitors never reach this — the public read above always serves the latest publish
    readPublishedVersionContent: getOwnerProcedure(type, readPublishedVersionContentInputSchema, "id").query<
      PublishedResourceContent<TType>
    >(async ({ ctx, input: { version } }) => ({
      content: await readPublishedContent(ctx.resource, version),
      name: ctx.resource.name,
    })),
    readResourcePublication: getOwnerProcedure(type, resourceIdInputSchema, "id").query<
      ResourcePublication | undefined
    >(({ ctx }) => ctx.db.query.resourcePublications.findFirst({ where: { resourceId: { eq: ctx.resource.id } } })),
    readResourceViewCount: getOwnerProcedure(type, resourceIdInputSchema, "id").query<number>(({ ctx }) =>
      readResourceViewCount(ctx.resource.id),
    ),
    unpublishResource: getOwnerProcedure(type, resourceIdInputSchema, "id").mutation<Resource>(async ({ ctx }) => {
      const { id } = ctx.resource;
      const [deletedPublication] = await ctx.db
        .delete(resourcePublications)
        .where(eq(resourcePublications.resourceId, id))
        .returning();
      // Only when a row was actually removed: an unpublish that deletes nothing was never publishing anything,
      // So every effect below it is a phantom. Sweeping regardless lets a stale tab wipe the assets a concurrent
      // FIRST publish has just cloned — the sweep's bound is stamped after those clones, and a delete that
      // Removed no row leaves the version sequence untouched, so the publish's own successor check cannot see it
      // Either — and an activity entry or a push to the owner's other devices would report a state change that
      // Never happened
      if (!deletedPublication) return ctx.resource;
      // Best-effort after the publications delete, but durable: a lingering blob stays downloadable to anyone
      // Still holding a cached short-lived SAS, and unpublished snapshots must not linger regardless. The
      // Snapshot directory grows with every retained publication, so the handler enumerates it — walking it here
      // Would put an unbounded listing on the unpublish request itself.
      await publishBlobPrefixDeletion(
        id,
        AzureContainer.ResourceAssets,
        `${id}/${SnapshotChannel.Published}`,
        new Date(),
      );
      // Best-effort: a failed write loses one trail entry, never the unpublish.
      getSynchronizedFunction(writeResourceActivity)({
        activityType: ResourceActivityType.Unpublished,
        resourceId: id,
        userId: ctx.getSessionPayload.user.id,
      });
      await publishResourceOperation(ctx.getSessionPayload, {
        path: RoutePath.Resource(id),
        title: ResourceOperationTitleMap[ResourceOperationType.Unpublished](ctx.resource.name),
      });
      return ctx.resource;
    }),
  };
  return {
    ...baseProcedures,
    ...(hasCapability(type, "fileAssets") ? fileAssetsProcedures : {}),
    ...(hasCapability(type, "publishable") ? publishProcedures : {}),
  } as (TType extends FileAssetsResourceType ? typeof fileAssetsProcedures : unknown) &
    (TType extends PublishableResourceType ? typeof publishProcedures : unknown) &
    typeof baseProcedures;
};
