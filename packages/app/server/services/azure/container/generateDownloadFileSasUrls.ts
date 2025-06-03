import type { FileEntity } from "#shared/models/azure/FileEntity";
import type { ContainerClient } from "@azure/storage-blob";

import { dayjs } from "#shared/services/dayjs";
import { getBlobName } from "@@/server/services/azure/container/getBlobName";
import { ContainerSASPermissions } from "@azure/storage-blob";

export const generateDownloadFileSasUrls = async (
  containerClient: ContainerClient,
  files: Pick<FileEntity, "filename" | "id" | "mimetype">[],
  prefix = "",
): Promise<string[]> => {
  if (files.length === 0) return [];
  else
    return Promise.all(
      files.map(({ filename, id, mimetype }) => {
        const blobName = getBlobName(`${prefix}/${id}`, filename);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        return blockBlobClient.generateSasUrl({
          contentDisposition: `attachment; filename="${filename}"`,
          contentType: mimetype,
          expiresOn: dayjs().add(1, "year").toDate(),
          permissions: ContainerSASPermissions.from({ read: true }),
        });
      }),
    );
};
