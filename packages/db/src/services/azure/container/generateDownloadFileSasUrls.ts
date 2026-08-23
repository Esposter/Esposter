import type { ContainerClient } from "@azure/storage-blob";
import type { FileEntity } from "@esposter/db-schema";

import { generateReadSasUrl } from "#src/services/azure/container/generateReadSasUrl";
import { getFileBlobNames } from "#src/services/azure/container/getFileBlobNames";

export const generateDownloadFileSasUrls = (
  containerClient: ContainerClient,
  files: Pick<FileEntity, "filename" | "id" | "mimetype">[],
  prefix = "",
) =>
  Promise.all(
    files.map(({ filename, id, mimetype }) => {
      const { blobName } = getFileBlobNames(prefix, id, filename);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      return generateReadSasUrl(blockBlobClient, {
        contentDisposition: `attachment; filename="${filename}"`,
        contentType: mimetype,
      });
    }),
  );
