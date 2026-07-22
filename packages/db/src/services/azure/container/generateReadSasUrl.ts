import type { BlobGenerateSasUrlOptions, BlockBlobClient } from "@azure/storage-blob";

import { encodeBlobUrl } from "@/services/azure/container/encodeBlobUrl";
import { dayjs } from "@/services/dayjs";
import { BlobSASPermissions } from "@azure/storage-blob";

// Every read SAS shares one signer. The day-long default bounds how long a handed-out message-attachment
// Url stays live (clients re-fetch per read, so it only has to outlast a long-open session), and callers
// Serving per-request redirects override expiresOn down to a minutes-scale window
export const generateReadSasUrl = async (
  blockBlobClient: BlockBlobClient,
  options?: Pick<BlobGenerateSasUrlOptions, "contentDisposition" | "contentType" | "expiresOn">,
) =>
  encodeBlobUrl(
    await blockBlobClient.generateSasUrl({
      expiresOn: dayjs().add(1, "day").toDate(),
      ...options,
      permissions: BlobSASPermissions.from({ read: true }),
    }),
  );
