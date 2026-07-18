import type { ContainerClient } from "@azure/storage-blob";
import type { FileEntity } from "@esposter/db-schema";

import { generateReadSasUrl } from "@/services/azure/container/generateReadSasUrl";
import { getBlobName } from "@/services/azure/container/getBlobName";

export const generateDownloadFileSasUrls = (
  containerClient: ContainerClient,
  files: Pick<FileEntity, "filename" | "id" | "mimetype">[],
  prefix = "",
) => {
  if (files.length === 0) return [] as string[];
  else
    return Promise.all(
      files.map(({ filename, id, mimetype }) => {
        const blobName = getBlobName(`${prefix}/${id}`, filename);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        return generateReadSasUrl(blockBlobClient, {
          contentDisposition: `attachment; filename="${filename}"`,
          contentType: mimetype,
        });
      }),
    );
};
