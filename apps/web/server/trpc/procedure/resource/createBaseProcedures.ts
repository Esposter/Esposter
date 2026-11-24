import type { BaseProcedureNames } from "#server/models/resource/BaseProcedureNames";
import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { ResourceListPage } from "#shared/models/resource/ResourceListPage";
import type { ResourceInResource, ResourceType } from "@esposter/db-schema";

import { publishResourceOperation } from "#server/services/notification/publishResourceOperation";
import { RESOURCE_ASSET_PRESIGNED_URL_DURATION_MS } from "#server/services/resource/constants";
import { createResourceRow } from "#server/services/resource/createResourceRow";
import { deleteStagingContentBlob } from "#server/services/resource/deleteStagingContentBlob";
import { getOwnedLiveResourceWhere } from "#server/services/resource/getOwnedLiveResourceWhere";
import { getResourcesWhere } from "#server/services/resource/getResourcesWhere";
import { getStagingContentBlobName } from "#server/services/resource/getStagingContentBlobName";
import { readResourceContent } from "#server/services/resource/readResourceContent";
import { readResourceContentDelta } from "#server/services/resource/readResourceContentDelta";
import { readStagedResourceContent } from "#server/services/resource/readStagedResourceContent";
import { saveResourceContent } from "#server/services/resource/saveResourceContent";
import { softDeleteResources } from "#server/services/resource/softDeleteResources";
import { updateResourceRow } from "#server/services/resource/updateResourceRow";
import { generateReservedWritePresignedUrl } from "#server/services/storage/generateReservedWritePresignedUrl";
import { getStorageCredentials } from "#server/services/storage/getStorageCredentials";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { getOwnerProcedure } from "#server/trpc/procedure/resource/getOwnerProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { createResourceInputSchema } from "#shared/models/db/resource/CreateResourceInput";
import { generateUploadContentPresignedUrlInputSchema } from "#shared/models/db/resource/GenerateUploadContentPresignedUrlInput";
import { readResourcesInputSchema } from "#shared/models/db/resource/ReadResourcesInput";
import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { saveResourceContentDeltaInputSchema } from "#shared/models/db/resource/SaveResourceContentDeltaInput";
import { createSaveResourceContentInputSchema } from "#shared/models/db/resource/SaveResourceContentInput";
import { saveStagedResourceContentInputSchema } from "#shared/models/db/resource/SaveStagedResourceContentInput";
import { updateResourceInputSchema } from "#shared/models/db/resource/UpdateResourceInput";
import { ResourceOperationType } from "#shared/models/notification/ResourceOperationType";
import { ResourceSortName } from "#shared/models/resource/ResourceSortName";
import { ResourceOperationTitleMap } from "#shared/services/notification/ResourceOperationTitleMap";
import { getResourceContentSchema } from "#shared/services/resource/getResourceContentSchema";
import { ResourceSortNamePageSortMap } from "#shared/services/resource/ResourceSortNamePageSortMap";
import { createPresignedGetUrl, getContentBlobName, readResourceListPage } from "@esposter/db";
import { DatabaseEntityType, ResourceActivityType, StorageBucket } from "@esposter/db-schema";
import { Operation, RoutePath } from "@esposter/shared";

// The base group every type takes, built from that type's own content schema, so its content, input and read types are
// The type's rather than the union of every type's
export const createBaseProcedures = <TType extends ResourceType>(type: TType) => {
  const contentSchema = getResourceContentSchema(type);
  // The input side is the accessor's declared input rather than zod's default, since defaulting it to unknown would
  // Erase the procedure's input type for consumers like achievement condition paths
  const saveResourceContentInputSchema = createSaveResourceContentInputSchema(contentSchema);
  return {
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
    // Every content write funnels through saveResourceContent, the one door that applies the version check
    readResourceContent: getOwnerProcedure(type, resourceIdInputSchema, "id").query<ResourceContent<TType> | undefined>(
      ({ input: { id } }) => readResourceContent(contentSchema, id),
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
    // Reference, reaching the same door with the same version check
    // (openspec/specs/architecture/file-uploads/design.md)
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
  } satisfies Record<(typeof BaseProcedureNames)[number], unknown>;
};
