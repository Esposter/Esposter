import type { BlobGenerateSasUrlOptions, BlockBlobClient } from "@azure/storage-blob";

import { BlobSASPermissions } from "@azure/storage-blob";
import { READ_SAS_DURATION_MS } from "@esposter/db-schema";
import { encodeUrlSubDelimiters } from "@esposter/shared";

// Every read SAS shares one signer. READ_SAS_DURATION_MS bounds how long a handed-out message-attachment
// Url stays live (clients re-mint a cached url once it nears that expiry), and callers serving per-request
// Redirects override expiresOn down to a minutes-scale window. Encoding the
// Sub-delimiters is transparent to Azure, which decodes the request before validating the signature, so
// Every url we hand out is canonical and matchable inside serialized content
export const generateReadSasUrl = async (
  blockBlobClient: BlockBlobClient,
  options?: Pick<BlobGenerateSasUrlOptions, "contentDisposition" | "contentType" | "expiresOn">,
) =>
  encodeUrlSubDelimiters(
    await blockBlobClient.generateSasUrl({
      expiresOn: new Date(Date.now() + READ_SAS_DURATION_MS),
      ...options,
      permissions: BlobSASPermissions.from({ read: true }),
    }),
  );
