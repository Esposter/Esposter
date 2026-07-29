import type { FileAssetsResourceType } from "#shared/models/resource/FileAssetsResourceType";
import type { PublishableResourceType } from "#shared/models/resource/PublishableResourceType";
import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { PublishableResourceProcedureOptions } from "@@/server/models/resource/PublishableResourceProcedureOptions";
import type { FileSasEntity, Resource, ResourcePublication, ResourceType } from "@esposter/db-schema";

import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { PUBLISHED_DIRECTORY_SEGMENT, staleContentVersionErrorMessage } from "#shared/services/resource/constants";
import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { hasCapability } from "#shared/services/resource/hasCapability";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { getIsSameDevice } from "@@/server/services/auth/getIsSameDevice";
import { publishBlobDeletion } from "@@/server/services/azure/eventGrid/publishBlobDeletion";
import { publishBlobPrefixDeletion } from "@@/server/services/azure/eventGrid/publishBlobPrefixDeletion";
import { on } from "@@/server/services/events/on";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { createResourceRow } from "@@/server/services/resource/createResourceRow";
import { resourceEventEmitter } from "@@/server/services/resource/events/resourceEventEmitter";
import { getContentBlobName } from "@@/server/services/resource/getContentBlobName";
import { getPublishedContentBlobName } from "@@/server/services/resource/getPublishedContentBlobName";
import { incrementResourceViewCount } from "@@/server/services/resource/incrementResourceViewCount";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { readResourceViewCount } from "@@/server/services/resource/readResourceViewCount";
import { ResourceAfterSaveContentMap } from "@@/server/services/resource/ResourceAfterSaveContentMap";
import { runAfterSaveResourceContent } from "@@/server/services/resource/runAfterSaveResourceContent";
import { softDeleteResources } from "@@/server/services/resource/softDeleteResources";
import { writeResourceActivity } from "@@/server/services/resource/writeResourceActivity";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { getOwnerProcedure } from "@@/server/trpc/procedure/resource/getOwnerProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import { generateUploadFileSasEntities } from "@esposter/db";
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
import {
  createUniqueArraySchema,
  getResultAsync,
  InvalidOperationError,
  MAX_READ_LIMIT,
  noop,
  Operation,
  streamToText,
} from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

const readResourcesInputSchema = createOffsetPaginationParamsSchema(selectResourceSchema.keyof()).prefault({});

const createResourceInputSchema = selectResourceSchema.pick({ name: true });
// Tags replace the whole record rather than merging, which is Azure's own tag update semantics
const updateResourceInputSchema = z.object({
  ...selectResourceSchema.pick({ id: true, name: true }).shape,
  ...selectResourceSchema.pick({ tags: true }).partial().shape,
});

const resourceIdInputSchema = selectResourceSchema.pick({ id: true });

const generateUploadFileSasEntitiesInputSchema = z.object({
  files: createUniqueArraySchema(fileEntitySchema.pick({ filename: true, mimetype: true }), "filename")
    .min(1)
    .max(MAX_READ_LIMIT),
  id: selectResourceSchema.shape.id,
});

