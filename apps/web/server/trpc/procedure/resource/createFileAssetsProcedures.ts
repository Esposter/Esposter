import type { FileProcedureNames } from "#server/models/resource/FileProcedureNames";
import type { ResourceFile } from "#shared/models/resource/ResourceFile";
import type { ResourceFilePresignedUrlEntity } from "#shared/models/resource/ResourceFilePresignedUrlEntity";
import type { ResourceType } from "@esposter/db-schema";

import { generateReservedResourceAssetPresignedUrlEntities } from "#server/services/resource/generateReservedResourceAssetPresignedUrlEntities";
import { readResourceFiles } from "#server/services/resource/readResourceFiles";
import { releaseResourceAssets } from "#server/services/resource/snapshot/releaseResourceAssets";
import { getBucket } from "#server/services/storage/getBucket";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { getOwnerProcedure } from "#server/trpc/procedure/resource/getOwnerProcedure";
import { deleteFileInputSchema } from "#shared/models/db/resource/DeleteFileInput";
import { generateUploadFilePresignedUrlEntitiesInputSchema } from "#shared/models/db/resource/GenerateUploadFilePresignedUrlEntitiesInput";
import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { ResourceFileMimeTypeMap } from "#shared/services/resource/ResourceFileMimeTypeMap";
import { StorageBucket } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

// Binary assets live under {id}/files/{hash} — the owner uploads through short-lived presigned urls and reads resolve
// Through the /api/resource-assets endpoint (content embeds only stable urls, never a signature). An asset is never
// Deleted here: the file's hash is handed to the release path, which deletes it only once no stored version names it
export const createFileAssetsProcedures = (type: ResourceType) =>
  ({
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
  }) satisfies Record<(typeof FileProcedureNames)[number], unknown>;
