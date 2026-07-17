import type { BlobGenerateSasUrlOptions, BlockBlobClient } from "@azure/storage-blob";

import { dayjs } from "@/services/dayjs";
import { ContainerSASPermissions } from "@azure/storage-blob";

// Every read SAS shares one signer so the long-lived expiry is defined exactly once;
// Readers re-sign on read, so the expiry only bounds how long a handed-out url stays live
export const generateReadSasUrl = (
  blockBlobClient: BlockBlobClient,
  options?: Pick<BlobGenerateSasUrlOptions, "contentDisposition" | "contentType">,
) =>
  blockBlobClient.generateSasUrl({
    ...options,
    expiresOn: dayjs().add(1, "year").toDate(),
    permissions: ContainerSASPermissions.from({ read: true }),
  });
