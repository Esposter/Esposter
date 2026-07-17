import type { BlobGenerateSasUrlOptions, BlockBlobClient } from "@azure/storage-blob";

import { dayjs } from "@/services/dayjs";
import { ContainerSASPermissions } from "@azure/storage-blob";

// Uploads finish quickly, so every write SAS shares one short-lived signer
export const generateWriteSasUrl = (
  blockBlobClient: BlockBlobClient,
  options?: Pick<BlobGenerateSasUrlOptions, "contentType">,
) =>
  blockBlobClient.generateSasUrl({
    ...options,
    expiresOn: dayjs().add(1, "hour").toDate(),
    permissions: ContainerSASPermissions.from({ write: true }),
  });