const deleteFileInputSchema = z.object({
  // The client recovers this from the stable asset url, so it is always the single `{id}|{filename}` segment
  // GetBlobName emits — a separator or a `..` could only ever be an attempt to climb out of {id}/files/
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
  // Args comes from an unresolved-generic conditional tuple, so the hook params collapse to the
  // Intersection of every content type; pin them back to this TType's concrete content shape.
  const { transformPublicReadContent, transformPublishedContent } = (args[0] ??
    {}) as unknown as PublishableResourceProcedureOptions<ResourceContent<TType>>;
  // The after-save hook is registered per type in its own map rather than passed in here, so every path
  // That writes this type's content fires it — this one and blueprint deploy alike
  const afterSaveResourceContent = ResourceAfterSaveContentMap[type];
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
  const baseProcedures = {
    createResource: standardAuthedProcedure
      .input(createResourceInputSchema)
      .mutation<Resource>(({ ctx, input }) => createResourceRow(ctx, { ...input, type })),
    // The blobs and the type's table partitions survive until purge — destroying them here would
    // Make restore hand back an empty resource
    deleteResource: getOwnerProcedure(type, resourceIdInputSchema, "id").mutation<Resource>(
      async ({ ctx, input: { id } }) =>
        requireMutation(
          (await softDeleteResources(ctx.db, eq(resources.id, id)))[0],
          Operation.Delete,
          DatabaseEntityType.Resource,
          id,
        ),
    ),
    // Every content write funnels through saveResourceContent, so one save event stream is all it
    // Takes to keep every other device's view of this resource live
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
        if (data.id === id && !getIsSameDevice(device, ctx.getSessionPayload))
          yield { ...data, content: data.content as ResourceContent<TType> };
    }),
    readResourceContent: getOwnerProcedure(type, resourceIdInputSchema, "id").query(({ input: { id } }) =>
      readContent(id),
    ),
    readResources: standardAuthedProcedure
      .input(readResourcesInputSchema)
      .query(async ({ ctx, input: { limit, offset, sortBy } }) => {
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
          // Publication state rides along so listings can distinguish published resources without n+1 queries
          with: { publication: true },
        });
        return getOffsetPaginationData(resultResources, limit);
      }),
    saveResourceContent: getOwnerProcedure(type, saveResourceContentInputSchema, "id").mutation<Resource>(
      async ({ ctx, input: { content, contentVersion, id } }) => {
        // Read the prior content before the upload overwrites it, so an afterSaveResourceContent hook can
        // Diff against it (undefined on the first save). Only paid when a hook is registered for this type.
        // Best-effort: the hook itself is best-effort, so an unreadable or schema-invalid prior blob
        // Degrades to "no previous content" instead of blocking the save of valid new content
        const previousContent = afterSaveResourceContent
          ? await getResultAsync(() => readContent(id)).match(
              (priorContent) => priorContent,
              () => undefined,
            )
          : undefined;
        // Bump the version and write the blob in one transaction so a failed upload rolls the version back,
        // Keeping Postgres and blob storage consistent instead of stranding the resource at a version with stale content
        const updatedResource = await ctx.db.transaction(async (tx) => {
          // The version check is part of the UPDATE so concurrent saves cannot both pass and silently lose one write
          const savedResource = (
            await tx
              .update(resources)
              .set({ contentVersion: contentVersion + 1 })
              .where(and(eq(resources.id, id), eq(resources.contentVersion, contentVersion)))
              .returning()
          )[0];
          if (!savedResource) throw new TRPCError({ code: "BAD_REQUEST", message: staleContentVersionErrorMessage });

          await useUpload(AzureContainer.ResourceAssets, getContentBlobName(id), JSON.stringify(content));
          return savedResource;
        });
        // Fire-and-forget: the activity trail is best-effort and autosave must not pay its coalescing
        // Table scan on every save the user is waiting on
        getSynchronizedFunction(writeResourceActivity)({
          activityType: ResourceActivityType.ContentSaved,
          resourceId: id,
          userId: ctx.getSessionPayload.user.id,
        });
        resourceEventEmitter.emit("saveResourceContent", [
          { content, contentVersion: updatedResource.contentVersion, id },
          { sessionId: ctx.getSessionPayload.session.id, userId: ctx.getSessionPayload.user.id },
        ]);
        runAfterSaveResourceContent(ctx, updatedResource, content, previousContent);
        return updatedResource;
      },
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
        // Fire-and-forget: the activity trail is best-effort and the rename must not wait on telemetry
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
  // Through the /api/resource-assets endpoint (content embeds only stable urls, never a signature), and
  // DeleteResource already removes the whole {id}/ directory, so the assets need no separate teardown
  const fileAssetsProcedures = {
    deleteFile: getOwnerProcedure(type, deleteFileInputSchema, "id").mutation(async ({ input: { blobPath, id } }) => {
      // The path is a single separator-free segment (BLOB_SEGMENT_REGEX) anchored under {id}/files/, so this can
      // Only ever delete uploaded assets, never the content or published-content blobs beside the files directory
      await publishBlobDeletion(id, AzureContainer.ResourceAssets, [`${getFilesDirectoryName(id)}/${blobPath}`]);
    }),
    generateUploadFileSasEntities: getOwnerProcedure(type, generateUploadFileSasEntitiesInputSchema, "id").query<
      FileSasEntity[]
    >(async ({ input: { files, id } }) => {
      const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
      return generateUploadFileSasEntities(containerClient, files, getFilesDirectoryName(id));
    }),
  };
  const publishProcedures = {
    publishResource: getOwnerProcedure(type, resourceIdInputSchema, "id").mutation<ResourcePublication>(
      async ({ ctx, input: { id } }) => {
        const content = await readContent(id);
        if (content === undefined)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: new InvalidOperationError(
              Operation.Update,
              DatabaseEntityType.Resource,
              "cannot publish resource without content",
            ).message,
          });
        // Read before the assets are cloned, so the claim below can be compared against it. A sweep of this
        // Resource's published prefix only ever follows a publication row delete, and that delete resets the
        // Version sequence — so a claim that is not the successor of what this attempt read is proof one landed
        const previousPublication = await ctx.db.query.resourcePublications.findFirst({
          where: { resourceId: { eq: id } },
        });
        // Transformed before the transaction opens: a hook may read through `ctx.db` (Dashboard resolves every
        // Bound dataset), and issuing that read while this connection holds a transaction deadlocks. Nothing it
        // Writes is keyed by the version claimed below — see createPublishedAssetsDirectoryName
        const publishedContent = transformPublishedContent
          ? await transformPublishedContent(ctx, ctx.resource, content)
          : content;
        // Bump the version and write the blob in one transaction so a failed upload rolls the version bump back,
        // The publication row can never point at a publishVersion whose blob was never written.
        const publication = await ctx.db.transaction(async (tx) => {
          // The version bump is done in SQL so concurrent publishes each claim a distinct publish blob;
          // The publication row exists only while the resource is published (the Publishable capability's state)
          const newPublication = requireMutation(
            (
              await tx
                .insert(resourcePublications)
                .values({ resourceId: id })
                .onConflictDoUpdate({
                  set: { publishedAt: new Date(), publishVersion: sql`${resourcePublications.publishVersion} + 1` },
                  target: resourcePublications.resourceId,
                })
                .returning()
            )[0],
            Operation.Update,
            DatabaseEntityType.ResourcePublication,
            id,
          );
          await useUpload(
            AzureContainer.ResourceAssets,
            getPublishedContentBlobName(id, newPublication.publishVersion),
            JSON.stringify(publishedContent),
          );
          return newPublication;
        });
        // An unpublish that landed between the clone and this claim swept the assets it had just written, while
        // The content blob — written inside the transaction, after that sweep's bound — survived: the resource
        // Would report itself published and render every image broken, with no operation left that rebuilds
        // Them. Re-cloning now writes past the bound, and the version is already claimed, so the repair is the
        // Transform and the upload again rather than another publish. A concurrent publish trips this too and
        // Pays one redundant clone; a swept snapshot cannot slip through, because a delete restarts the
        // Sequence at 1 and any successor this attempt could expect is at least 2.
        // An attempt that read no row expects to claim 1 — reading the successor off the row alone exempted
        // Every first publish (and every publish after an unpublish) from the check entirely.
        //
        // Outside the transaction on purpose, and it cannot move in: the transform may read through `ctx.db`
        // (Dashboard resolves every bound dataset), which deadlocks against a transaction this same connection
        // Holds. So the publication has already landed by the time the repair runs, and the transaction's
        // Guarantee is unaffected — the version it claimed does point at a blob that was written. What a failed
        // Repair leaves behind is that blob still naming the swept assets, i.e. a live publication whose images
        // 404. The rejection is therefore reported rather than swallowed, and says so: republishing re-clones and
        // Overwrites, so the owner's own retry is what repairs it, and a silent success would leave the page
        // Broken with nothing to signal it. See /docs/architecture/publishing
        if (publication.publishVersion !== (previousPublication?.publishVersion ?? 0) + 1)
          await getResultAsync(async () =>
            useUpload(
              AzureContainer.ResourceAssets,
              getPublishedContentBlobName(id, publication.publishVersion),
              JSON.stringify(
                transformPublishedContent ? await transformPublishedContent(ctx, ctx.resource, content) : content,
              ),
            ),
          ).match(noop, (error) => {
            console.error(error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: new InvalidOperationError(
                Operation.Update,
                DatabaseEntityType.ResourcePublication,
                `published at version ${publication.publishVersion}, but its assets were swept by a concurrent unpublish and could not be re-cloned — publish again to rebuild them`,
              ).message,
            });
          });
        // Fire-and-forget: the activity trail is best-effort and the publish must not wait on telemetry
        getSynchronizedFunction(writeResourceActivity)({
          activityType: ResourceActivityType.Published,
          publishVersion: publication.publishVersion,
          resourceId: id,
          userId: ctx.getSessionPayload.user.id,
        });
        return publication;
      },
    ),
    readPublishedResourceContent: standardRateLimitedProcedure
      .input(selectResourceSchema.shape.id)
      .query(async ({ ctx, input }) => {
        const resource = await requireEntity(
          ctx.db.query.resources.findFirst({
            where: { id: { eq: input }, type: { eq: type } },
            with: { publication: true },
          }),
          DatabaseEntityType.Resource,
          input,
        );
        if (!resource.publication) throw new TRPCError({ code: "NOT_FOUND" });

        const { readableStreamBody } = await useDownload(
          AzureContainer.ResourceAssets,
          getPublishedContentBlobName(input, resource.publication.publishVersion),
        );
        if (!readableStreamBody) throw new TRPCError({ code: "NOT_FOUND" });
        // The generic contentSchema parses to the union of all content types; the concrete caller's
        // TType pins it back down so consumers read their own content shape. Plain JSON.parse leaves
        // Date coercion to the content schema, so ISO-datetime free-text fields survive as strings.
        const content = contentSchema.parse(
          JSON.parse(await streamToText(readableStreamBody)),
        ) as ResourceContent<TType>;
        // Counted after the read is guaranteed to succeed, so a 404 never lands in the buckets.
        // Fire-and-forget: the increment swallows its own failures and the viewer must never wait on telemetry
        getSynchronizedFunction(incrementResourceViewCount)(input);
        if (!transformPublicReadContent) return { content, name: resource.name };
        return { content: await transformPublicReadContent(ctx, resource, content), name: resource.name };
      }),
    // An owner-only read of a retained snapshot, backing the view route's `version` query param. Anonymous
    // Visitors never reach this — the public read above always serves the latest publish
    readPublishedVersionContent: getOwnerProcedure(type, readPublishedVersionContentInputSchema, "id").query(
      async ({ ctx, input: { id, version } }) => {
        const { readableStreamBody } = await useDownload(
          AzureContainer.ResourceAssets,
          getPublishedContentBlobName(id, version),
        );
        if (!readableStreamBody) throw new TRPCError({ code: "NOT_FOUND" });
        const content = contentSchema.parse(
          JSON.parse(await streamToText(readableStreamBody)),
        ) as ResourceContent<TType>;
        return { content, name: ctx.resource.name };
      },
    ),
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

      // Best-effort after the publications delete, but durable: a lingering blob stays downloadable to anyone
      // Still holding a cached short-lived SAS, and unpublished snapshots must not linger regardless — cleanup
      // Goes through the one blob-deletion publish every delete funnels through (/docs/architecture/persist-then-notify)
      // The snapshot directory grows with every retained publication, so the handler enumerates it — walking
      // It here would put an unbounded listing on the unpublish request itself.
      // Only when a row was actually removed: an unpublish that deletes nothing was never publishing anything,
      // And sweeping regardless is what let a stale tab wipe the assets a concurrent FIRST publish had just
      // Cloned — the sweep's bound is stamped after those clones, and a delete that removed no row leaves the
      // Version sequence untouched, so the publish's own successor check below cannot see it either
      if (deletedPublication)
        await publishBlobPrefixDeletion(
          id,
          AzureContainer.ResourceAssets,
          `${id}/${PUBLISHED_DIRECTORY_SEGMENT}`,
          new Date(),
        );
      // Fire-and-forget: the activity trail is best-effort and the unpublish must not wait on telemetry
      getSynchronizedFunction(writeResourceActivity)({
        activityType: ResourceActivityType.Unpublished,
        resourceId: id,
        userId: ctx.getSessionPayload.user.id,
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
