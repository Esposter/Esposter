import type { FileAssetsResourceType } from "#shared/models/resource/FileAssetsResourceType";
import type { PublishableResourceType } from "#shared/models/resource/PublishableResourceType";
import type { PublishableResourceProcedureOptions } from "@@/server/models/resource/PublishableResourceProcedureOptions";
import type { FileSasEntity, Resource, ResourcePublication, ResourceType } from "@esposter/db-schema";

import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { staleContentVersionErrorMessage } from "#shared/services/resource/constants";
import { hasCapability } from "#shared/services/resource/hasCapability";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { getIsSameDevice } from "@@/server/services/auth/getIsSameDevice";
import { on } from "@@/server/services/events/on";
import { getOffsetPaginationData } from "@@/server/services/pagination/offset/getOffsetPaginationData";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { resourceEventEmitter } from "@@/server/services/resource/events/resourceEventEmitter";
import { getContentBlobName } from "@@/server/services/resource/getContentBlobName";
import { getPublishedContentBlobName } from "@@/server/services/resource/getPublishedContentBlobName";
import { incrementResourceViewCount } from "@@/server/services/resource/incrementResourceViewCount";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { readResourceViewCount } from "@@/server/services/resource/readResourceViewCount";
import { writeResourceActivity } from "@@/server/services/resource/writeResourceActivity";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { getOwnerProcedure } from "@@/server/trpc/procedure/resource/getOwnerProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import { deleteDirectory, generateDownloadFileSasUrls, generateUploadFileSasEntities } from "@esposter/db";
import {
  AzureContainer,
  DatabaseEntityType,
  fileEntitySchema,
  ResourceActivityType,
  resourcePublications,
  resources,
  selectResourceSchema,
} from "@esposter/db-schema";
import {
  createUniqueArraySchema,
  InvalidOperationError,
  jsonDateParse,
  MAX_READ_LIMIT,
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

const generateDownloadFileSasUrlsInputSchema = z.object({
  files: createUniqueArraySchema(fileEntitySchema.pick({ filename: true, id: true, mimetype: true }), "id")
    .min(1)
    .max(MAX_READ_LIMIT),
  id: selectResourceSchema.shape.id,
});

const deleteFileInputSchema = z.object({
  blobPath: z.string().min(1).max(MAX_READ_LIMIT),
  id: selectResourceSchema.shape.id,
});

type ResourceContent<TType extends ResourceType> = z.infer<(typeof ResourceDefinitionMap)[TType]["contentSchema"]>;

export const createResourceProcedures = <TType extends ResourceType>(
  type: TType,
  ...args: TType extends PublishableResourceType
    ? [options?: PublishableResourceProcedureOptions<ResourceContent<TType>>]
    : []
) => {
  const { contentSchema } = ResourceDefinitionMap[type];
  // Args comes from an unresolved-generic conditional tuple, so the hook params collapse to the
  // Intersection of every content type; pin them back to this TType's concrete content shape.
  const { transformPublicReadContent, transformPublishedContent, transformReadContent } = (args[0] ??
    {}) as unknown as PublishableResourceProcedureOptions<ResourceContent<TType>>;
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
      .mutation<Resource>(async ({ ctx, input }) => {
        const newResource = requireMutation(
          (
            await ctx.db
              .insert(resources)
              .values({ ...input, type, userId: ctx.getSessionPayload.user.id })
              .returning()
          )[0],
          Operation.Create,
          DatabaseEntityType.Resource,
          ctx.getSessionPayload.user.id,
        );
        await writeResourceActivity({
          activityType: ResourceActivityType.Created,
          resourceId: newResource.id,
          userId: ctx.getSessionPayload.user.id,
        });
        return newResource;
      }),
    // Soft: the row, its content blob and its {id}/ directory all survive the Recycle bin window,
    // Which is exactly what makes restore possible. Purge is what actually destroys them.
    deleteResource: getOwnerProcedure(type, resourceIdInputSchema, "id").mutation<Resource>(
      async ({ ctx, input: { id } }) =>
        // A deleted resource must not stay publicly served, so restore deliberately returns a Draft.
        // The blobs and the type's table partitions survive until purge — destroying them here would
        // Make restore hand back an empty resource.
        // One transaction so a soft-deleted resource can never linger publicly served
        ctx.db.transaction(async (tx) => {
          const deletedResource = requireMutation(
            (await tx.update(resources).set({ deletedAt: new Date() }).where(eq(resources.id, id)).returning())[0],
            Operation.Delete,
            DatabaseEntityType.Resource,
            id,
          );
          await tx.delete(resourcePublications).where(eq(resourcePublications.resourceId, id));
          return deletedResource;
        }),
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
    readResourceContent: getOwnerProcedure(type, resourceIdInputSchema, "id").query(async ({ ctx, input: { id } }) => {
      const content = await readContent(id);
      if (content === undefined || !transformReadContent) return content;
      return transformReadContent(ctx, ctx.resource, content);
    }),
    readResources: standardAuthedProcedure
      .input(readResourcesInputSchema)
      .query(async ({ ctx, input: { limit, offset, sortBy } }) => {
        const resultResources = await ctx.db.query.resources.findMany({
          limit: limit + 1,
          offset,
          orderBy: (resources, { desc }) =>
            sortBy.length > 0 ? parseSortByToSql(resources, sortBy) : desc(resources.updatedAt),
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
        // Bump the version and write the blob in one transaction so a failed upload rolls the version back,
        // Keeping Postgres and blob storage consistent instead of stranding the resource at a version with stale content
        const updatedResource = await ctx.db.transaction(async (tx) => {
          // The version check is part of the UPDATE so concurrent saves cannot both pass and silently lose one write
          const updatedResource = (
            await tx
              .update(resources)
              .set({ contentVersion: contentVersion + 1 })
              .where(and(eq(resources.id, id), eq(resources.contentVersion, contentVersion)))
              .returning()
          )[0];
          if (!updatedResource) throw new TRPCError({ code: "BAD_REQUEST", message: staleContentVersionErrorMessage });

          await useUpload(AzureContainer.ResourceAssets, getContentBlobName(id), JSON.stringify(content));
          return updatedResource;
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
        // A tags-only edit is not a rename, so it leaves no Renamed entry
        if (updatedResource.name !== oldName)
          await writeResourceActivity({
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
  // Binary assets live under {id}/files/… — the owner uploads and reads them through short-lived SAS urls,
  // And deleteResource already removes the whole {id}/ directory, so the assets need no separate teardown
  const fileAssetsProcedures = {
    deleteFile: getOwnerProcedure(type, deleteFileInputSchema, "id").mutation(async ({ input: { blobPath, id } }) => {
      const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
      // The path is anchored under {id}/files/ so this can only ever delete uploaded assets,
      // Never the content or published-content blobs that live beside the files directory
      const blockBlobClient = containerClient.getBlockBlobClient(`${getFilesDirectoryName(id)}/${blobPath}`);
      await blockBlobClient.deleteIfExists();
    }),
    generateDownloadFileSasUrls: getOwnerProcedure(type, generateDownloadFileSasUrlsInputSchema, "id").query<string[]>(
      async ({ input: { files, id } }) => {
        const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
        return generateDownloadFileSasUrls(containerClient, files, getFilesDirectoryName(id));
      },
    ),
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
        await writeResourceActivity({
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
        // TType pins it back down so consumers read their own content shape
        const content = contentSchema.parse(
          jsonDateParse(await streamToText(readableStreamBody)),
        ) as ResourceContent<TType>;
        // Counted after the read is guaranteed to succeed, so a 404 never lands in the buckets.
        // Fire-and-forget: the increment swallows its own failures and the viewer must never wait on telemetry
        getSynchronizedFunction(incrementResourceViewCount)(input);
        if (!transformPublicReadContent) return { content, name: resource.name };
        return { content: await transformPublicReadContent(ctx, resource, content), name: resource.name };
      }),
    readResourcePublication: getOwnerProcedure(type, resourceIdInputSchema, "id").query<
      ResourcePublication | undefined
    >(({ ctx }) => ctx.db.query.resourcePublications.findFirst({ where: { resourceId: { eq: ctx.resource.id } } })),
    readResourceViewCount: getOwnerProcedure(type, resourceIdInputSchema, "id").query<number>(({ ctx }) =>
      readResourceViewCount(ctx.resource.id),
    ),
    unpublishResource: getOwnerProcedure(type, resourceIdInputSchema, "id").mutation<Resource>(async ({ ctx }) => {
      const { id } = ctx.resource;
      await ctx.db.delete(resourcePublications).where(eq(resourcePublications.resourceId, id));

      const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
      await deleteDirectory(containerClient, `${id}/published`, true);
      await writeResourceActivity({
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
