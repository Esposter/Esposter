import type { BlobGenerateSasUrlOptions, BlockBlobClient } from "@azure/storage-blob";

import { encodeBlobUrl } from "@/services/azure/container/encodeBlobUrl";
import { dayjs } from "@/services/dayjs";
import { BlobSASPermissions } from "@azure/storage-blob";

// Every read SAS shares one signer so the long-lived expiry is defined exactly once;
// Readers re-sign on read, so the expiry only bounds how long a handed-out url stays live
export const generateReadSasUrl = async (
  blockBlobClient: BlockBlobClient,
  options?: Pick<BlobGenerateSasUrlOptions, "contentDisposition" | "contentType">,
) =>
  encodeBlobUrl(
    await blockBlobClient.generateSasUrl({
      ...options,
      expiresOn: dayjs().add(1, "year").toDate(),
      permissions: BlobSASPermissions.from({ read: true }),
    }),
  );
