import type { BlobGenerateSasUrlOptions, BlockBlobClient } from "@azure/storage-blob";

import { encodeBlobUrl } from "@/services/azure/container/encodeBlobUrl";
import { dayjs } from "@/services/dayjs";
import { BlobSASPermissions } from "@azure/storage-blob";

// Uploads finish quickly, so every write SAS shares one short-lived signer
export const generateWriteSasUrl = async (
  blockBlobClient: BlockBlobClient,
  options?: Pick<BlobGenerateSasUrlOptions, "contentType">,
) =>
  encodeBlobUrl(
    await blockBlobClient.generateSasUrl({
      ...options,
      expiresOn: dayjs().add(1, "hour").toDate(),
      permissions: BlobSASPermissions.from({ write: true }),
    }),
  );
