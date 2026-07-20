import type { ContainerClient } from "@azure/storage-blob";
import type { FileEntity, FileSasEntity } from "@esposter/db-schema";

import { generateWriteSasUrl } from "@/services/azure/container/generateWriteSasUrl";
import { getBlobName } from "@/services/azure/container/getBlobName";
import { getThumbnailBlobName } from "@/services/azure/container/getThumbnailBlobName";
import { getMimeCategory, MimeCategory, THUMBNAIL_CONTENT_TYPE } from "@esposter/db-schema";

export const generateUploadFileSasEntities = (
  containerClient: ContainerClient,
  files: Pick<FileEntity, "filename" | "mimetype">[],
  prefix = "",
  options: { withThumbnail?: boolean } = {},
) => {
  if (files.length === 0) return [] as FileSasEntity[];
  else
    return Promise.all(
      files.map(async ({ filename, mimetype }) => {
        const id: string = crypto.randomUUID();
        const blobName = getBlobName(`${prefix}/${id}`, filename);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const entity: FileSasEntity = {
          id,
          sasUrl: await generateWriteSasUrl(blockBlobClient, { contentType: mimetype }),
        };
        // Images get a sibling thumbnail write target so the client can upload a downscaled preview alongside.
        if (options.withThumbnail && getMimeCategory(mimetype) === MimeCategory.Image) {
          const thumbnailBlobClient = containerClient.getBlockBlobClient(getThumbnailBlobName(prefix, id));
          entity.thumbnailSasUrl = await generateWriteSasUrl(thumbnailBlobClient, {
            contentType: THUMBNAIL_CONTENT_TYPE,
          });
        }

        return entity;
      }),
    );
};
