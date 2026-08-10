import type { ContainerClient } from "@azure/storage-blob";
import type { FileEntity } from "@esposter/db-schema";

import { generateReadSasUrl } from "@/services/azure/container/generateReadSasUrl";
import { getThumbnailBlobName } from "@/services/azure/container/getThumbnailBlobName";
import { THUMBNAIL_CONTENT_TYPE } from "@esposter/db-schema";

export const generateDownloadThumbnailSasUrls = (
  containerClient: ContainerClient,
  files: Pick<FileEntity, "id">[],
  prefix = "",
) =>
  Promise.all(
    files.map(({ id }) => {
      const blockBlobClient = containerClient.getBlockBlobClient(getThumbnailBlobName(prefix, id));
      return generateReadSasUrl(blockBlobClient, { contentType: THUMBNAIL_CONTENT_TYPE });
    }),
  );
