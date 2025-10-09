import type { FileSasEntity } from "#shared/models/message/FileSasEntity";
import type { ContainerClient } from "@azure/storage-blob";
import type { FileEntity } from "@esposter/shared";

import { dayjs } from "#shared/services/dayjs";
import { getBlobName } from "@@/server/services/azure/container/getBlobName";
import { ContainerSASPermissions } from "@azure/storage-blob";

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
        return {
          id,
          sasUrl: await blockBlobClient.generateSasUrl({
            contentType: mimetype,
            expiresOn: dayjs().add(1, "hour").toDate(),
            permissions: ContainerSASPermissions.from({ write: true }),
          }),
        };
      }),
    );
};
