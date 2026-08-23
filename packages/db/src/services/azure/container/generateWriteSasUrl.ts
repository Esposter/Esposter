import type { BlobGenerateSasUrlOptions, BlockBlobClient } from "@azure/storage-blob";

import { dayjs } from "#src/services/dayjs/index";
import { BlobSASPermissions } from "@azure/storage-blob";
import { WRITE_SAS_DURATION_MS } from "@esposter/db-schema";
import { encodeUrlSubDelimiters } from "@esposter/shared";

// Uploads finish quickly, so every write SAS shares one short-lived signer. Encoding the sub-delimiters is
// Transparent to Azure, which decodes the request before validating the signature
export const generateWriteSasUrl = async (
  blockBlobClient: BlockBlobClient,
  options?: Pick<BlobGenerateSasUrlOptions, "contentType">,
) =>
  encodeUrlSubDelimiters(
    await blockBlobClient.generateSasUrl({
      ...options,
      expiresOn: dayjs().add(WRITE_SAS_DURATION_MS, "ms").toDate(),
      permissions: BlobSASPermissions.from({ write: true }),
    }),
  );
