import type { ContainerClient } from "@azure/storage-blob";
import type { FileEntity, FileSasEntity } from "@esposter/db-schema";

import { generateWriteSasUrl } from "@/services/azure/container/generateWriteSasUrl";
import { getBlobName } from "@/services/azure/container/getBlobName";

export const generateUploadFileSasEntities = (
  containerClient: ContainerClient,
  files: Pick<FileEntity, "filename" | "mimetype">[],
  prefix = "",
) => {
  if (files.length === 0) return [] as FileSasEntity[];
  else
    return Promise.all(
      files.map(async ({ filename, mimetype }) => {
        const id: string = crypto.randomUUID();
        const blobName = getBlobName(`${prefix}/${id}`, filename);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        return { id, sasUrl: await generateWriteSasUrl(blockBlobClient, { contentType: mimetype }) };
      }),
    );
};
