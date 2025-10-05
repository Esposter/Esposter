import type { FileEntity } from "#shared/models/azure/table/FileEntity";
import type { ContainerClient } from "@azure/storage-blob";

import { dayjs } from "#shared/services/dayjs";
import { getBlobName } from "@@/server/services/azure/container/getBlobName";
import { ContainerSASPermissions } from "@azure/storage-blob";

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
        return blockBlobClient.generateSasUrl({
          contentDisposition: `attachment; filename="${filename}"`,
          contentType: mimetype,
          expiresOn: dayjs().add(1, "year").toDate(),
          permissions: ContainerSASPermissions.from({ read: true }),
        });
      }),
    );
};
