import type { BlobGenerateSasUrlOptions, BlockBlobClient } from "@azure/storage-blob";

import { dayjs } from "@/services/dayjs";
import { BlobSASPermissions } from "@azure/storage-blob";
import { encodeUrlSubDelimiters } from "@esposter/shared";

// Every read SAS shares one signer. The day-long default bounds how long a handed-out message-attachment
// Url stays live (clients re-fetch per read, so it only has to outlast a long-open session), and callers
// Serving per-request redirects override expiresOn down to a minutes-scale window. Encoding the
// Sub-delimiters is transparent to Azure, which decodes the request before validating the signature, so
// Every url we hand out is canonical and matchable inside serialized content
export const generateReadSasUrl = async (
  blockBlobClient: BlockBlobClient,
  options?: Pick<BlobGenerateSasUrlOptions, "contentDisposition" | "contentType" | "expiresOn">,
) =>
  encodeUrlSubDelimiters(
    await blockBlobClient.generateSasUrl({
      expiresOn: dayjs().add(1, "day").toDate(),
      ...options,
      permissions: BlobSASPermissions.from({ read: true }),
    }),
  );
